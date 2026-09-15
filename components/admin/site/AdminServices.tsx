'use client';
import Link from 'next/link';
import { useSiteServices } from '@/hooks/useSiteServices';
import { SERVICE_ICONS } from '@/lib/data/site-fields';
import type { SiteService } from '@/lib/types/site-settings';

const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/20 bg-[var(--page)] px-4 py-3 text-sm';

export function AdminServices({ initial }: { initial: SiteService[] }) {
  const model = useSiteServices(initial);
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <Link href="/admin" className="text-sm underline">Volver al panel</Link>
    <h1 className="mt-5 font-serif text-3xl font-bold">Servicios</h1>
    <p className="mt-3 text-sm">Edita tarjetas, orden y publicación. Guarda al terminar. <Link href="/admin/site" className="underline">Editar título de la sección</Link></p>
    <form className="mt-8 space-y-6" onSubmit={(e) => { e.preventDefault(); void model.save(); }}>
      <fieldset disabled={model.isSaving} className="space-y-6 disabled:opacity-60">
        {model.services.map((service, index) => <section key={service.id} className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">{index + 1}. {service.title || 'Nuevo servicio'}</h2>
            <div className="flex gap-3 text-sm">
              <button type="button" disabled={index === 0} className="underline disabled:opacity-40" onClick={() => model.move(index, -1)} aria-label={`Subir ${service.title || 'servicio'}`}>Subir</button>
              <button type="button" disabled={index === model.services.length - 1} className="underline disabled:opacity-40" onClick={() => model.move(index, 1)} aria-label={`Bajar ${service.title || 'servicio'}`}>Bajar</button>
              <button type="button" className="text-[color:var(--danger)] underline" onClick={() => model.setDeleteId(service.id)}>Eliminar</button>
            </div>
          </div>
          {model.deleteId === service.id && <div role="alert" className="mb-5 rounded-xl border border-[#9B3024]/30 p-4 text-sm">
            <p>¿Quitar «{service.title || 'Nuevo servicio'}»? La eliminación se publicará al guardar.</p>
            <div className="mt-3 flex gap-5"><button type="button" onClick={model.remove} className="font-semibold text-[color:var(--danger)]">Confirmar eliminación</button><button type="button" onClick={() => model.setDeleteId(null)}>Cancelar</button></div>
          </div>}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium sm:col-span-2">Título<input className={inputClass} required maxLength={150} value={service.title} onChange={(e) => model.update(service.id, { title: e.target.value })} /></label>
            <label className="block text-sm font-medium sm:col-span-2">Descripción<textarea className={inputClass} required rows={3} maxLength={1000} value={service.description} onChange={(e) => model.update(service.id, { description: e.target.value })} /></label>
            <label className="block text-sm font-medium sm:col-span-2">Beneficios (uno por línea, máximo ocho)<textarea className={inputClass} rows={4} maxLength={2008} value={service.benefits.join('\n')} onChange={(e) => model.update(service.id, { benefits: e.target.value ? e.target.value.split('\n') : [] })} /></label>
            <label className="block text-sm font-medium">Duración<input className={inputClass} required maxLength={100} value={service.duration} onChange={(e) => model.update(service.id, { duration: e.target.value })} /></label>
            <label className="block text-sm font-medium">Modalidad<input className={inputClass} required maxLength={100} value={service.modality} onChange={(e) => model.update(service.id, { modality: e.target.value })} /></label>
            <label className="block text-sm font-medium">Etiqueta (opcional)<input className={inputClass} maxLength={80} value={service.badge} onChange={(e) => model.update(service.id, { badge: e.target.value })} /></label>
            <label className="block text-sm font-medium">Icono<select className={inputClass} value={service.icon} onChange={(e) => model.update(service.id, { icon: e.target.value as SiteService['icon'] })}>{Object.entries(SERVICE_ICONS).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={service.isPublished} onChange={(e) => model.update(service.id, { isPublished: e.target.checked })} />Publicado en la web</label>
          </div>
        </section>)}
        <button type="button" disabled={model.services.length >= 24} onClick={model.add} className="rounded-xl border border-[color:var(--ink)]/30 px-5 py-3 disabled:opacity-40">Agregar servicio</button>
      </fieldset>
      <div className="sticky bottom-0 rounded-2xl border border-[color:var(--ink)]/20 bg-[var(--surface)] p-4 shadow-lg">
        {model.errorMessage && <p role="alert" className="mb-3 text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
        {model.message && <p role="status" className="mb-3 text-sm text-[color:var(--positive)]">{model.message}</p>}
        <button type="submit" disabled={model.isSaving} className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-semibold text-white disabled:opacity-50">{model.isSaving ? 'Guardando…' : 'Guardar servicios'}</button>
      </div>
    </form>
  </main>;
}
