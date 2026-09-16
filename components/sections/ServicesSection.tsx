'use client';

import React from 'react';
import { Check, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { User, Users2, Wind, Compass } from 'lucide-react';
import type { SiteContent } from '@/lib/types/site-settings';
const icons = { user: User, users: Users2, wind: Wind, compass: Compass };

// Grilla de servicios editados desde el panel; recibe el contenido público.
// acá solo se recorre con .map() para no repetir el mismo bloque de tarjeta
// 4 veces (equivalente a un ListView.builder en Flutter).
interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
  content: SiteContent;
}

export default function ServicesSection({ onSelectService, content }: ServicesSectionProps) {
  return (
    <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#6366F1]/15 text-[#6366F1] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
          <span>{content.settings.texts.servicesEyebrow}</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[color:var(--ink)] font-bold tracking-tight mb-4">
          {content.settings.texts.servicesTitle}
        </h2>
        <p className="font-sans text-base sm:text-lg text-[color:var(--ink)]/80 font-normal leading-relaxed">
          {content.settings.texts.servicesSubtitle}
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
        {content.services.map((svc) => {
          const Icon = icons[svc.icon];
          return (
            <div
              key={svc.id}
              id={`service-card-${svc.id}`}
              className="relative overflow-hidden rounded-3xl bg-[var(--surface)] border border-[color:var(--ink)]/15 hover:border-[#8B5CF6]/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] shrink-0" />
              <div className="p-6 sm:p-8 flex flex-col justify-between grow">
              <div>
                {/* Top icon and badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center shadow-xs`}>
                    <Icon className="w-7 h-7 stroke-[1.75]" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-[#8B5CF6]/15 text-[#8B5CF6]`}>
                    {svc.badge}
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="font-serif text-2xl font-bold text-[color:var(--ink)] mb-3">
                  {svc.title}
                </h3>
                <p className="text-[color:var(--ink)]/80 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                  {svc.description}
                </p>

                {/* Beneficios */}
                <ul className="space-y-2.5 mb-8 border-t border-[color:var(--ink)]/10 pt-6">
                  {svc.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-[color:var(--ink)]/85">
                      <Check className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {/* Duration & modality metadata */}
                <div className="flex items-center justify-between text-xs text-[color:var(--ink)]/70 py-4 border-t border-[color:var(--ink)]/10 mb-6 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <span>{svc.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    <span>{svc.modality}</span>
                  </div>
                </div>

                {onSelectService && <button
                  id={`btn-consult-service-${svc.id}`}
                  onClick={() => onSelectService(svc.title)}
                  className="w-full py-3.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-95 shadow-[0_4px_15px_rgba(99,102,241,0.25)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Solicitar Consulta para este Servicio</span>
                  <ArrowRight className="w-4 h-4 text-[#06B6D4] group-hover:translate-x-1 transition-transform" />
                </button>}
              </div>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
