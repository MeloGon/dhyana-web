import React from 'react';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { GROUP_WORKSHOPS } from '@/lib/data/workshops';
import type { WorkshopItem } from '@/lib/types';

// Grilla detallada de los 4 talleres grupales activos (horario, cupos,
// temario, precio). También presentacional: recibe qué hacer al tocar
// "Volver" o "Inscribirme" y avisa al padre, nunca decide por su cuenta.
interface GroupWorkshopsViewProps {
  onBack: () => void;
  onSelectWorkshop: (workshop: WorkshopItem) => void;
}

export default function GroupWorkshopsView({ onBack, onSelectWorkshop }: GroupWorkshopsViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Breadcrumb / Back button to return to overview */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D1D3E8]/60">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#D1D3E8] text-[#3D4C5A] text-xs uppercase tracking-wider font-semibold hover:bg-[#F7F7F5] transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Volver a Opciones de Talleres</span>
        </button>

        <span className="text-xs uppercase tracking-wider font-bold text-[#3D4C5A] bg-[#83D0C6]/20 px-3.5 py-1.5 rounded-full">
          4 Talleres Grupales Disponibles
        </span>
      </div>

      {/* Group Workshops Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {GROUP_WORKSHOPS.map((ws) => (
          <div
            key={ws.id}
            id={`group-workshop-${ws.id}`}
            className="rounded-[24px] p-6 sm:p-8 bg-white border border-[#3D4C5A]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Badge and spots status */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${ws.colorBadge}`}>
                  {ws.type}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#84B0DF]/20 text-[#3D4C5A]">
                  <span className="w-2 h-2 rounded-full bg-[#84B0DF] animate-pulse" />
                  {ws.remainingSpots} cupos restantes
                </span>
              </div>

              {/* Title & Summary */}
              <h3 className="font-serif italic text-2xl font-bold text-[#3D4C5A] mb-2.5">
                {ws.title}
              </h3>
              <p className="text-sm text-[#3D4C5A]/80 font-sans leading-relaxed mb-5">
                {ws.summary}
              </p>

              {/* Logistics Pill Container */}
              <div className="rounded-2xl bg-[#F7F7F5] p-4 space-y-2 mb-6 border border-[#3D4C5A]/5 text-xs sm:text-sm text-[#3D4C5A]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#83D0C6] shrink-0" />
                  <span><strong>Horario:</strong> {ws.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#84B0DF] shrink-0" />
                  <span><strong>Duración:</strong> {ws.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#3D4C5A] shrink-0" />
                  <span><strong>Modalidad:</strong> {ws.modality}</span>
                </div>
              </div>

              {/* Syllabus breakdown */}
              <div className="space-y-2 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D4C5A]/70 block">
                  Temario & Dinámicas:
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-[#3D4C5A]/85">
                  {ws.syllabus.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#83D0C6] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Action */}
            <div className="pt-5 border-t border-[#D1D3E8]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-[#3D4C5A]/60 block uppercase tracking-wider">Inversión:</span>
                <span className="font-serif text-lg font-bold text-[#3D4C5A]">{ws.price}</span>
              </div>
              <button
                id={`btn-enroll-${ws.id}`}
                onClick={() => onSelectWorkshop(ws)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold bg-[#83D0C6] text-white hover:opacity-90 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                Inscribirme en este Taller
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
