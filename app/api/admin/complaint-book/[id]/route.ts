import { handleAdminComplaintSheetDetailGet, handleAdminComplaintSheetUpdate } from '@/lib/server/complaint-book-http';

export async function GET(_request: Request, context: RouteContext<'/api/admin/complaint-book/[id]'>) {
  const { id } = await context.params;
  return handleAdminComplaintSheetDetailGet(id);
}

export async function PATCH(request: Request, context: RouteContext<'/api/admin/complaint-book/[id]'>) {
  const { id } = await context.params;
  return handleAdminComplaintSheetUpdate(request, id);
}
