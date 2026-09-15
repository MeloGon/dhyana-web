'use client';
import Link from 'next/link';
export default function EditorError({ retry }: { retry: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-20">
    <Link href="/admin" className="text-sm underline">Volver al panel</Link>
    <h1 className="mt-5 font-serif text-3xl">No pudimos cargar el editor</h1>
    <p className="mt-4">Inténtalo nuevamente. Los datos guardados se conservan.</p>
    <button onClick={retry} className="mt-6 rounded-xl bg-[#3D4C5A] px-6 py-3 text-white">Reintentar</button>
  </main>;
}
