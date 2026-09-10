import { handleAdminSession } from '@/lib/server/auth-http';

export async function GET() {
  return handleAdminSession();
}
