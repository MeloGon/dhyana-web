import 'server-only';

import { HttpError } from '@/lib/server/http-error';

import { getAuthConfig } from '@/lib/server/auth-config';
import { requireAdmin } from '@/lib/server/admin-auth';
import { uploadWorkshopImage } from '@/lib/server/workshop-media';
import { getAdminCatalog, getPublicCatalog, deleteWorkshop, saveWorkshop, reorderWorkshops } from '@/lib/server/catalog';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

function errorResponse(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status)
    : json({ message: 'No se pudo acceder al catálogo. Inténtalo nuevamente.' }, 503);
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
  const text = await request.text();
  if (text.length > 65536) throw new HttpError(413, 'Solicitud demasiado grande.');
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Solicitud inválida.');
  return body as Record<string, unknown>;
}

export async function handleCatalogGet(isAdmin: boolean) {
  try { return json(isAdmin ? await getAdminCatalog() : await getPublicCatalog()); }
  catch (error) { return errorResponse(error); }
}

export async function handleWorkshopSave(request: Request, id?: string) {
  try {
    const body = await readBody(request);
    await requireAdmin();
    return json(await saveWorkshop(body, id), id ? 200 : 201);
  } catch (error) { return errorResponse(error); }
}

export async function handleWorkshopDelete(request: Request, id: string) {
  try {
    await readBody(request);
    await requireAdmin();
    return json(await deleteWorkshop(id));
  } catch (error) { return errorResponse(error); }
}

export async function handleWorkshopReorder(request: Request) {
  try {
    const body = await readBody(request);
    await requireAdmin();
    if (!Array.isArray(body.ids) || !body.ids.every((id) => typeof id === 'string') || !body.ids.length) {
      throw new HttpError(400, 'Lista de talleres inválida.');
    }
    return json(await reorderWorkshops(body.ids));
  } catch (error) { return errorResponse(error); }
}

export async function handleWorkshopMediaUpload(request: Request) {
  try {
    if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
    await requireAdmin();
    const type = request.headers.get('content-type') ?? '';
    if (!type.startsWith('multipart/form-data;')) throw new HttpError(415, 'Selecciona un archivo de imagen válido.');

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

    return json(await uploadWorkshopImage(file));
  } catch (error) { return errorResponse(error); }
}
