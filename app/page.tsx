// 'use client' = este componente corre en el navegador, no en el servidor.
// Hace falta porque usa useState y maneja clicks (interactividad). Sin esta
// directiva, Next.js asume Server Component por default y esas cosas fallan.
// Ver GUIA-NEXTJS.md → "Server vs Client Components".
'use client';

import { useState } from 'react';
import { useScrollTo } from '@/hooks/useScrollTo';
import { usePublicAboutSettings } from '@/hooks/useAboutSettings';
import { usePublicQuotes } from '@/hooks/useQuotes';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroVideo from '@/components/sections/HeroVideo';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
import QuoteDeckSection from '@/components/sections/QuoteDeckSection';
import WorkshopsSection from '@/components/sections/WorkshopsSection';
import ContactSection from '@/components/sections/ContactSection';

// app/page.tsx es la home ("/") por convención del App Router: el nombre del
// archivo (page.tsx) es lo que le dice a Next.js "esto es una ruta navegable".
// Este componente es el "orquestador": no dibuja UI compleja él mismo, solo
// ordena las secciones de la página y conecta las que necesitan hablarse.
export default function HomePage() {
  const scrollTo = useScrollTo();

  // preselectedService viaja de ServicesSection -> ContactSection: cuando el
  // usuario elige un servicio, el formulario de contacto ya abre con ese
  // servicio seleccionado.
  const [preselectedService, setPreselectedService] = useState<string>('Psicoterapia Individual');

  // Carga la sección "Sobre nosotros" desde la API.
  const aboutModel = usePublicAboutSettings();

  // Carga las reflexiones dinámicas desde la API para el mazo de cartas.
  const quotesModel = usePublicQuotes();

  const handleSelectService = (serviceName: string) => {
    setPreselectedService(serviceName);
    scrollTo('contacto');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#3D4C5A]">
      <Navbar onNavigate={scrollTo} />

      <main className="flex-grow">
        <HeroVideo onScrollTo={scrollTo} />

        {/* Sobre nosotros: se renderiza cuando los datos están listos */}
        {aboutModel.settings && (
          <AboutSection settings={aboutModel.settings} onScrollTo={scrollTo} />
        )}
        {aboutModel.errorMessage && (
          <div className="py-10 text-center">
            <p className="text-sm text-[#3D4C5A]/75">{aboutModel.errorMessage}</p>
            <button
              onClick={aboutModel.handleRetry}
              className="mt-3 text-sm font-medium underline underline-offset-4 cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        <ServicesSection onSelectService={handleSelectService} />

        {/* Mazo interactivo de cartas de Reflexiones */}
        {quotesModel.quotes.length > 0 && (
          <QuoteDeckSection quotes={quotesModel.quotes} />
        )}

        <WorkshopsSection />

        <ContactSection preselectedService={preselectedService} />
      </main>

      <Footer onScrollTo={scrollTo} />
    </div>
  );
}
