import { handleQuoteDelete, handleQuoteSave } from '@/lib/server/quotes-http';

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handleQuoteSave(request, id);
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  return handleQuoteDelete(request, id);
}
