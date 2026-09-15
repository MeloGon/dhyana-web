import type { Metadata } from 'next';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export const metadata: Metadata = {
  title: 'Administración | Dhyana',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <><div className="mx-auto flex max-w-7xl justify-end px-5 pt-3"><ThemeToggle /></div>{children}</>;
}
