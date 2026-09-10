'use client';

import { useEffect, useState } from 'react';
import { getPublicContactSettings, saveContactSettings } from '@/lib/api/contact-settings';
import type { ContactSettings, PublicContactSettings } from '@/lib/types/contact-settings';

export function usePublicContactSettings() {
  const [settings, setSettings] = useState<PublicContactSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPublicContactSettings(controller.signal).then((data) => {
      if (!controller.signal.aborted) setSettings(data);
    }).catch(() => {
      if (!controller.signal.aborted) setErrorMessage('No pudimos cargar los datos de la consulta.');
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  function handleRetry() {
    setErrorMessage(''); setIsLoading(true); setAttempt((previous) => previous + 1);
  }
  return { settings, isLoading, errorMessage, handleRetry };
}

export function useAdminContactSettings(initial: ContactSettings) {
  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      setForm(await saveContactSettings(form));
      setSuccessMessage('Datos de la consulta guardados.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron guardar los datos.');
    } finally { setIsSaving(false); }
  }
  return { form, setForm, isSaving, errorMessage, successMessage, handleSave };
}
