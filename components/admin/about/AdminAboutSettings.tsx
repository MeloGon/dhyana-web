'use client';

import Link from 'next/link';
import { useAdminAboutSettings } from '@/hooks/useAboutSettings';
import { AboutSettingsForm } from '@/components/admin/about/AboutSettingsForm';
import type { AboutSettings } from '@/lib/types/about-settings';

/**
 * Orquestador del panel "Sobre nosotros". Conecta el hook (ViewModel) con el
 * formulario (pieza tonta). Los datos iniciales vienen de SSR para evitar
 * un flash de carga — en Flutter sería como inyectar el estado inicial desde
 * el constructor del widget en vez de hacer un FutureBuilder.
 */
export function AdminAboutSettings({ initial }: { initial: AboutSettings }) {
  const model = useAdminAboutSettings(initial);
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-8 border-b border-[#3D4C5A]/15 pb-7">
        <Link href="/admin" className="text-sm text-[#467E76] underline underline-offset-4">Volver al panel</Link>
        <h1 className="mt-3 font-serif text-3xl">Sobre nosotros</h1>
        <p className="mt-3 text-sm text-[#3D4C5A]/75">Personaliza la sección de presentación del sitio. Al guardar, los cambios estarán disponibles en la siguiente carga.</p>
      </header>
      <AboutSettingsForm form={model.form} isSaving={model.isSaving} onChange={model.setForm} onSubmit={model.handleSave} />
      {model.errorMessage && <p role="alert" className="mt-5 text-sm text-[#9B3024]">{model.errorMessage}</p>}
      {model.successMessage && <p role="status" className="mt-5 text-sm text-[#467E76]">{model.successMessage}</p>}
    </main>
  );
}
