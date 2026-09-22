'use client';

import { ComplaintBookError } from '@/components/admin/complaint-book/ComplaintBookError';

export default function AdminComplaintBookErrorPage({ retry }: { retry: () => void }) {
  return <ComplaintBookError title="No pudimos cargar el libro de reclamaciones" retry={retry} />;
}
