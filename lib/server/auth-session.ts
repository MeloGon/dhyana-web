import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAuthConfig, getAuthCookieOptions } from '@/lib/server/auth-config';
import type { Database } from '@/lib/types/database';

export async function createAuthSessionClient(writable = false) {
  const cookieStore = await cookies();
  const { url, publishableKey } = getAuthConfig();
  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: getAuthCookieOptions(),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        // Las páginas solo leen cookies. Proxy renueva y guarda la sesión antes
        // del render; los endpoints sí pueden escribir después de login o logout.
        if (!writable) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
