'use client';

import { useState, type FormEvent } from 'react';
import { loginAdmin, recoverAdminPassword, saveAdminPassword, logoutAdmin } from '@/lib/api/admin-auth';
import type { AuthFormMode } from '@/lib/types/admin-auth';

export function useAdminAuth(mode: AuthFormMode) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    setSuccessMessage('');
    if (mode === 'password' && password !== confirmation) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'recover') {
        const result = await recoverAdminPassword(email);
        setSuccessMessage(result.message);
      } else {
        if (mode === 'login') await loginAdmin(email, password);
        else await saveAdminPassword(password);
        // Recarga completa: no reutilizar contenido privado del router después
        // de cambiar sesión. La contraseña solo permanece en memoria del form.
        window.location.replace('/admin');
      }
      setPassword('');
      setConfirmation('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo completar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { email, setEmail, password, setPassword, confirmation, setConfirmation,
    isSubmitting, errorMessage, successMessage, handleSubmit };
}

export function useAdminLogout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleLogout() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await logoutAdmin();
      window.location.replace('/admin/login');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cerrar sesión.');
      setIsSubmitting(false);
    }
  }
  return { isSubmitting, errorMessage, handleLogout };
}
