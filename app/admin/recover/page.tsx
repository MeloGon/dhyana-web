import { AdminAuthForm } from '@/components/admin/AdminAuthForm';
import { AuthShell } from '@/components/admin/AuthShell';

export default function AdminRecoveryPage() {
  return <AuthShell><AdminAuthForm mode="recover" /></AuthShell>;
}
