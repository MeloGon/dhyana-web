'use client';

import { useRef, useState } from 'react';
import { getAdminComplaintSheets } from '@/lib/api/complaint-book';
import type { AdminComplaintSheetsPage, ComplaintStatus } from '@/lib/types/complaint-book';

export function useAdminComplaintBook(initial: AdminComplaintSheetsPage) {
  const [data, setData] = useState(initial);
  const [estado, setEstado] = useState<'all' | ComplaintStatus>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const requestVersion = useRef(0);

  async function load(nextEstado: 'all' | ComplaintStatus, page: number) {
    const version = ++requestVersion.current;
    setIsLoading(true); setErrorMessage('');
    try {
      const result = await getAdminComplaintSheets({ estado: nextEstado, page });
      if (version === requestVersion.current) { setData(result); setEstado(nextEstado); }
    } catch (error) {
      if (version === requestVersion.current) setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar las hojas.');
    } finally {
      if (version === requestVersion.current) setIsLoading(false);
    }
  }

  function handleFilterChange(next: 'all' | ComplaintStatus) { void load(next, 1); }
  function handlePage(page: number) { void load(estado, page); }
  function handleRetry() { void load(estado, data.page); }

  return { data, estado, isLoading, errorMessage, handleFilterChange, handlePage, handleRetry };
}
