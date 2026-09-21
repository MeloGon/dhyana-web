'use client';
import { useState } from 'react';
import { useScrollTo } from '@/hooks/useScrollTo';
import { usePublicAboutSettings } from '@/hooks/useAboutSettings';
import { usePublicQuotes } from '@/hooks/useQuotes';
import { visibleSiteLinks } from '@/lib/site-navigation';
import SideDecorations from '@/components/layout/SideDecorations';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroVideo from '@/components/sections/HeroVideo';
import ServicesSection from '@/components/sections/ServicesSection';
import WorkshopsSection from '@/components/sections/WorkshopsSection';
import AboutSection from '@/components/sections/AboutSection';
import QuoteDeckSection from '@/components/sections/QuoteDeckSection';
import ContactSection from '@/components/sections/ContactSection';
import { DEFAULT_SECTION_ORDER } from '@/lib/data/site-fields';
import type { SiteContent, SiteSettings, SiteSectionKey } from '@/lib/types/site-settings';
import type { PublicContactSettings } from '@/lib/types/contact-settings';

function About({ settings, onScrollTo }: { settings: SiteSettings; onScrollTo: (id: string) => void }) {
  const model = usePublicAboutSettings();
  if (model.errorMessage) return <section id="sobre-nosotros" className="p-10 text-center"><p role="alert">{model.errorMessage}</p><button className="mt-3 underline" onClick={model.handleRetry}>Reintentar</button></section>;
  return model.settings ? <AboutSection settings={model.settings} onScrollTo={onScrollTo} showContact={settings.visibility.contacto && settings.visibility.contactForm} showServices={settings.visibility.servicios} /> : <section id="sobre-nosotros" className="p-10 text-center" aria-busy="true">Cargando presentación…</section>;
}
function Opinions({ settings }: { settings: SiteSettings }) {
  const model = usePublicQuotes();
  if (model.isLoading || model.errorMessage || !model.quotes.length) return <section id="opiniones" className="mx-auto max-w-5xl px-5 py-20 text-center">
    <h2 className="font-serif text-3xl font-bold">{settings.texts.opinionsTitle}</h2>
    {model.errorMessage ? <div role="alert" className="mt-5"><p>{model.errorMessage}</p><button onClick={model.handleRetry} className="mt-3 underline">Reintentar</button></div>
      : <p role="status" className="mt-5">{model.isLoading ? 'Cargando opiniones…' : 'Pronto compartiremos nuevas opiniones.'}</p>}
  </section>;
  return <QuoteDeckSection quotes={model.quotes} settings={settings} />;
}

export function HomePage({ content, contact }: { content: SiteContent; contact: PublicContactSettings | null }) {
  const scrollTo = useScrollTo();
  const [preselectedService, setPreselectedService] = useState(content.services[0]?.title ?? 'Otro Motivo');
  const { visibility } = content.settings;
  const showContact = visibleSiteLinks(content.settings).some((link) => link.id === 'contacto');
  const selectService = visibility.contacto && visibility.contactForm ? (name: string) => { setPreselectedService(name); scrollTo('contacto'); } : undefined;
  const sectionOrder = content.settings.sectionOrder?.length ? content.settings.sectionOrder : DEFAULT_SECTION_ORDER;

  const renderSection = (key: SiteSectionKey) => {
    switch (key) {
      case 'inicio':
        return visibility.inicio ? <HeroVideo key="inicio" content={content} onScrollTo={scrollTo} /> : null;
      case 'servicios':
        return visibility.servicios ? <ServicesSection key="servicios" content={content} onSelectService={selectService} /> : null;
      case 'talleres':
        return visibility.talleres ? <WorkshopsSection key="talleres" settings={content.settings} contact={contact} /> : null;
      case 'opiniones':
        return visibility.opiniones ? <Opinions key="opiniones" settings={content.settings} /> : null;
      case 'sobre-nosotros':
        return visibility['sobre-nosotros'] ? <About key="sobre-nosotros" settings={content.settings} onScrollTo={scrollTo} /> : null;
      case 'contacto':
        return showContact ? <ContactSection key="contacto" content={content} contact={contact} preselectedService={preselectedService} /> : null;
      default:
        return null;
    }
  };

  return <div className="relative flex min-h-screen flex-col bg-[var(--page)] text-[color:var(--ink)] overflow-x-clip">
    <SideDecorations />
    <Navbar settings={content.settings} logoUrl={content.logoUrl} onNavigate={scrollTo} />
    <main className="grow">
      {sectionOrder.map(renderSection)}
    </main>
    <Footer content={content} contact={contact} onScrollTo={scrollTo} />
  </div>;
}
