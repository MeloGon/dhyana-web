'use client';

import { formatLimaDate } from '@/lib/format';
import type { ComplaintSheetConfirmation } from '@/lib/types/complaint-book';

export function ComplaintBookConfirmation({ confirmation, onNewSheet }: { confirmation: ComplaintSheetConfirmation; onNewSheet: () => void }) {
  return (
    <div className="rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
      <h2 className="font-serif text-2xl">Hoja registrada</h2>
      <p className="mt-3 text-sm text-[color:var(--ink)]/75">Guarda este número: lo necesitarás para dar seguimiento a tu reclamo o queja.</p>
      <dl className="mt-5 space-y-2 rounded-2xl bg-[var(--page)] p-5">
        <div className="flex justify-between gap-4"><dt className="font-medium">Número de hoja</dt><dd className="font-mono text-lg">{confirmation.numeroHoja}</dd></div>
        <div className="flex justify-between gap-4"><dt className="font-medium">Fecha y hora</dt><dd>{formatLimaDate(confirmation.createdAt)}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        {confirmation.pdfUrl ? (
          <a href={confirmation.pdfUrl} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">Descargar PDF</a>
        ) : (
          <p role="status" className="text-sm text-[color:var(--ink)]/75">El PDF no pudo generarse en este momento. Conserva tu número de hoja; también recibirás una copia por correo si el envío fue exitoso.</p>
        )}
        <button type="button" onClick={() => window.print()} className="rounded-xl border border-[color:var(--ink)]/25 px-6 py-3 font-medium">Imprimir esta constancia</button>
        <button type="button" onClick={onNewSheet} className="rounded-xl border border-[color:var(--ink)]/25 px-6 py-3 font-medium">Registrar otra hoja</button>
      </div>
    </div>
  );
}
