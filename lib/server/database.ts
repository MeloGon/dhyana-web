import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

/**
 * Cliente privilegiado para los servicios del servidor; no representa al usuario.
 * Omite RLS: cada operación administrativa debe validar sesión y permisos antes
 * de usarlo. El login del panel usa el cliente separado de auth-session.ts.
 */
export function createDatabaseAdminClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();

  if (!url || !secretKey) {
    throw new Error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY en la configuración del servidor.');
  }

  if (!secretKey.startsWith('sb_secret_')) {
    throw new Error('SUPABASE_SECRET_KEY debe contener una Secret key del proyecto Supabase.');
  }

  return createClient<Database>(url, secretKey, {
    // Sin cookies ni almacenamiento de sesión: este cliente nunca inicia sesión
    // como participante o administrador y se crea cuando lo requiere un servicio.
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
