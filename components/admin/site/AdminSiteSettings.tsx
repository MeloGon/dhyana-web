'use client';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { SITE_TEXT_FIELDS, SITE_VISIBILITY_FIELDS } from '@/lib/data/site-fields';
import type { SiteContent, SiteTextKey, SiteVisibilityKey } from '@/lib/types/site-settings';

const groups = [...new Set(Object.values(SITE_TEXT_FIELDS).map((field) => field.group))];
const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/20 bg-[var(--page)] px-4 py-3 text-sm';

export function AdminSiteSettings({ initial }: { initial: SiteContent }) {
  const model = useSiteSettings(initial);
  const busy = model.isSaving || model.uploading !== null;
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin" className="text-sm underline">Volver al panel</Link>
      <h1 className="mt-5 font-serif text-3xl font-bold">Diseño del sitio</h1>
      <p className="mt-3 text-sm">Edita textos, logo, video y secciones visibles. Los cambios se publican al guardar.</p>
      <form onSubmit={(event) => { event.preventDefault(); void model.save(); }} className="mt-8 space-y-6">
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
          <section className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Secciones visibles</h2>
            <p className="mt-2 text-sm">Orden: Inicio → Servicios → Talleres → Opiniones → Sobre nosotros → Contacto. Ocultar también retira enlaces de navegación.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(Object.keys(SITE_VISIBILITY_FIELDS) as SiteVisibilityKey[]).map((key) => (
                <label key={key} className="flex items-start gap-3 text-sm">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" checked={model.settings.visibility[key]} onChange={(e) => model.setVisibility(key, e.target.checked)} />
                  {SITE_VISIBILITY_FIELDS[key]}
                </label>
              ))}
            </div>
            <p className="mt-5 text-xs">Para mostrar formulario, tarjeta o preguntas, activa también el bloque de contacto. El formulario sigue siendo demostrativo.</p>
          </section>
          <section className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8 space-y-6">
            <h2 className="font-serif text-2xl">Logo y video de inicio</h2>
            <div>
              <label htmlFor="site-logo" className="block font-semibold">Logo SVG</label>
              <p id="logo-help" className="my-2 text-sm">Cuadrado, recomendado 128 × 128 con viewBox; se muestra a 40 px. Hasta 256 KB. Convierte textos a trazados; exporta sin CSS, scripts ni imágenes incrustadas.</p>
              <input id="site-logo" type="file" accept=".svg,image/svg+xml" aria-describedby="logo-help" className="max-w-full text-sm" onChange={(e) => { const file = e.target.files?.[0]; if (file) void model.upload(file, 'logo'); e.target.value = ''; }} />
              {model.logoUrl && <div className="mt-4 flex items-center gap-4">
                {/* SVG validado, renderizado como imagen aislada, nunca como HTML. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={model.logoUrl} alt="Vista previa del logo" width={64} height={64} className="h-16 w-16 rounded-lg bg-[#D1D3E8]/30 p-2 object-contain" />
                <button type="button" onClick={() => model.clearAsset('logo')} className="text-sm underline">Quitar logo</button>
              </div>}
              <p className="mt-2 text-xs">Sin archivo se muestra un símbolo de bienestar, sin círculo con letra.</p>
            </div>
            <div>
              <label htmlFor="site-video" className="block font-semibold">Video de inicio</label>
              <p id="video-help" className="my-2 text-sm">MP4 o WebM, hasta 50 MB. Recomendado: horizontal 16:9, 1920 × 1080 y comprimido para web. Se reproduce en bucle y comienza sin sonido.</p>
              <input id="site-video" type="file" accept="video/mp4,video/webm,.mp4,.webm" aria-describedby="video-help" className="max-w-full text-sm" onChange={(e) => { const file = e.target.files?.[0]; if (file) void model.upload(file, 'video'); e.target.value = ''; }} />
              {model.videoUrl && <div className="mt-4 space-y-3">
                <video key={model.videoUrl} src={model.videoUrl} controls preload="metadata" className="aspect-video w-full max-w-xl rounded-xl bg-[#3D4C5A]" />
                <button type="button" onClick={() => model.clearAsset('video')} className="text-sm underline">Volver al video de muestra</button>
              </div>}
              <p className="mt-2 text-xs">El archivo subido queda en el borrador hasta guardar. Reemplazarlo no elimina el archivo anterior del almacenamiento.</p>
            </div>
          </section>
          {groups.map((group) => <section key={group} className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
            <h2 className="mb-5 font-serif text-2xl">{group}</h2>
            <div className="space-y-5">
              {(Object.keys(SITE_TEXT_FIELDS) as SiteTextKey[]).filter((key) => SITE_TEXT_FIELDS[key].group === group).map((key) => {
                const field = SITE_TEXT_FIELDS[key];
                const optional = key === 'footerCredentials' || key === 'footerMotto';
                return <label key={key} className="block text-sm font-medium">{field.label}
                  {field.max > 200 ? <textarea className={inputClass} rows={3} required={!optional} maxLength={field.max} value={model.settings.texts[key]} onChange={(e) => model.setText(key, e.target.value)} />
                    : <input className={inputClass} required={!optional} maxLength={field.max} value={model.settings.texts[key]} onChange={(e) => model.setText(key, e.target.value)} />}
                </label>;
              })}
            </div>
          </section>)}
          <p className="text-sm">Otros contenidos: <Link className="underline" href="/admin/services">servicios</Link>, <Link className="underline" href="/admin/about">Sobre nosotros</Link>, <Link className="underline" href="/admin/contact">contacto de tarjeta y footer</Link>, <Link className="underline" href="/admin/faqs">preguntas</Link> y <Link className="underline" href="/admin/quotes">opiniones</Link>.</p>
        </fieldset>
        <div className="sticky bottom-0 rounded-2xl border border-[color:var(--ink)]/20 bg-[var(--surface)] p-4 shadow-lg">
          {model.errorMessage && <p role="alert" className="mb-3 text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
          {model.message && <p role="status" className="mb-3 text-sm text-[color:var(--positive)]">{model.message}</p>}
          {model.uploading && <p role="status" className="mb-3 text-sm">Subiendo {model.uploading === 'logo' ? 'logo' : 'video'}… Mantén esta página abierta.</p>}
          <button type="submit" disabled={busy} className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-semibold text-white disabled:opacity-50">{model.isSaving ? 'Guardando…' : 'Guardar diseño del sitio'}</button>
        </div>
      </form>
    </main>
  );
}
