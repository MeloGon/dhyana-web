// 'use client' = este componente corre en el navegador, no en el servidor.
// Hace falta porque usa useState y maneja clicks (interactividad). Sin esta
// directiva, Next.js asume Server Component por default y esas cosas fallan.
// Ver GUIA-NEXTJS.md → "Server vs Client Components".
'use client';

import { useState } from 'react';
import { useScrollTo } from '@/hooks/useScrollTo';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroVideo from '@/components/sections/HeroVideo';
import QuoteSection from '@/components/sections/QuoteSection';
import AboutSection from '@/components/sections/AboutSection';
import ServicesSection from '@/components/sections/ServicesSection';
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
  // servicio seleccionado. Es "levantar el estado" al padre común (patrón
  // típico de React, equivalente a manejar el estado compartido en un
  // ancestro común en Flutter en vez de en cada widget hijo).
  const [preselectedService, setPreselectedService] = useState<string>('Psicoterapia Individual');

  const handleSelectService = (serviceName: string) => {
    setPreselectedService(serviceName);
    scrollTo('contacto');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] text-[#3D4C5A]">
      <Navbar onNavigate={scrollTo} />

      <main className="flex-grow">
        <HeroVideo onScrollTo={scrollTo} />

        <QuoteSection
          quote="No puedes detener las olas, pero puedes aprender a surfear."
          author="Jon Kabat-Zinn"
          role="Pionero de la Reducción del Estrés Basada en Mindfulness (MBSR)"
          accentNote="Respira, cada momento es una oportunidad para empezar de nuevo"
          variant="mint"
        />

        <AboutSection onScrollTo={scrollTo} />

        <ServicesSection onSelectService={handleSelectService} />

        <QuoteSection
          quote="La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar."
          author="Carl Rogers"
          role="Fundador del Enfoque Centrado en la Persona"
          accentNote="Tu espacio de aceptación incondicional"
          variant="sky"
        />

        <WorkshopsSection />

        <ContactSection preselectedService={preselectedService} />
      </main>

      <Footer onScrollTo={scrollTo} />
    </div>
  );
}
