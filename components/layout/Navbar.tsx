'use client';

import { useMemo, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { visibleSiteLinks } from '@/lib/site-navigation';
import { SiteLogo } from '@/components/layout/SiteLogo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import type { SiteSettings } from '@/lib/types/site-settings';

interface NavbarProps {
  settings: SiteSettings;
  logoUrl: string;
  onNavigate: (sectionId: string) => void;
}

export default function Navbar({ settings, logoUrl, onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = useMemo(() => visibleSiteLinks(settings), [settings]);
  const ids = useMemo(() => links.map((link) => link.id), [links]);
  const { activeSection, setActiveSection } = useScrollSpy(ids);
  const navigate = (id: string) => { setMobileMenuOpen(false); setActiveSection(id); onNavigate(id); };
  return <header id="navbar-header" className="sticky top-0 z-50 border-b border-[#D1D3E8]/40 bg-[var(--surface)]/95 py-3 shadow-sm backdrop-blur-md">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <a href={links[0] ? `#${links[0].id}` : '#'} onClick={(e) => { e.preventDefault(); if (links[0]) navigate(links[0].id); else window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex min-w-0 items-center gap-2.5" id="nav-brand-link">
          <SiteLogo url={logoUrl} />
          <span className="flex min-w-0 flex-col">
            <span className="font-serif text-sm font-bold leading-tight tracking-tight sm:text-base">{settings.texts.brandTitle}</span>
            <span className="mt-1 text-[9px] uppercase tracking-wider text-[color:var(--ink)]/70 sm:text-[10px]">{settings.texts.brandSubtitle}</span>
          </span>
        </a>
        <nav aria-label="Navegación principal" className="hidden shrink-0 items-center gap-5 xl:flex" id="desktop-nav-menu">
          {links.map((link) => <a key={link.id} href={`#${link.id}`} id={`nav-link-${link.id}`} onClick={(e) => { e.preventDefault(); navigate(link.id); }} aria-current={activeSection === link.id ? 'location' : undefined} className={`border-b-2 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${activeSection === link.id ? 'border-[#6366F1] text-[#6366F1] font-semibold' : 'border-transparent hover:border-[#8B5CF6]/50'}`}>{link.label}</a>)}
        </nav>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <button id="mobile-menu-toggle-btn" type="button" aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={mobileMenuOpen} aria-controls="mobile-drawer" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-xl p-2 hover:bg-[#6366F1]/15 xl:hidden">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </div>
      {mobileMenuOpen && <nav id="mobile-drawer" aria-label="Navegación móvil" className="absolute top-full right-0 left-0 flex max-h-[calc(100svh-80px)] flex-col gap-1 overflow-y-auto border-b border-[color:var(--ink)]/15 bg-[var(--surface)] px-4 py-3 shadow-lg xl:hidden">
        {links.map((link) => <a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); navigate(link.id); }} aria-current={activeSection === link.id ? 'location' : undefined} className={`rounded-xl px-4 py-3 text-sm transition-colors ${activeSection === link.id ? 'bg-[#6366F1]/15 text-[#6366F1] font-semibold' : 'hover:bg-[#6366F1]/10'}`}>{link.label}</a>)}
      </nav>}
    </div>
  </header>;
}
