import { AdminComplaintBookSettings } from '@/components/admin/complaint-book/AdminComplaintBookSettings';
import { getAdminComplaintBookSettings } from '@/lib/server/complaint-book';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminComplaintBookSettingsPage() {
  await requireAdminPage();
  return <AdminComplaintBookSettings initial={await getAdminComplaintBookSettings()} />;
}
