import type { Metadata } from 'next';
import Link from 'next/link';
import { ComplaintBookForm } from '@/components/legal/ComplaintBookForm';

export const metadata: Metadata = {
  title: 'Libro de Reclamaciones | Centro de Desarrollo Integral Dhyana',
  description: 'Formulario virtual de reclamos y quejas conforme a la Ley 29571 y sus modificatorias.',
};

export default function ComplaintBookPage() {
  return (
    <div className="min-h-screen bg-[var(--page)] text-[color:var(--ink)]">
      <header className="border-b border-[color:var(--ink)]/10 px-5 py-6 sm:px-8">
        <Link href="/" className="text-sm text-[color:var(--positive)] underline underline-offset-4">Volver al inicio</Link>
        <h1 className="mt-3 font-serif text-3xl">Libro de Reclamaciones</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--ink)]/75">
          Formula tu reclamo o queja directamente en este formulario. Recibirás un número de hoja propio,
          una constancia en PDF y una copia por correo electrónico.
        </p>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <ComplaintBookForm />
      </main>
      <footer className="border-t border-[color:var(--ink)]/10 px-5 py-6 text-center text-xs text-[color:var(--ink)]/60 sm:px-8">
        Centro de Desarrollo Integral Dhyana
      </footer>
    </div>
  );
}
