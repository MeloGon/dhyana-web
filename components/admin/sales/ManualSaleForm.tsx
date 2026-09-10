'use client';

import Link from 'next/link';
import { useManualSale } from '@/hooks/useAdminSales';
import { MANUAL_PAYMENT_METHODS } from '@/lib/data/admin-sales';
import type { AdminWorkshop } from '@/lib/types/admin-catalog';
import type { ManualSaleResult } from '@/lib/types/admin-sales';

export function ManualSaleForm({ workshops, onSaved, onCancel }: {
  workshops: AdminWorkshop[]; onSaved: (result: ManualSaleResult) => void; onCancel: () => void;
}) {
  const editor = useManualSale(workshops, onSaved);
  const { form, setField } = editor;
  const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base focus:outline-2 focus:outline-[#467E76]';
  return (
    <form onSubmit={editor.handleSubmit} className="rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl">Registrar venta manual</h2>
      <p className="mt-2 text-sm leading-relaxed">Para pagos externos que ya verificaste, como Yape directo o transferencia. Este registro crea la compra y su acceso mensual.</p>
      {!editor.options.length ? <p className="mt-5 text-sm">Primero <Link href="/admin/workshops" className="underline">crea un taller grupal con horario</Link>.</p> :
        <fieldset disabled={editor.isSubmitting} className="mt-6 grid gap-5 disabled:opacity-60 sm:grid-cols-2">
          <div><label htmlFor="sale-workshop" className="text-sm font-medium">Taller</label>
            <select id="sale-workshop" value={editor.workshopId} onChange={(e) => editor.selectWorkshop(e.target.value)} className={inputClass}>
              {editor.options.map((workshop) => <option key={workshop.id} value={workshop.id}>{workshop.title}{!workshop.isPublished ? ' (borrador)' : ''}</option>)}
            </select></div>
          <div><label htmlFor="sale-group" className="text-sm font-medium">Horario</label>
            <select id="sale-group" value={editor.groupId} onChange={(e) => editor.selectGroup(e.target.value)} className={inputClass}>
              {editor.selectedWorkshop?.groups.map((group) => <option key={group.id} value={group.id}>{group.scheduleDescription || 'Sin descripción'}{!group.isPublished ? ' (privado)' : ''}</option>)}
            </select></div>
          <div><label htmlFor="sale-name" className="text-sm font-medium">Nombre del participante</label>
            <input id="sale-name" autoComplete="off" required maxLength={160} value={form.buyerName} onChange={(e) => setField('buyerName', e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="sale-email" className="text-sm font-medium">Correo</label>
            <input id="sale-email" type="email" autoComplete="off" required maxLength={254} value={form.buyerEmail} onChange={(e) => setField('buyerEmail', e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="sale-phone" className="text-sm font-medium">Teléfono / WhatsApp</label>
            <input id="sale-phone" type="tel" autoComplete="off" required maxLength={40} placeholder="+51 999 999 999" value={form.buyerPhone} onChange={(e) => setField('buyerPhone', e.target.value)} className={inputClass} /></div>
          <div><label htmlFor="sale-amount" className="text-sm font-medium">Importe recibido (S/)</label>
            <input id="sale-amount" inputMode="decimal" required value={form.amount} onChange={(e) => setField('amount', e.target.value)} className={inputClass} />
            <p className="mt-2 text-xs">Sugerimos el precio actual; registra el importe realmente pagado.</p></div>
          <div><label htmlFor="sale-date" className="text-sm font-medium">Fecha y hora real del pago (Perú)</label>
            <input id="sale-date" type="datetime-local" required value={form.purchasedAt} onChange={(e) => setField('purchasedAt', e.target.value)} className={inputClass} />
            <p className="mt-2 text-xs">El mes de acceso empieza aquí, aunque registres el pago después.</p></div>
          <div><label htmlFor="sale-method" className="text-sm font-medium">Medio de pago</label>
            <select id="sale-method" value={form.paymentMethod} onChange={(e) => { const option = MANUAL_PAYMENT_METHODS.find((item) => item.value === e.target.value); if (option) setField('paymentMethod', option.value); }} className={inputClass}>
              {MANUAL_PAYMENT_METHODS.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
            </select></div>
          <div className="sm:col-span-2"><label htmlFor="sale-reference" className="text-sm font-medium">Referencia / número de operación (opcional)</label>
            <input id="sale-reference" autoComplete="off" maxLength={100} value={form.paymentReference} onChange={(e) => setField('paymentReference', e.target.value)} className={inputClass} />
            <p className="mt-2 text-xs">Si existe, inclúyela para detectar pagos registrados dos veces.</p></div>
          <label className="flex items-start gap-3 text-sm sm:col-span-2"><input type="checkbox" required checked={form.paymentVerified} onChange={(e) => setField('paymentVerified', e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#467E76]" />
            <span>Confirmo que verifiqué el pago recibido y revisé participante, importe y fecha.</span></label>
          <div className="sm:col-span-2"><button className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{editor.isSubmitting ? 'Registrando…' : 'Registrar pago verificado'}</button></div>
        </fieldset>}
      {editor.error && <p role="alert" className="mt-4 text-sm text-[#9B3024]">{editor.error}</p>}
      <button type="button" disabled={editor.isSubmitting} onClick={onCancel} className="mt-5 text-sm underline underline-offset-4">Cerrar formulario</button>
    </form>
  );
}
