import type { NextRequest } from 'next/server';
import { refreshAuthSession } from '@/lib/server/auth-proxy';

export async function proxy(request: NextRequest) {
  return refreshAuthSession(request);
}

export const config = {
  matcher: ['/admin/:path*', '/auth/:path*', '/api/admin/:path*', '/api/auth/:path*'],
};
