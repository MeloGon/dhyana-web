'use client';

import React from 'react';
import { Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
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
    <div className="rounded-[24px] p-6 sm:p-8 bg-[var(--page)] border border-[color:var(--ink)]/10 shadow-sm">
      {isLoading && <p role="status" className="text-sm">Cargando datos de la consulta…</p>}
      {errorMessage && <div role="alert" className="text-sm"><p>{errorMessage}</p>
        <button type="button" onClick={handleRetry} className="mt-2 underline underline-offset-4">Reintentar</button>
      </div>}
    </div>
  );
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-[var(--page)] border border-[color:var(--ink)]/10 shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] shrink-0" />
      <div className="p-6 sm:p-8">
      <h3 className="font-serif text-2xl font-bold text-[color:var(--ink)] mb-6">
        {settings.title}
      </h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--surface)] text-[color:var(--ink)] flex items-center justify-center shrink-0 border border-[color:var(--ink)]/10 shadow-xs">
            <MapPin className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/60 block">
              Consultorio Presencial
            </span>
            <p className="whitespace-pre-line text-sm font-medium text-[color:var(--ink)]">
              {settings.address}
            </p>
            {settings.addressNote && <p className="whitespace-pre-line text-xs text-[color:var(--ink)]/70">{settings.addressNote}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--surface)] text-[color:var(--ink)] flex items-center justify-center shrink-0 border border-[color:var(--ink)]/10 shadow-xs">
            <MessageSquare className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/60 block">
              Teléfono & WhatsApp
            </span>
            {/* El número es solo WhatsApp (ver phoneNote): abre chat, no la app de llamadas. */}
            <a
              href={settings.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[color:var(--ink)] hover:text-[#06B6D4] transition-colors"
            >
              {settings.phone}
            </a>
            {settings.phoneNote && <p className="whitespace-pre-line text-xs text-[color:var(--ink)]/70">{settings.phoneNote}</p>}
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--surface)] text-[color:var(--ink)] flex items-center justify-center shrink-0 border border-[color:var(--ink)]/10 shadow-xs">
            <Mail className="w-4 h-4 text-[#6366F1]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/60 block">
              Correo Electrónico
            </span>
            <a
              href={settings.emailHref}
              className="text-sm font-medium text-[color:var(--ink)] hover:text-[#6366F1] transition-colors"
            >
              {settings.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[var(--surface)] text-[color:var(--ink)] flex items-center justify-center shrink-0 border border-[color:var(--ink)]/10 shadow-xs">
            <Clock className="w-4 h-4 text-[#EC4899]" />
          </div>
          <div className="min-w-0 break-words">
            <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/60 block">
              Horario de Atención
            </span>
            <p className="whitespace-pre-line text-sm font-medium text-[color:var(--ink)]">
              {settings.hours}
            </p>
            {settings.hoursNote && <p className="whitespace-pre-line text-xs text-[color:var(--ink)]/70">{settings.hoursNote}</p>}
          </div>
        </div>
      </div>

      {/* Abrir WhatsApp prepara el mensaje; nunca lo envía automáticamente. */}
      <div className="mt-6 pt-5 border-t border-[color:var(--ink)]/10">
        <a
          href={settings.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cosmic-glow w-full px-3 py-3.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <MessageSquare className="w-4 h-4 shrink-0 text-[#06B6D4]" />
          <span className="min-w-0 break-words text-center">{settings.whatsappLabel}</span>
        </a>
      </div>
      </div>
    </div>
  );
}
