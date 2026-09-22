'use client';

import Link from 'next/link';
import { useAdminComplaintBook } from '@/hooks/useAdminComplaintBook';
import { COMPLAINT_STATUS_LABELS, businessDaysSince, COMPLAINT_RESPONSE_DEADLINE_DAYS } from '@/lib/data/complaint-book';
import { formatLimaDate } from '@/lib/format';
import type { AdminComplaintSheetsPage } from '@/lib/types/complaint-book';

const FILTERS: { value: 'all' | 'registrado' | 'en_tramite' | 'respondido'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'registrado', label: 'Registrado' },
  { value: 'en_tramite', label: 'En trámite' },
  { value: 'respondido', label: 'Respondido' },
];

export function AdminComplaintBookList({ initial }: { initial: AdminComplaintSheetsPage }) {
  const model = useAdminComplaintBook(initial);
  const { data } = model;
  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[color:var(--ink)]/15 pb-7">
        <div>
          <Link href="/admin" className="text-sm text-[color:var(--positive)] underline underline-offset-4">Volver al panel</Link>
          <h1 className="mt-3 font-serif text-3xl">Libro de Reclamaciones</h1>
          <p className="mt-3 max-w-xl text-sm text-[color:var(--ink)]/75">Hojas registradas por visitantes. Ninguna se puede eliminar; solo el proveedor responde.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/complaint-book/settings" className="rounded-xl border border-[color:var(--ink)]/25 px-4 py-2 text-sm font-medium">Datos del proveedor</Link>
          <button type="button" onClick={() => window.open('/api/admin/complaint-book/export', '_blank')} className="rounded-xl bg-[var(--mint-solid)] px-4 py-2 text-sm font-medium">Exportar CSV</button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button key={filter.value} onClick={() => model.handleFilterChange(filter.value)}
            className={`rounded-full border px-4 py-1.5 text-sm ${model.estado === filter.value ? 'border-[#467E76] bg-[#467E76]/10 font-medium' : 'border-[color:var(--ink)]/20'}`}>
            {filter.label}
          </button>
        ))}
      </div>

      {model.errorMessage && (
        <div role="alert" className="mt-6 rounded-2xl border border-[#9B3024]/30 bg-[var(--surface)] p-5 text-sm">
          {model.errorMessage} <button onClick={model.handleRetry} className="ml-2 underline underline-offset-4">Reintentar</button>
        </div>
      )}

      {model.isLoading ? (
        <p role="status" className="mt-8 text-sm">Cargando…</p>
      ) : (
        <>
          {!data.items.length && !model.errorMessage && <p className="mt-8 rounded-2xl bg-[var(--surface)] p-7 text-sm">No hay hojas para este filtro.</p>}
          <ul className="mt-6 space-y-4">
            {data.items.map((item) => {
              const daysOpen = item.estado !== 'respondido' ? businessDaysSince(new Date(item.createdAt)) : null;
              const isOverdue = daysOpen !== null && daysOpen > COMPLAINT_RESPONSE_DEADLINE_DAYS;
              return (
                <li key={item.id}>
                  <Link href={`/admin/complaint-book/${item.id}`} className="block rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-5 hover:border-[#467E76]/50">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-sm text-[color:var(--positive)]">{item.numeroHoja}</p>
                        <h2 className="mt-1 break-words font-serif text-lg">{item.consumidorNombre}</h2>
                        <p className="mt-1 break-all text-sm text-[color:var(--ink)]/75">{item.consumidorCorreo}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.estado === 'respondido' ? 'bg-[#83D0C6]/25 text-[#285D48] dark:text-[#A8E5CD]' : isOverdue ? 'bg-[#9B3024]/15 text-[#9B3024]' : 'bg-[#F0E8DF] text-[#6B5140]'}`}>
                        {COMPLAINT_STATUS_LABELS[item.estado]}{isOverdue ? ' · vencido' : ''}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-1 text-sm text-[color:var(--ink)]/75">{item.bienDescripcion}</p>
                    <p className="mt-2 text-xs text-[color:var(--ink)]/60">
                      Registrada {formatLimaDate(item.createdAt)}
                      {daysOpen !== null && ` · ${daysOpen} de ${COMPLAINT_RESPONSE_DEADLINE_DAYS} días hábiles`}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <button disabled={data.page <= 1} onClick={() => model.handlePage(data.page - 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40">Anterior</button>
            <span>Página {data.page} de {totalPages}</span>
            <button disabled={data.page >= totalPages} onClick={() => model.handlePage(data.page + 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40">Siguiente</button>
          </div>
        </>
      )}
    </main>
  );
}
