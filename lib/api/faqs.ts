import type { AdminFaq, FaqInput, PublicFaq } from '@/lib/types/faqs';

async function requestFaqs<T>(url: string, method = 'GET', body?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, signal, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicFaqs = (signal?: AbortSignal) => requestFaqs<PublicFaq[]>('/api/faqs', 'GET', undefined, signal);
export const getAdminFaqs = () => requestFaqs<AdminFaq[]>('/api/admin/faqs');
export const saveFaq = (input: FaqInput, id?: string) =>
  requestFaqs<AdminFaq>(`/api/admin/faqs${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', input);
export const deleteFaq = (id: string) => requestFaqs<{ deleted: boolean }>(`/api/admin/faqs/${id}`, 'DELETE', {});
