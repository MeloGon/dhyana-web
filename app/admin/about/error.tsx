'use client';

import Link from 'next/link';

export default function AdminAboutError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-10 sm:px-8">
      <Link href="/admin" className="text-sm text-[#467E76] underline underline-offset-4">Volver al panel</Link>
      <h1 className="mt-3 font-serif text-3xl">Sobre nosotros</h1>
      <p className="mt-6 text-sm">No se pudo cargar la sección. Verifica tu conexión e inténtalo de nuevo.</p>
      <button onClick={reset} className="mt-4 rounded-xl bg-[#3D4C5A] px-6 py-3 font-medium text-white">Reintentar</button>
    </main>
  );
}
