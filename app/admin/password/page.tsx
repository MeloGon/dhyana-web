import { AdminAuthForm } from '@/components/admin/AdminAuthForm';
import { AuthShell } from '@/components/admin/AuthShell';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminPasswordPage() {
  await requireAdminPage();
  return <AuthShell><AdminAuthForm mode="password" /></AuthShell>;
}
