import 'server-only';

export function getAuthConfig() {
  const url = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const appUrl = process.env.APP_URL?.trim();
  if (!url || !publishableKey?.startsWith('sb_publishable_') || !appUrl) {
    throw new Error('Faltan SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY o APP_URL.');
  }
  const origin = new URL(appUrl).origin;
  return { url, publishableKey, origin };
}

export function getAuthCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: getAuthConfig().origin.startsWith('https://'),
  };
}
