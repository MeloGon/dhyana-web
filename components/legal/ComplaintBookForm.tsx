'use client';

import { useComplaintBookForm } from '@/hooks/useComplaintBookForm';
import { ComplaintBookConfirmation } from '@/components/legal/ComplaintBookConfirmation';
import {
  COMPLAINT_DOCUMENT_TYPE_OPTIONS,
  COMPLAINT_GOOD_TYPE_OPTIONS,
  COMPLAINT_TYPE_OPTIONS,
} from '@/lib/data/complaint-book';

const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base';
const sectionClass = 'space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8';

export function ComplaintBookForm() {
  const model = useComplaintBookForm();

  if (model.isLoadingSettings) return <p role="status" className="p-10 text-center">Cargando…</p>;
  if (model.loadErrorMessage || !model.settings) return <p role="alert" className="p-10 text-center">{model.loadErrorMessage}</p>;
  if (model.confirmation) return <ComplaintBookConfirmation confirmation={model.confirmation} onNewSheet={model.handleNewSheet} />;

  const { settings, form, setForm } = model;

  return (
    <form onSubmit={(event) => { event.preventDefault(); void model.handleSubmit(); }}>
      <fieldset disabled={model.isSubmitting} className="space-y-6 disabled:opacity-60">
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Datos del proveedor</h2>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="font-medium text-[color:var(--ink)]/60">Razón social</dt><dd>{settings.razonSocial}</dd></div>
            <div><dt className="font-medium text-[color:var(--ink)]/60">RUC</dt><dd>{settings.ruc}</dd></div>
            <div className="sm:col-span-2"><dt className="font-medium text-[color:var(--ink)]/60">Domicilio del establecimiento</dt><dd>{settings.domicilio}</dd></div>
          </dl>
        </section>

        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Tipo de hoja</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            {COMPLAINT_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex flex-1 items-start gap-3 rounded-xl border border-[color:var(--ink)]/25 p-4 text-sm">
                <input type="radio" name="tipo" checked={form.tipo === option.value} onChange={() => setForm({ ...form, tipo: option.value })} className="mt-1" />
                {option.label}
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Identificación del consumidor</h2>
          <label className="block text-sm font-medium">Nombre completo
            <input required maxLength={200} value={form.consumidorNombre} onChange={(event) => setForm({ ...form, consumidorNombre: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Domicilio
            <input required maxLength={300} value={form.consumidorDomicilio} onChange={(event) => setForm({ ...form, consumidorDomicilio: event.target.value })} className={inputClass} />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">Tipo de documento
              <select required value={form.consumidorDocumentoTipo} onChange={(event) => setForm({ ...form, consumidorDocumentoTipo: event.target.value as typeof form.consumidorDocumentoTipo })} className={inputClass}>
                {COMPLAINT_DOCUMENT_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">Número de documento
              <input required maxLength={20} value={form.consumidorDocumentoNumero} onChange={(event) => setForm({ ...form, consumidorDocumentoNumero: event.target.value })} className={inputClass} />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium">Teléfono
              <input type="tel" required maxLength={40} value={form.consumidorTelefono} onChange={(event) => setForm({ ...form, consumidorTelefono: event.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">Correo electrónico
              <input type="email" required maxLength={254} value={form.consumidorCorreo} onChange={(event) => setForm({ ...form, consumidorCorreo: event.target.value })} className={inputClass} aria-describedby="complaint-email-help" />
            </label>
          </div>
          <p id="complaint-email-help" className="text-xs text-[color:var(--ink)]/75">A este correo enviaremos la constancia con tu número de hoja.</p>
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" checked={form.esMenorEdad} onChange={(event) => setForm({ ...form, esMenorEdad: event.target.checked })} className="h-4 w-4 accent-[#467E76]" />
            El consumidor es menor de edad
          </label>
          {form.esMenorEdad && (
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">Nombre del padre, madre o representante
                <input required maxLength={200} value={form.representanteNombre} onChange={(event) => setForm({ ...form, representanteNombre: event.target.value })} className={inputClass} />
              </label>
              <label className="block text-sm font-medium">Documento del representante
                <input required maxLength={20} value={form.representanteDocumentoNumero} onChange={(event) => setForm({ ...form, representanteDocumentoNumero: event.target.value })} className={inputClass} />
              </label>
            </div>
          )}
        </section>

        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Identificación del bien</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            {COMPLAINT_GOOD_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex flex-1 items-center gap-3 rounded-xl border border-[color:var(--ink)]/25 p-4 text-sm">
                <input type="radio" name="bienTipo" checked={form.bienTipo === option.value} onChange={() => setForm({ ...form, bienTipo: option.value })} />
                {option.label}
              </label>
            ))}
          </div>
          <label className="block text-sm font-medium">Descripción del producto o servicio
            <textarea required maxLength={2000} rows={2} value={form.bienDescripcion} onChange={(event) => setForm({ ...form, bienDescripcion: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Monto reclamado (opcional)
            <span className="relative mt-2 block">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-base text-[color:var(--ink)]/60">S/</span>
              <input type="text" inputMode="decimal" placeholder="0.00" autoComplete="off" value={model.montoTexto}
                onChange={(event) => model.handleMontoChange(event.target.value)} onBlur={model.handleMontoBlur}
                className="w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] py-3 pl-11 pr-4 text-base" />
            </span>
            <span className="mt-2 block text-xs font-normal text-[color:var(--ink)]/75">Déjalo vacío si tu reclamo no es por un monto.</span>
          </label>
        </section>

        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Detalle</h2>
          <label className="block text-sm font-medium">Detalle de los hechos
            <textarea required maxLength={5000} rows={5} value={form.detalleHechos} onChange={(event) => setForm({ ...form, detalleHechos: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Pedido concreto
            <textarea required maxLength={2000} rows={3} value={form.detallePedido} onChange={(event) => setForm({ ...form, detallePedido: event.target.value })} className={inputClass} />
          </label>
        </section>

        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Antes de enviar</h2>
          <p className="text-sm leading-relaxed text-[color:var(--ink)]/75">{settings.textoAvisoOtrasVias}</p>
          <p className="text-sm leading-relaxed text-[color:var(--ink)]/75">{settings.textoPlazoRespuesta}</p>
          <p className="text-sm leading-relaxed text-[color:var(--ink)]/75">Al enviar, declaras que el contenido de esta hoja constituye tu {form.tipo === 'reclamo' ? 'reclamo' : 'queja'}.</p>
        </section>

        {model.errorMessage && <p role="alert" className="text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
        <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{model.isSubmitting ? 'Enviando…' : `Enviar ${form.tipo === 'reclamo' ? 'reclamo' : 'queja'}`}</button>
      </fieldset>
    </form>
  );
}
