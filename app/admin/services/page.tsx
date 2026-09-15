import { AdminServices } from '@/components/admin/site/AdminServices';
import { getAdminSiteContent } from '@/lib/server/site-settings';
import { requireAdminPage } from '@/lib/server/admin-auth';
export default async function Page() {
  await requireAdminPage();
  return <AdminServices initial={(await getAdminSiteContent()).services} />;
}
