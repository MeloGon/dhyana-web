'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { CONTACT_FAQS } from '@/lib/data/faqs';

// Acordeón de preguntas frecuentes. `openFaq` guarda el índice de la pregunta
// abierta (o null si ninguna) — es estado local puro de UI, nadie más necesita
// saberlo, así que vive acá y no en un hook aparte.
// El contenido de las preguntas se edita en lib/data/faqs.ts.
export default function ContactFaqAccordion() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="rounded-[24px] p-6 bg-white border border-[#3D4C5A]/10 shadow-sm">
      <h4 className="font-serif italic text-lg font-bold text-[#3D4C5A] mb-4 flex items-center gap-2">
        <HelpCircle className="w-4 h-4 text-[#84B0DF]" />
        <span>Preguntas Frecuentes</span>
      </h4>
      <div className="space-y-2">
        {CONTACT_FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="border-b border-[#3D4C5A]/10 last:border-0 pb-2.5 last:pb-0"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full py-2 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#3D4C5A] hover:text-[#83D0C6] transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#83D0C6] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#3D4C5A]/50 shrink-0" />
                )}
              </button>
              {isOpen && (
                <p className="text-xs sm:text-sm text-[#3D4C5A]/75 font-sans pb-2 leading-relaxed animate-in fade-in duration-200">
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
