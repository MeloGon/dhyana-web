'use client';

import Link from 'next/link';
import { useAdminSales } from '@/hooks/useAdminSales';
import { ManualSaleForm } from '@/components/admin/sales/ManualSaleForm';
import { SalesList } from '@/components/admin/sales/SalesList';
import { formatLimaDate } from '@/lib/format';
import type { AdminWorkshop } from '@/lib/types/admin-catalog';
import type { AdminSalesPage, SalesFilters } from '@/lib/types/admin-sales';

export function AdminSales({ initial, workshops }: { initial: AdminSalesPage; workshops: AdminWorkshop[] }) {
  const sales = useAdminSales(initial);
  const busy = sales.isLoading || sales.coordinationId !== null;
  const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-sm';
  return <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
    <Link href="/admin" className="text-sm underline underline-offset-4">Volver al panel</Link>
    <header className="mt-7 flex flex-wrap items-center justify-between gap-4">
      <div><p className="text-xs font-semibold tracking-widest text-[#467E76]">DHYANA · ADMINISTRACIÓN</p><h1 className="mt-2 font-serif text-3xl">Ventas y participantes</h1></div>
      {!sales.isFormOpen && <button onClick={() => sales.setIsFormOpen(true)} className="rounded-xl bg-[#3D4C5A] px-5 py-3 text-sm font-medium text-white">+ Registrar venta manual</button>}
    </header>
    {sales.created && <div role="status" className="mt-6 rounded-2xl bg-[#83D0C6]/25 p-5 text-sm">
      <p className="font-semibold">Venta registrada.</p><p className="mt-2 break-all">Código: {sales.created.referenceCode}</p>
      <p className="mt-1">Acceso: {formatLimaDate(sales.created.startsAt)} a {formatLimaDate(sales.created.endsAt)} (Perú).</p>
    </div>}
    {sales.isFormOpen && <div className="mt-6"><ManualSaleForm workshops={workshops} onSaved={sales.handleCreated} onCancel={() => sales.setIsFormOpen(false)} /></div>}
    <form onSubmit={sales.search} className="mt-8 rounded-2xl bg-[#83D0C6]/10 p-5">
      <fieldset disabled={busy} className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
        <div><label htmlFor="sales-search" className="text-sm font-medium">Buscar participante o compra</label><input id="sales-search" type="search" maxLength={100} placeholder="Nombre, correo, teléfono, código o referencia" value={sales.filters.query} onChange={(e) => sales.setFilters({ ...sales.filters, query: e.target.value })} className={inputClass} /></div>
        <div><label htmlFor="sales-access" className="text-sm font-medium">Acceso</label><select id="sales-access" value={sales.filters.access} onChange={(e) => sales.setFilters({ ...sales.filters, access: e.target.value as SalesFilters['access'] })} className={inputClass}>
          <option value="all">Todos</option><option value="active">Vigentes</option><option value="expired">Vencidos</option><option value="upcoming">Próximos</option></select></div>
        <div><label htmlFor="sales-coordination" className="text-sm font-medium">Coordinación</label><select id="sales-coordination" value={sales.filters.coordination} onChange={(e) => sales.setFilters({ ...sales.filters, coordination: e.target.value as SalesFilters['coordination'] })} className={inputClass}>
          <option value="all">Todas</option><option value="pending">Pendiente</option><option value="done">Coordinado</option></select></div>
        <button className="rounded-xl bg-[#3D4C5A] px-5 py-3 text-sm text-white">Buscar</button>
      </fieldset>
    </form>
    <div className="mt-4 flex items-center justify-between gap-4 text-sm"><p>Registrar coordinación no cambia el pago ni el vencimiento.</p>
      <button disabled={busy} onClick={sales.refresh} className="shrink-0 underline underline-offset-4 disabled:opacity-40">{sales.isLoading ? 'Cargando…' : 'Actualizar'}</button></div>
    {sales.error && <p role="alert" className="mt-4 text-sm text-[#9B3024]">{sales.error}</p>}
    <SalesList data={sales.data} isBusy={busy} coordinationId={sales.coordinationId} onCoordinate={sales.toggleCoordination} onPage={sales.goToPage} />
  </main>;
}
