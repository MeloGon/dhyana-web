'use client';

import { useState } from 'react';
import { submitWorkshopRegistration } from '@/lib/api/workshops';
import type { WorkshopFormData, WorkshopItem } from '@/lib/types';

const EMPTY_FORM: WorkshopFormData = {
  workshopChoice: 'Mindfulness y Regulación Emocional (4 semanas)',
  categoryChoice: 'grupal',
  fullName: '',
  email: '',
  phone: '',
  modality: 'Online',
  priorExperience: 'No',
  notes: '',
};

/**
 * ViewModel del formulario de inscripción a talleres: estado, pre-selección
 * al tocar una tarjeta, envío y reset.
 *
 * `selectWorkshop` / `selectIndividual` son los que hacen que, al tocar
 * "Inscribirme" en una tarjeta, el formulario de abajo ya venga completado
 * con ese taller.
 */
export function useWorkshopRegistration() {
  const [formData, setFormData] = useState<WorkshopFormData>(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [registrationCode, setRegistrationCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectIndividual = () => {
    setFormData((prev) => ({
      ...prev,
      categoryChoice: 'individual',
      workshopChoice: 'Taller Individual Personalizado 1 a 1',
    }));
  };

  const selectWorkshop = (ws: WorkshopItem) => {
    setFormData((prev) => ({
      ...prev,
      categoryChoice: 'grupal',
      workshopChoice: `${ws.title} (${ws.type})`,
      modality: ws.modality.includes('Online') ? 'Online' : 'Presencial',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await submitWorkshopRegistration(formData);
      setRegistrationCode(result.referenceCode);
      setFormSubmitted(true);
    } catch {
      setErrorMessage('No pudimos registrar tu inscripción. Intenta de nuevo o escríbenos por WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormSubmitted(false);
    setErrorMessage('');
    setFormData(EMPTY_FORM);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    formSubmitted,
    registrationCode,
    errorMessage,
    selectIndividual,
    selectWorkshop,
    handleSubmit,
    handleReset,
  };
}
