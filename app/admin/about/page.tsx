import { AdminAboutSettings } from '@/components/admin/about/AdminAboutSettings';
import { getAdminAboutSettings } from '@/lib/server/about-settings';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminAboutPage() {
  await requireAdminPage();
  return <AdminAboutSettings initial={await getAdminAboutSettings()} />;
}
