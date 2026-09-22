import { ComplaintBookDetail } from '@/components/admin/complaint-book/ComplaintBookDetail';
import { getAdminComplaintSheetDetail } from '@/lib/server/complaint-book';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminComplaintBookDetailPage(context: PageProps<'/admin/complaint-book/[id]'>) {
  await requireAdminPage();
  const { id } = await context.params;
  return <ComplaintBookDetail initial={await getAdminComplaintSheetDetail(id)} />;
}
