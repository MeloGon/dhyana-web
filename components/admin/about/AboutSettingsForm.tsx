'use client';

import type { AboutSettings } from '@/lib/types/about-settings';

interface Props {
  form: AboutSettings;
  isSaving: boolean;
  onChange: (form: AboutSettings) => void;
  onSubmit: () => void;
}

const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base';
const sectionClass = 'space-y-5 rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 sm:p-8';

/**
 * Formulario "tonto" (pieza): recibe todo por props y no sabe de dónde vienen.
 * En Flutter sería un StatelessWidget que recibe callbacks.
 */
export function AboutSettingsForm({ form, isSaving, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <fieldset disabled={isSaving} className="space-y-6 disabled:opacity-60">
        {/* Cabecera de la sección */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Cabecera de la sección</h2>
          <label className="block text-sm font-medium">Etiqueta superior
            <input required maxLength={120} value={form.badge} onChange={(event) => onChange({ ...form, badge: event.target.value })} className={inputClass} />
          </label>
          <p className="text-xs text-[#3D4C5A]/75">Texto del badge que aparece encima del título, como &quot;Sobre el Equipo&quot;.</p>
          <label className="block text-sm font-medium">Título principal
            <input required maxLength={200} value={form.heading} onChange={(event) => onChange({ ...form, heading: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Párrafo de presentación
            <textarea required maxLength={1000} rows={3} value={form.introduction} onChange={(event) => onChange({ ...form, introduction: event.target.value })} className={inputClass} />
          </label>
        </section>

        {/* Tarjeta de perfil */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Tarjeta de perfil</h2>
          <label className="block text-sm font-medium">Nombre
            <input required maxLength={120} value={form.profileName} onChange={(event) => onChange({ ...form, profileName: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Subtítulo
            <input required maxLength={200} value={form.profileTitle} onChange={(event) => onChange({ ...form, profileTitle: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">URL de la imagen
            <input required type="url" maxLength={500} value={form.profileImageUrl} onChange={(event) => onChange({ ...form, profileImageUrl: event.target.value })} className={inputClass} aria-describedby="about-image-help" />
          </label>
          <p id="about-image-help" className="text-xs text-[#3D4C5A]/75">Pega la URL completa de la foto. Si el dominio es nuevo, debe agregarse a la configuración de imágenes.</p>
          <label className="block text-sm font-medium">Texto alternativo de la imagen
            <input required maxLength={200} value={form.profileImageAlt} onChange={(event) => onChange({ ...form, profileImageAlt: event.target.value })} className={inputClass} />
          </label>
          <p className="text-xs text-[#3D4C5A]/75">Describe la imagen para accesibilidad y motores de búsqueda.</p>
        </section>

        {/* Credenciales */}
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Credenciales</h2>
          <p className="text-xs text-[#3D4C5A]/75">Tres líneas bajo la foto con formación, especialización y experiencia.</p>
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
          <p className="text-xs text-[#3D4C5A]/75">Aparece en cursiva debajo de las credenciales, dentro de la tarjeta de perfil.</p>
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
          <p className="text-xs text-[#3D4C5A]/75">Cuatro tarjetas con ícono fijo. Solo se editan título y descripción de cada pilar.</p>
          {([1, 2, 3, 4] as const).map((n) => {
            // Construimos las claves de forma tipada para acceder al form.
            const titleKey = `pillar${n}Title` as const;
            const descKey = `pillar${n}Description` as const;
            return (
              <fieldset key={n} className="space-y-3 border-t border-[#3D4C5A]/10 pt-5 first:border-0 first:pt-0">
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
