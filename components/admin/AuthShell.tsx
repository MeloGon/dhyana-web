import Link from 'next/link';
import { Leaf } from 'lucide-react';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div aria-hidden="true" className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#83D0C6]/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-[#D1D3E8]/40 blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-xl font-semibold tracking-[0.16em]">
          <Leaf className="h-6 w-6 text-[#467E76]" aria-hidden="true" /> DHYANA
        </Link>
        <div className="rounded-3xl border border-[#3D4C5A]/10 bg-white p-7 shadow-sm sm:p-10">
          <p className="mb-4 text-xs font-semibold tracking-widest text-[#467E76] uppercase">Administración</p>
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-[#3D4C5A]/65">Centro de Desarrollo Integral Dhyana</p>
      </div>
    </main>
  );
}
