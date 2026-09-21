'use client';

import type { LegalSettings } from '@/lib/types/legal';

interface Props {
  form: LegalSettings;
  isSaving: boolean;
  onChange: (form: LegalSettings) => void;
  onSubmit: () => void;
}

const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base';
const sectionClass = 'space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8';

export function LegalSettingsForm({ form, isSaving, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <fieldset disabled={isSaving} className="space-y-6 disabled:opacity-60">
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Términos y condiciones</h2>
          <label className="block text-sm font-medium">Título
            <input required maxLength={200} value={form.termsTitle} onChange={(event) => onChange({ ...form, termsTitle: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Contenido
            <textarea required maxLength={20000} rows={12} value={form.termsBody} onChange={(event) => onChange({ ...form, termsBody: event.target.value })} className={inputClass} />
          </label>
        </section>
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Política de privacidad</h2>
          <label className="block text-sm font-medium">Título
            <input required maxLength={200} value={form.privacyTitle} onChange={(event) => onChange({ ...form, privacyTitle: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Contenido
            <textarea required maxLength={20000} rows={12} value={form.privacyBody} onChange={(event) => onChange({ ...form, privacyBody: event.target.value })} className={inputClass} />
          </label>
        </section>
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Política de cambios y devoluciones</h2>
          <label className="block text-sm font-medium">Título
            <input required maxLength={200} value={form.returnsTitle} onChange={(event) => onChange({ ...form, returnsTitle: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Contenido
            <textarea required maxLength={20000} rows={12} value={form.returnsBody} onChange={(event) => onChange({ ...form, returnsBody: event.target.value })} className={inputClass} />
          </label>
        </section>
        <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{isSaving ? 'Guardando…' : 'Guardar términos y políticas'}</button>
      </fieldset>
    </form>
  );
}
