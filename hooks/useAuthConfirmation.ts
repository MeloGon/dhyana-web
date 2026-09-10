'use client';

import { useEffect, useRef, useState } from 'react';
import { confirmAdminAccess } from '@/lib/api/admin-auth';
import type { AuthConfirmation } from '@/lib/types/admin-auth';

export function useAuthConfirmation() {
  const payload = useRef<AuthConfirmation | null>(null);
  const captured = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Guardar enlace solo en memoria y quitar tokens del historial visible.
    // La referencia evita perderlos cuando Strict Mode repite el efecto.
    if (captured.current) return;
    captured.current = true;
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    const code = url.searchParams.get('code');
    const tokenHash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');
    const accessToken = hash.get('access_token');
    const refreshToken = hash.get('refresh_token');
    if (code) payload.current = { code };
    else if (tokenHash && (type === 'invite' || type === 'recovery')) {
      payload.current = { tokenHash, type };
    } else if (accessToken && refreshToken) payload.current = { accessToken, refreshToken };
    window.history.replaceState(null, '', '/auth/confirm');
  }, []);

  async function handleConfirm() {
    if (isSubmitting) return;
    if (!payload.current) {
      setErrorMessage('El enlace está incompleto o venció. Abre el correo otra vez o solicita otro enlace.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await confirmAdminAccess(payload.current);
      payload.current = null;
      window.location.replace('/admin/password');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo confirmar el acceso.');
      setIsSubmitting(false);
    }
  }
  return { isSubmitting, errorMessage, handleConfirm };
}
