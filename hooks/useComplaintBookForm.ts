'use client';

import { useEffect, useState } from 'react';
import { getPublicComplaintBookSettings, submitComplaintSheet } from '@/lib/api/complaint-book';
import type { ComplaintSheetConfirmation, ComplaintSheetInput, PublicComplaintBookSettings } from '@/lib/types/complaint-book';

function emptyForm(): ComplaintSheetInput {
  return {
    tipo: 'reclamo', consumidorNombre: '', consumidorDomicilio: '', consumidorDocumentoTipo: 'dni',
    consumidorDocumentoNumero: '', consumidorTelefono: '', consumidorCorreo: '', esMenorEdad: false,
    representanteNombre: '', representanteDocumentoNumero: '', bienTipo: 'servicio', bienDescripcion: '',
    montoReclamadoCents: null, detalleHechos: '', detallePedido: '',
  };
}

// "150", "150.5" o "150,50" → céntimos. Vacío = no indica monto. Inválido = undefined.
function parseAmountToCents(text: string): number | null | undefined {
  const normalized = text.trim().replace(',', '.');
  if (!normalized) return null;
  if (!/^(\d{1,9}(\.\d{0,2})?|\.\d{1,2})$/.test(normalized)) return undefined;
  return Math.round(Number(normalized) * 100);
}

// Filtra mientras se escribe: solo dígitos, un separador decimal y dos decimales.
function sanitizeAmount(text: string) {
  const [integer, ...rest] = text.replace(',', '.').replace(/[^\d.]/g, '').split('.');
  const decimals = rest.join('').slice(0, 2);
  return rest.length ? `${integer.slice(0, 9)}.${decimals}` : integer.slice(0, 9);
}

export function useComplaintBookForm() {
  const [settings, setSettings] = useState<PublicComplaintBookSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [form, setForm] = useState<ComplaintSheetInput>(emptyForm);
  // El monto se edita como texto libre: convertirlo en cada tecla a céntimos
  // y volver a formatearlo impedía escribir más de un dígito.
  const [montoTexto, setMontoTexto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmation, setConfirmation] = useState<ComplaintSheetConfirmation | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getPublicComplaintBookSettings(controller.signal).then((data) => {
      if (!controller.signal.aborted) setSettings(data);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadErrorMessage('No pudimos cargar los datos del libro de reclamaciones.');
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoadingSettings(false);
    });
    return () => controller.abort();
  }, []);

  async function handleSubmit() {
    if (isSubmitting) return;
    const montoReclamadoCents = parseAmountToCents(montoTexto);
    if (montoReclamadoCents === undefined) {
      setErrorMessage('Monto reclamado: usa solo números, con hasta dos decimales (por ejemplo 150 o 150.50).');
      return;
    }
    setIsSubmitting(true); setErrorMessage('');
    try {
      setConfirmation(await submitComplaintSheet({ ...form, montoReclamadoCents }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo registrar la hoja. Revisa los datos e inténtalo nuevamente.');
    } finally { setIsSubmitting(false); }
  }

  function handleMontoChange(text: string) { setMontoTexto(sanitizeAmount(text)); }
  function handleMontoBlur() {
    const cents = parseAmountToCents(montoTexto);
    if (typeof cents === 'number') setMontoTexto((cents / 100).toFixed(2));
  }

  function handleNewSheet() {
    setConfirmation(null); setForm(emptyForm()); setMontoTexto(''); setErrorMessage('');
  }

  return { settings, isLoadingSettings, loadErrorMessage, form, setForm, montoTexto, handleMontoChange, handleMontoBlur, isSubmitting, errorMessage, confirmation, handleSubmit, handleNewSheet };
}
