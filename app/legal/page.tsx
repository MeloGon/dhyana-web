import Link from 'next/link';
import type { Metadata } from 'next';
import { getPublicLegalSettings } from '@/lib/server/legal-settings';

export const metadata: Metadata = {
  title: 'Términos y políticas | Centro de Desarrollo Integral Dhyana',
  description: 'Términos y condiciones, política de privacidad y política de cambios y devoluciones.',
};

// Página independiente de la landing (no vive dentro de HomePage), por eso no
// monta Navbar/Footer completos: solo necesita este contenido, sin el resto de
// configuración del sitio. `scroll-smooth` ya está en <html> (app/layout.tsx),
// así que los enlaces #ancla se desplazan suavemente sin JS adicional.
export default async function LegalPage() {
  const legal = await getPublicLegalSettings();
  const sections = [
    { id: 'terminos', title: legal.termsTitle, body: legal.termsBody },
    { id: 'privacidad', title: legal.privacyTitle, body: legal.privacyBody },
    { id: 'cambios', title: legal.returnsTitle, body: legal.returnsBody },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-14 sm:px-8">
      <header className="border-b border-[color:var(--ink)]/15 pb-7">
        <Link href="/" className="text-sm text-[color:var(--positive)] underline underline-offset-4">Volver al inicio</Link>
        <h1 className="mt-3 font-serif text-3xl font-bold">Términos y políticas</h1>
        <nav aria-label="Secciones" className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="text-[color:var(--ink)]/75 underline underline-offset-4 hover:text-[color:var(--positive)]">
              {section.title}
            </a>
          ))}
        </nav>
      </header>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-20 border-b border-[color:var(--ink)]/10 py-10 last:border-b-0">
          <h2 className="font-serif text-2xl font-bold">{section.title}</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[color:var(--ink)]/85">{section.body}</p>
        </section>
      ))}
    </main>
  );
}
