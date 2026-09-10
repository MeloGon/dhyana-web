import { AdminAuthForm } from '@/components/admin/AdminAuthForm';
import { AuthShell } from '@/components/admin/AuthShell';

export default function AdminLoginPage() {
  return <AuthShell><AdminAuthForm mode="login" /></AuthShell>;
}
