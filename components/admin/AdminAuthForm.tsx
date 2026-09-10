'use client';

import Link from 'next/link';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AUTH_FORM_CONTENT } from '@/lib/data/admin-auth';
import type { AuthFormMode } from '@/lib/types/admin-auth';

export function AdminAuthForm({ mode }: { mode: AuthFormMode }) {
  const form = useAdminAuth(mode);
  const content = AUTH_FORM_CONTENT[mode];
  const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-[#F7F7F5]/50 px-4 py-3 text-base outline-none focus:border-[#467E76] focus:ring-2 focus:ring-[#83D0C6]/40 disabled:opacity-60';

  return (
    <>
      <h1 className="font-serif text-3xl leading-tight">{content.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#3D4C5A]/75">{content.description}</p>
      <form onSubmit={form.handleSubmit} className="mt-7 space-y-5" aria-busy={form.isSubmitting}>
        {mode !== 'password' && (
          <div>
            <label htmlFor="admin-email" className="text-sm font-medium">Correo electrónico</label>
            <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254}
              value={form.email} onChange={(event) => form.setEmail(event.target.value)}
              disabled={form.isSubmitting} className={inputClass} />
          </div>
        )}
        {mode !== 'recover' && (
          <div>
            <label htmlFor="admin-password" className="text-sm font-medium">{mode === 'password' ? 'Nueva contraseña' : 'Contraseña'}</label>
            <input id="admin-password" name="password" type="password" required maxLength={256}
              minLength={mode === 'password' ? 12 : undefined} autoComplete={mode === 'password' ? 'new-password' : 'current-password'}
              value={form.password} onChange={(event) => form.setPassword(event.target.value)}
              disabled={form.isSubmitting} className={inputClass} />
          </div>
        )}
        {mode === 'password' && (
          <div>
            <label htmlFor="admin-confirmation" className="text-sm font-medium">Repite la contraseña</label>
            <input id="admin-confirmation" name="confirmation" type="password" autoComplete="new-password" required minLength={12} maxLength={256}
              value={form.confirmation} onChange={(event) => form.setConfirmation(event.target.value)}
              disabled={form.isSubmitting} className={inputClass} />
          </div>
        )}
        {form.errorMessage && <p role="alert" className="rounded-xl bg-[#FFF0ED] p-3 text-sm text-[#9B3024]">{form.errorMessage}</p>}
        {form.successMessage && <p role="status" className="rounded-xl bg-[#E7F5EF] p-3 text-sm text-[#285D48]">{form.successMessage}</p>}
        <button disabled={form.isSubmitting} className="w-full rounded-xl bg-[#3D4C5A] px-5 py-3.5 font-medium text-white transition hover:bg-[#2E3B47] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#467E76] disabled:opacity-60">
          {form.isSubmitting ? 'Procesando…' : content.submit}
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        {mode === 'login' ? <Link href="/admin/recover" className="underline underline-offset-4">Olvidé mi contraseña</Link>
          : <Link href={mode === 'password' ? '/admin' : '/admin/login'} className="underline underline-offset-4">{mode === 'password' ? 'Volver al panel' : 'Volver al ingreso'}</Link>}
      </div>
    </>
  );
}
