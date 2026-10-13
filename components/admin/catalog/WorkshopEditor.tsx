'use client';

import { GroupEditor } from '@/components/admin/catalog/GroupEditor';
import { useWorkshopEditor } from '@/hooks/useAdminCatalog';
import type { AdminWorkshop } from '@/lib/types/admin-catalog';

export function WorkshopEditor({ workshop, onSaved, onDeleted, onBusyChange }: {
  workshop?: AdminWorkshop; onSaved: (saved: AdminWorkshop) => void;
  onDeleted: (id: string) => void; onBusyChange: (busy: boolean) => void;
}) {
  const editor = useWorkshopEditor(workshop, onSaved, onDeleted, onBusyChange);
  const { form, setField, isSubmitting, isDeleting, errorMessage, handleSubmit } = editor;
  const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base focus:outline-2 focus:outline-[#467E76]';
  return (
    <form onSubmit={handleSubmit} className="min-w-0 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8">
      <h2 className="font-serif text-2xl">{workshop ? 'Editar taller' : 'Nuevo taller'}</h2>
      <fieldset disabled={isSubmitting || isDeleting} className="min-w-0 mt-6 space-y-5 disabled:opacity-60">
        <div><label htmlFor="workshop-title" className="text-sm font-medium">Título</label>
          <input id="workshop-title" value={form.title} onChange={(e) => setField('title', e.target.value)} required maxLength={160} className={inputClass} /></div>
        <div><label htmlFor="workshop-slug" className="text-sm font-medium">Identificador público</label>
          <input id="workshop-slug" value={form.title ? editor.slug : ''} readOnly aria-describedby="slug-help" className={inputClass} />
          <p id="slug-help" className="mt-2 text-xs text-[color:var(--ink)]/70">Se genera desde el título. Si ya existe, se añade un número al guardar.</p></div>
        <div><label htmlFor="workshop-summary" className="text-sm font-medium">Descripción</label>
          <textarea id="workshop-summary" value={form.summary} onChange={(e) => setField('summary', e.target.value)} required maxLength={3000} rows={5} className={inputClass} /></div>
        <div><label htmlFor="workshop-category" className="text-sm font-medium">Modalidad</label>
          <select id="workshop-category" value={form.category} onChange={(e) => setField('category', e.target.value === 'individual' ? 'individual' : 'group')} className={inputClass}>
            <option value="group">Grupal</option><option value="individual">Individual (agotado)</option>
          </select></div>
        <div>
          <label className="text-sm font-medium">Afiche o imagen del taller (opcional)</label>
          <p className="mt-1 text-xs text-[color:var(--ink)]/70">
            Formato cuadrado o vertical (JPG, PNG o WebP, máx. 5 MB). Se muestra en la tarjeta pública con opción de ampliar.
          </p>
          {form.imageUrl ? (
            <div className="mt-3 flex items-center gap-4 p-3 rounded-2xl border border-[color:var(--ink)]/15 bg-[var(--page)] min-w-0 overflow-hidden">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[color:var(--ink)]/15 bg-[var(--surface)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="Afiche del taller"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-mono text-[color:var(--ink)]/80">{form.imageUrl}</p>
                <button
                  type="button"
                  onClick={editor.handleImageRemove}
                  disabled={editor.isSubmitting || editor.isDeleting}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--danger)]/30 px-3 py-1 text-xs font-semibold text-[color:var(--danger)] hover:bg-[color:var(--danger)]/10 transition-colors"
                >
                  Quitar afiche
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <label
                htmlFor="workshop-image-file"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-[color:var(--ink)]/20 rounded-2xl bg-[var(--page)] cursor-pointer hover:border-[#467E76] transition-colors ${
                  editor.isUploadingImage ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#467E76]">
                    {editor.isUploadingImage ? 'Subiendo imagen…' : 'Subir afiche desde tu equipo'}
                  </p>
                  <p className="mt-1 text-xs text-[color:var(--ink)]/60">Haz clic para seleccionar un archivo (JPG, PNG o WebP)</p>
                </div>
                <input
                  id="workshop-image-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={editor.isUploadingImage || editor.isSubmitting || editor.isDeleting}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      editor.handleImageUpload(file);
                      e.target.value = '';
                    }
                  }}
                  className="sr-only"
                />
              </label>
            </div>
          )}
        </div>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setField('isPublished', e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#467E76]" />
          <span>Publicar en la web<span className="mt-1 block text-xs text-[color:var(--ink)]/70">Desmarcado: borrador privado. Los horarios se publican por separado.</span></span></label>
        <div className="border-t border-[color:var(--ink)]/15 pt-6 pb-2">
          <h2 className="font-serif text-2xl">Horarios</h2>
          <p className="mt-2 text-sm">Agrega los horarios antes de guardar. Cada uno tiene su precio y cupos.</p>
          {form.category === 'individual' && <p className="mt-2 text-sm">Los talleres individuales aparecen como agotados; sus horarios no se muestran al público.</p>}
          <div className="mt-5 space-y-4">
            {editor.groups.map((group, index) => <GroupEditor key={group.key} group={group} index={index} onChange={editor.setGroupField} onRemove={editor.removeGroup} />)}
          </div>
          {!editor.groups.length && <p className="mt-4 text-sm">Sin horarios. Puedes agregarlos ahora o más adelante.</p>}
          <button type="button" onClick={editor.addGroup} disabled={editor.groups.length >= 50} className="mt-4 rounded-xl border border-[#467E76] px-5 py-3 text-sm text-[#285D48] disabled:opacity-50">+ Agregar horario</button>
          {workshop && <p className="mt-3 text-xs text-[color:var(--ink)]/70">Quitar horarios se aplica al guardar. Si tienen compras, se conservarán y verás un aviso.</p>}
        </div>
        <div className="sticky bottom-0 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--ink)]/15 bg-[var(--surface)] px-6 sm:px-8 py-4 rounded-b-3xl shadow-xs z-10">
          <button className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white hover:bg-[#2D3A46] transition-colors">{isSubmitting ? 'Guardando…' : 'Guardar taller y horarios'}</button>
          {workshop && <button type="button" onClick={() => editor.setConfirmDelete(true)} className="px-2 py-3 text-sm text-[color:var(--danger)] underline underline-offset-4 hover:opacity-80">Eliminar taller</button>}
        </div>
      </fieldset>
      {errorMessage && <p role="alert" className="mt-4 text-sm text-[color:var(--danger)]">{errorMessage}</p>}
      {editor.confirmDelete && workshop && <section aria-label="Confirmar eliminación" className="mt-5 rounded-xl border border-[#9B3024]/30 bg-[#FFF5F3] p-5">
        <p className="text-sm">Se eliminará «{workshop.title}» y sus horarios. No se puede deshacer. Si tiene compras, deberás despublicarlo para conservar el historial.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={isDeleting || isSubmitting} onClick={editor.handleDelete} className="rounded-xl bg-[#9B3024] px-4 py-2 text-sm text-white">{isDeleting ? 'Eliminando…' : 'Sí, eliminar taller'}</button>
          <button type="button" disabled={isDeleting} onClick={() => editor.setConfirmDelete(false)} className="rounded-xl border px-4 py-2 text-sm">Cancelar</button>
        </div>
      </section>}
    </form>
  );
}
