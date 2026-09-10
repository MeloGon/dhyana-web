import type { ContactSettings, PublicContactSettings } from '@/lib/types/contact-settings';

async function requestSettings<T>(url: string, method = 'GET', body?: ContactSettings, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, signal, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicContactSettings = (signal?: AbortSignal) => requestSettings<PublicContactSettings>('/api/contact-settings', 'GET', undefined, signal);
export const saveContactSettings = (input: ContactSettings) => requestSettings<ContactSettings>('/api/admin/contact-settings', 'PUT', input);
