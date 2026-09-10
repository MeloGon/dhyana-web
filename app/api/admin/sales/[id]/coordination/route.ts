import { handleSaleCoordination } from '@/lib/server/sales-http';

export async function PATCH(request: Request, context: RouteContext<'/api/admin/sales/[id]/coordination'>) {
  const { id } = await context.params;
  return handleSaleCoordination(request, id);
}
