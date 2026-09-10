import { handleSaleCancel } from '@/lib/server/sales-http';

export async function POST(request: Request, context: RouteContext<'/api/admin/sales/[id]/cancel'>) {
  const { id } = await context.params;
  return handleSaleCancel(request, id);
}
