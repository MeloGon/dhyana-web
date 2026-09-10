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
  const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base focus:outline-2 focus:outline-[#467E76]';
  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl">{workshop ? 'Editar taller' : 'Nuevo taller'}</h2>
      <fieldset disabled={isSubmitting || isDeleting} className="mt-6 space-y-5 disabled:opacity-60">
        <div><label htmlFor="workshop-title" className="text-sm font-medium">Título</label>
          <input id="workshop-title" value={form.title} onChange={(e) => setField('title', e.target.value)} required maxLength={160} className={inputClass} /></div>
        <div><label htmlFor="workshop-slug" className="text-sm font-medium">Identificador público</label>
          <input id="workshop-slug" value={form.title ? editor.slug : ''} readOnly aria-describedby="slug-help" className={inputClass} />
          <p id="slug-help" className="mt-2 text-xs text-[#3D4C5A]/70">Se genera desde el título. Si ya existe, se añade un número al guardar.</p></div>
        <div><label htmlFor="workshop-summary" className="text-sm font-medium">Descripción</label>
          <textarea id="workshop-summary" value={form.summary} onChange={(e) => setField('summary', e.target.value)} required maxLength={3000} rows={4} className={inputClass} /></div>
        <div><label htmlFor="workshop-category" className="text-sm font-medium">Modalidad</label>
          <select id="workshop-category" value={form.category} onChange={(e) => setField('category', e.target.value === 'individual' ? 'individual' : 'group')} className={inputClass}>
            <option value="group">Grupal</option><option value="individual">Individual (agotado)</option>
          </select></div>
        <label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e) => setField('isPublished', e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#467E76]" />
          <span>Publicar en la web<span className="mt-1 block text-xs text-[#3D4C5A]/70">Desmarcado: borrador privado. Los horarios se publican por separado.</span></span></label>
        <div className="border-t border-[#3D4C5A]/15 pt-6">
          <h2 className="font-serif text-2xl">Horarios</h2>
          <p className="mt-2 text-sm">Agrega los horarios antes de guardar. Cada uno tiene su precio y cupos.</p>
          {form.category === 'individual' && <p className="mt-2 text-sm">Los talleres individuales aparecen como agotados; sus horarios no se muestran al público.</p>}
          <div className="mt-5 space-y-4">
            {editor.groups.map((group, index) => <GroupEditor key={group.key} group={group} index={index} onChange={editor.setGroupField} onRemove={editor.removeGroup} />)}
          </div>
          {!editor.groups.length && <p className="mt-4 text-sm">Sin horarios. Puedes agregarlos ahora o más adelante.</p>}
          <button type="button" onClick={editor.addGroup} disabled={editor.groups.length >= 50} className="mt-4 rounded-xl border border-[#467E76] px-5 py-3 text-sm text-[#285D48] disabled:opacity-50">+ Agregar horario</button>
          {workshop && <p className="mt-3 text-xs text-[#3D4C5A]/70">Quitar horarios se aplica al guardar. Si tienen compras, se conservarán y verás un aviso.</p>}
        </div>
        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-[#3D4C5A]/15 bg-white py-4">
          <button className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{isSubmitting ? 'Guardando…' : 'Guardar taller y horarios'}</button>
          {workshop && <button type="button" onClick={() => editor.setConfirmDelete(true)} className="px-2 py-3 text-sm text-[#9B3024] underline underline-offset-4">Eliminar taller</button>}
        </div>
      </fieldset>
      {errorMessage && <p role="alert" className="mt-4 text-sm text-[#9B3024]">{errorMessage}</p>}
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
