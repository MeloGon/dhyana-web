'use client';

import { useState, useEffect } from 'react';

/** Píxeles de scroll a partir de los cuales la navbar cambia a fondo claro. */
const SCROLLED_THRESHOLD = 40;

/** Margen para decidir qué sección se considera "a la vista". */
const ACTIVE_OFFSET = 120;

/**
 * Observa el scroll de la página y reporta:
 * - `activeSection`: id de la sección visible ahora mismo (para resaltar el link)
 * - `isScrolled`: si el usuario ya bajó lo suficiente (para el cambio de estilo)
 *
 * Ambos salen del mismo listener a propósito: dos hooks separados
 * significarían dos listeners de scroll haciendo el mismo trabajo.
 */
export function useScrollSpy(sectionIds: string[]) {
  const [activeSection, setActiveSection] = useState(sectionIds[0] ?? '');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLLED_THRESHOLD);

      const scrollPosition = window.scrollY + ACTIVE_OFFSET;

      for (const sectionId of sectionIds) {
        const el = document.getElementById(sectionId);
        if (!el) continue;

        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSection(sectionId);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
    // sectionIds llega como array literal desde el componente. Se compara por
    // contenido (join) para no re-suscribir el listener en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds.join(',')]);

  return { activeSection, setActiveSection, isScrolled };
}
