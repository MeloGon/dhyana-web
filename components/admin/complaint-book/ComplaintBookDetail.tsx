'use client';

import Link from 'next/link';
import { useAdminComplaintSheetDetail } from '@/hooks/useAdminComplaintSheetDetail';
import { COMPLAINT_DOCUMENT_TYPE_OPTIONS, COMPLAINT_GOOD_TYPE_OPTIONS, COMPLAINT_STATUS_LABELS, COMPLAINT_TYPE_OPTIONS } from '@/lib/data/complaint-book';
import { formatLimaDate, formatPrice } from '@/lib/format';
import type { AdminComplaintSheetDetail } from '@/lib/types/complaint-book';

const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base';

function label(list: { value: string; label: string }[], value: string) {
  return list.find((item) => item.value === value)?.label ?? value;
}

export function ComplaintBookDetail({ initial }: { initial: AdminComplaintSheetDetail }) {
  const model = useAdminComplaintSheetDetail(initial);
  const { detail } = model;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <Link href="/admin/complaint-book" className="text-sm text-[color:var(--positive)] underline underline-offset-4">Volver al listado</Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--ink)]/15 pb-7">
        <div>
          <p className="font-mono text-sm text-[color:var(--positive)]">{detail.numeroHoja}</p>
          <h1 className="mt-1 font-serif text-3xl">{detail.consumidorNombre}</h1>
          <p className="mt-2 text-sm text-[color:var(--ink)]/75">{label(COMPLAINT_TYPE_OPTIONS, detail.tipo)} · Registrada {formatLimaDate(detail.createdAt)}</p>
        </div>
        <span className="rounded-full bg-[#F0E8DF] px-3 py-1 text-xs font-medium text-[#6B5140]">{COMPLAINT_STATUS_LABELS[detail.estado]}</span>
      </header>

      {model.errorMessage && <p role="alert" className="mt-5 text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
      {model.successMessage && <p role="status" className="mt-5 text-sm text-[color:var(--positive)]">{model.successMessage}</p>}

      <section className="mt-6 space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="font-serif text-2xl">Datos del consumidor</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-[color:var(--ink)]/60">Domicilio</dt><dd className="mt-1">{detail.consumidorDomicilio}</dd></div>
          <div><dt className="text-[color:var(--ink)]/60">Documento</dt><dd className="mt-1">{label(COMPLAINT_DOCUMENT_TYPE_OPTIONS, detail.consumidorDocumentoTipo)} {detail.consumidorDocumentoNumero}</dd></div>
          <div><dt className="text-[color:var(--ink)]/60">Teléfono</dt><dd className="mt-1">{detail.consumidorTelefono}</dd></div>
          <div><dt className="text-[color:var(--ink)]/60">Correo</dt><dd className="mt-1 break-all">{detail.consumidorCorreo}</dd></div>
          {detail.esMenorEdad && <>
            <div><dt className="text-[color:var(--ink)]/60">Representante</dt><dd className="mt-1">{detail.representanteNombre}</dd></div>
            <div><dt className="text-[color:var(--ink)]/60">Documento del representante</dt><dd className="mt-1">{detail.representanteDocumentoNumero}</dd></div>
          </>}
        </dl>
      </section>

      <section className="mt-6 space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
        <h2 className="font-serif text-2xl">Bien y detalle</h2>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-[color:var(--ink)]/60">Tipo</dt><dd className="mt-1">{label(COMPLAINT_GOOD_TYPE_OPTIONS, detail.bienTipo)}</dd></div>
          <div><dt className="text-[color:var(--ink)]/60">Monto reclamado</dt><dd className="mt-1">{detail.montoReclamadoCents === null ? 'No indicado' : formatPrice(detail.montoReclamadoCents)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[color:var(--ink)]/60">Descripción</dt><dd className="mt-1">{detail.bienDescripcion}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[color:var(--ink)]/60">Hechos</dt><dd className="mt-1 whitespace-pre-line">{detail.detalleHechos}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[color:var(--ink)]/60">Pedido concreto</dt><dd className="mt-1 whitespace-pre-line">{detail.detallePedido}</dd></div>
        </dl>
        {detail.pdfUrl && <a href={detail.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-sm underline underline-offset-4">Ver PDF original</a>}
        {!detail.emailConsumidorEnviado && <p className="text-xs text-[color:var(--danger)]">El correo de constancia al consumidor no se pudo enviar.</p>}
        {!detail.emailInternoEnviado && <p className="text-xs text-[color:var(--danger)]">El correo interno de aviso no se pudo enviar.</p>}
      </section>

      {detail.estado === 'registrado' && (
        <section className="mt-6 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Estado</h2>
          <p className="mt-2 text-sm text-[color:var(--ink)]/75">Márcala como en trámite mientras se prepara la respuesta.</p>
          <button onClick={model.handleMarkInTramite} disabled={model.isSaving} className="mt-4 rounded-xl border border-[color:var(--ink)]/25 px-5 py-2.5 text-sm font-medium disabled:opacity-60">
            {model.isSaving ? 'Actualizando…' : 'Marcar en trámite'}
          </button>
        </section>
      )}

      {detail.estado === 'respondido' ? (
        <section className="mt-6 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Respuesta registrada</h2>
          <p className="mt-2 text-sm text-[color:var(--ink)]/75">Comunicada el {detail.respuestaFecha}</p>
          <p className="mt-3 whitespace-pre-line text-sm">{detail.respuestaTexto}</p>
        </section>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void model.handleRespond(); }} className="mt-6 space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
          <h2 className="font-serif text-2xl">Registrar respuesta</h2>
          <fieldset disabled={model.isSaving} className="space-y-5 disabled:opacity-60">
            <label className="block text-sm font-medium">Respuesta al consumidor
              <textarea required maxLength={5000} rows={5} value={model.respuestaTexto} onChange={(event) => model.setRespuestaTexto(event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">Fecha de la comunicación
              <input type="date" required value={model.respuestaFecha} onChange={(event) => model.setRespuestaFecha(event.target.value)} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">Evidencia (PDF o imagen, opcional)
              <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => { const file = event.target.files?.[0]; if (file) void model.handleUploadEvidence(file); }}
                className={inputClass} />
            </label>
            {model.isUploadingEvidence && <p className="text-xs">Subiendo evidencia…</p>}
            {model.respuestaEvidenciaPath && <p className="text-xs text-[color:var(--positive)]">Evidencia adjuntada.</p>}
            <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{model.isSaving ? 'Guardando…' : 'Registrar respuesta'}</button>
          </fieldset>
        </form>
      )}
    </main>
  );
}
