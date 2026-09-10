'use client';

import { FaqsError } from '@/components/admin/faqs/FaqsError';

export default function AdminFaqsError({ retry }: { retry: () => void }) {
  return <FaqsError retry={retry} />;
}
