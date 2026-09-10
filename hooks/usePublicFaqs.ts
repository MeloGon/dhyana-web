'use client';

import { useEffect, useState } from 'react';
import { getPublicFaqs } from '@/lib/api/faqs';
import type { PublicFaq } from '@/lib/types/faqs';

export function usePublicFaqs() {
  const [faqs, setFaqs] = useState<PublicFaq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPublicFaqs(controller.signal).then((data) => {
      if (!controller.signal.aborted) setFaqs(data);
    }).catch(() => {
      if (!controller.signal.aborted) setErrorMessage('No pudimos cargar las preguntas frecuentes.');
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  function handleRetry() {
    setErrorMessage(''); setIsLoading(true); setAttempt((previous) => previous + 1);
  }
  return { faqs, isLoading, errorMessage, handleRetry };
}
