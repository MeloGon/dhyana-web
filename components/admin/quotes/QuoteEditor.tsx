'use client';

import type { QuoteInput, QuoteVariant } from '@/lib/types/quotes';

interface Props {
  form: QuoteInput;
  isEditing: boolean;
  isSaving: boolean;
  isDisabled: boolean;
  onChange: (form: QuoteInput) => void;
  onSubmit: () => void;
}

const fieldClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base';

export function QuoteEditor({ form, isEditing, isSaving, isDisabled, onChange, onSubmit }: Props) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 sm:p-8"
    >
      <h2 className="font-serif text-2xl">{isEditing ? 'Editar reflexión' : 'Nueva reflexión'}</h2>
      <fieldset disabled={isSaving || isDisabled} className="mt-6 space-y-5 disabled:opacity-60">
        <label className="block text-sm font-medium">
          Cita o reflexión
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={form.quote}
            onChange={(event) => onChange({ ...form, quote: event.target.value })}
            className={fieldClass}
            placeholder="No puedes detener las olas, pero puedes aprender a surfear."
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-sm font-medium">
            Autor
            <input
              required
              maxLength={150}
              value={form.author}
              onChange={(event) => onChange({ ...form, author: event.target.value })}
              className={fieldClass}
              placeholder="Jon Kabat-Zinn"
            />
          </label>

          <label className="block text-sm font-medium">
            Estilo / Color
            <select
              value={form.variant}
              onChange={(event) => onChange({ ...form, variant: event.target.value as QuoteVariant })}
              className={fieldClass}
            >
              <option value="mint">Menta (verde suave)</option>
              <option value="sky">Cielo (azul suave)</option>
              <option value="lavender">Lavanda (violeta suave)</option>
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium">
          Rol o descripción del autor (opcional)
          <input
            maxLength={250}
            value={form.role}
            onChange={(event) => onChange({ ...form, role: event.target.value })}
            className={fieldClass}
            placeholder="Pionero de la Reducción del Estrés Basada en Mindfulness (MBSR)"
          />
        </label>

        <label className="block text-sm font-medium">
          Nota manuscrita de acento (opcional)
          <input
            maxLength={300}
            value={form.accentNote}
            onChange={(event) => onChange({ ...form, accentNote: event.target.value })}
            className={fieldClass}
            placeholder="Respira, cada momento es una oportunidad para empezar de nuevo"
          />
        </label>
        <p className="text-xs text-[#3D4C5A]/75">
          Esta frase aparece en letra cursiva estilizada al pie de la tarjeta.
        </p>

        <label className="block text-sm font-medium">
          Orden de aparición
          <input
            type="number"
            required
            min={1}
            max={10000}
            step={1}
            value={form.sortOrder || ''}
            onChange={(event) => onChange({ ...form, sortOrder: Number(event.target.value) })}
            className={fieldClass}
            aria-describedby="quote-order-help"
          />
          <span id="quote-order-help" className="mt-2 block text-xs font-normal text-[#3D4C5A]/75">
            Los números menores aparecen primero en el mazo de cartas.
          </span>
        </label>

        <label className="flex items-center gap-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(event) => onChange({ ...form, isPublished: event.target.checked })}
            className="h-4 w-4 accent-[#467E76]"
          />
          Publicar en el sitio
        </label>
        <p className="text-xs text-[#3D4C5A]/75">
          Si desmarcas esta opción, la cita queda guardada como borrador sin mostrarse a los visitantes.
        </p>

        <button
          type="submit"
          className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white hover:bg-[#2F3C47] transition-all"
        >
          {isSaving ? 'Guardando…' : 'Guardar reflexión'}
        </button>
      </fieldset>
    </form>
  );
}
