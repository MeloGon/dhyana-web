'use client';

import { useEffect, useState } from 'react';
import { getPublicAboutSettings, saveAboutSettings } from '@/lib/api/about-settings';
import type { AboutSettings } from '@/lib/types/about-settings';

/**
 * Hook público: carga la sección "Sobre nosotros" desde la API.
 * Equivale al ViewModel de Flutter: maneja estado de carga, error y reintento.
 */
export function usePublicAboutSettings() {
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  // useEffect corre después del primer render. El AbortController cancela la
  // petición si el componente se desmonta antes de recibir la respuesta
  // (equivalente a cancelar un Future en Flutter cuando se dispone un widget).
  useEffect(() => {
    const controller = new AbortController();
    getPublicAboutSettings(controller.signal).then((data) => {
      if (!controller.signal.aborted) setSettings(data);
    }).catch(() => {
      if (!controller.signal.aborted) setErrorMessage('No pudimos cargar la información.');
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

/**
 * Hook del panel admin: formulario, guardado y mensajes.
 * Recibe el valor inicial desde SSR para evitar flash de carga.
 */
export function useAdminAboutSettings(initial: AboutSettings) {
  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      setForm(await saveAboutSettings(form));
      setSuccessMessage('Sección guardada.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron guardar los datos.');
    } finally { setIsSaving(false); }
  }
  return { form, setForm, isSaving, errorMessage, successMessage, handleSave };
}
