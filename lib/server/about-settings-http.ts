import 'server-only';

import { getAuthConfig } from '@/lib/server/auth-config';
import { HttpError } from '@/lib/server/http-error';
import { requireAdmin } from '@/lib/server/admin-auth';
import { getAboutSettings, getAdminAboutSettings, saveAboutSettings } from '@/lib/server/about-settings';
import { uploadAboutImage } from '@/lib/server/about-media';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

function errorResponse(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status)
    : json({ message: 'No se pudo acceder a la sección "Sobre nosotros". Inténtalo nuevamente.' }, 503);
}

export async function handleAboutSettingsGet(isAdmin: boolean) {
  try { return json(isAdmin ? await getAdminAboutSettings() : await getAboutSettings()); }
  catch (error) { return errorResponse(error); }
}

export async function handleAboutSettingsSave(request: Request) {
  try {
    if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
    const text = await request.text();
    if (text.length > 32768) throw new HttpError(413, 'Solicitud demasiado grande.');
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Solicitud inválida.');
    return json(await saveAboutSettings(body as Record<string, unknown>));
  } catch (error) { return errorResponse(error); }
}

export async function handleAboutMediaUpload(request: Request) {
  try {
    if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
    await requireAdmin();
    const type = request.headers.get('content-type') ?? '';
    if (!type.startsWith('multipart/form-data;')) throw new HttpError(415, 'Selecciona un archivo de imagen válido.');

    // Limita peticiones a 6 MB
    const limit = 6 * 1024 * 1024;
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, 'Faltan datos.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new HttpError(413, 'La imagen supera el límite permitido de 5 MB.');
      }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    const form = await new Response(bytes, { headers: { 'Content-Type': type } }).formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, 'Falta el archivo de imagen.');

    return json(await uploadAboutImage(file));
  } catch (error) { return errorResponse(error); }
}
