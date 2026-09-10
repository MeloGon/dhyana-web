import { AdminCatalog } from '@/components/admin/catalog/AdminCatalog';
import { getAdminCatalog } from '@/lib/server/catalog';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminWorkshopsPage() {
  await requireAdminPage();
  const workshops = await getAdminCatalog();
  return <AdminCatalog initial={workshops} />;
}
