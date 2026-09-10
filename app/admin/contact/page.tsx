import { AdminContactSettings } from '@/components/admin/contact/AdminContactSettings';
import { getAdminContactSettings } from '@/lib/server/contact-settings';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminContactPage() {
  await requireAdminPage();
  return <AdminContactSettings initial={await getAdminContactSettings()} />;
}
