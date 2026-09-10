import 'server-only';

import { getAuthConfig } from '@/lib/server/auth-config';
import { HttpError } from '@/lib/server/http-error';
import { getAdminSales, registerManualSale, setSaleCoordination } from '@/lib/server/sales';

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}
function failure(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status)
    : json({ message: 'No se pudo acceder a ventas. Reintenta o vuelve a iniciar sesión.' }, 503);
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
  const text = await request.text();
  if (text.length > 16384) throw new HttpError(413, 'Solicitud demasiado grande.');
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Solicitud inválida.');
  return body as Record<string, unknown>;
}
export async function handleSalesGet(request: Request) {
  try { return json(await getAdminSales(new URL(request.url).searchParams)); } catch (error) { return failure(error); }
}
export async function handleManualSale(request: Request) {
  try { return json(await registerManualSale(await readBody(request)), 201); } catch (error) { return failure(error); }
}
export async function handleSaleCoordination(request: Request, id: string) {
  try { return json(await setSaleCoordination(id, await readBody(request))); } catch (error) { return failure(error); }
}
