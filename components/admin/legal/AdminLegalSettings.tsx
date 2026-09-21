'use client';

import Link from 'next/link';
import { useAdminLegalSettings } from '@/hooks/useLegalSettings';
import { LegalSettingsForm } from '@/components/admin/legal/LegalSettingsForm';
import type { LegalSettings } from '@/lib/types/legal';

export function AdminLegalSettings({ initial }: { initial: LegalSettings }) {
  const model = useAdminLegalSettings(initial);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-8 border-b border-[color:var(--ink)]/15 pb-7">
        <Link href="/admin" className="text-sm text-[color:var(--positive)] underline underline-offset-4">Volver al panel</Link>
        <h1 className="mt-3 font-serif text-3xl">Términos y políticas</h1>
        <p className="mt-3 text-sm text-[color:var(--ink)]/75">Edita Términos y condiciones, Política de privacidad y Política de cambios/devoluciones publicados en <code>/legal</code>. Al guardar, los cambios estarán disponibles en la siguiente carga del sitio.</p>
      </header>
      <LegalSettingsForm form={model.form} isSaving={model.isSaving} onChange={model.setForm} onSubmit={model.handleSave} />
      {model.errorMessage && <p role="alert" className="mt-5 text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
      {model.successMessage && <p role="status" className="mt-5 text-sm text-[color:var(--positive)]">{model.successMessage}</p>}
    </main>
  );
}
