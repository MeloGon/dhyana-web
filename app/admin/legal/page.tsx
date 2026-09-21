import { AdminLegalSettings } from '@/components/admin/legal/AdminLegalSettings';
import { getAdminLegalSettings } from '@/lib/server/legal-settings';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminLegalPage() {
  await requireAdminPage();
  return <AdminLegalSettings initial={await getAdminLegalSettings()} />;
}
