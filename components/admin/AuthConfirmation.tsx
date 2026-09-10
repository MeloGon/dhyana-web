'use client';

import Link from 'next/link';
import { useAuthConfirmation } from '@/hooks/useAuthConfirmation';

export function AuthConfirmation() {
  const { isSubmitting, errorMessage, handleConfirm } = useAuthConfirmation();
  return (
    <>
      <h1 className="font-serif text-3xl">Confirma tu acceso</h1>
      <p className="mt-4 text-sm leading-relaxed">Continúa para validar el enlace y definir tu contraseña administrativa.</p>
      {errorMessage && <p role="alert" className="mt-5 rounded-xl bg-[#FFF0ED] p-3 text-sm text-[#9B3024]">{errorMessage}</p>}
      <button onClick={handleConfirm} disabled={isSubmitting} className="mt-7 w-full rounded-xl bg-[#3D4C5A] px-5 py-3.5 font-medium text-white disabled:opacity-60">
        {isSubmitting ? 'Verificando…' : 'Continuar'}
      </button>
      <Link href="/admin/recover" className="mt-6 block text-center text-sm underline underline-offset-4">Solicitar otro enlace</Link>
    </>
  );
}
