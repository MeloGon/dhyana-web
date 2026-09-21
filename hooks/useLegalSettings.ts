'use client';

import { useState } from 'react';
import { saveLegalSettings } from '@/lib/api/legal-settings';
import type { LegalSettings } from '@/lib/types/legal';

export function useAdminLegalSettings(initial: LegalSettings) {
  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      setForm(await saveLegalSettings(form));
      setSuccessMessage('Términos y políticas guardados.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron guardar los cambios.');
    } finally { setIsSaving(false); }
  }
  return { form, setForm, isSaving, errorMessage, successMessage, handleSave };
}
