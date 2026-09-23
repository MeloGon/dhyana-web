'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, X } from 'lucide-react';
import type { FloatingSocialSettings } from '@/lib/types/site-settings';

function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function FloatingSocialBar({ settings }: { settings?: FloatingSocialSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!settings || !settings.isEnabled) return null;

  const networks = [
    {
      id: 'facebook',
      name: 'Facebook',
      enabled: settings.facebookEnabled,
      url: settings.facebookUrl,
      icon: <FacebookIcon className="w-5 h-5" />,
      fabIcon: <FacebookIcon className="w-5 h-5" />,
      pillIcon: <FacebookIcon className="w-4 h-4" />,
      bgFab: 'bg-[#1877F2] text-white shadow-blue-500/30',
      hoverPill: 'hover:bg-[#1877F2] hover:text-white',
      hoverDock: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      enabled: settings.instagramEnabled,
      url: settings.instagramUrl,
      icon: <InstagramIcon className="w-5 h-5" />,
      fabIcon: <InstagramIcon className="w-5 h-5" />,
      pillIcon: <InstagramIcon className="w-4 h-4" />,
      bgFab: 'bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white shadow-pink-500/30',
      hoverPill: 'hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:via-[#E1306C] hover:to-[#833AB4] hover:text-white',
      hoverDock: 'hover:bg-gradient-to-tr hover:from-[#FD1D1D] hover:via-[#E1306C] hover:to-[#833AB4] hover:text-white',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      enabled: settings.youtubeEnabled,
      url: settings.youtubeUrl,
      icon: <YouTubeIcon className="w-5 h-5" />,
      fabIcon: <YouTubeIcon className="w-5 h-5" />,
      pillIcon: <YouTubeIcon className="w-4 h-4" />,
      bgFab: 'bg-[#FF0000] text-white shadow-red-500/30',
      hoverPill: 'hover:bg-[#FF0000] hover:text-white',
      hoverDock: 'hover:bg-[#FF0000] hover:text-white',
    },
  ].filter((item) => item.enabled && item.url.trim() !== '');

  if (networks.length === 0) return null;

  // ========================================================
  // PROPUESTA 1: BOTÓN FAB EXPANDIBLE (SPEED DIAL)
  // ========================================================
  if (settings.design === 'fab') {
    return (
      <aside
        ref={containerRef}
        aria-label="Redes sociales de Dhyana"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end select-none"
      >
        {/* Menú de redes desplegable vertical hacia arriba */}
        {isOpen && (
          <div
            className="flex flex-col items-end gap-2.5 mb-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            {networks.map((net) => (
              <a
                key={net.id}
                href={net.url}
                target="_blank"
                rel="noopener noreferrer"
                role="menuitem"
                className="group flex items-center gap-2.5 transition-transform duration-150 hover:-translate-x-1 focus:outline-none"
                title={`Abrir ${net.name} en una nueva pestaña`}
              >
                <span className="px-2.5 py-1 rounded-lg bg-[var(--surface)] text-[color:var(--ink)] text-xs font-semibold shadow-md border border-[color:var(--ink)]/15 group-hover:border-[#6366F1]/40 transition-colors">
                  {net.name}
                </span>
                <div
                  className={`w-11 h-11 rounded-full ${net.bgFab} flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-transform`}
                >
                  {net.fabIcon}
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Botón gatillo flotante (FAB) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-label={isOpen ? 'Cerrar menú de redes sociales' : 'Abrir menú de redes sociales'}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#6366F1] via-[#8B5CF6] to-[#EC4899] text-white flex items-center justify-center shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all focus:outline-none ring-4 ring-indigo-500/20"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform rotate-90" />
          ) : (
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6 transition-transform" />
          )}
        </button>
      </aside>
    );
  }

  // ========================================================
  // PROPUESTA 2: CÁPSULA GLASS HORIZONTAL (FLOATING PILL)
  // ========================================================
  if (settings.design === 'pill') {
    return (
      <aside
        aria-label="Redes sociales de Dhyana"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none"
      >
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface)]/90 backdrop-blur-md border border-[color:var(--ink)]/15 shadow-xl shadow-black/10">
          <span className="text-[10px] font-bold tracking-wider text-[color:var(--ink)]/60 pl-2.5 pr-1 uppercase hidden sm:inline">
            Síguenos
          </span>
          {networks.map((net) => (
            <a
              key={net.id}
              href={net.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-9 h-9 rounded-full bg-[color:var(--ink)]/5 text-[color:var(--ink)]/80 ${net.hoverPill} flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shadow-2xs focus:outline-none`}
              title={`Síguenos en ${net.name}`}
              aria-label={`Visitar nuestro ${net.name}`}
            >
              {net.pillIcon}
            </a>
          ))}
        </div>
      </aside>
    );
  }

  // ========================================================
  // PROPUESTA 3: DOCK LATERAL ADOSADO (VERTICAL EN EL BORDE)
  // ========================================================
  return (
    <aside
      aria-label="Redes sociales de Dhyana"
      className="fixed top-1/2 -translate-y-1/2 right-0 z-40 select-none"
    >
      <div className="flex flex-col gap-2 p-1.5 bg-[var(--surface)]/90 backdrop-blur-md rounded-l-2xl border-l border-y border-[color:var(--ink)]/15 shadow-xl shadow-black/15">
        {networks.map((net) => (
          <a
            key={net.id}
            href={net.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[color:var(--ink)]/5 text-[color:var(--ink)]/80 ${net.hoverDock} transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none`}
            title={net.name}
            aria-label={`Visitar nuestro ${net.name}`}
          >
            {net.pillIcon}
            {/* Tooltip flotante hacia la izquierda en pantallas de escritorio */}
            <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[var(--surface)] text-[color:var(--ink)] text-[11px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md border border-[color:var(--ink)]/15 hidden sm:block">
              {net.name}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
