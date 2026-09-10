'use client';

import { useEffect, useState } from 'react';
import { getPublicWorkshops } from '@/lib/api/catalog';
import type { PublicWorkshop } from '@/lib/types/catalog';

export function usePublicCatalog() {
  const [workshops, setWorkshops] = useState<PublicWorkshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPublicWorkshops(controller.signal).then((data) => {
      if (!controller.signal.aborted) setWorkshops(data);
    }).catch(() => {
      if (!controller.signal.aborted) setErrorMessage('No pudimos cargar los talleres. Inténtalo nuevamente.');
    }).finally(() => {
      if (!controller.signal.aborted) setIsLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  function handleRetry() {
    setErrorMessage(''); setIsLoading(true); setAttempt((previous) => previous + 1);
  }
  return { workshops, isLoading, errorMessage, handleRetry };
}
