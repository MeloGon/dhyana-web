import type { AboutSettings } from '@/lib/types/about-settings';

async function requestSettings<T>(url: string, method = 'GET', body?: AboutSettings, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, signal, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicAboutSettings = (signal?: AbortSignal) =>
  requestSettings<AboutSettings>('/api/about-settings', 'GET', undefined, signal);

export const saveAboutSettings = (input: AboutSettings) =>
  requestSettings<AboutSettings>('/api/admin/about-settings', 'PUT', input);

export async function uploadAboutImage(file: File): Promise<{ url: string; path: string }> {
  const form = new FormData();
  form.set('file', file);
  const response = await fetch('/api/admin/about-media', {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta del servidor.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo subir la imagen.');
  return result;
}
