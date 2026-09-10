'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { PublicFaq } from '@/lib/types/faqs';

// Acordeón de preguntas frecuentes. `openFaq` guarda el ID de la pregunta
// abierta (o null si ninguna) — es estado local puro de UI, nadie más necesita
// saberlo, así que vive acá y no en un hook aparte.
// El contenido llega del servidor; este componente solo mantiene la apertura.
interface Props {
  faqs: PublicFaq[];
  isLoading: boolean;
  errorMessage: string;
  handleRetry: () => void;
}

export default function ContactFaqAccordion({ faqs, isLoading, errorMessage, handleRetry }: Props) {
  // undefined abre la primera pregunta al cargar; null cierra todas.
  const [openFaq, setOpenFaq] = useState<string | null | undefined>(undefined);

  if (!isLoading && !errorMessage && faqs.length === 0) return null;

  return (
    <div className="rounded-[24px] p-6 bg-white border border-[#3D4C5A]/10 shadow-sm">
      <h4 className="font-serif italic text-lg font-bold text-[#3D4C5A] mb-4 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-[#84B0DF]" />
        <span>Preguntas Frecuentes</span>
      </h4>
      {isLoading && <p role="status" className="text-sm text-[#3D4C5A]/75">Cargando preguntas…</p>}
      {errorMessage && <div role="alert" className="text-sm text-[#3D4C5A]/75">
        <p>{errorMessage}</p>
        <button type="button" onClick={handleRetry} className="mt-2 underline underline-offset-4">Reintentar</button>
      </div>}
      <div className="space-y-2">
        {faqs.map((faq, idx) => {
          const isOpen = openFaq === undefined ? idx === 0 : openFaq === faq.id;
          return (
            <div
              key={faq.id}
              className="border-b border-[#3D4C5A]/10 last:border-0 pb-2.5 last:pb-0"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${faq.id}`}
                className="w-full py-2 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#3D4C5A] hover:text-[#83D0C6] transition-colors cursor-pointer"
              >
                <span className="min-w-0 break-words">{faq.question}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#83D0C6] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#3D4C5A]/50 shrink-0" />
                )}
              </button>
              {isOpen && (
                <p id={`faq-answer-${faq.id}`} className="whitespace-pre-line break-words text-xs sm:text-sm text-[#3D4C5A]/75 font-sans pb-2 leading-relaxed animate-in fade-in duration-200">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
