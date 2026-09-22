'use client';

import Link from 'next/link';
import { useAdminComplaintBookSettings } from '@/hooks/useAdminComplaintBookSettings';
import type { ComplaintBookSettings } from '@/lib/types/complaint-book';

const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base';
const sectionClass = 'space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8';

export function AdminComplaintBookSettings({ initial }: { initial: ComplaintBookSettings }) {
  const model = useAdminComplaintBookSettings(initial);
  const { form, setForm } = model;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <header className="mb-8 border-b border-[color:var(--ink)]/15 pb-7">
        <Link href="/admin/complaint-book" className="text-sm text-[color:var(--positive)] underline underline-offset-4">Volver al libro de reclamaciones</Link>
        <h1 className="mt-3 font-serif text-3xl">Datos del proveedor</h1>
        <p className="mt-3 text-sm text-[color:var(--ink)]/75">Estos datos se muestran fijos en cada hoja del Libro de Reclamaciones y en el PDF generado.</p>
      </header>

      <form onSubmit={(event) => { event.preventDefault(); model.handleSubmit(); }}>
        <fieldset disabled={model.isSaving} className="space-y-6 disabled:opacity-60">
          <section className={sectionClass}>
            <h2 className="font-serif text-2xl">Identificación</h2>
            <label className="block text-sm font-medium">Razón social
              <input required maxLength={200} value={form.razonSocial} onChange={(event) => setForm({ ...form, razonSocial: event.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">RUC
              <input required maxLength={11} value={form.ruc} onChange={(event) => setForm({ ...form, ruc: event.target.value })} className={inputClass} aria-describedby="cb-ruc-help" />
            </label>
            <p id="cb-ruc-help" className="text-xs text-[color:var(--ink)]/75">11 dígitos, sin espacios ni guiones.</p>
            <label className="block text-sm font-medium">Domicilio del establecimiento
              <textarea required maxLength={300} rows={2} value={form.domicilio} onChange={(event) => setForm({ ...form, domicilio: event.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">Correo de reclamos (copia interna)
              <input type="email" required maxLength={254} value={form.correoReclamosInterno} onChange={(event) => setForm({ ...form, correoReclamosInterno: event.target.value })} className={inputClass} />
            </label>
          </section>

          <section className={sectionClass}>
            <h2 className="font-serif text-2xl">Textos de cumplimiento legal</h2>
            <p className="rounded-xl bg-[#9B3024]/10 p-4 text-xs text-[#9B3024]">
              Estos textos responden a obligaciones de INDECOPI (Ley 29571). Cambiarlos por error puede generar un
              incumplimiento legal. Al guardar un cambio aquí, se pedirá una confirmación aparte.
            </p>
            <label className="block text-sm font-medium">Aviso sobre otras vías de solución
              <textarea required maxLength={2000} rows={3} value={form.textoAvisoOtrasVias} onChange={(event) => setForm({ ...form, textoAvisoOtrasVias: event.target.value })} className={inputClass} />
            </label>
            <label className="block text-sm font-medium">Plazo de respuesta
              <textarea required maxLength={2000} rows={3} value={form.textoPlazoRespuesta} onChange={(event) => setForm({ ...form, textoPlazoRespuesta: event.target.value })} className={inputClass} />
            </label>
          </section>

          {model.errorMessage && <p role="alert" className="text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
          {model.successMessage && <p role="status" className="text-sm text-[color:var(--positive)]">{model.successMessage}</p>}
          <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{model.isSaving ? 'Guardando…' : 'Guardar configuración'}</button>
        </fieldset>
      </form>

      {model.pendingLegalConfirm && (
        <section role="alertdialog" aria-label="Confirmar edición de textos legales" className="mt-6 rounded-2xl border border-[#9B3024]/30 bg-[var(--surface)] p-5">
          <h2 className="font-semibold">¿Editar textos de cumplimiento legal?</h2>
          <p className="mt-2 text-sm">Vas a modificar el aviso de otras vías o el plazo de respuesta exigidos por INDECOPI. Verifica el texto con criterio legal antes de continuar.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={model.handleSubmit} className="rounded-xl bg-[#9B3024] px-4 py-2 text-white">Confirmar y guardar</button>
            <button onClick={model.cancelLegalConfirm} className="rounded-xl border border-[color:var(--ink)]/25 px-4 py-2">Cancelar</button>
          </div>
        </section>
      )}
    </main>
  );
}
