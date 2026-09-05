'use client';

import { useState } from 'react';
import { submitContactRequest } from '@/lib/api/contact';
import type { ContactFormData } from '@/lib/types';

const EMPTY_FORM: ContactFormData = {
  name: '',
  email: '',
  phone: '',
  modality: 'online',
  service: 'Psicoterapia Individual',
  schedulePreference: 'tardes',
  message: '',
  agreePrivacy: true,
};

/**
 * ViewModel del formulario de contacto: estado, envío y reset.
 *
 * El componente (`ContactSection`) queda solo pintando; toda la lógica de
 * "qué pasa cuando el usuario envía" vive acá, y la llamada al backend vive
 * más abajo todavía, en `lib/api/contact.ts`.
 *
 * @param preselectedService servicio elegido en ServicesSection. Cuando cambia,
 *   el campo `service` del formulario se sincroniza solo.
 */
export function useContactForm(preselectedService: string) {
  const [formData, setFormData] = useState<ContactFormData>({
    ...EMPTY_FORM,
    service: preselectedService,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sincroniza el campo `service` cuando el prop cambia desde afuera.
  // Comparar contra un valor previo guardado en estado es el patrón oficial
  // de React para reaccionar a props sin usar useEffect (evita un render extra).
  const [prevPropService, setPrevPropService] = useState(preselectedService);
  if (preselectedService !== prevPropService) {
    setPrevPropService(preselectedService);
    setFormData((prev) => ({ ...prev, service: preselectedService }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await submitContactRequest(formData);
      setConfirmationCode(result.referenceCode);
      setIsSubmitted(true);
    } catch {
      setErrorMessage('No pudimos enviar tu solicitud. Intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrorMessage('');
    setFormData(EMPTY_FORM);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    isSubmitted,
    confirmationCode,
    errorMessage,
    handleSubmit,
    handleReset,
  };
}
