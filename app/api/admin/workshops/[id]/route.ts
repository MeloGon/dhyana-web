import { handleWorkshopSave, handleWorkshopDelete } from '@/lib/server/catalog-http';

export async function PUT(request: Request, context: RouteContext<'/api/admin/workshops/[id]'>) {
  const { id } = await context.params;
  return handleWorkshopSave(request, id);
}

export async function DELETE(request: Request, context: RouteContext<'/api/admin/workshops/[id]'>) {
  const { id } = await context.params;
  return handleWorkshopDelete(request, id);
}
