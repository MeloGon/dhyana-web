import { AdminPanel } from '@/components/admin/AdminPanel';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminPage() {
  const admin = await requireAdminPage();
  return <AdminPanel admin={admin} />;
}
