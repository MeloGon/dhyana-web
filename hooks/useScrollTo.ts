'use client';

import { useCallback } from 'react';

/** Alto de la navbar fija, para no tapar el título de la sección al llegar. */
const NAV_HEIGHT = 80;

/**
 * Devuelve una función para hacer scroll suave hasta una sección por su `id`.
 *
 * Antes esta cuenta estaba duplicada en app/page.tsx y en Navbar.tsx — si
 * cambiaba el alto de la navbar había que acordarse de tocar los dos lados.
 * Ahora NAV_HEIGHT vive en un solo lugar.
 */
export function useScrollTo() {
  return useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const offsetPosition = element.getBoundingClientRect().top + window.pageYOffset - NAV_HEIGHT;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }, []);
}
