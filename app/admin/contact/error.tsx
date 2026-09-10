'use client';

import { ContactSettingsError } from '@/components/admin/contact/ContactSettingsError';

export default function AdminContactError({ retry }: { retry: () => void }) {
  return <ContactSettingsError retry={retry} />;
}
