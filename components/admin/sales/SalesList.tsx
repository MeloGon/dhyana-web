'use client';

import type { ReactNode } from 'react';
import { ACCESS_LABELS, MANUAL_PAYMENT_METHODS } from '@/lib/data/admin-sales';
import { formatLimaDate, formatPrice } from '@/lib/format';
import type { AdminSalesPage, AdminSale, SaleAction } from '@/lib/types/admin-sales';

export function SalesList({ data, isBusy, coordinationId, onCoordinate, onPage, onAction, actionForm }: {
  onAction: (sale: AdminSale, action: SaleAction) => void;
  actionForm: { saleId: string; content: ReactNode } | null;
  data: AdminSalesPage; isBusy: boolean; coordinationId: string | null;
  onCoordinate: (id: string, coordinated: boolean) => void; onPage: (page: number) => void;
}) {
  return <section aria-label="Ventas registradas" className="mt-6">
    <p className="text-sm">{data.total} {data.total === 1 ? 'venta encontrada' : 'ventas encontradas'} · Actualizado {formatLimaDate(data.asOf)} (Perú)</p>
    {!data.items.length && <p className="mt-5 rounded-2xl bg-white p-7 text-sm">No hay ventas para estos filtros.</p>}
    <ul className="mt-4 space-y-4">
      {data.items.map((sale) => <li key={sale.id} className="rounded-2xl border border-[#3D4C5A]/10 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0"><h2 className="break-words font-serif text-xl">{sale.buyerName}</h2>
            <p className="mt-1 break-all text-sm">{sale.buyerEmail} · {sale.buyerPhone}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${sale.accessStatus === 'active' ? 'bg-[#83D0C6]/25 text-[#285D48]' : 'bg-[#F0E8DF] text-[#6B5140]'}`}>{ACCESS_LABELS[sale.accessStatus]}</span>
        </div>
        <p className="mt-4 font-medium">{sale.workshopTitle}</p><p className="mt-1 text-sm">{sale.scheduleDescription}</p>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-[#3D4C5A]/70">Pago registrado</dt><dd className="mt-1">{formatPrice(sale.amountCents)} · {sale.origin === 'culqi' ? 'Culqi' : MANUAL_PAYMENT_METHODS.find((method) => method.value === sale.paymentMethod)?.label ?? 'Venta manual'}</dd><dd className="mt-1">{formatLimaDate(sale.purchasedAt)}</dd></div>
          <div><dt className="text-[#3D4C5A]/70">{sale.status === 'cancelled' ? 'Período original (hora de Perú)' : 'Acceso mensual (hora de Perú)'}</dt><dd className="mt-1">Desde {formatLimaDate(sale.startsAt)}</dd><dd className="mt-1">Hasta {formatLimaDate(sale.endsAt)}</dd></div>
          <div className="min-w-0"><dt className="text-[#3D4C5A]/70">Código de compra</dt><dd className="mt-1 break-all font-mono text-xs">{sale.referenceCode}</dd></div>
          {sale.paymentReference && <div className="min-w-0"><dt className="text-[#3D4C5A]/70">Referencia del pago</dt><dd className="mt-1 break-all">{sale.paymentReference}</dd></div>}
        </dl>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#3D4C5A]/10 pt-4">
          <p className="text-sm">{sale.coordinatedAt ? `Coordinado · ${formatLimaDate(sale.coordinatedAt)}` : sale.status === 'cancelled' ? 'Sin coordinación pendiente' : 'Coordinación pendiente'}</p>
          {sale.status === 'paid' && <button disabled={isBusy} onClick={() => onCoordinate(sale.id, !sale.coordinatedAt)} className="rounded-xl border border-[#467E76]/40 px-4 py-2 text-sm disabled:opacity-50">
            {coordinationId === sale.id ? 'Actualizando…' : sale.coordinatedAt ? 'Volver a pendiente' : 'Marcar coordinado'}</button>}
        </div>
        {sale.cancelledAt && <p className="mt-4 text-sm text-[#9B3024]">Anulada el {formatLimaDate(sale.cancelledAt)} · {sale.cancellationReason}</p>}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-[#9B3024]">
          {sale.status === 'paid' && <button disabled={isBusy} onClick={() => onAction(sale, 'cancel')} className="underline underline-offset-4 disabled:opacity-40">Anular venta</button>}
          {sale.origin === 'manual' && <button disabled={isBusy} onClick={() => onAction(sale, 'delete')} className="underline underline-offset-4 disabled:opacity-40">Eliminar definitivamente</button>}
        </div>
        {actionForm?.saleId === sale.id && actionForm.content}
      </li>)}
    </ul>
    <div className="mt-6 flex items-center justify-between gap-3 text-sm">
      <button disabled={isBusy || data.page <= 1} onClick={() => onPage(data.page - 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40">Anterior</button>
      <span>Página {data.page} de {Math.max(1, Math.ceil(data.total / data.pageSize))}</span>
      <button disabled={isBusy || data.page * data.pageSize >= data.total} onClick={() => onPage(data.page + 1)} className="rounded-xl border px-4 py-2 disabled:opacity-40">Siguiente</button>
    </div>
  </section>;
}
