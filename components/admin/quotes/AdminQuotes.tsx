'use client';

import Link from 'next/link';
import { useAdminQuotes } from '@/hooks/useQuotes';
import { QuoteEditor } from '@/components/admin/quotes/QuoteEditor';
import type { AdminQuote } from '@/lib/types/quotes';

const variantLabels = {
  mint: 'Menta',
  sky: 'Cielo',
  lavender: 'Lavanda',
};

export function AdminQuotes({ initial }: { initial: AdminQuote[] }) {
  const model = useAdminQuotes(initial);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-[#3D4C5A]/15 pb-7">
        <div>
          <Link href="/admin" className="text-sm text-[#467E76] underline underline-offset-4">
            Volver al panel
          </Link>
          <h1 className="mt-3 font-serif text-3xl">Citas y reflexiones</h1>
          <p className="mt-3 max-w-xl text-sm text-[#3D4C5A]/75">
            Gestiona las reflexiones del mazo interactivo de la página principal. Los cambios se verán al recargar la web.
          </p>
        </div>
        <button
          onClick={() => model.editQuote()}
          disabled={model.isSaving}
          className="rounded-xl bg-[#83D0C6] px-5 py-3 font-medium disabled:opacity-60 cursor-pointer"
        >
          Nueva reflexión
        </button>
      </header>

      {model.errorMessage && (
        <p role="alert" className="mt-5 text-sm text-[#9B3024]">
          {model.errorMessage}
        </p>
      )}
      {model.successMessage && (
        <p role="status" className="mt-5 text-sm text-[#467E76]">
          {model.successMessage}
        </p>
      )}

      {model.pendingDelete && (
        <section
          role="region"
          aria-label="Confirmar eliminación"
          className="mt-6 rounded-2xl border border-[#9B3024]/30 bg-white p-5"
        >
          <h2 className="font-semibold">¿Eliminar esta reflexión?</h2>
          <p className="mt-2 break-words text-sm italic">&ldquo;{model.pendingDelete.quote}&rdquo;</p>
          <p className="mt-1 text-xs text-[#3D4C5A]/70">— {model.pendingDelete.author}</p>
          <p className="mt-3 text-sm">Se quitará del mazo de cartas de la web. Esta acción no se puede deshacer.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={model.handleDelete}
              disabled={model.isSaving}
              className="rounded-xl bg-[#9B3024] px-4 py-2 text-white disabled:opacity-60 cursor-pointer"
            >
              {model.isSaving ? 'Eliminando…' : 'Confirmar eliminación'}
            </button>
            <button
              onClick={() => model.setPendingDelete(null)}
              disabled={model.isSaving}
              className="rounded-xl border border-[#3D4C5A]/25 px-4 py-2 disabled:opacity-60 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </section>
      )}

      <div className="mt-8 grid items-start gap-7 lg:grid-cols-2">
        <section aria-label="Reflexiones guardadas" className="space-y-4">
          {model.quotes.length === 0 && (
            <p className="rounded-2xl bg-white p-6 text-sm">
              Todavía no hay reflexiones. Crea la primera con el formulario.
            </p>
          )}
          {model.quotes.map((q) => (
            <article
              key={q.id}
              className={`rounded-2xl border bg-white p-5 transition-all ${
                model.selectedId === q.id ? 'border-[#467E76] shadow-sm' : 'border-[#3D4C5A]/10'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#467E76]">
                  Orden {q.sortOrder} · {q.isPublished ? 'Publicada' : 'Borrador'}
                </span>
                <span className="rounded-full bg-[#3D4C5A]/5 px-2.5 py-0.5 text-xs text-[#3D4C5A]/70">
                  {variantLabels[q.variant] ?? q.variant}
                </span>
              </div>

              <blockquote className="mt-2.5 font-serif italic text-base text-[#3D4C5A] leading-snug">
                &ldquo;{q.quote}&rdquo;
              </blockquote>

              <p className="mt-2 text-sm font-semibold text-[#3D4C5A]">{q.author}</p>
              {q.role && <p className="text-xs text-[#3D4C5A]/70">{q.role}</p>}
              {q.accentNote && (
                <p className="mt-2 font-handwriting text-lg text-[#467E76]">
                  ~ {q.accentNote} ~
                </p>
              )}

              <div className="mt-4 flex gap-5 text-sm border-t border-[#3D4C5A]/10 pt-3">
                <button
                  onClick={() => model.editQuote(q)}
                  disabled={model.isSaving}
                  className="font-medium underline underline-offset-4 disabled:opacity-60 cursor-pointer"
                >
                  Editar
                </button>
                <button
                  onClick={() => model.setPendingDelete(q)}
                  disabled={model.isSaving}
                  className="text-[#9B3024] underline underline-offset-4 disabled:opacity-60 cursor-pointer"
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </section>

        <QuoteEditor
          form={model.form}
          isEditing={!!model.selectedId}
          isSaving={model.isSaving}
          isDisabled={!!model.pendingDelete}
          onChange={model.setForm}
          onSubmit={model.handleSave}
        />
      </div>
    </main>
  );
}
