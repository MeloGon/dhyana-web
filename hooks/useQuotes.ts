'use client';

import { useEffect, useState } from 'react';
import { deleteQuote, getPublicQuotes, saveQuote } from '@/lib/api/quotes';
import type { AdminQuote, QuoteInput, QuoteItem } from '@/lib/types/quotes';

const INITIAL_QUOTES: QuoteItem[] = [
  {
    id: 'initial-1',
    quote: 'No puedes detener las olas, pero puedes aprender a surfear.',
    author: 'Jon Kabat-Zinn',
    role: 'Pionero de la Reducción del Estrés Basada en Mindfulness (MBSR)',
    accentNote: 'Respira, cada momento es una oportunidad para empezar de nuevo',
    variant: 'mint',
    sortOrder: 1,
  },
  {
    id: 'initial-2',
    quote: 'La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar.',
    author: 'Carl Rogers',
    role: 'Fundador del Enfoque Centrado en la Persona',
    accentNote: 'Tu espacio de aceptación incondicional',
    variant: 'sky',
    sortOrder: 2,
  },
  {
    id: 'initial-3',
    quote: 'Entre el estímulo y la respuesta hay un espacio. En ese espacio reside nuestro poder de elegir.',
    author: 'Viktor Frankl',
    role: 'Neurólogo, psiquiatra y autor de El hombre en busca de sentido',
    accentNote: 'Elige con calma tu propio camino',
    variant: 'lavender',
    sortOrder: 3,
  },
  {
    id: 'initial-4',
    quote: 'Sentir no es un signo de debilidad; es la prueba más certera de que estás vivo y conectado.',
    author: 'Brené Brown',
    role: 'Investigadora y referente en empatía y vulnerabilidad',
    accentNote: 'Abraza tu humanidad con gentileza',
    variant: 'mint',
    sortOrder: 4,
  },
];

/** Hook para la landing pública: carga las reflexiones con AbortController y soporte de reintento. */
export function usePublicQuotes() {
  const [quotes, setQuotes] = useState<QuoteItem[]>(INITIAL_QUOTES);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPublicQuotes(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setQuotes(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setErrorMessage('No pudimos cargar las reflexiones.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);

  function handleRetry() {
    setErrorMessage('');
    setIsLoading(true);
    setAttempt((previous) => previous + 1);
  }

  return { quotes, isLoading, errorMessage, handleRetry };
}

function emptyForm(quotes: AdminQuote[]): QuoteInput {
  return {
    quote: '',
    author: '',
    role: '',
    accentNote: '',
    variant: 'mint',
    sortOrder: Math.min(10000, Math.max(0, ...quotes.map((q) => q.sortOrder)) + 1),
    isPublished: true,
  };
}

/** Hook del panel de administración: gestiona la lista de citas, selección, formulario y operaciones CRUD. */
export function useAdminQuotes(initial: AdminQuote[]) {
  const [quotes, setQuotes] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [form, setForm] = useState<QuoteInput>(() => emptyForm(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminQuote | null>(null);

  function editQuote(item?: AdminQuote) {
    setSelectedId(item?.id);
    setForm(
      item
        ? {
            quote: item.quote,
            author: item.author,
            role: item.role,
            accentNote: item.accentNote,
            variant: item.variant,
            sortOrder: item.sortOrder,
            isPublished: item.isPublished,
          }
        : emptyForm(quotes)
    );
    setErrorMessage('');
    setSuccessMessage('');
    setPendingDelete(null);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const saved = await saveQuote(form, selectedId);
      setQuotes((previous) =>
        [...previous.filter((q) => q.id !== saved.id), saved].sort(
          (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)
        )
      );
      setSelectedId(saved.id);
      setForm(saved);
      setSuccessMessage(
        saved.isPublished ? 'Reflexión guardada y publicada.' : 'Reflexión guardada como borrador.'
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la reflexión.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete || isSaving) return;
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await deleteQuote(pendingDelete.id);
      const remaining = quotes.filter((q) => q.id !== pendingDelete.id);
      setQuotes(remaining);
      if (selectedId === pendingDelete.id) {
        setSelectedId(undefined);
        setForm(emptyForm(remaining));
      }
      setPendingDelete(null);
      setSuccessMessage('Reflexión eliminada.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar la reflexión.');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    quotes,
    selectedId,
    form,
    setForm,
    isSaving,
    errorMessage,
    successMessage,
    pendingDelete,
    setPendingDelete,
    editQuote,
    handleSave,
    handleDelete,
  };
}
