'use client';

import { useState } from 'react';
import { deleteFaq, saveFaq } from '@/lib/api/faqs';
import type { AdminFaq, FaqInput } from '@/lib/types/faqs';

function emptyForm(faqs: AdminFaq[]): FaqInput {
  return { question: '', answer: '', sortOrder: Math.min(10000, Math.max(0, ...faqs.map((faq) => faq.sortOrder)) + 1), isPublished: false };
}

export function useAdminFaqs(initial: AdminFaq[]) {
  const [faqs, setFaqs] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [form, setForm] = useState<FaqInput>(() => emptyForm(initial));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDelete, setPendingDelete] = useState<AdminFaq | null>(null);

  function editFaq(faq?: AdminFaq) {
    setSelectedId(faq?.id);
    setForm(faq ? { question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, isPublished: faq.isPublished } : emptyForm(faqs));
    setErrorMessage(''); setSuccessMessage(''); setPendingDelete(null);
  }

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      const saved = await saveFaq(form, selectedId);
      setFaqs((previous) => [...previous.filter((faq) => faq.id !== saved.id), saved]
        .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)));
      setSelectedId(saved.id); setForm(saved);
      setSuccessMessage(saved.isPublished ? 'Pregunta guardada y publicada.' : 'Pregunta guardada como borrador.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo guardar la pregunta.');
    } finally { setIsSaving(false); }
  }

  async function handleDelete() {
    if (!pendingDelete || isSaving) return;
    setIsSaving(true); setErrorMessage(''); setSuccessMessage('');
    try {
      await deleteFaq(pendingDelete.id);
      const remaining = faqs.filter((faq) => faq.id !== pendingDelete.id);
      setFaqs(remaining);
      if (selectedId === pendingDelete.id) { setSelectedId(undefined); setForm(emptyForm(remaining)); }
      setPendingDelete(null); setSuccessMessage('Pregunta eliminada.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar la pregunta.');
    } finally { setIsSaving(false); }
  }

  return { faqs, selectedId, form, setForm, isSaving, errorMessage, successMessage,
    pendingDelete, setPendingDelete, editFaq, handleSave, handleDelete };
}
