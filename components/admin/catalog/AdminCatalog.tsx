'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import { useAdminCatalog } from '@/hooks/useAdminCatalog';
import { WorkshopEditor } from '@/components/admin/catalog/WorkshopEditor';
import type { AdminWorkshop } from '@/lib/types/admin-catalog';

export function AdminCatalog({ initial }: { initial: AdminWorkshop[] }) {
  const catalog = useAdminCatalog(initial);
  // Arrastrar guarda el id en una ref (no re-renderiza en cada evento de drag);
  // draggingId sí es estado porque decide una clase visual (opacidad) mientras se mueve.
  const draggedId = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      <Link href="/admin" className="text-sm underline underline-offset-4">Volver al panel</Link>
      <header className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-semibold tracking-widest text-[color:var(--positive)]">DHYANA · CATÁLOGO</p><h1 className="mt-2 font-serif text-3xl">Talleres y horarios</h1></div>
        <Link href="/#talleres" className="rounded-full border border-[color:var(--ink)]/25 px-5 py-2.5 text-sm">Ver catálogo público</Link>
      </header>
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-5">
          <button disabled={catalog.isBusy} onClick={() => catalog.selectWorkshop(null)} className="w-full rounded-xl bg-[#3D4C5A] px-4 py-3 text-sm font-medium text-white">+ Nuevo taller</button>
          {!catalog.workshops.length && <p className="mt-5 text-sm leading-relaxed">Todavía no tienes talleres. Crea el primero con sus horarios.</p>}
          <ul className="mt-4 space-y-2">
            {catalog.workshops.map((workshop, index) => <li key={workshop.id}
              // El drop se escucha en toda la fila para no depender de soltar justo sobre el ícono.
              onDragOver={(event) => { if (draggedId.current) event.preventDefault(); }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedId.current) catalog.reorderWorkshop(draggedId.current, workshop.id);
                draggedId.current = null; setDraggingId(null);
              }}
              className={`flex items-stretch gap-1.5 ${draggingId === workshop.id ? 'opacity-40' : ''}`}>
              {/* Drag nativo del navegador: sin librería, pero sin soporte táctil.
                  Las flechas de al lado cubren teclado y celulares/tablets. */}
              <span draggable={!catalog.isBusy}
                onDragStart={() => { draggedId.current = workshop.id; setDraggingId(workshop.id); }}
                onDragEnd={() => { draggedId.current = null; setDraggingId(null); }}
                title="Arrastrar para reordenar" aria-hidden="true"
                className="flex shrink-0 cursor-grab items-center px-1 text-[color:var(--ink)]/40 hover:text-[color:var(--ink)]/70 active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </span>
              <button disabled={catalog.isBusy} onClick={() => catalog.selectWorkshop(workshop.id)} aria-pressed={catalog.selectedId === workshop.id}
                className={`min-w-0 flex-1 rounded-xl p-3 text-left text-sm ${catalog.selectedId === workshop.id ? 'bg-[#83D0C6]/25 ring-1 ring-[#467E76]' : 'bg-[var(--page)] hover:bg-[#83D0C6]/10'}`}>
                <span className="block font-medium break-words">{workshop.title}</span>
                <span className="mt-1 block text-xs">{workshop.isPublished ? 'Publicado' : 'Borrador'} · {workshop.groups.length} {workshop.groups.length === 1 ? 'horario' : 'horarios'}</span><span className="mt-2 block text-xs font-medium text-[#285D48] underline">Editar taller</span>
              </button>
              {/* Orden manual del catálogo público: sube o baja el taller un lugar por click. */}
              <div className="flex flex-col justify-center gap-1">
                <button type="button" disabled={catalog.isBusy || index === 0} onClick={() => catalog.moveWorkshop(workshop.id, 'up')}
                  aria-label={`Subir ${workshop.title}`} title="Subir" className="rounded-lg p-1.5 hover:bg-[#83D0C6]/15 disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" disabled={catalog.isBusy || index === catalog.workshops.length - 1} onClick={() => catalog.moveWorkshop(workshop.id, 'down')}
                  aria-label={`Bajar ${workshop.title}`} title="Bajar" className="rounded-lg p-1.5 hover:bg-[#83D0C6]/15 disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
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
