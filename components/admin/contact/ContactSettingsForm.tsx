'use client';

import type { ContactSettings } from '@/lib/types/contact-settings';

interface Props {
  form: ContactSettings;
  isSaving: boolean;
  onChange: (form: ContactSettings) => void;
  onSubmit: () => void;
}

const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base';
const sectionClass = 'space-y-5 rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 sm:p-8';

export function ContactSettingsForm({ form, isSaving, onChange, onSubmit }: Props) {
  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <fieldset disabled={isSaving} className="space-y-6 disabled:opacity-60">
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Título y consultorio</h2>
          <label className="block text-sm font-medium">Título de la tarjeta
            <input required maxLength={120} value={form.title} onChange={(event) => onChange({ ...form, title: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Dirección
            <textarea required maxLength={300} rows={2} value={form.address} onChange={(event) => onChange({ ...form, address: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Referencia de dirección (opcional)
            <input maxLength={300} value={form.addressNote} onChange={(event) => onChange({ ...form, addressNote: event.target.value })} className={inputClass} />
          </label>
        </section>
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Teléfono y correo</h2>
          <label className="block text-sm font-medium">Teléfono de contacto
            <input type="tel" required maxLength={40} value={form.phone} onChange={(event) => onChange({ ...form, phone: event.target.value })} className={inputClass} aria-describedby="contact-phone-help" />
          </label>
          <p id="contact-phone-help" className="text-xs text-[#3D4C5A]/75">Incluye + y código de país. Puedes usar espacios: +51 999 999 999.</p>
          <label className="block text-sm font-medium">Nota del teléfono (opcional)
            <input maxLength={300} value={form.phoneNote} onChange={(event) => onChange({ ...form, phoneNote: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Correo electrónico
            <input type="email" required maxLength={254} value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value })} className={inputClass} />
          </label>
        </section>
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Horario de atención</h2>
          <label className="block text-sm font-medium">Horario principal
            <textarea required maxLength={500} rows={2} value={form.hours} onChange={(event) => onChange({ ...form, hours: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Horario adicional (opcional)
            <textarea maxLength={500} rows={2} value={form.hoursNote} onChange={(event) => onChange({ ...form, hoursNote: event.target.value })} className={inputClass} />
          </label>
        </section>
        <section className={sectionClass}>
          <h2 className="font-serif text-2xl">Botón de WhatsApp</h2>
          <label className="block text-sm font-medium">Número de WhatsApp
            <input type="tel" required maxLength={16} value={form.whatsappPhone} onChange={(event) => onChange({ ...form, whatsappPhone: event.target.value })} className={inputClass} aria-describedby="contact-whatsapp-help" />
          </label>
          <p id="contact-whatsapp-help" className="text-xs text-[#3D4C5A]/75">Código de país y número sin espacios: 51999999999. Puede ser distinto del teléfono de contacto.</p>
          <label className="block text-sm font-medium">Texto del botón
            <input required maxLength={120} value={form.whatsappLabel} onChange={(event) => onChange({ ...form, whatsappLabel: event.target.value })} className={inputClass} />
          </label>
          <label className="block text-sm font-medium">Mensaje inicial (opcional)
            <textarea maxLength={1000} rows={3} value={form.whatsappMessage} onChange={(event) => onChange({ ...form, whatsappMessage: event.target.value })} className={inputClass} />
          </label>
          <p className="text-xs text-[#3D4C5A]/75">El mensaje se prepara al abrir WhatsApp; el visitante decide si lo envía.</p>
        </section>
        <button type="submit" className="rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">{isSaving ? 'Guardando…' : 'Guardar datos de la consulta'}</button>
      </fieldset>
    </form>
  );
}
