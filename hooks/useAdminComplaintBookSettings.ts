'use client';

import { useState } from 'react';
import { saveComplaintBookSettings } from '@/lib/api/complaint-book';
import type { ComplaintBookSettings } from '@/lib/types/complaint-book';

export function useAdminComplaintBookSettings(initial: ComplaintBookSettings) {
  const [baseline, setBaseline] = useState(initial);
  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Los textos de cumplimiento legal exigen una confirmación aparte del
  // guardado normal: no deben cambiarse sin darse cuenta.
  const [pendingLegalConfirm, setPendingLegalConfirm] = useState(false);

  const legalTextsChanged = form.textoAvisoOtrasVias !== baseline.textoAvisoOtrasVias || form.textoPlazoRespuesta !== baseline.textoPlazoRespuesta;

  async function performSave() {
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      const saved = await saveComplaintBookSettings(form);
      setForm(saved); setBaseline(saved);
      setSuccessMessage('Configuración guardada.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la configuración.');
    } finally { setIsSaving(false); }
  }

  function handleSubmit() {
    if (isSaving) return;
    if (legalTextsChanged && !pendingLegalConfirm) { setPendingLegalConfirm(true); return; }
    setPendingLegalConfirm(false);
    void performSave();
  }

  function cancelLegalConfirm() { setPendingLegalConfirm(false); }

  return { form, setForm, isSaving, errorMessage, successMessage, pendingLegalConfirm, cancelLegalConfirm, handleSubmit };
}
