import 'server-only';

import { HttpError } from '@/lib/server/http-error';
import { redirect } from 'next/navigation';
import { createAuthSessionClient } from '@/lib/server/auth-session';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { getAuthConfig } from '@/lib/server/auth-config';
import type { AdminIdentity } from '@/lib/types/admin-auth';

type SessionClient = Awaited<ReturnType<typeof createAuthSessionClient>>;

// Repetir en cada operación privada. Nunca confiar en email, user_metadata,
// getSession() ni en que el visitante ya pasó por la página del panel.
export async function requireAdmin(client?: SessionClient): Promise<AdminIdentity> {
  const session = client ?? await createAuthSessionClient();
  const { data, error } = await session.auth.getUser();
  if (error || !data.user) throw new HttpError(401, 'Inicia sesión para continuar.');
  const { data: admin, error: databaseError } = await createDatabaseAdminClient()
    .from('admin_users').select('user_id').eq('user_id', data.user.id)
    .eq('is_active', true).maybeSingle();
  if (databaseError) throw new Error('No se pudieron verificar los permisos.');
  if (!admin) throw new HttpError(403, 'Esta cuenta no tiene acceso administrativo.');
  return { id: data.user.id, email: data.user.email ?? '' };
}

export async function requireAdminPage() {
  try {
    return await requireAdmin();
  } catch (error) {
    if (error instanceof HttpError) redirect('/admin/login');
    throw error;
  }
}

function stringField(body: Record<string, unknown>, name: string, max: number) {
  const value = body[name];
  if (typeof value !== 'string' || !value || value.length > max) {
    throw new HttpError(400, 'Revisa los datos ingresados.');
  }
  return value;
}

function emailField(body: Record<string, unknown>) {
  const email = stringField(body, 'email', 254).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Ingresa un correo válido.');
  }
  return email;
}

export async function performAuthAction(action: string, body: Record<string, unknown>) {
  const client = await createAuthSessionClient(true);

  if (action === 'login') {
    const email = emailField(body);
    const password = stringField(body, 'password', 256);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new HttpError(error.status === 429 ? 429 : 401,
      error.status === 429 ? 'Demasiados intentos. Espera unos minutos.' : 'Correo o contraseña incorrectos.');
    try {
      await requireAdmin(client);
    } catch (error) {
      await client.auth.signOut({ scope: 'local' });
      throw error;
    }
    return { message: 'Sesión iniciada.' };
  }

  if (action === 'logout') {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) throw new HttpError(503, 'No se pudo cerrar sesión. Inténtalo nuevamente.');
    return { message: 'Sesión cerrada.' };
  }

  if (action === 'recover') {
    const { error } = await client.auth.resetPasswordForEmail(emailField(body), {
      redirectTo: `${getAuthConfig().origin}/auth/confirm`,
    });
    if (error) throw new HttpError(error.status === 429 ? 429 : 503,
      'No se pudo solicitar el enlace. Espera unos minutos e inténtalo nuevamente.');
    // Mismo mensaje exista o no el correo: no revelar cuentas registradas.
    return { message: 'Si el correo tiene una cuenta, recibirás un enlace. Ábrelo en este mismo navegador.' };
  }

  if (action === 'confirm') {
    let error;
    if ('code' in body) {
      ({ error } = await client.auth.exchangeCodeForSession(stringField(body, 'code', 2048)));
    } else if ('tokenHash' in body && (body.type === 'invite' || body.type === 'recovery')) {
      ({ error } = await client.auth.verifyOtp({
        token_hash: stringField(body, 'tokenHash', 2048), type: body.type,
      }));
    } else {
      // Las invitaciones de Supabase no usan PKCE: el navegador recibe tokens
      // en el fragmento del enlace y los entrega una sola vez a este endpoint.
      ({ error } = await client.auth.setSession({
        access_token: stringField(body, 'accessToken', 8192),
        refresh_token: stringField(body, 'refreshToken', 2048),
      }));
    }
    if (error) throw new HttpError(401, 'El enlace venció o ya fue usado. Solicita otro.');
    try {
      await requireAdmin(client);
    } catch (error) {
      await client.auth.signOut({ scope: 'local' });
      throw error;
    }
    return { message: 'Acceso confirmado.' };
  }

  if (action === 'password') {
    await requireAdmin(client);
    const password = stringField(body, 'password', 256);
    if (password.length < 12) throw new HttpError(400, 'Usa al menos 12 caracteres.');
    const { error } = await client.auth.updateUser({ password });
    if (error) throw new HttpError(400, 'No se pudo guardar. Usa una contraseña distinta o solicita otro enlace.');
    return { message: 'Contraseña guardada.' };
  }

  throw new HttpError(404, 'Operación no encontrada.');
}
