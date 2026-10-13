import { handleWorkshopMediaUpload } from '@/lib/server/catalog-http';
import { requireAdmin } from '@/lib/server/admin-auth';

export async function POST(request: Request) {
  await requireAdmin();
  return handleWorkshopMediaUpload(request);
}
