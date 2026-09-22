'use client';

import Link from 'next/link';

export function ComplaintBookError({ title, retry }: { title: string; retry: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="font-serif text-3xl">{title}</h1>
      <p role="alert" className="mt-4 text-sm">Inténtalo nuevamente. Si tu sesión venció, vuelve a ingresar.</p>
      <div className="mt-7 flex flex-wrap gap-5">
        <button onClick={retry} className="rounded-xl bg-[#3D4C5A] px-5 py-3 text-white">Reintentar</button>
        <Link href="/admin/login" className="self-center text-sm underline underline-offset-4">Volver al ingreso</Link>
      </div>
    </main>
  );
}
