import 'server-only';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import { inputObject, parseAssetPath } from '@/lib/server/site-validation';
import { validateLogoSvg } from '@/lib/server/svg-validation';

const bucket = 'site-media';
export function siteAssetUrl(path: string) {
  return path ? createDatabaseAdminClient().storage.from(bucket).getPublicUrl(path).data.publicUrl : '';
}

export async function assertSiteAsset(path: string, kind: 'logo' | 'video') {
  if (!path) return;
  parseAssetPath(path, kind);
  const { data, error } = await createDatabaseAdminClient().storage.from(bucket).info(path);
  const mime = data?.contentType;
  const expected = kind === 'logo' ? 'image/svg+xml' : path.endsWith('.webm') ? 'video/webm' : 'video/mp4';
  if (error || mime !== expected || !data?.size || data.size > (kind === 'logo' ? 262144 : 52428800)) {
    throw new HttpError(400, 'El archivo no está disponible o no tiene el formato permitido. Vuelve a subirlo.');
  }
}

export async function createVideoUpload(body: unknown) {
  await requireAdmin();
  const input = inputObject(body);
  if (!['video/mp4', 'video/webm'].includes(String(input.type)) || typeof input.size !== 'number' || !Number.isInteger(input.size) || input.size <= 0 || input.size > 52428800) {
    throw new HttpError(400, 'Selecciona un video MP4 o WebM de hasta 50 MB.');
  }
  const path = `video/${randomUUID()}.${input.type === 'video/mp4' ? 'mp4' : 'webm'}`;
  const { data, error } = await createDatabaseAdminClient().storage.from(bucket).createSignedUploadUrl(path, { upsert: false });
  if (error) throw new Error('No se pudo preparar la subida.');
  // Autorización temporal para un solo archivo; nunca enviamos la clave de servidor.
  return { path, url: siteAssetUrl(path), signedUrl: data.signedUrl };
}

export async function uploadSiteLogo(file: File) {
  await requireAdmin();
  if (!file.name.toLowerCase().endsWith('.svg') || file.size === 0 || file.size > 262144) throw new HttpError(400, 'Selecciona un SVG de hasta 256 KB.');
  let svg: string;
  try { svg = validateLogoSvg(await file.text()); }
  catch (error) { throw new HttpError(400, error instanceof Error ? error.message : 'SVG inválido.'); }
  const path = `logo/${randomUUID()}.svg`;
  const { error } = await createDatabaseAdminClient().storage.from(bucket).upload(path, Buffer.from(svg), { contentType: 'image/svg+xml', upsert: false });
  if (error) throw new Error('No se pudo subir el logo.');
  return { path, url: siteAssetUrl(path) };
}
