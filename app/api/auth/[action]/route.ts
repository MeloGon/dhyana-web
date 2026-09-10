import { handleAuthPost } from '@/lib/server/auth-http';

export async function POST(request: Request, context: RouteContext<'/api/auth/[action]'>) {
  const { action } = await context.params;
  return handleAuthPost(request, action);
}
