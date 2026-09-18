'use client';

import { useState } from 'react';
import { Upload, FileImage, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { uploadAboutImage } from '@/lib/api/about-settings';
import type { AboutSettings } from '@/lib/types/about-settings';

interface Props {
  form: AboutSettings;
  isSaving: boolean;
  onChange: (form: AboutSettings) => void;
  onSubmit: () => void;
}

const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base';
const sectionClass = 'space-y-5 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-8';

/**
 * Formulario "tonto" (pieza): recibe todo por props y no sabe de dónde vienen.
 * En Flutter sería un StatelessWidget que recibe callbacks.
 */
export function AboutSettingsForm({ form, isSaving, onChange, onSubmit }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Formato no permitido. Selecciona una imagen JPG, PNG o WebP.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen supera el límite permitido de 5 MB.');
      e.target.value = '';
      return;
    }
    try {
      setIsUploading(true);
      const res = await uploadAboutImage(file);
      onChange({ ...form, profileImageUrl: res.url });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <fieldset disabled={isSaving} className="space-y-6 disabled:opacity-60">
        {/* Cabecera de la sección */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Cabecera de la sección</h2>
          <label className="block text-sm font-medium">Etiqueta superior
            <input required maxLength={120} value={form.badge} onChange={(event) => onChange({ ...form, badge: event.target.value })} className={inputClass} />
          </label>
          <p className="text-xs text-[color:var(--ink)]/75">Texto del badge que aparece encima del título, como &quot;Sobre el Equipo&quot;.</p>
          <label className="block text-sm font-medium">Título principal
            <input required maxLength={200} value={form.heading} onChange={(event) => onChange({ ...form, heading: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Párrafo de presentación
            <textarea required maxLength={1000} rows={3} value={form.introduction} onChange={(event) => onChange({ ...form, introduction: event.target.value })} className={inputClass} />
          </label>
        </section>

        {/* Tarjeta de perfil */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Tarjeta de perfil y fotografía</h2>

          {/* Subida y Previsualización de la Fotografía */}
          <div className="rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--page)] p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/10 text-[#6366F1]">
                <FileImage className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Fotografía de la tarjeta</h3>
                <p className="text-xs text-[color:var(--ink)]/60">Proporción 4:3 · JPG, PNG o WebP · Máximo 5 MB</p>
              </div>
            </div>

            {/* Especificaciones y Guía de dimensiones */}
            <div className="rounded-xl border border-[#6366F1]/20 bg-[#6366F1]/5 p-4 text-xs space-y-2 text-[color:var(--ink)]">
              <div className="flex items-center gap-2 font-semibold text-[#6366F1]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Especificaciones para que la foto se vea perfecta:</span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[color:var(--ink)]/85 pt-1">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-[#6366F1]">📐 Proporción:</span> 4:3 (formato horizontal apaisado)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-[#6366F1]">🖼️ Resolución ideal:</span> 1200 × 900 px (mínimo 800 × 600 px)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-[#6366F1]">📁 Formatos:</span> JPG, PNG o WebP (hasta 5 MB)
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-[#6366F1]">💡 Encuadre:</span> Rostro en la mitad superior (la base tiene el degradado con el nombre)
                </li>
              </ul>
            </div>

            {/* Previsualización idéntica a la tarjeta pública */}
            {form.profileImageUrl && (
              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--ink)]/70">Vista previa en la tarjeta:</span>
                <div className="relative w-full max-w-md aspect-4/3 rounded-2xl overflow-hidden bg-[#3D4C5A]/10 shadow-sm border border-[color:var(--ink)]/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.profileImageUrl}
                    alt={form.profileImageAlt || 'Vista previa'}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D4C5A]/70 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                    <span className="font-serif text-base sm:text-lg font-bold block">{form.profileName || 'Nombre del profesional'}</span>
                    <span className="text-xs text-white/90 font-sans">{form.profileTitle || 'Subtítulo / Especialidad'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Selector y botón de subida */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <input
                id="profile-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={isSaving || isUploading}
                onChange={handleFileChange}
              />
              <label
                htmlFor="profile-image-upload"
                className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer ${isSaving || isUploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Subiendo fotografía…</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>{form.profileImageUrl ? 'Subir otra foto desde mi equipo' : 'Seleccionar fotografía desde mi equipo'}</span>
                  </>
                )}
              </label>

              {uploadError && (
                <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {uploadError}
                </span>
              )}
            </div>

            {/* Enlace alternativo manual */}
            <div className="pt-2 border-t border-[color:var(--ink)]/10">
              <details className="text-xs text-[color:var(--ink)]/75">
                <summary className="cursor-pointer font-medium hover:text-[#6366F1] transition-colors py-1">
                  O pegar URL externa manualmente
                </summary>
                <div className="pt-2">
                  <input
                    type="url"
                    maxLength={500}
                    value={form.profileImageUrl}
                    onChange={(event) => onChange({ ...form, profileImageUrl: event.target.value })}
                    className={inputClass}
                    placeholder="https://..."
                  />
                </div>
              </details>
            </div>
          </div>

          <label className="block text-sm font-medium">Nombre
            <input required maxLength={120} value={form.profileName} onChange={(event) => onChange({ ...form, profileName: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Subtítulo
            <input required maxLength={200} value={form.profileTitle} onChange={(event) => onChange({ ...form, profileTitle: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Texto alternativo de la imagen
            <input required maxLength={200} value={form.profileImageAlt} onChange={(event) => onChange({ ...form, profileImageAlt: event.target.value })} className={inputClass} />
          </label>
          <p className="text-xs text-[color:var(--ink)]/75">Describe la imagen para accesibilidad y motores de búsqueda.</p>
        </section>

        {/* Credenciales */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Credenciales</h2>
          <p className="text-xs text-[color:var(--ink)]/75">Tres líneas bajo la foto con formación, especialización y experiencia.</p>
          <label className="block text-sm font-medium">Credencial 1
            <input required maxLength={300} value={form.credential1} onChange={(event) => onChange({ ...form, credential1: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Credencial 2
            <input required maxLength={300} value={form.credential2} onChange={(event) => onChange({ ...form, credential2: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Credencial 3
            <input required maxLength={300} value={form.credential3} onChange={(event) => onChange({ ...form, credential3: event.target.value })} className={inputClass} />
          </label>
        </section>

        {/* Cita */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Cita al pie de la tarjeta</h2>
          <label className="block text-sm font-medium">Frase
            <textarea required maxLength={500} rows={2} value={form.quote} onChange={(event) => onChange({ ...form, quote: event.target.value })} className={inputClass} />
          </label>
          <p className="text-xs text-[color:var(--ink)]/75">Aparece en cursiva debajo de las credenciales, dentro de la tarjeta de perfil.</p>
        </section>

        {/* Enfoque */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Enfoque terapéutico</h2>
          <label className="block text-sm font-medium">Título del enfoque
            <input required maxLength={200} value={form.approachTitle} onChange={(event) => onChange({ ...form, approachTitle: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Primer párrafo
            <textarea required maxLength={1000} rows={3} value={form.approachParagraph1} onChange={(event) => onChange({ ...form, approachParagraph1: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Segundo párrafo
            <textarea required maxLength={1000} rows={3} value={form.approachParagraph2} onChange={(event) => onChange({ ...form, approachParagraph2: event.target.value })} className={inputClass} />
          </label>
        </section>

        {/* Pilares */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Pilares del enfoque</h2>
          <p className="text-xs text-[color:var(--ink)]/75">Cuatro tarjetas con ícono fijo. Solo se editan título y descripción de cada pilar.</p>
          {([1, 2, 3, 4] as const).map((n) => {
            // Construimos las claves de forma tipada para acceder al form.
            const titleKey = `pillar${n}Title` as const;
            const descKey = `pillar${n}Description` as const;
            return (
              <fieldset key={n} className="space-y-3 border-t border-[color:var(--ink)]/10 pt-5 first:border-0 first:pt-0">
                <legend className="text-sm font-semibold">Pilar {n}</legend>
                <label className="block text-sm font-medium">Título
                  <input required maxLength={120} value={form[titleKey]} onChange={(event) => onChange({ ...form, [titleKey]: event.target.value })} className={inputClass} />
                </label>
                <label className="block text-sm font-medium">Descripción
                  <textarea required maxLength={500} rows={2} value={form[descKey]} onChange={(event) => onChange({ ...form, [descKey]: event.target.value })} className={inputClass} />
                </label>
              </fieldset>
            );
          })}
        </section>

        <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{isSaving ? 'Guardando…' : 'Guardar sección'}</button>
      </fieldset>
    </form>
  );
}
