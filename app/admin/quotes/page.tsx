import { AdminQuotes } from '@/components/admin/quotes/AdminQuotes';
import { getAdminQuotes } from '@/lib/server/quotes';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminQuotesPage() {
  await requireAdminPage();
  return <AdminQuotes initial={await getAdminQuotes()} />;
}
