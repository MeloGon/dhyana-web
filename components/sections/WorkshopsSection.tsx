'use client';

import { Users, User } from 'lucide-react';
import { usePublicCatalog } from '@/hooks/usePublicCatalog';
import { PublicWorkshopCard } from '@/components/sections/workshops/PublicWorkshopCard';

export default function WorkshopsSection() {
  const catalog = usePublicCatalog();
  return (
    <section id="talleres" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#83D0C6]/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider">
          <Users className="h-4 w-4" aria-hidden="true" /><span>Talleres Dhyana</span>
        </div>
        <h2 className="mb-4 font-serif text-3xl font-bold italic sm:text-4xl md:text-5xl">Espacios de Crecimiento &amp; Talleres</h2>
        <p className="text-base leading-relaxed text-[#3D4C5A]/80 sm:text-lg">Herramientas para tu bienestar emocional, aprendizaje compartido y acompañamiento en grupo.</p>
      </div>
      {catalog.isLoading ? <p role="status" className="rounded-3xl bg-white p-10 text-center">Cargando talleres…</p>
        : catalog.errorMessage ? <div role="alert" className="rounded-3xl bg-white p-8 text-center">
          <p>{catalog.errorMessage}</p><button onClick={catalog.handleRetry} className="mt-4 rounded-full border border-[#3D4C5A]/25 px-5 py-2">Reintentar</button>
        </div>
        : catalog.workshops.length ? <div className="grid items-start gap-7 md:grid-cols-2">{catalog.workshops.map((workshop) => <PublicWorkshopCard key={workshop.id} workshop={workshop} />)}</div>
        : <div className="rounded-3xl border border-[#3D4C5A]/10 bg-[#D1D3E8]/35 p-10 text-center"><h3 className="font-serif text-2xl">Próximos talleres</h3><p className="mt-3 text-sm">Pronto compartiremos nuestros talleres y horarios disponibles.</p></div>}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-[#B2C9DC]/40 p-6 sm:p-8">
        <div className="flex items-center gap-3"><User className="h-6 w-6" aria-hidden="true" /><div><h3 className="font-serif text-xl">Talleres individuales</h3><p className="mt-1 text-sm">Sin disponibilidad por el momento.</p></div></div>
        <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold">Agotados</span>
      </div>
    </section>
  );
}
