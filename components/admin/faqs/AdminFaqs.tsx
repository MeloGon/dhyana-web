'use client';

import Link from 'next/link';
import { useAdminFaqs } from '@/hooks/useAdminFaqs';
import { FaqEditor } from '@/components/admin/faqs/FaqEditor';
import type { AdminFaq } from '@/lib/types/faqs';

export function AdminFaqs({ initial }: { initial: AdminFaq[] }) {
  const model = useAdminFaqs(initial);
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[#3D4C5A]/15 pb-7">
        <div>
          <Link href="/admin" className="text-sm text-[#467E76] underline underline-offset-4">Volver al panel</Link>
          <h1 className="mt-3 font-serif text-3xl">Preguntas frecuentes</h1>
          <p className="mt-3 max-w-xl text-sm text-[#3D4C5A]/75">Edita las preguntas de la sección de contacto. Los cambios publicados se ven al volver a cargar el sitio.</p>
        </div>
        <button onClick={() => model.editFaq()} disabled={model.isSaving} className="rounded-xl bg-[#83D0C6] px-5 py-3 font-medium disabled:opacity-60">Nueva pregunta</button>
      </header>
      {model.errorMessage && <p role="alert" className="mt-5 text-sm text-[#9B3024]">{model.errorMessage}</p>}
      {model.successMessage && <p role="status" className="mt-5 text-sm text-[#467E76]">{model.successMessage}</p>}
      {model.pendingDelete && (
        <section role="region" aria-label="Confirmar eliminación" className="mt-6 rounded-2xl border border-[#9B3024]/30 bg-white p-5">
          <h2 className="font-semibold">¿Eliminar esta pregunta?</h2>
          <p className="mt-2 break-words text-sm">{model.pendingDelete.question}</p>
          <p className="mt-2 text-sm">Se quitará del sitio y del panel. Esta acción no se puede deshacer.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={model.handleDelete} disabled={model.isSaving} className="rounded-xl bg-[#9B3024] px-4 py-2 text-white disabled:opacity-60">{model.isSaving ? 'Eliminando…' : 'Confirmar eliminación'}</button>
            <button onClick={() => model.setPendingDelete(null)} disabled={model.isSaving} className="rounded-xl border border-[#3D4C5A]/25 px-4 py-2 disabled:opacity-60">Cancelar</button>
          </div>
        </section>
      )}
      <div className="mt-8 grid items-start gap-7 lg:grid-cols-2">
        <section aria-label="Preguntas guardadas" className="space-y-4">
          {model.faqs.length === 0 && <p className="rounded-2xl bg-white p-6 text-sm">Todavía no hay preguntas. Crea la primera con el formulario.</p>}
          {model.faqs.map((faq) => (
            <article key={faq.id} className={`rounded-2xl border bg-white p-5 ${model.selectedId === faq.id ? 'border-[#467E76]' : 'border-[#3D4C5A]/10'}`}>
              <p className="text-xs font-medium text-[#467E76]">Orden {faq.sortOrder} · {faq.isPublished ? 'Publicada' : 'Borrador'}</p>
              <h2 className="mt-2 break-words font-semibold">{faq.question}</h2>
              <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-sm leading-relaxed text-[#3D4C5A]/75">{faq.answer}</p>
              <div className="mt-4 flex gap-5 text-sm">
                <button onClick={() => model.editFaq(faq)} disabled={model.isSaving} className="font-medium underline underline-offset-4 disabled:opacity-60">Editar pregunta</button>
                <button onClick={() => model.setPendingDelete(faq)} disabled={model.isSaving} className="text-[#9B3024] underline underline-offset-4 disabled:opacity-60">Eliminar</button>
              </div>
            </article>
          ))}
        </section>
        <FaqEditor form={model.form} isEditing={!!model.selectedId} isSaving={model.isSaving} isDisabled={!!model.pendingDelete} onChange={model.setForm} onSubmit={model.handleSave} />
      </div>
    </main>
  );
}
