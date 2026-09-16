'use client';

import React from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContactFormData } from '@/lib/types';

// Este formulario NO guarda su propio estado — lo recibe todo por props desde
// ContactSection, que a su vez lo saca del hook useContactForm. Componente
// "tonto" a propósito: se puede leer entero sin saber cómo funciona el envío.
interface ContactFormProps {
  services: string[];
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  confirmationCode: string;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function ContactForm({
  services,
  formData,
  setFormData,
  isSubmitting,
  isSubmitted,
  confirmationCode,
  errorMessage,
  onSubmit,
  onReset,
}: ContactFormProps) {
  if (isSubmitted) {
    return (
      <div
        id="contact-form-success"
        className="py-12 px-6 rounded-2xl bg-[#83D0C6]/15 border border-[#83D0C6]/40 text-center animate-in fade-in duration-300 my-auto"
      >
        <div className="w-16 h-16 rounded-full bg-[var(--mint-solid)] text-[color:var(--ink)] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h4 className="font-serif text-2xl sm:text-3xl font-bold text-[color:var(--ink)] mb-2">
          ¡Mensaje Enviado con Éxito!
        </h4>
        <p className="text-sm text-[color:var(--ink)]/85 font-sans mb-4 max-w-lg mx-auto">
          Gracias por tu confianza, <strong>{formData.name}</strong>. He recibido tu solicitud para <strong>{formData.service}</strong> en modalidad <strong>{formData.modality === 'online' ? 'Online' : 'Presencial'}</strong>.
        </p>
        <div className="inline-block px-4 py-2 rounded-xl bg-[var(--surface)] text-[color:var(--ink)] font-mono text-sm font-bold border border-[#83D0C6] mb-6">
          Referencia de Consulta: {confirmationCode}
        </div>
        <p className="text-xs text-[color:var(--ink)]/70 mb-6 max-w-md mx-auto">
          Me pondré en contacto contigo a través de <strong>{formData.email}</strong> o por teléfono al <strong>{formData.phone}</strong> para acordar día y hora exacta.
        </p>
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-full text-xs font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-95 transition-all cursor-pointer shadow-xs"
        >
          Enviar otro mensaje o consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" id="main-contact-form">
      <div>
        <h3 className="font-serif text-2xl font-bold text-[color:var(--ink)] mb-1">
          Formulario de Contacto & Consulta
        </h3>
        <p className="text-xs sm:text-sm text-[color:var(--ink)]/75 font-sans">
          Completa este formulario confidencial y coordinaremos tu cita rápidamente.
        </p>
      </div>

      {/* Name and Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
            Nombre y Apellidos *
          </label>
          <input
            type="text"
            required
            placeholder="Ej. Mateo Gómez"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--page)] text-sm text-[color:var(--ink)] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
            Correo Electrónico *
          </label>
          <input
            type="email"
            required
            placeholder="mateo@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--page)] text-sm text-[color:var(--ink)] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
          />
        </div>
      </div>

      {/* Phone and Service */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
            Teléfono / WhatsApp *
          </label>
          <input
            type="tel"
            required
            placeholder="+34 600 000 000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--page)] text-sm text-[color:var(--ink)] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
            Motivo o Servicio de Interés *
          </label>
          <select
            value={formData.service}
            onChange={(e) => setFormData({ ...formData, service: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--page)] text-sm text-[color:var(--ink)] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
          >
            {services.map((service) => <option key={service} value={service}>{service}</option>)}
            <option value="Otro Motivo">Otro Motivo</option>
          </select>
        </div>
      </div>

      {/* Modality and Preferred Schedule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
            Modalidad Preferida
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, modality: 'online' })}
              className={`py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                formData.modality === 'online'
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-xs'
                  : 'bg-[var(--page)] text-[color:var(--ink)]/70 border border-[color:var(--ink)]/10 hover:text-[color:var(--ink)]'
              }`}
            >
              Online (Zoom)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, modality: 'presencial' })}
              className={`py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer ${
                formData.modality === 'presencial'
                  ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-xs'
                  : 'bg-[var(--page)] text-[color:var(--ink)]/70 border border-[color:var(--ink)]/10 hover:text-[color:var(--ink)]'
              }`}
            >
              Presencial
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
            Franja Horaria Preferida
          </label>
          <select
            value={formData.schedulePreference}
            onChange={(e) => setFormData({ ...formData, schedulePreference: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--page)] text-sm text-[color:var(--ink)] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
          >
            <option value="tardes">Tardes (15:00 a 20:30)</option>
            <option value="mananas">Mañanas (08:30 a 14:00)</option>
            <option value="sabados">Sábados por la mañana</option>
            <option value="flexible">Cualquier horario disponible</option>
          </select>
        </div>
      </div>

      {/* Message textarea */}
      <div>
        <label className="block text-xs font-semibold text-[color:var(--ink)] mb-1.5">
          ¿Cómo te sientes o qué te gustaría trabajar? (Opcional pero recomendado)
        </label>
        <textarea
          rows={4}
          placeholder="Escribe brevemente tu situación actual o qué te motivó a buscar terapia hoy..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 rounded-xl border border-[color:var(--ink)]/10 bg-[var(--page)] text-sm text-[color:var(--ink)] focus:outline-none focus:ring-1 focus:ring-[#83D0C6] resize-none"
        />
      </div>

      {/* Privacy checkbox */}
      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="privacy-check"
          required
          checked={formData.agreePrivacy}
          onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
          className="mt-1 w-4 h-4 rounded text-[#83D0C6] focus:ring-[#83D0C6] border-[color:var(--ink)]/20 cursor-pointer"
        />
        <label htmlFor="privacy-check" className="text-xs text-[color:var(--ink)]/75 leading-tight cursor-pointer">
          Acepto la política de confidencialidad y el tratamiento de mis datos con fines exclusivos de atención psicológica.
        </label>
      </div>

      {/* Error de envío (solo aparece si lib/api devolvió un fallo) */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-cosmic-glow w-full py-3.5 rounded-xl font-bold text-sm text-white active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin" />
              <span>Enviando Solicitud...</span>
            </span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Solicitar Cita / Enviar Consulta</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
