import type { LegalSettings } from '@/lib/types/legal';

async function requestSettings<T>(url: string, method = 'GET', body?: LegalSettings, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, signal, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicLegalSettings = (signal?: AbortSignal) => requestSettings<LegalSettings>('/api/legal-settings', 'GET', undefined, signal);
export const saveLegalSettings = (input: LegalSettings) => requestSettings<LegalSettings>('/api/admin/legal-settings', 'PUT', input);
