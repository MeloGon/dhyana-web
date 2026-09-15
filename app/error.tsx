'use client';

export default function ErrorPage({ retry }: { retry: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center">
    <h1 className="font-serif text-3xl">No pudimos cargar el sitio</h1>
    <p className="mt-4">Revisa tu conexión e inténtalo nuevamente.</p>
    <button onClick={retry} className="mt-6 rounded-xl bg-[#3D4C5A] px-6 py-3 text-white">Reintentar</button>
  </main>;
}
