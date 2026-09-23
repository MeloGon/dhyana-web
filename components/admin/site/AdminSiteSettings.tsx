'use client';
import Link from 'next/link';
import {
  ArrowUp,
  ArrowDown,
  Upload,
  Loader2,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
  Layers,
  FileImage,
  Video,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import {
  SITE_TEXT_FIELDS,
  SITE_VISIBILITY_FIELDS,
  SECTION_NAMES,
  DEFAULT_SECTION_ORDER,
  FLOATING_SOCIAL_DESIGNS,
  DEFAULT_FLOATING_SOCIAL,
} from '@/lib/data/site-fields';
import type { SiteContent, SiteTextKey, SiteVisibilityKey, FloatingSocialDesign } from '@/lib/types/site-settings';

const groups = [...new Set(Object.values(SITE_TEXT_FIELDS).map((field) => field.group))];
const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/20 bg-[var(--page)] px-4 py-3 text-sm';

export function AdminSiteSettings({ initial }: { initial: SiteContent }) {
  const model = useSiteSettings(initial);
  const busy = model.isSaving || model.uploading !== null;
  const currentOrder = model.settings.sectionOrder || DEFAULT_SECTION_ORDER;
  const social = model.settings.floatingSocial || DEFAULT_FLOATING_SOCIAL;

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link href="/admin" className="text-sm underline">Volver al panel</Link>
      <h1 className="mt-5 font-serif text-3xl font-bold">Diseño del sitio</h1>
      <p className="mt-3 text-sm">Edita textos, orden de secciones, visibilidad, logo y video. Los cambios se publican al guardar.</p>
      <form onSubmit={(event) => { event.preventDefault(); void model.save(); }} className="mt-8 space-y-6">
        <fieldset disabled={busy} className="space-y-6 disabled:opacity-70">
          {/* Orden de las secciones */}
          <section className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl flex items-center gap-2.5">
                  <Layers className="h-6 w-6 text-[#6366F1]" />
                  Orden de las secciones
                </h2>
                <p className="mt-1 text-sm text-[color:var(--ink)]/75">
                  Organiza la estructura vertical de la página a tu gusto. El orden se reflejará tanto en la web como en el menú de navegación.
                </p>
              </div>
              <button
                type="button"
                onClick={model.resetSectionOrder}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#6366F1] hover:underline transition-opacity"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restablecer orden inicial
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {currentOrder.map((key, index) => {
                const isVisible = model.settings.visibility[key];
                const isFirst = index === 0;
                const isLast = index === currentOrder.length - 1;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--page)] p-3.5 sm:p-4 shadow-2xs transition-shadow"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-xs font-bold text-white shadow-2xs">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate text-[color:var(--ink)]">
                          {SECTION_NAMES[key] || key}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {isVisible ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <Eye className="h-3 w-3" /> Visible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--ink)]/50">
                              <EyeOff className="h-3 w-3" /> Oculta en visibilidad
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={isFirst || busy}
                        onClick={() => model.moveSectionUp(index)}
                        title="Subir sección"
                        aria-label={`Subir sección ${SECTION_NAMES[key] || key}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--ink)]/15 bg-[var(--surface)] text-[color:var(--ink)] hover:bg-[#6366F1]/10 hover:text-[#6366F1] hover:border-[#6366F1]/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast || busy}
                        onClick={() => model.moveSectionDown(index)}
                        title="Bajar sección"
                        aria-label={`Bajar sección ${SECTION_NAMES[key] || key}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--ink)]/15 bg-[var(--surface)] text-[color:var(--ink)] hover:bg-[#6366F1]/10 hover:text-[#6366F1] hover:border-[#6366F1]/40 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Secciones visibles */}
          <section className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
            <h2 className="font-serif text-2xl">Secciones visibles</h2>
            <p className="mt-2 text-sm">Activa o desactiva qué secciones se muestran. Ocultar también retira los enlaces correspondientes de la barra de navegación y pie de página.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(Object.keys(SITE_VISIBILITY_FIELDS) as SiteVisibilityKey[]).map((key) => (
                <label key={key} className="flex items-start gap-3 text-sm cursor-pointer select-none">
                  <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#6366F1]" checked={model.settings.visibility[key]} onChange={(e) => model.setVisibility(key, e.target.checked)} />
                  {SITE_VISIBILITY_FIELDS[key]}
                </label>
              ))}
            </div>
            <p className="mt-5 text-xs text-[color:var(--ink)]/60">Para mostrar formulario, tarjeta o preguntas, activa también el bloque de contacto. El formulario sigue siendo demostrativo.</p>
          </section>

          {/* Logo y video de inicio con botones destacados */}
          <section className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8 space-y-8">
            <div>
              <h2 className="font-serif text-2xl">Logo y video de inicio</h2>
              <p className="mt-1 text-sm text-[color:var(--ink)]/75">
                Personaliza la identidad visual de la cabecera y el video envolvente de bienvenida.
              </p>
            </div>

            {/* Subida de Logo SVG */}
            <div className="rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--page)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#6366F1]">
                  <FileImage className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Logo SVG del centro</h3>
                  <p className="text-xs text-[color:var(--ink)]/60">Formato vectorial .svg, hasta 256 KB. Recomendado: 128 × 128 px.</p>
                </div>
              </div>

              <p id="logo-help" className="text-sm text-[color:var(--ink)]/80">
                Convierte textos a trazados; exporta sin CSS, scripts ni imágenes incrustadas. Si no subes logo, se muestra el símbolo de bienestar predeterminado.
              </p>

              {/* Botón de subida destacado y accesible */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <input
                  id="site-logo"
                  type="file"
                  accept=".svg,image/svg+xml"
                  aria-describedby="logo-help"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void model.upload(file, 'logo');
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="site-logo"
                  className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}
                >
                  {model.uploading === 'logo' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Subiendo logo…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{model.logoUrl ? 'Reemplazar logo SVG' : 'Seleccionar archivo de logo SVG'}</span>
                    </>
                  )}
                </label>

                {model.logoUrl && (
                  <button
                    type="button"
                    onClick={() => model.clearAsset('logo')}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-3 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Quitar logo
                  </button>
                )}
              </div>

              {model.logoUrl && (
                <div className="mt-4 flex items-center gap-4 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-3 w-fit">
                  {/* SVG validado, renderizado como imagen aislada, nunca como HTML. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={model.logoUrl}
                    alt="Vista previa del logo"
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg bg-[#D1D3E8]/30 p-2 object-contain"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">✓ Logo activo en borrador</span>
                    <p className="text-[color:var(--ink)]/60 mt-0.5">Guarda los cambios para publicarlo en la web.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Subida de Video de inicio */}
            <div className="rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--page)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6]">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Video de fondo de inicio</h3>
                  <p className="text-xs text-[color:var(--ink)]/60">MP4 o WebM, hasta 50 MB. Recomendado: 16:9 (1920 × 1080 px).</p>
                </div>
              </div>

              <p id="video-help" className="text-sm text-[color:var(--ink)]/80">
                Se reproduce en bucle continuo y comienza sin sonido. Comprime el video para asegurar una carga web rápida.
              </p>

              {/* Botón de subida destacado y accesible */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <input
                  id="site-video"
                  type="file"
                  accept="video/mp4,video/webm,.mp4,.webm"
                  aria-describedby="video-help"
                  className="sr-only"
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void model.upload(file, 'video');
                    e.target.value = '';
                  }}
                />
                <label
                  htmlFor="site-video"
                  className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer ${busy ? 'pointer-events-none opacity-50' : ''}`}
                >
                  {model.uploading === 'video' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Subiendo video…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>{model.videoUrl ? 'Reemplazar video de inicio' : 'Seleccionar archivo de video'}</span>
                    </>
                  )}
                </label>

                {model.videoUrl && (
                  <button
                    type="button"
                    onClick={() => model.clearAsset('video')}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--ink)]/20 px-4 py-3 text-xs font-semibold text-[color:var(--ink)] hover:bg-[color:var(--ink)]/5 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Volver al video de muestra
                  </button>
                )}
              </div>

              {model.videoUrl && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>✓ Video cargado en borrador</span>
                  </div>
                  <video
                    key={model.videoUrl}
                    src={model.videoUrl}
                    controls
                    preload="metadata"
                    className="aspect-video w-full max-w-xl rounded-xl bg-[#111827] border border-[color:var(--ink)]/10"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Redes Sociales Flotantes */}
          <section className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl flex items-center gap-2.5">
                  <Share2 className="h-6 w-6 text-[#EC4899]" />
                  Redes Sociales Flotantes
                </h2>
                <p className="mt-1 text-sm text-[color:var(--ink)]/75">
                  Configura los botones flotantes que acompañan al visitante mientras navega por la web (Facebook, Instagram y YouTube).
                </p>
              </div>

              {/* Interruptor maestro */}
              <label className="self-start sm:self-auto inline-flex items-center gap-2.5 cursor-pointer bg-[var(--page)] px-4 py-2.5 rounded-xl border border-[color:var(--ink)]/15 hover:border-[color:var(--ink)]/30 transition-colors">
                <input
                  type="checkbox"
                  checked={social.isEnabled}
                  onChange={(e) => model.setFloatingSocialEnabled(e.target.checked)}
                  disabled={busy}
                  className="h-4 w-4 rounded accent-[#6366F1]"
                />
                <span className="text-xs font-semibold">
                  {social.isEnabled ? 'Botones activos' : 'Botones pausados'}
                </span>
              </label>
            </div>

            {social.isEnabled ? (
              <div className="mt-6 space-y-6">
                {/* Selector de los 3 estilos */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/70 mb-3">
                    Estilo de los botones flotantes:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {(['fab', 'pill', 'dock'] as FloatingSocialDesign[]).map((designKey) => {
                      const info = FLOATING_SOCIAL_DESIGNS[designKey];
                      const isSelected = social.design === designKey;
                      return (
                        <button
                          key={designKey}
                          type="button"
                          disabled={busy}
                          onClick={() => model.setFloatingSocialDesign(designKey)}
                          className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'border-[#6366F1] bg-[#6366F1]/5 ring-2 ring-[#6366F1]/30 shadow-sm'
                              : 'border-[color:var(--ink)]/15 bg-[var(--page)] hover:border-[color:var(--ink)]/30'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-sm font-bold text-[color:var(--ink)]">{info.label}</span>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-[#6366F1] shrink-0" />}
                            </div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[color:var(--ink)]/10 text-[color:var(--ink)]/80 mb-2">
                              {info.badge}
                            </span>
                            <p className="text-xs text-[color:var(--ink)]/70 leading-relaxed">
                              {info.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Configuración individual de cada red */}
                <div className="space-y-4 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/70">
                    Redes visibles y enlaces de redirección:
                  </label>

                  {/* Facebook */}
                  <div className="p-4 rounded-2xl border border-[color:var(--ink)]/15 bg-[var(--page)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-sm">
                        <input
                          type="checkbox"
                          checked={social.facebookEnabled}
                          onChange={(e) => model.setSocialNetwork('facebook', 'enabled', e.target.checked)}
                          disabled={busy}
                          className="h-4 w-4 rounded accent-[#1877F2]"
                        />
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-xs font-bold">f</span>
                          Mostrar botón de Facebook
                        </span>
                      </label>
                      <span className={`text-[11px] font-semibold ${social.facebookEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[color:var(--ink)]/40'}`}>
                        {social.facebookEnabled ? 'Visible' : 'Oculto'}
                      </span>
                    </div>
                    {social.facebookEnabled && (
                      <div>
                        <label className="block text-xs text-[color:var(--ink)]/70 mb-1">
                          Enlace a tu página de Facebook:
                        </label>
                        <input
                          type="url"
                          placeholder="https://facebook.com/dhyanaterapia"
                          value={social.facebookUrl}
                          onChange={(e) => model.setSocialNetwork('facebook', 'url', e.target.value)}
                          disabled={busy}
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="p-4 rounded-2xl border border-[color:var(--ink)]/15 bg-[var(--page)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-sm">
                        <input
                          type="checkbox"
                          checked={social.instagramEnabled}
                          onChange={(e) => model.setSocialNetwork('instagram', 'enabled', e.target.checked)}
                          disabled={busy}
                          className="h-4 w-4 rounded accent-[#E1306C]"
                        />
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white flex items-center justify-center text-xs font-bold">ig</span>
                          Mostrar botón de Instagram
                        </span>
                      </label>
                      <span className={`text-[11px] font-semibold ${social.instagramEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[color:var(--ink)]/40'}`}>
                        {social.instagramEnabled ? 'Visible' : 'Oculto'}
                      </span>
                    </div>
                    {social.instagramEnabled && (
                      <div>
                        <label className="block text-xs text-[color:var(--ink)]/70 mb-1">
                          Enlace a tu perfil de Instagram:
                        </label>
                        <input
                          type="url"
                          placeholder="https://instagram.com/dhyanaterapia"
                          value={social.instagramUrl}
                          onChange={(e) => model.setSocialNetwork('instagram', 'url', e.target.value)}
                          disabled={busy}
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>

                  {/* YouTube */}
                  <div className="p-4 rounded-2xl border border-[color:var(--ink)]/15 bg-[var(--page)] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-sm">
                        <input
                          type="checkbox"
                          checked={social.youtubeEnabled}
                          onChange={(e) => model.setSocialNetwork('youtube', 'enabled', e.target.checked)}
                          disabled={busy}
                          className="h-4 w-4 rounded accent-[#FF0000]"
                        />
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center text-xs font-bold">yt</span>
                          Mostrar botón de YouTube
                        </span>
                      </label>
                      <span className={`text-[11px] font-semibold ${social.youtubeEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-[color:var(--ink)]/40'}`}>
                        {social.youtubeEnabled ? 'Visible' : 'Oculto'}
                      </span>
                    </div>
                    {social.youtubeEnabled && (
                      <div>
                        <label className="block text-xs text-[color:var(--ink)]/70 mb-1">
                          Enlace a tu canal de YouTube:
                        </label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/@dhyanaterapia"
                          value={social.youtubeUrl}
                          onChange={(e) => model.setSocialNetwork('youtube', 'url', e.target.value)}
                          disabled={busy}
                          className={inputClass}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-2xl bg-[var(--page)] border border-[color:var(--ink)]/10 text-xs text-[color:var(--ink)]/60">
                Los botones flotantes de redes sociales están actualmente desactivados en la web. Marca la casilla &quot;Botones activos&quot; arriba para habilitarlos.
              </div>
            )}
          </section>

          {groups.map((group) => (
            <section key={group} className="rounded-3xl border border-[color:var(--ink)]/15 bg-[var(--surface)] p-6 sm:p-8">
              <h2 className="mb-5 font-serif text-2xl">{group}</h2>
              <div className="space-y-5">
                {(Object.keys(SITE_TEXT_FIELDS) as SiteTextKey[])
                  .filter((key) => SITE_TEXT_FIELDS[key].group === group)
                  .map((key) => {
                    const field = SITE_TEXT_FIELDS[key];
                    const optional = key === 'footerCredentials' || key === 'footerMotto';
                    return (
                      <label key={key} className="block text-sm font-medium">
                        {field.label}
                        {field.max > 200 ? (
                          <textarea
                            className={inputClass}
                            rows={3}
                            required={!optional}
                            maxLength={field.max}
                            value={model.settings.texts[key]}
                            onChange={(e) => model.setText(key, e.target.value)}
                          />
                        ) : (
                          <input
                            className={inputClass}
                            required={!optional}
                            maxLength={field.max}
                            value={model.settings.texts[key]}
                            onChange={(e) => model.setText(key, e.target.value)}
                          />
                        )}
                      </label>
                    );
                  })}
              </div>
            </section>
          ))}

          <p className="text-sm">Otros contenidos: <Link className="underline" href="/admin/services">servicios</Link>, <Link className="underline" href="/admin/about">Sobre nosotros</Link>, <Link className="underline" href="/admin/contact">contacto de tarjeta y footer</Link>, <Link className="underline" href="/admin/faqs">preguntas</Link> y <Link className="underline" href="/admin/quotes">opiniones</Link>.</p>
        </fieldset>

        <div className="sticky bottom-0 rounded-2xl border border-[color:var(--ink)]/20 bg-[var(--surface)] p-4 shadow-lg">
          {model.errorMessage && <p role="alert" className="mb-3 text-sm text-[color:var(--danger)]">{model.errorMessage}</p>}
          {model.message && <p role="status" className="mb-3 text-sm text-[color:var(--positive)]">{model.message}</p>}
          {model.uploading && <p role="status" className="mb-3 text-sm">Subiendo {model.uploading === 'logo' ? 'logo' : 'video'}… Mantén esta página abierta.</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-3 font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md disabled:opacity-50 transition-all"
          >
            {model.isSaving ? 'Guardando…' : 'Guardar diseño del sitio'}
          </button>
        </div>
      </form>
    </main>
  );
}

