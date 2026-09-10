import type { Metadata } from 'next';
import { Playfair_Display, Montserrat, Caveat } from 'next/font/google';
import './globals.css';

// next/font descarga y optimiza estas fuentes de Google en build time (no hay
// request al navegador en runtime como haría un <link> normal). Cada `variable`
// crea una CSS variable (ej. --font-playfair) que globals.css usa después.
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

// `metadata` es exclusivo del App Router: Next.js lo lee para armar el <head>
// (título de pestaña, descripción para buscadores, tarjeta de OpenGraph al compartir el link).
export const metadata: Metadata = {
  title: 'Lic. Alejandro Morales | Psicología Clínica & Bienestar Emocional',
  description: 'Espacio de psicoterapia, salud mental y talleres vivenciales individuales y grupales. Modalidad presencial y online.',
  openGraph: {
    title: 'Lic. Alejandro Morales | Psicología Clínica & Bienestar Emocional',
    description: 'Espacio de psicoterapia, salud mental y talleres vivenciales individuales y grupales.',
    type: 'website',
  },
};

// RootLayout envuelve todas las páginas: landing y acceso administrativo.
// Es un Server Component (no tiene 'use client' arriba) — corre en el servidor,
// nunca se manda su código JS al navegador. Ideal para esto porque no maneja
// estado ni eventos, solo arma el esqueleto <html>/<body>.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${montserrat.variable} ${caveat.variable} scroll-smooth`}
    >
      <body className="bg-[#F7F7F5] text-[#3D4C5A] font-sans antialiased selection:bg-[#83D0C6]/30 selection:text-[#3D4C5A]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
