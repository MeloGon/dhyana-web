'use client';

import React, { useState } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { useScrollTo } from '@/hooks/useScrollTo';
import { useScrollSpy } from '@/hooks/useScrollSpy';

// Enlaces de la navbar. Fuera del componente a propósito: así el array no se
// recrea en cada render y useScrollSpy no re-suscribe su listener.
const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'sobre-mi', label: 'Sobre Mí' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'talleres', label: 'Talleres' },
  { id: 'citas', label: 'Reflexiones' },
  { id: 'contacto', label: 'Contacto' },
];

const SECTION_IDS = NAV_LINKS.map((link) => link.id);

// Barra de navegación fija arriba de toda la página (sticky). Cambia de estilo
// al hacer scroll y resalta la sección visible — esa lógica vive en
// hooks/useScrollSpy.ts, acá solo se pinta el resultado.
interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeSection, setActiveSection, isScrolled } = useScrollSpy(SECTION_IDS);
  const scrollTo = useScrollTo();

  const navLinks = NAV_LINKS;

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      scrollTo(sectionId);
    }

    setActiveSection(sectionId);
  };

  return (
    <header
      id="navbar-header"
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFFFFF]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.06)] py-3 border-b border-[#D1D3E8]/40'
          : 'bg-[#3D4C5A]/85 backdrop-blur-sm py-4 border-b border-white/10 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#inicio"
            onClick={(e) => scrollToSection(e, 'inicio')}
            className="flex items-center gap-2.5 group focus:outline-none"
            id="nav-brand-link"
          >
            <div
              className={`w-9 h-9 rounded-full border-2 border-[#83D0C6] flex items-center justify-center transition-all duration-300 ${
                isScrolled
                  ? 'bg-[#83D0C6]/15 text-[#3D4C5A]'
                  : 'bg-white/10 text-white backdrop-blur-xs'
              }`}
            >
              <span className="text-xs font-bold font-sans">AM</span>
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif italic font-bold text-base sm:text-lg tracking-tight transition-colors ${
                  isScrolled ? 'text-[#3D4C5A]' : 'text-white'
                }`}
              >
                Lic. Alejandro Morales
              </span>
              <span
                className={`text-[10px] sm:text-xs uppercase tracking-widest font-sans transition-colors ${
                  isScrolled ? 'text-[#3D4C5A]/70' : 'text-[#84B0DF]'
                }`}
              >
                Psicología & Terapia Consciente
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" id="desktop-nav-menu">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  id={`nav-link-${link.id}`}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`text-xs uppercase tracking-wider font-medium transition-all duration-200 ${
                    isActive
                      ? isScrolled
                        ? 'text-[#3D4C5A] font-bold border-b-2 border-[#83D0C6] pb-0.5'
                        : 'text-white font-bold border-b-2 border-[#83D0C6] pb-0.5'
                      : isScrolled
                      ? 'text-[#3D4C5A]/80 hover:text-[#83D0C6]'
                      : 'text-white/85 hover:text-[#83D0C6]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* CTA Button and Phone Quick Access */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              id="nav-cta-contact-btn"
              onClick={(e) => scrollToSection(e, 'contacto')}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold bg-[#83D0C6] text-white hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Cita</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle-btn"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                isScrolled
                  ? 'text-[#3D4C5A] hover:bg-[#F0F2F4]'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="md:hidden bg-[#FFFFFF] border-b border-[#D1D3E8] px-4 pt-3 pb-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  id={`mobile-nav-link-${link.id}`}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-[#83D0C6]/20 text-[#3D4C5A] font-semibold'
                      : 'text-[#3D4C5A]/80 hover:bg-[#F7F7F5]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-3 mt-2 border-t border-[#D1D3E8]/50 flex flex-col gap-2">
              <button
                id="mobile-drawer-cta-btn"
                onClick={(e) => scrollToSection(e, 'contacto')}
                className="w-full text-center py-3 rounded-xl text-base font-semibold bg-[#83D0C6] text-[#3D4C5A] shadow-md hover:bg-[#72c2b8]"
              >
                Agendar Consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
