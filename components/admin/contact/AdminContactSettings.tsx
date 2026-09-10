'use client';

import Link from 'next/link';
import { useAdminContactSettings } from '@/hooks/useContactSettings';
import { ContactSettingsForm } from '@/components/admin/contact/ContactSettingsForm';
import type { ContactSettings } from '@/lib/types/contact-settings';

export function AdminContactSettings({ initial }: { initial: ContactSettings }) {
  const model = useAdminContactSettings(initial);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-8 border-b border-[#3D4C5A]/15 pb-7">
        <Link href="/admin" className="text-sm text-[#467E76] underline underline-offset-4">Volver al panel</Link>
        <h1 className="mt-3 font-serif text-3xl">Datos de la consulta</h1>
        <p className="mt-3 text-sm text-[#3D4C5A]/75">Personaliza la tarjeta de contacto. Al guardar, los cambios estarán disponibles en la siguiente carga del sitio.</p>
      </header>
      <ContactSettingsForm form={model.form} isSaving={model.isSaving} onChange={model.setForm} onSubmit={model.handleSave} />
      {model.errorMessage && <p role="alert" className="mt-5 text-sm text-[#9B3024]">{model.errorMessage}</p>}
      {model.successMessage && <p role="status" className="mt-5 text-sm text-[#467E76]">{model.successMessage}</p>}
    </main>
  );
}
