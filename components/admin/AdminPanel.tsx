'use client';

import Link from 'next/link';
import { useAdminLogout } from '@/hooks/useAdminAuth';
import type { AdminIdentity } from '@/lib/types/admin-auth';

export function AdminPanel({ admin }: { admin: AdminIdentity }) {
  const { isSubmitting, errorMessage, handleLogout } = useAdminLogout();
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[#3D4C5A]/15 pb-7">
        <div><p className="text-xs font-semibold tracking-widest text-[#467E76]">DHYANA · ADMINISTRACIÓN</p>
          <h1 className="mt-2 font-serif text-3xl">Panel de administración</h1></div>
        <button onClick={handleLogout} disabled={isSubmitting} className="rounded-full border border-[#3D4C5A]/30 px-5 py-2.5 text-sm disabled:opacity-60">
          {isSubmitting ? 'Cerrando…' : 'Cerrar sesión'}
        </button>
      </header>
      {errorMessage && <p role="alert" className="mt-4 text-sm text-[#9B3024]">{errorMessage}</p>}
      <section className="mt-8 rounded-3xl border border-[#3D4C5A]/10 bg-white p-7 sm:p-10">
        <p className="text-sm font-medium text-[#467E76]">Acceso habilitado</p>
        <h2 className="mt-3 break-all font-serif text-2xl">{admin.email}</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed">Tu cuenta tiene acceso al panel privado de Dhyana.</p>
        <div className="mt-7 flex flex-wrap gap-5 text-sm">
          <Link href="/admin/password" className="underline underline-offset-4">Cambiar contraseña</Link>
          <Link href="/" className="underline underline-offset-4">Ver sitio público</Link>
        </div>
      </section>
    </main>
  );
}
