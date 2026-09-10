'use client';

import { SalesError } from '@/components/admin/sales/SalesError';

export default function AdminSalesError({ retry }: { retry: () => void }) {
  return <SalesError retry={retry} />;
}
