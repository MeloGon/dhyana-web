'use client';

import Link from 'next/link';

export default function ComplaintBookError({ retry }: { retry: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 text-center">
      <h1 className="font-serif text-3xl">No pudimos cargar el Libro de Reclamaciones</h1>
      <p role="alert" className="mt-4 text-sm">Revisa tu conexión e inténtalo nuevamente.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button onClick={retry} className="rounded-xl bg-[#3D4C5A] px-6 py-3 text-white">Reintentar</button>
        <Link href="/" className="self-center text-sm underline underline-offset-4">Volver al inicio</Link>
      </div>
    </main>
  );
}
