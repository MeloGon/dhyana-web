import { getPublicSiteContent } from '@/lib/server/site-settings';

// Convención de Next.js: un archivo app/icon.tsx genera el favicon de la pestaña
// (reemplaza a un favicon.ico estático). Al ser dinámico, muestra el mismo logo
// SVG que subiste en /admin/site, sin necesitar un archivo fijo en el repo.
export const contentType = 'image/svg+xml';

const fallbackSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#83D0C6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c2 3-2 4-2 7a2 2 0 1 0 4 0c0-3-4-4-2-7Z"/><path d="M8 15a4 4 0 1 0 8 0c0-2-1-3-4-3s-4 1-4 3Z"/></svg>';

export default async function Icon() {
  const { logoUrl } = await getPublicSiteContent();
  let svg = fallbackSvg;
  if (logoUrl) {
    try {
      const response = await fetch(logoUrl);
      if (response.ok) svg = await response.text();
    } catch {
      // Sin logo accesible: se sirve el ícono por defecto en vez de romper la pestaña.
    }
  }
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}
