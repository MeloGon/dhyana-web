import type { AdminQuote, QuoteInput, QuoteItem } from '@/lib/types/quotes';

async function requestQuotes<T>(url: string, method = 'GET', body?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method,
    signal,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = await response.json().catch(() => {
    throw new Error('No se pudo leer la respuesta.');
  });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicQuotes = (signal?: AbortSignal) =>
  requestQuotes<QuoteItem[]>('/api/quotes', 'GET', undefined, signal);

export const getAdminQuotes = () =>
  requestQuotes<AdminQuote[]>('/api/admin/quotes');

export const saveQuote = (input: QuoteInput, id?: string) =>
  requestQuotes<AdminQuote>(`/api/admin/quotes${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', input);

export const deleteQuote = (id: string) =>
  requestQuotes<{ deleted: boolean }>(`/api/admin/quotes/${id}`, 'DELETE', {});
