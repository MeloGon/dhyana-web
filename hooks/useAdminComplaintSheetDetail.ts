'use client';

import { useState } from 'react';
import { getAdminComplaintSheetDetail, respondComplaintSheet, setComplaintSheetStatus, uploadComplaintEvidence } from '@/lib/api/complaint-book';
import type { AdminComplaintSheetDetail } from '@/lib/types/complaint-book';

function today() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}

export function useAdminComplaintSheetDetail(initial: AdminComplaintSheetDetail) {
  const [detail, setDetail] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [respuestaTexto, setRespuestaTexto] = useState('');
  const [respuestaFecha, setRespuestaFecha] = useState(today);
  const [respuestaEvidenciaPath, setRespuestaEvidenciaPath] = useState('');
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

  async function refresh() {
    setDetail(await getAdminComplaintSheetDetail(detail.id));
  }

  async function handleMarkInTramite() {
    if (isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      await setComplaintSheetStatus(detail.id);
      await refresh();
      setSuccessMessage('Hoja marcada como en trámite.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el estado.');
    } finally { setIsSaving(false); }
  }

  async function handleUploadEvidence(file: File) {
    setIsUploadingEvidence(true); setErrorMessage('');
    try {
      const { path } = await uploadComplaintEvidence(detail.id, file);
      setRespuestaEvidenciaPath(path);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo subir la evidencia.');
    } finally { setIsUploadingEvidence(false); }
  }

  async function handleRespond() {
    if (isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      await respondComplaintSheet(detail.id, { respuestaTexto, respuestaFecha, respuestaEvidenciaPath });
      await refresh();
      setSuccessMessage('Respuesta registrada.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo registrar la respuesta.');
    } finally { setIsSaving(false); }
  }

  return {
    detail, isSaving, errorMessage, successMessage,
    respuestaTexto, setRespuestaTexto, respuestaFecha, setRespuestaFecha, respuestaEvidenciaPath,
    isUploadingEvidence, handleUploadEvidence, handleMarkInTramite, handleRespond,
  };
}
