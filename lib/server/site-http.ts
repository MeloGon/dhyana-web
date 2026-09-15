import 'server-only';
import { getAuthConfig } from '@/lib/server/auth-config';
import { requireAdmin } from '@/lib/server/admin-auth';
import { HttpError } from '@/lib/server/http-error';
import { getPublicSiteContent, getAdminSiteContent, saveSiteSettings, saveSiteServices } from '@/lib/server/site-settings';
import { createVideoUpload, uploadSiteLogo } from '@/lib/server/site-media';

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}
function failure(error: unknown) {
  return error instanceof HttpError ? json({ message: error.message }, error.status) : json({ message: 'No se pudo completar la operación. Inténtalo nuevamente.' }, 503);
}

export async function handleSiteGet(admin: boolean) {
  try { return json(admin ? await getAdminSiteContent() : await getPublicSiteContent()); }
  catch (error) { return failure(error); }
}

export async function handleSiteMutation(request: Request, action: 'settings' | 'services' | 'video' | 'logo') {
  try {
    if (request.headers.get('origin') !== getAuthConfig().origin) throw new HttpError(403, 'Solicitud de origen no permitido.');
    await requireAdmin();
    // Lee el cuerpo por partes: también limita peticiones sin Content-Length.
    const limit = action === 'logo' ? 300000 : 150000;
    const reader = request.body?.getReader();
    if (!reader) throw new HttpError(400, 'Faltan datos.');
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, 'Solicitud demasiado grande.'); }
      chunks.push(value);
    }
    const bytes = Buffer.concat(chunks);
    const type = request.headers.get('content-type') ?? '';
    if (action === 'logo') {
      if (!type.startsWith('multipart/form-data;')) throw new HttpError(415, 'Selecciona un archivo SVG.');
      const form = await new Response(bytes, { headers: { 'Content-Type': type } }).formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new HttpError(400, 'Falta el archivo SVG.');
      return json(await uploadSiteLogo(file));
    }
    if (type.split(';')[0].trim() !== 'application/json') throw new HttpError(415, 'Se esperaba JSON.');
    let body: unknown;
    try { body = JSON.parse(bytes.toString('utf8')); } catch { throw new HttpError(400, 'JSON inválido.'); }
    if (action === 'video') return json(await createVideoUpload(body));
    return json(action === 'settings' ? await saveSiteSettings(body) : await saveSiteServices(body));
  } catch (error) { return failure(error); }
}
