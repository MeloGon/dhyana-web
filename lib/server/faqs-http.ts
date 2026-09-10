import 'server-only';

import { getAuthConfig } from '@/lib/server/auth-config';
import { HttpError } from '@/lib/server/http-error';
import { deleteFaq, getAdminFaqs, getPublicFaqs, saveFaq } from '@/lib/server/faqs';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

function errorResponse(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status)
    : json({ message: 'No se pudo acceder a las preguntas frecuentes. Inténtalo nuevamente.' }, 503);
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
  const text = await request.text();
  if (text.length > 32768) throw new HttpError(413, 'Solicitud demasiado grande.');
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Solicitud inválida.');
  return body as Record<string, unknown>;
}

export async function handleFaqsGet(isAdmin: boolean) {
  try { return json(isAdmin ? await getAdminFaqs() : await getPublicFaqs()); }
  catch (error) { return errorResponse(error); }
}

export async function handleFaqSave(request: Request, id?: string) {
  try { return json(await saveFaq(await readBody(request), id), id ? 200 : 201); }
  catch (error) { return errorResponse(error); }
}

export async function handleFaqDelete(request: Request, id: string) {
  try { await readBody(request); return json(await deleteFaq(id)); }
  catch (error) { return errorResponse(error); }
}
