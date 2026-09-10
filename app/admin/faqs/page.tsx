import { AdminFaqs } from '@/components/admin/faqs/AdminFaqs';
import { getAdminFaqs } from '@/lib/server/faqs';
import { requireAdminPage } from '@/lib/server/admin-auth';

export default async function AdminFaqsPage() {
  await requireAdminPage();
  return <AdminFaqs initial={await getAdminFaqs()} />;
}
