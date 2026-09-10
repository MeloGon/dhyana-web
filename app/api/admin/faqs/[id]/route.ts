import { handleFaqSave, handleFaqDelete } from '@/lib/server/faqs-http';

export async function PUT(request: Request, context: RouteContext<'/api/admin/faqs/[id]'>) {
  const { id } = await context.params;
  return handleFaqSave(request, id);
}

export async function DELETE(request: Request, context: RouteContext<'/api/admin/faqs/[id]'>) {
  const { id } = await context.params;
  return handleFaqDelete(request, id);
}
