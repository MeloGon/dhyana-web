import React from 'react';
import { User, Users, Sparkles, ArrowRight } from 'lucide-react';

// Vista inicial de Talleres: 2 tarjetas grandes (Individual vs Grupal).
// Puramente presentacional — los dos clicks posibles se avisan al padre
// (WorkshopsSection) vía callbacks, que decide qué hacer con cada uno.
interface WorkshopsOverviewProps {
  onSelectIndividual: () => void;
  onOpenGroupView: () => void;
}

export default function WorkshopsOverview({ onSelectIndividual, onOpenGroupView }: WorkshopsOverviewProps) {
  return (
    <div className="space-y-16 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Item 1: Talleres Individuales (Editorial Pastel Blue Card) */}
        <div
          id="taller-card-individual"
          className="rounded-[24px] p-6 sm:p-8 bg-[#B2C9DC] text-[#3D4C5A] border border-white/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-full bg-white/40 text-[#3D4C5A] flex items-center justify-center backdrop-blur-xs">
                <User className="w-6 h-6 stroke-[1.75]" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/40 text-[#3D4C5A] uppercase tracking-wider">
                1:1 Focus
              </span>
            </div>

            <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#3D4C5A] mb-3">
              Talleres Individuales
            </h3>
            <p className="text-[#3D4C5A]/90 text-sm sm:text-base leading-relaxed mb-6 font-sans">
              Sesiones personalizadas e intensivas enfocadas en el autodescubrimiento, regulación emocional y sanación profunda a tu propio ritmo.
            </p>

            {/* Key Points */}
            <div className="space-y-3 mb-8 pt-4 border-t border-white/25 text-sm text-[#3D4C5A]">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D4C5A] mt-2 shrink-0" />
                <div>
                  <strong className="block text-[#3D4C5A]">100% Adaptado a tus Objetivos</strong>
                  <span className="text-xs text-[#3D4C5A]/80">Elegimos temario de Mindfulness, Ansiedad o Asertividad según tus necesidades.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D4C5A] mt-2 shrink-0" />
                <div>
                  <strong className="block text-[#3D4C5A]">Horarios y Fechas a Convenir</strong>
                  <span className="text-xs text-[#3D4C5A]/80">Flexibilidad de agenda en sesiones matutinas, vespertinas o intensivas.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D4C5A] mt-2 shrink-0" />
                <div>
                  <strong className="block text-[#3D4C5A]">Acompañamiento Privado y Exclusivo</strong>
                  <span className="text-xs text-[#3D4C5A]/80">Espacio confidencial sin interacción grupal para mayor intimidad.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/25 flex items-center justify-between relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#3D4C5A]">
              Modalidad Personalizada
            </span>
            <button
              id="btn-select-individual-workshop"
              onClick={onSelectIndividual}
              className="px-5 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold bg-[#3D4C5A] text-white hover:bg-[#2F3C47] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span>Saber Más</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#83D0C6]" />
            </button>
          </div>
        </div>

        {/* Item 2: Talleres Grupales (Editorial Lavender Card with Ring) */}
        <div
          id="taller-card-grupal"
          className="rounded-[24px] p-6 sm:p-8 bg-[#D1D3E8] text-[#3D4C5A] border border-white/30 ring-2 ring-[#83D0C6] shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Highlight ribbon */}
          <div className="absolute top-6 right-6 bg-[#83D0C6] text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Vista Activa</span>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-full bg-white/40 text-[#3D4C5A] flex items-center justify-center backdrop-blur-xs">
                <Users className="w-6 h-6 stroke-[1.75]" />
              </div>
            </div>

            <h3 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#3D4C5A] mb-3">
              Talleres Grupales
            </h3>
            <p className="text-[#3D4C5A]/90 text-sm sm:text-base leading-relaxed mb-6 font-sans">
              Espacios vivenciales en grupos reducidos donde compartir experiencias, validar emociones y aprender dinámicas colectivas de regulación y crecimiento.
            </p>

            {/* Key Points */}
            <div className="space-y-3 mb-8 pt-4 border-t border-white/25 text-sm text-[#3D4C5A]">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D4C5A] mt-2 shrink-0" />
                <div>
                  <strong className="block text-[#3D4C5A]">Mindfulness en Comunidad</strong>
                  <span className="text-xs text-[#3D4C5A]/80">Prácticas compartidas que disuelven la sensación de aislamiento.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D4C5A] mt-2 shrink-0" />
                <div>
                  <strong className="block text-[#3D4C5A]">Círculo de Apoyo Mutuo</strong>
                  <span className="text-xs text-[#3D4C5A]/80">Resonancia emocional y empatía en grupos de máximo 8 a 12 participantes.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3D4C5A] mt-2 shrink-0" />
                <div>
                  <strong className="block text-[#3D4C5A]">4 Talleres Activos con Calendario Abierto</strong>
                  <span className="text-xs text-[#3D4C5A]/80">Mindfulness, Manejo de Ansiedad, Autoestima y Nervio Vago.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action that triggers the specialized group view */}
          <div className="pt-6 border-t border-white/25 flex items-center justify-between relative z-10">
            <button
              onClick={onOpenGroupView}
              className="text-xs uppercase tracking-wider font-bold text-[#3D4C5A] hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explorar 4 Convocatorias</span>
            </button>
            <button
              id="btn-open-group-workshops-view"
              onClick={onOpenGroupView}
              className="w-10 h-10 rounded-full bg-[#3D4C5A] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
              title="Ver talleres grupales"
              aria-label="Ver talleres grupales"
            >
              <ArrowRight className="w-4 h-4 text-[#83D0C6]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
