import 'server-only';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import { siteAssetUrl } from '@/lib/server/site-media';

const bucket = 'site-media';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function uploadAboutImage(file: File) {
  await requireAdmin();

  if (!file || file.size === 0) {
    throw new HttpError(400, 'Selecciona una imagen.');
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new HttpError(400, 'La imagen no debe superar los 5 MB.');
  }

  const mime = file.type.toLowerCase();
  const ext = ALLOWED_MIME_TYPES[mime];
  if (!ext) {
    throw new HttpError(400, 'Formato no permitido. Usa archivos JPG, PNG o WebP.');
  }

  const path = `about/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await createDatabaseAdminClient()
    .storage.from(bucket)
    .upload(path, buffer, { contentType: mime, upsert: false });

  if (error) {
    throw new Error('No se pudo subir la imagen.');
  }

  return { path, url: siteAssetUrl(path) };
}