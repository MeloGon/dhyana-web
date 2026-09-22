import { AdminComplaintBookList } from '@/components/admin/complaint-book/AdminComplaintBookList';
import { getAdminComplaintSheets } from '@/lib/server/complaint-book';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminComplaintBookPage() {
  await requireAdminPage();
  return <AdminComplaintBookList initial={await getAdminComplaintSheets()} />;
}
