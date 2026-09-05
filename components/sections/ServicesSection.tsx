'use client';

import React from 'react';
import { Check, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { SERVICES } from '@/lib/data/services';

// Grilla de servicios terapéuticos. El catálogo vive en lib/data/services.ts;
// acá solo se recorre con .map() para no repetir el mismo bloque de tarjeta
// 4 veces (equivalente a un ListView.builder en Flutter).
interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export default function ServicesSection({ onSelectService }: ServicesSectionProps) {
  return (
    <section id="servicios" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#84B0DF]/20 text-[#3D4C5A] text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#84B0DF]" />
          <span>Servicios Terapéuticos</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#3D4C5A] font-bold tracking-tight mb-4">
          Cuidado Psicológico para Cada Momento de tu Vida
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#3D4C5A]/80 font-normal leading-relaxed">
          Cada espacio terapéutico está diseñado para brindarte comprensión, herramientas clínicas rigurosas y un acompañamiento cálido hacia tu estabilidad emocional.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
        {SERVICES.map((svc) => {
          const Icon = svc.icon;
          return (
            <div
              key={svc.id}
              id={`service-card-${svc.id}`}
              className={`rounded-3xl p-6 sm:p-8 ${svc.cardBg} border ${svc.borderAccent} shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                {/* Top icon and badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl ${svc.iconBg} flex items-center justify-center shadow-xs`}>
                    <Icon className="w-7 h-7 stroke-[1.75]" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${svc.badgeColor}`}>
                    {svc.badge}
                  </span>
                </div>

                {/* Title and description */}
                <h3 className="font-serif text-2xl font-bold text-[#3D4C5A] mb-3">
                  {svc.title}
                </h3>
                <p className="text-[#3D4C5A]/80 text-sm sm:text-base leading-relaxed mb-6 font-sans">
                  {svc.description}
                </p>

                {/* Benefits checklist */}
                <div className="space-y-2.5 mb-6 pt-4 border-t border-[#D1D3E8]/40">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#3D4C5A]/60 block mb-2">
                    Enfoque y Beneficios
                  </span>
                  {svc.benefits.map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2.5 text-sm text-[#3D4C5A]/90">
                      <div className="w-4 h-4 rounded-full bg-[#83D0C6]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#3D4C5A] stroke-[3]" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer info and action */}
              <div className="pt-6 border-t border-[#D1D3E8]/40">
                <div className="flex items-center justify-between text-xs text-[#3D4C5A]/70 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#83D0C6]" />
                    <span>{svc.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#84B0DF]" />
                    <span>{svc.modality}</span>
                  </div>
                </div>

                <button
                  id={`btn-consult-service-${svc.id}`}
                  onClick={() => onSelectService(svc.title)}
                  className="w-full py-3 rounded-full text-sm font-semibold bg-[#3D4C5A] text-white hover:bg-[#2F3C47] transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-xs"
                >
                  <span>Solicitar Consulta para este Servicio</span>
                  <ArrowRight className="w-4 h-4 text-[#83D0C6] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clarification banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#B2C9DC]/30 to-[#D1D3E8]/30 p-6 sm:p-8 text-center border border-[#B2C9DC]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-left">
          <h4 className="font-serif text-lg font-bold text-[#3D4C5A] mb-1">
            ¿Tienes dudas sobre qué tipo de acompañamiento necesitas?
          </h4>
          <p className="text-sm text-[#3D4C5A]/80 font-sans">
            Podemos realizar una primera sesión de valoración para determinar el plan terapéutico más adecuado para ti.
          </p>
        </div>
        <button
          onClick={() => onSelectService('Sesión de Valoración y Orientación')}
          className="shrink-0 px-6 py-3 rounded-full text-sm font-semibold bg-[#83D0C6] text-[#3D4C5A] hover:bg-[#72c2b8] shadow-sm transition-all cursor-pointer"
        >
          Pedir Sesión de Valoración
        </button>
      </div>
    </section>
  );
}
