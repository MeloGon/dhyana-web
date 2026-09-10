import 'server-only';

import { HttpError } from '@/lib/server/http-error';

import { performAuthAction, requireAdmin } from '@/lib/server/admin-auth';
import { getAuthConfig } from '@/lib/server/auth-config';

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return Response.json({ message: error.message }, { status: error.status, headers: privateHeaders });
  }
  // No enviar errores del proveedor, tokens, contraseñas ni variables al cliente.
  return Response.json({ message: 'Servicio no disponible. Inténtalo nuevamente.' },
    { status: 503, headers: privateHeaders });
}

export async function handleAuthPost(request: Request, action: string) {
  try {
    // Las cookies HttpOnly requieren protección CSRF también en login y logout.
    // APP_URL es configuración confiable; no construirla con Host del visitante.
    if (request.headers.get('origin') !== getAuthConfig().origin) {
      throw new HttpError(403, 'Solicitud de origen no permitido.');
    }
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      throw new HttpError(415, 'Se esperaba una solicitud JSON.');
    }
    const text = await request.text();
    if (text.length > 16384) throw new HttpError(413, 'Solicitud demasiado grande.');
    let body: unknown;
    try { body = JSON.parse(text); } catch { throw new HttpError(400, 'Solicitud inválida.'); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new HttpError(400, 'Solicitud inválida.');
    }
    const result = await performAuthAction(action, body as Record<string, unknown>);
    return Response.json(result, { headers: privateHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function handleAdminSession() {
  try {
    return Response.json(await requireAdmin(), { headers: privateHeaders });
  } catch (error) {
    return errorResponse(error);
  }
}
