'use client';

import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import type { PublicContactSettings } from '@/lib/types/contact-settings';

interface Props {
  settings: PublicContactSettings | null;
  isLoading: boolean;
  errorMessage: string;
  handleRetry: () => void;
}

// Solo presentación: datos y enlaces ya validados llegan desde el servidor.
export default function ContactInfoCard({ settings, isLoading, errorMessage, handleRetry }: Props) {
  if (!settings) return (
    <div className="rounded-[24px] p-6 sm:p-8 bg-[#F7F7F5] border border-[#3D4C5A]/10 shadow-sm">
      {isLoading && <p role="status" className="text-sm">Cargando datos de la consulta…</p>}
      {errorMessage && <div role="alert" className="text-sm"><p>{errorMessage}</p>
        <button type="button" onClick={handleRetry} className="mt-2 underline underline-offset-4">Reintentar</button>
      </div>}
    </div>
  );
  return (
    <div className="rounded-[24px] p-6 sm:p-8 bg-[#F7F7F5] border border-[#3D4C5A]/10 shadow-sm">
      <h3 className="font-serif italic text-2xl font-bold text-[#3D4C5A] mb-6">
        {settings.title}
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <MapPin className="w-4 h-4 text-[#84B0DF]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Consultorio Presencial
            </span>
            <p className="whitespace-pre-line text-sm font-medium text-[#3D4C5A]">
              {settings.address}
            </p>
            {settings.addressNote && <p className="whitespace-pre-line text-xs text-[#3D4C5A]/70">{settings.addressNote}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <Phone className="w-4 h-4 text-[#83D0C6]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Teléfono & WhatsApp
            </span>
            <a
              href={settings.phoneHref}
              className="text-sm font-medium text-[#3D4C5A] hover:text-[#83D0C6] transition-colors"
            >
              {settings.phone}
            </a>
            {settings.phoneNote && <p className="whitespace-pre-line text-xs text-[#3D4C5A]/70">{settings.phoneNote}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <Mail className="w-4 h-4 text-[#84B0DF]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Correo Electrónico
            </span>
            <a
              href={settings.emailHref}
              className="text-sm font-medium text-[#3D4C5A] hover:text-[#83D0C6] transition-colors"
            >
              {settings.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white text-[#3D4C5A] flex items-center justify-center shrink-0 border border-[#3D4C5A]/10 shadow-xs">
            <Clock className="w-4 h-4 text-[#83D0C6]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/60 block">
              Horario de Atención
            </span>
            <p className="whitespace-pre-line text-sm font-medium text-[#3D4C5A]">
              {settings.hours}
            </p>
            {settings.hoursNote && <p className="whitespace-pre-line text-xs text-[#3D4C5A]/70">{settings.hoursNote}</p>}
          </div>
        </div>
      </div>

      {/* Abrir WhatsApp prepara el mensaje; nunca lo envía automáticamente. */}
      <div className="mt-6 pt-5 border-t border-[#3D4C5A]/10">
        <a
          href={settings.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-3 py-3 rounded-xl bg-[#3D4C5A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#2F3C47] transition-all shadow-sm"
        >
          <MessageSquare className="w-4 h-4 shrink-0 text-[#83D0C6]" />
          <span className="min-w-0 break-words text-center">{settings.whatsappLabel}</span>
        </a>
      </div>
    </div>
  );
}
