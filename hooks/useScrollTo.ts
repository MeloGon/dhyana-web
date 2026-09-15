'use client';

import { useCallback } from 'react';

/** Separación adicional respecto al encabezado fijo. */
const SECTION_GAP = 12;

/**
 * Devuelve una función para hacer scroll suave hasta una sección por su `id`.
 *
 * El alto real de la navbar puede variar con el nombre editable y el tamaño
 * de pantalla. Se mide al navegar para no tapar el inicio de la sección.
 */
export function useScrollTo() {
  return useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const navbarHeight = document.getElementById('navbar-header')?.getBoundingClientRect().height ?? 0;
    const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight - SECTION_GAP;

    window.scrollTo({
      top: offsetPosition,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, []);
}
