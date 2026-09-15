import type { SiteContent, SiteSettings, SiteService, UploadedSiteAsset } from '@/lib/types/site-settings';

async function readResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la operación.');
  return data as T;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<SiteContent> {
  return readResponse(await fetch('/api/admin/site-settings', { method: 'PUT', credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) }));
}

export async function saveSiteServices(services: SiteService[]): Promise<SiteService[]> {
  return readResponse(await fetch('/api/admin/services', { method: 'PUT', credentials: 'same-origin', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(services) }));
}

export async function uploadSiteAsset(file: File, kind: 'logo' | 'video'): Promise<UploadedSiteAsset> {
  if (kind === 'logo') {
    const form = new FormData();
    form.append('file', file);
    return readResponse(await fetch('/api/admin/site-media/logo', { method: 'POST', credentials: 'same-origin', body: form }));
  }
  if (!['video/mp4', 'video/webm'].includes(file.type) || file.size > 52428800 || file.size === 0) throw new Error('Selecciona un MP4 o WebM de hasta 50 MB.');
  const asset = await readResponse<UploadedSiteAsset & { signedUrl: string }>(await fetch('/api/admin/site-media/video', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: file.type, size: file.size }),
  }));
  // El video va directo a Storage para evitar límites de tamaño del hosting de Next.
  const form = new FormData();
  form.append('cacheControl', '3600');
  form.append('', file);
  const response = await fetch(asset.signedUrl, { method: 'PUT', credentials: 'omit', body: form });
  if (!response.ok) throw new Error('No se pudo subir el video. Reintenta con un archivo de hasta 50 MB.');
  return { path: asset.path, url: asset.url };
}
