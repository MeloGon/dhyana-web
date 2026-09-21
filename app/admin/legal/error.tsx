'use client';

import { LegalSettingsError } from '@/components/admin/legal/LegalSettingsError';

export default function AdminLegalError({ retry }: { retry: () => void }) {
  return <LegalSettingsError retry={retry} />;
}
