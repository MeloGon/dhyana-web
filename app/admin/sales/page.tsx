import { AdminSales } from '@/components/admin/sales/AdminSales';
import { getAdminSales } from '@/lib/server/sales';
import { getAdminCatalog } from '@/lib/server/catalog';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminSalesPage() {
  await requireAdminPage();
  const [initial, workshops] = await Promise.all([getAdminSales(), getAdminCatalog()]);
  return <AdminSales initial={initial} workshops={workshops} />;
}
