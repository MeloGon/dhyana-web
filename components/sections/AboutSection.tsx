'use client';

import React from 'react';
import Image from 'next/image';
import { Award, CheckCircle2, Smile, ArrowRight } from 'lucide-react';
import { ABOUT_PILLARS } from '@/lib/data/about';

// Sección "Sobre Mí". Usa `next/image` en vez de un <img> normal: Next.js
// optimiza el tamaño de la imagen automáticamente y evita layout shift.
// Como viene de una URL externa (Unsplash), ese dominio está autorizado en
// next.config.ts (images.remotePatterns) — si agregás otra fuente de imagen
// externa más adelante, hay que sumarla ahí también o Next.js la bloquea.
// Los 4 pilares se editan en lib/data/about.ts.
interface AboutSectionProps {
  onScrollTo: (sectionId: string) => void;
}

export default function AboutSection({ onScrollTo }: AboutSectionProps) {
  return (
    <section id="sobre-mi" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#83D0C6]/20 text-[#3D4C5A] text-xs font-semibold uppercase tracking-wider mb-3">
          <span>Sobre el Terapeuta</span>
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-[#3D4C5A] font-bold tracking-tight mb-4">
          Un Acompañamiento Cercano Hacia Tu Calma
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#3D4C5A]/80 font-normal leading-relaxed">
          Hola, soy el Lic. Alejandro Morales. Mi vocación es brindarte un espacio terapéutico donde sentirte escuchado, comprendido y capaz de transformar tu relación con tus pensamientos y emociones.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center mb-16">
        {/* Left Side: Profile Presentation Card */}
        <div className="lg:col-span-5">
          <div className="relative rounded-[24px] bg-[#F7F7F5] p-6 sm:p-8 border border-[#3D4C5A]/10 shadow-sm">
            {/* Visual Portrait Container */}
            <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden mb-6 bg-[#3D4C5A]/10 shadow-sm flex items-center justify-center">
              <Image
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80"
                alt="Lic. Alejandro Morales - Psicólogo Clínico"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3D4C5A]/70 via-transparent to-transparent z-10" />
              <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                <span className="font-serif italic text-lg font-bold block">Lic. Alejandro Morales</span>
                <span className="text-xs text-white/90 font-sans">Psicólogo Clínico · Colegiado Nº M-34821</span>
              </div>
            </div>

            {/* Credential Badges */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-[#3D4C5A]">
                <div className="w-7 h-7 rounded-full bg-[#83D0C6]/30 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-[#3D4C5A]" />
                </div>
                <span>Máster en Psicoterapia Humanista & TCC</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#3D4C5A]">
                <div className="w-7 h-7 rounded-full bg-[#84B0DF]/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#3D4C5A]" />
                </div>
                <span>Especialista en Mindfulness y Reducción de Estrés (MBSR)</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-[#3D4C5A]">
                <div className="w-7 h-7 rounded-full bg-[#D1D3E8] flex items-center justify-center shrink-0">
                  <Smile className="w-4 h-4 text-[#3D4C5A]" />
                </div>
                <span>Más de 8 años de práctica clínica con adultos y parejas</span>
              </div>
            </div>

            {/* Handwritten note */}
            <div className="mt-6 pt-5 border-t border-[#3D4C5A]/10 text-center">
              <span className="font-handwriting text-2xl text-[#3D4C5A] font-semibold">
                &ldquo;Sanar no es volverse perfecto, es aprender a abrazar tu humanidad.&rdquo;
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Pillars & Philosophy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="prose text-[#3D4C5A]/90">
            <h3 className="font-serif italic text-2xl sm:text-3xl text-[#3D4C5A] font-bold mb-3">
              Mi Enfoque: Una Mirada Integradora y Humana
            </h3>
            <p className="text-base leading-relaxed mb-4">
              Cada persona llega a consulta con su propio universo de experiencias, anhelos y dificultades. Por eso, mi trabajo no consiste en aplicar fórmulas rígidas, sino en co-crear contigo un proceso terapéutico a tu medida.
            </p>
            <p className="text-base leading-relaxed">
              Combinamos la profundidad del autoconocimiento con estrategias prácticas que puedas poner a prueba desde la primera semana para recuperar tu bienestar mental.
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {ABOUT_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-[#3D4C5A]/10 shadow-xs hover:border-[#83D0C6] transition-all duration-200"
                >
                  <div className={`w-11 h-11 rounded-full ${pillar.accentBg} flex items-center justify-center mb-3.5`}>
                    <Icon className={`w-5 h-5 ${pillar.iconColor} stroke-[1.75]`} />
                  </div>
                  <h4 className="font-sans font-semibold text-base text-[#3D4C5A] mb-1.5">
                    {pillar.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#3D4C5A]/75 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Call to action inside about */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onScrollTo('contacto')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs uppercase tracking-wider font-bold bg-[#3D4C5A] text-white hover:bg-[#2F3C47] shadow-sm transition-all cursor-pointer"
            >
              <span>Conoce cómo puedo ayudarte</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#83D0C6]" />
            </button>
            <button
              onClick={() => onScrollTo('servicios')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs uppercase tracking-wider font-semibold text-[#3D4C5A] border border-[#3D4C5A]/20 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <span>Ver áreas de consulta</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
