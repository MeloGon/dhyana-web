import { handleSaleDelete } from '@/lib/server/sales-http';

export async function DELETE(request: Request, context: RouteContext<'/api/admin/sales/[id]'>) {
  const { id } = await context.params;
  return handleSaleDelete(request, id);
}
