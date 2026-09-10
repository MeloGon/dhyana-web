import type { Metadata } from 'next';
import { AuthConfirmation } from '@/components/admin/AuthConfirmation';
import { AuthShell } from '@/components/admin/AuthShell';

export const metadata: Metadata = {
  title: 'Confirmar acceso | Dhyana',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function AuthConfirmPage() {
  return <AuthShell><AuthConfirmation /></AuthShell>;
}
