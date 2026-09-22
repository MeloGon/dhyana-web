import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { getAuthConfig } from '@/lib/server/auth-config';
import { HttpError } from '@/lib/server/http-error';
import {
  exportComplaintSheets,
  getAdminComplaintBookSettings,
  getAdminComplaintSheetDetail,
  getAdminComplaintSheets,
  getPublicComplaintBookSettings,
  respondComplaintSheet,
  saveComplaintBookSettings,
  setComplaintSheetStatus,
  submitComplaintSheet,
  uploadComplaintEvidence,
} from '@/lib/server/complaint-book';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}

function errorResponse(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status)
    : json({ message: 'No se pudo acceder al libro de reclamaciones. Inténtalo nuevamente.' }, 503);
}

async function readBody(request: Request, limit = 32768): Promise<Record<string, unknown>> {
  if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, 'Solicitud demasiado grande.');
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Solicitud inválida.');
  return body as Record<string, unknown>;
}

export async function handleComplaintBookSettingsGet(isAdmin: boolean) {
  try { return json(isAdmin ? await getAdminComplaintBookSettings() : await getPublicComplaintBookSettings()); }
  catch (error) { return errorResponse(error); }
}

export async function handleComplaintBookSettingsSave(request: Request) {
  try { return json(await saveComplaintBookSettings(await readBody(request))); }
  catch (error) { return errorResponse(error); }
}

export async function handleComplaintSheetSubmit(request: Request) {
  try { return json(await submitComplaintSheet(await readBody(request, 16384)), 201); }
  catch (error) { return errorResponse(error); }
}

export async function handleAdminComplaintSheetsGet(request: Request) {
  try { return json(await getAdminComplaintSheets(new URL(request.url).searchParams)); }
  catch (error) { return errorResponse(error); }
}

export async function handleAdminComplaintSheetDetailGet(id: string) {
  try { return json(await getAdminComplaintSheetDetail(id)); }
  catch (error) { return errorResponse(error); }
}

export async function handleAdminComplaintSheetUpdate(request: Request, id: string) {
  try {
    const body = await readBody(request);
    // Verificar sesión antes de interpretar la acción: un cuerpo inválido no
    // debe delatar la validación de negocio a un visitante sin permisos.
    await requireAdmin();
    if (body.action === 'status') return json(await setComplaintSheetStatus(id, body));
    if (body.action === 'respond') return json(await respondComplaintSheet(id, body));
    throw new HttpError(400, 'Operación no reconocida.');
  } catch (error) { return errorResponse(error); }
}

export async function handleComplaintEvidenceUpload(request: Request, id: string) {
  try {
    if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
    // Verificar sesión antes de leer el cuerpo: una solicitud sin permisos no
    // debe procesarse aunque el content-type no sea multipart.
    await requireAdmin();
    const type = request.headers.get('content-type') ?? '';
    if (!type.startsWith('multipart/form-data;')) throw new HttpError(415, 'Selecciona un archivo.');
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, 'Faltan datos.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 11000000) { await reader.cancel(); throw new HttpError(413, 'Solicitud demasiado grande.'); }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), { headers: { 'Content-Type': type } }).formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, 'Falta el archivo.');
    return json(await uploadComplaintEvidence(id, file));
  } catch (error) { return errorResponse(error); }
}

export async function handleComplaintBookExport() {
  try {
    const csv = await exportComplaintSheets();
    return new Response(csv, { status: 200, headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="libro-de-reclamaciones.csv"',
      'Cache-Control': 'private, no-store, max-age=0',
    } });
  } catch (error) { return errorResponse(error); }
}
