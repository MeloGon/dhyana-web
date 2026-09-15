import { AdminSiteSettings } from '@/components/admin/site/AdminSiteSettings';
import { getAdminSiteContent } from '@/lib/server/site-settings';
import { requireAdminPage } from '@/lib/server/admin-auth';
export default async function Page() {
  await requireAdminPage();
  return <AdminSiteSettings initial={await getAdminSiteContent()} />;
}
