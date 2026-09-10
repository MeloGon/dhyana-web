'use client';

import React from 'react';
import { HeartHandshake, PhoneCall, AlertTriangle, ShieldCheck, Mail, MapPin, ArrowUp } from 'lucide-react';

// Pie de página: aviso de crisis/urgencias, navegación resumida, especialidades
// y datos de contacto. Componente puramente presentacional — no tiene estado
// propio, solo recibe la función de scroll desde app/page.tsx.
interface FooterProps {
  onScrollTo: (sectionId: string) => void;
}

export default function Footer({ onScrollTo }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer-section" className="bg-[#3D4C5A] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency Crisis Hotline Banner */}
        <div className="mb-12 p-6 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs sm:text-sm text-white/90">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#83D0C6]/20 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4 text-[#83D0C6]" />
            </div>
            <div>
              <strong className="block text-white text-sm">
                Aviso Importante sobre Crisis & Urgencias de Salud Mental:
              </strong>
              <p className="text-white/75 mt-0.5 leading-relaxed">
                Este sitio web no es un servicio de emergencias. Si te encuentras en una crisis aguda o necesitas ayuda inmediata, llama al{' '}
                <strong className="text-[#83D0C6]">024</strong> (Línea de atención a la conducta suicida en España) o al{' '}
                <strong className="text-[#83D0C6]">717 003 717</strong> (Teléfono de la Esperanza) o acude al centro de urgencias más cercano.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Columns Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/15">
          {/* Col 1: Brand & Credentials */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#83D0C6] text-[#3D4C5A] flex items-center justify-center font-bold">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold block leading-tight">
                  Centro de Desarrollo Integral Dhyana
                </span>
                <span className="text-xs text-[#83D0C6] font-sans">
                  Psicología Clínica & Bienestar Emocional
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-sans">
              Espacio terapéutico profesional, ético e integrativo dedicado al autoconocimiento, la superación de la ansiedad y el fortalecimiento de la salud mental.
            </p>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <ShieldCheck className="w-4 h-4 text-[#83D0C6]" />
              <span>Colegiado Nº M-34821 · Colegio Oficial de la Psicología</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif italic text-base font-semibold text-[#83D0C6]">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-white/80">
              <li>
                <button
                  onClick={() => onScrollTo('inicio')}
                  className="hover:text-[#83D0C6] transition-colors cursor-pointer text-left"
                >
                  Inicio & Video Introductorio
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('sobre-nosotros')}
                  className="hover:text-[#83D0C6] transition-colors cursor-pointer text-left"
                >
                  Sobre Nosotros y Enfoque Terapéutico
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('servicios')}
                  className="hover:text-[#83D0C6] transition-colors cursor-pointer text-left"
                >
                  Servicios y Terapias
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('talleres')}
                  className="hover:text-[#83D0C6] transition-colors cursor-pointer text-left"
                >
                  Talleres Individuales y Grupales
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollTo('contacto')}
                  className="hover:text-[#83D0C6] transition-colors cursor-pointer text-left"
                >
                  Formulario de Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services Summary */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif italic text-base font-semibold text-[#84B0DF]">
              Especialidades
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li>Terapia Individual Adultos</li>
              <li>Terapia de Pareja</li>
              <li>Ansiedad & Estrés</li>
              <li>Duelo y Transiciones</li>
              <li>Mindfulness Clínico</li>
            </ul>
          </div>

          {/* Col 4: Contact & Hours */}
          <div className="lg:col-span-3 space-y-3 text-xs sm:text-sm text-white/80">
            <h4 className="font-serif italic text-base font-semibold text-[#83D0C6]">
              Contacto Directo
            </h4>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#84B0DF] shrink-0 mt-0.5" />
              <span>Av. de la Paz 142, Despacho 302</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#83D0C6] shrink-0" />
              <span>+34 612 345 678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#84B0DF] shrink-0" />
              <span>consulta@psicologiamorales.com</span>
            </div>
            <p className="text-xs text-white/60 pt-2">
              Atención presencial en consulta y online vía videollamada segura.
            </p>
          </div>
        </div>

        {/* Bottom Bar with Scroll-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Centro de Desarrollo Integral Dhyana. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="font-handwriting text-xl text-[#83D0C6]">
              Tu bienestar emocional empieza hoy
            </span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-white/10 hover:bg-[#83D0C6] hover:text-[#3D4C5A] text-white transition-all cursor-pointer"
              title="Volver al inicio"
              aria-label="Volver al inicio"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
