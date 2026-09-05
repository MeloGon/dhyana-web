'use client';

import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { useWorkshopRegistration } from '@/hooks/useWorkshopRegistration';
import type { WorkshopItem } from '@/lib/types';
import WorkshopsOverview from './workshops/WorkshopsOverview';
import GroupWorkshopsView from './workshops/GroupWorkshopsView';
import WorkshopRegistrationForm from './workshops/WorkshopRegistrationForm';

/** Baja suave hasta el formulario de inscripción. */
function scrollToRegistrationForm() {
  document.getElementById('formulario-talleres')?.scrollIntoView({ behavior: 'smooth' });
}

// Orquestador de la sección de Talleres. Guarda solo `currentView` (qué se
// muestra arriba: las 2 tarjetas o la grilla de 4 talleres) — puro estado de
// UI. Todo lo del formulario vive en hooks/useWorkshopRegistration.ts, y los
// datos de los talleres en lib/data/workshops.ts.
export default function WorkshopsSection() {
  const [currentView, setCurrentView] = useState<'overview' | 'group-view'>('overview');
  const registration = useWorkshopRegistration();

  const handleOpenGroupView = () => {
    setCurrentView('group-view');
    document.getElementById('talleres')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectIndividual = () => {
    registration.selectIndividual();
    scrollToRegistrationForm();
  };

  const handleSelectGroupWorkshop = (ws: WorkshopItem) => {
    registration.selectWorkshop(ws);
    scrollToRegistrationForm();
  };

  return (
    <section id="talleres" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#83D0C6]/20 text-[#3D4C5A] text-xs font-semibold uppercase tracking-wider mb-3">
          <Users className="w-3.5 h-3.5 text-[#83D0C6]" />
          <span>Talleres 2024-2025</span>
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-[#3D4C5A] font-bold tracking-tight mb-4">
          Espacios de Crecimiento & Talleres
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#3D4C5A]/80 font-normal leading-relaxed">
          Diseñados para brindarte herramientas prácticas de aplicación directa en un entorno seguro, humano y confidencial.
        </p>

        {/* View Toggle Tabs */}
        <div className="inline-flex p-1 rounded-full bg-[#D1D3E8]/30 border border-[#B2C9DC]/40 mt-6 max-w-md mx-auto shadow-xs">
          <button
            onClick={() => setCurrentView('overview')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              currentView === 'overview'
                ? 'bg-white text-[#3D4C5A] shadow-xs'
                : 'text-[#3D4C5A]/70 hover:text-[#3D4C5A]'
            }`}
          >
            Vista General (2 Modalidades)
          </button>
          <button
            onClick={() => setCurrentView('group-view')}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'group-view'
                ? 'bg-[#83D0C6] text-[#3D4C5A] shadow-xs font-bold'
                : 'text-[#3D4C5A]/70 hover:text-[#3D4C5A]'
            }`}
          >
            <span>Talleres Grupales</span>
            <span className="w-2 h-2 rounded-full bg-[#3D4C5A]/60" />
          </button>
        </div>
      </div>

      {currentView === 'overview' ? (
        <WorkshopsOverview
          onSelectIndividual={handleSelectIndividual}
          onOpenGroupView={handleOpenGroupView}
        />
      ) : (
        <GroupWorkshopsView
          onBack={() => setCurrentView('overview')}
          onSelectWorkshop={handleSelectGroupWorkshop}
        />
      )}

      <WorkshopRegistrationForm
        formData={registration.formData}
        setFormData={registration.setFormData}
        isSubmitting={registration.isSubmitting}
        formSubmitted={registration.formSubmitted}
        registrationCode={registration.registrationCode}
        errorMessage={registration.errorMessage}
        onSubmit={registration.handleSubmit}
        onReset={registration.handleReset}
      />
    </section>
  );
}
