import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';

// Tarjeta estática con dirección, teléfono, email, horario y botón de WhatsApp.
// No maneja estado propio: recibe cero props porque todo el contenido es fijo.
export default function ContactInfoCard() {
  return (
    <div className="rounded-[24px] p-6 sm:p-8 bg-[#F7F7F5] border border-[#3D4C5A]/10 shadow-sm">
      <h3 className="font-serif italic text-2xl font-bold text-[#3D4C5A] mb-6">
        Datos de la Consulta
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <MapPin className="w-4 h-4 text-[#84B0DF]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Consultorio Presencial
            </span>
            <p className="text-sm font-medium text-[#3D4C5A]">
              Av. de la Paz 142, Planta 3, Despacho 302
            </p>
            <p className="text-xs text-[#3D4C5A]/70">
              Zona céntrica, fácil aparcamiento y metro cercano
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <Phone className="w-4 h-4 text-[#83D0C6]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Teléfono & WhatsApp
            </span>
            <a
              href="tel:+34612345678"
              className="text-sm font-medium text-[#3D4C5A] hover:text-[#83D0C6] transition-colors"
            >
              +34 612 345 678
            </a>
            <p className="text-xs text-[#3D4C5A]/70">
              Mensajes y llamadas en horario de consulta
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <Mail className="w-4 h-4 text-[#84B0DF]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Correo Electrónico
            </span>
            <a
              href="mailto:consulta@psicologiamorales.com"
              className="text-sm font-medium text-[#3D4C5A] hover:text-[#83D0C6] transition-colors"
            >
              consulta@psicologiamorales.com
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <Clock className="w-4 h-4 text-[#83D0C6]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Horario de Atención
            </span>
            <p className="text-sm font-medium text-[#3D4C5A]">
              Lunes a Viernes: 08:30 a 20:30
            </p>
            <p className="text-xs text-[#3D4C5A]/70">
              Sábados: 09:00 a 14:00 (Talleres y sesiones especiales)
            </p>
          </div>
        </div>
      </div>

      {/* Quick WhatsApp direct button */}
      <div className="mt-6 pt-5 border-t border-[#3D4C5A]/10">
        <a
          href="https://wa.me/34612345678?text=Hola%20Lic.%20Alejandro,%20quisiera%20consultar%20por%20una%20cita"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 rounded-xl bg-[#3D4C5A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#2F3C47] transition-all shadow-sm"
        >
          <MessageSquare className="w-4 h-4 text-[#83D0C6]" />
          <span>Contactar por WhatsApp Directo</span>
        </a>
      </div>
    </div>
  );
}
