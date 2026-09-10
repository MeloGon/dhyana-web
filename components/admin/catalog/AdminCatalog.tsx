'use client';

import Link from 'next/link';
import { useAdminCatalog } from '@/hooks/useAdminCatalog';
import { WorkshopEditor } from '@/components/admin/catalog/WorkshopEditor';
import type { AdminWorkshop } from '@/lib/types/admin-catalog';

export function AdminCatalog({ initial }: { initial: AdminWorkshop[] }) {
  const catalog = useAdminCatalog(initial);
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      <Link href="/admin" className="text-sm underline underline-offset-4">Volver al panel</Link>
      <header className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold tracking-widest text-[#467E76]">DHYANA · CATÁLOGO</p><h1 className="mt-2 font-serif text-3xl">Talleres y horarios</h1></div>
        <Link href="/#talleres" className="rounded-full border border-[#3D4C5A]/25 px-5 py-2.5 text-sm">Ver catálogo público</Link>
      </header>
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-[#3D4C5A]/10 bg-white p-5">
          <button disabled={catalog.isBusy} onClick={() => catalog.selectWorkshop(null)} className="w-full rounded-xl bg-[#3D4C5A] px-4 py-3 text-sm font-medium text-white">+ Nuevo taller</button>
          {!catalog.workshops.length && <p className="mt-5 text-sm leading-relaxed">Todavía no tienes talleres. Crea el primero con sus horarios.</p>}
          <ul className="mt-4 space-y-2">
            {catalog.workshops.map((workshop) => <li key={workshop.id}>
              <button disabled={catalog.isBusy} onClick={() => catalog.selectWorkshop(workshop.id)} aria-pressed={catalog.selectedId === workshop.id}
                className={`w-full rounded-xl p-3 text-left text-sm ${catalog.selectedId === workshop.id ? 'bg-[#83D0C6]/25 ring-1 ring-[#467E76]' : 'bg-[#F7F7F5] hover:bg-[#83D0C6]/10'}`}>
                <span className="block font-medium break-words">{workshop.title}</span>
                <span className="mt-1 block text-xs">{workshop.isPublished ? 'Publicado' : 'Borrador'} · {workshop.groups.length} {workshop.groups.length === 1 ? 'horario' : 'horarios'}</span><span className="mt-2 block text-xs font-medium text-[#285D48] underline">Editar taller</span>
              </button>
            </li>)}
          </ul>
        </aside>
        <div className="min-w-0 space-y-7">
          {/* key reinicia el formulario al cambiar de taller, sin efectos que borren lo escrito. */}
          {catalog.message && <p role="status" className="rounded-xl bg-[#83D0C6]/20 p-4 text-sm text-[#285D48]">{catalog.message}</p>}
          <WorkshopEditor key={catalog.selectedId ?? 'new'} workshop={catalog.selected} onSaved={catalog.handleWorkshopSaved}
            onDeleted={catalog.handleWorkshopDeleted} onBusyChange={catalog.setIsBusy} />
        </div>
      </div>
    </main>
  );
}
