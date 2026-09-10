import 'server-only';

import { getAuthConfig } from '@/lib/server/auth-config';
import { HttpError } from '@/lib/server/http-error';
import { getAdminContactSettings, getPublicContactSettings, saveContactSettings } from '@/lib/server/contact-settings';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

function errorResponse(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status)
    : json({ message: 'No se pudo acceder a los datos de la consulta. Inténtalo nuevamente.' }, 503);
}

export async function handleContactSettingsGet(isAdmin: boolean) {
  try { return json(isAdmin ? await getAdminContactSettings() : await getPublicContactSettings()); }
  catch (error) { return errorResponse(error); }
}

export async function handleContactSettingsSave(request: Request) {
  try {
    if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
    const text = await request.text();
    if (text.length > 32768) throw new HttpError(413, 'Solicitud demasiado grande.');
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Solicitud inválida.');
    return json(await saveContactSettings(body as Record<string, unknown>));
  } catch (error) { return errorResponse(error); }
}
