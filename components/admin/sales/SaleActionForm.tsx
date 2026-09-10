'use client';

import type { FormEvent } from 'react';
import type { AdminSale, SaleAction, SaleActionInput } from '@/lib/types/admin-sales';

export function SaleActionForm({ sale, action, input, onChange, onSubmit, onClose, isPending, error }: {
  sale: AdminSale; action: SaleAction; input: SaleActionInput;
  onChange: (input: SaleActionInput) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void; isPending: boolean; error: string;
}) {
  const isDelete = action === 'delete';
  const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-sm';
  return <form onSubmit={onSubmit} aria-label={isDelete ? 'Confirmar eliminación' : 'Confirmar anulación'} className="mt-5 rounded-xl border border-[#9B3024]/25 bg-[#FFF5F3] p-5">
    <h3 className="font-semibold">{isDelete ? 'Eliminar definitivamente' : 'Anular venta'}</h3>
    <p className="mt-2 text-sm">{isDelete ? 'Se borrarán la compra y su acceso mensual. Esta acción no se puede deshacer. Úsala solo para pruebas o registros erróneos.' : 'El acceso dejará de ocupar cupo desde la anulación. Se conservarán el pago y su historial. Esto no devuelve dinero al participante.'}</p>
    <p className="mt-3 break-all text-sm font-medium">{sale.buyerName} · {sale.referenceCode}</p>
    <fieldset disabled={isPending} className="mt-4 space-y-4 disabled:opacity-60">
      {isDelete ? <>
        <div><label htmlFor={`confirm-code-${sale.id}`} className="text-sm">Escribe el código de compra para confirmar</label>
          <input id={`confirm-code-${sale.id}`} autoComplete="off" required maxLength={36} value={input.confirmationCode} onChange={(e) => onChange({ ...input, confirmationCode: e.target.value })} className={inputClass} /></div>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" required checked={input.isTestOrMistake} onChange={(e) => onChange({ ...input, isTestOrMistake: e.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 accent-[#9B3024]" />Confirmo que esta venta es una prueba o un error de registro.</label>
      </> : <div><label htmlFor={`cancel-reason-${sale.id}`} className="text-sm">Motivo de anulación</label>
        <textarea id={`cancel-reason-${sale.id}`} required minLength={5} maxLength={500} rows={3} value={input.reason} onChange={(e) => onChange({ ...input, reason: e.target.value })} className={inputClass} /></div>}
      <div className="flex flex-wrap gap-3">
        <button className="rounded-xl bg-[#9B3024] px-4 py-2.5 text-sm font-medium text-white">{isPending ? 'Procesando…' : isDelete ? 'Sí, eliminar definitivamente' : 'Confirmar anulación'}</button>
        <button type="button" onClick={onClose} className="rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-2.5 text-sm">Volver sin cambios</button>
      </div>
    </fieldset>
    {error && <p role="alert" className="mt-4 text-sm text-[#9B3024]">{error}</p>}
  </form>;
}
