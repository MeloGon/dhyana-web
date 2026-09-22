import { handleComplaintEvidenceUpload } from '@/lib/server/complaint-book-http';

export async function POST(request: Request, context: RouteContext<'/api/admin/complaint-book/[id]/evidence'>) {
  const { id } = await context.params;
  return handleComplaintEvidenceUpload(request, id);
}
