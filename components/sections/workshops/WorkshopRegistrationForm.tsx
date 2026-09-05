'use client';

import React from 'react';
import { CheckCircle2, Send, BookOpen, AlertCircle } from 'lucide-react';
import { GROUP_WORKSHOPS } from '@/lib/data/workshops';
import type { WorkshopFormData } from '@/lib/types';

// Formulario de inscripción a talleres. Controlado 100% por props (mismo
// patrón que ContactForm): el estado y el envío viven en
// hooks/useWorkshopRegistration.ts, acá solo se pinta.
interface WorkshopRegistrationFormProps {
  formData: WorkshopFormData;
  setFormData: React.Dispatch<React.SetStateAction<WorkshopFormData>>;
  isSubmitting: boolean;
  formSubmitted: boolean;
  registrationCode: string;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function WorkshopRegistrationForm({
  formData,
  setFormData,
  isSubmitting,
  formSubmitted,
  registrationCode,
  errorMessage,
  onSubmit,
  onReset,
}: WorkshopRegistrationFormProps) {
  return (
    <div id="formulario-talleres" className="mt-16 pt-12 border-t border-[#3D4C5A]/10">
      <div className="max-w-3xl mx-auto rounded-[24px] bg-white border border-[#3D4C5A]/10 p-6 sm:p-10 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#83D0C6]/20 text-[#3D4C5A] text-xs font-semibold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#83D0C6]" />
            <span>Inscripción y Reserva</span>
          </div>
          <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#3D4C5A]">
            Formulario de Inscripción para Talleres
          </h3>
          <p className="text-xs sm:text-sm text-[#3D4C5A]/75 mt-1 font-sans">
            Completa tus datos para apartar tu plaza. Te enviaremos la confirmación y el temario detallado por correo.
          </p>
        </div>

        {formSubmitted ? (
          <div
            id="workshop-form-success-banner"
            className="p-8 rounded-2xl bg-[#83D0C6]/15 border border-[#83D0C6]/40 text-center animate-in fade-in duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-[#83D0C6] text-[#3D4C5A] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl font-bold text-[#3D4C5A] mb-2">
              ¡Pre-Inscripción Recibida con Éxito!
            </h4>
            <p className="text-sm text-[#3D4C5A]/85 font-sans mb-4 max-w-md mx-auto">
              Hemos reservado provisionalmente tu lugar en <strong>{formData.workshopChoice}</strong>.
            </p>
            <div className="inline-block px-4 py-2 rounded-xl bg-white text-[#3D4C5A] font-mono text-sm font-bold border border-[#83D0C6] mb-6">
              Código de Reserva: {registrationCode}
            </div>
            <p className="text-xs text-[#3D4C5A]/70 mb-6">
              Revisa tu bandeja de entrada en <strong>{formData.email}</strong> para los detalles de acceso y bienvenida.
            </p>
            <button
              onClick={onReset}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#3D4C5A] text-white hover:bg-[#2F3C47] transition-all cursor-pointer"
            >
              Inscribir a otra persona o taller
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6" id="workshop-registration-form">
            {/* Workshop Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3D4C5A] mb-2">
                Selecciona el Taller de tu Interés *
              </label>
              <select
                required
                value={formData.workshopChoice}
                onChange={(e) => setFormData({ ...formData, workshopChoice: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6] transition-all"
              >
                <optgroup label="Talleres Grupales">
                  {GROUP_WORKSHOPS.map((ws) => (
                    <option key={ws.id} value={`${ws.title} (${ws.type})`}>
                      {ws.title} — ({ws.remainingSpots} cupos disponibles)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Modalidad Individual">
                  <option value="Taller Individual Personalizado 1 a 1">
                    Taller Individual Personalizado 1 a 1 (Fecha a convenir)
                  </option>
                </optgroup>
              </select>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D4C5A] mb-1.5">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sofía Ramírez"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4C5A] mb-1.5">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="sofia@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D4C5A] mb-1.5">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+34 612 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4C5A] mb-1.5">
                  Modalidad Preferida
                </label>
                <select
                  value={formData.modality}
                  onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
                >
                  <option value="Online">Online en vivo (Zoom)</option>
                  <option value="Presencial">Presencial (Sala Terapéutica)</option>
                  <option value="Indiferente">Indiferente / Lo que esté disponible</option>
                </select>
              </div>
            </div>

            {/* Experience and notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3D4C5A] mb-1.5">
                  ¿Has participado antes en talleres o terapia?
                </label>
                <select
                  value={formData.priorExperience}
                  onChange={(e) => setFormData({ ...formData, priorExperience: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
                >
                  <option value="No">No, es mi primera vez</option>
                  <option value="Si, en terapia individual">Sí, en terapia individual</option>
                  <option value="Si, en talleres grupales">Sí, en talleres grupales</option>
                  <option value="Practico Mindfulness/Meditacion">Practico meditación/mindfulness</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3D4C5A] mb-1.5">
                  Comentario o expectativa (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="¿Qué esperas llevarte del taller?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#3D4C5A]/10 bg-[#F7F7F5] text-sm text-[#3D4C5A] focus:outline-none focus:ring-1 focus:ring-[#83D0C6]"
                />
              </div>
            </div>

            {/* Error de envío (solo aparece si lib/api devolvió un fallo) */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#3D4C5A] text-white hover:bg-[#2F3C47] shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#83D0C6] border-t-transparent rounded-full animate-spin" />
                    <span>Procesando Reserva...</span>
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirmar Reserva de Plaza en el Taller</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-[#3D4C5A]/60 mt-2">
                Tus datos están protegidos y sólo se usarán para coordinar tu participación en el taller.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
