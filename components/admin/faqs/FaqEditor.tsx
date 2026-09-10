'use client';

import type { FaqInput } from '@/lib/types/faqs';

interface Props {
  form: FaqInput;
  isEditing: boolean;
  isSaving: boolean;
  isDisabled: boolean;
  onChange: (form: FaqInput) => void;
  onSubmit: () => void;
}

const fieldClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base';

export function FaqEditor({ form, isEditing, isSaving, isDisabled, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className="rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl">{isEditing ? 'Editar pregunta' : 'Nueva pregunta'}</h2>
      <fieldset disabled={isSaving || isDisabled} className="mt-6 space-y-5 disabled:opacity-60">
        <label className="block text-sm font-medium">Pregunta
          <textarea required maxLength={300} rows={2} value={form.question} onChange={(event) => onChange({ ...form, question: event.target.value })} className={fieldClass} />
        </label>
        <label className="block text-sm font-medium">Respuesta
          <textarea required maxLength={5000} rows={7} value={form.answer} onChange={(event) => onChange({ ...form, answer: event.target.value })} className={fieldClass} />
        </label>
        <label className="block text-sm font-medium">Orden de aparición
          <input type="number" required min={1} max={10000} step={1} value={form.sortOrder || ''} onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value) })} className={fieldClass} aria-describedby="faq-order-help" />
          <span id="faq-order-help" className="mt-2 block text-xs font-normal text-[#3D4C5A]/75">Los números menores aparecen primero. Usa números distintos para elegir el orden.</span>
        </label>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={form.isPublished} onChange={(event) => onChange({ ...form, isPublished: event.target.checked })} className="h-4 w-4 accent-[#467E76]" />
          Publicar en el sitio
        </label>
        <p className="text-xs text-[#3D4C5A]/75">Si desmarcas esta opción, la pregunta queda guardada como borrador.</p>
        <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{isSaving ? 'Guardando…' : 'Guardar pregunta'}</button>
      </fieldset>
    </form>
  );
}
