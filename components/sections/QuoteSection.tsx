'use client';

import React from 'react';
import { Quote, Sparkles } from 'lucide-react';

// Bloque de cita inspiracional. Se reutiliza dos veces en app/page.tsx con
// distinto contenido — cada prop tiene un valor por default (`quote = '...'`)
// como fallback, similar a un parámetro nombrado con default en Dart.
interface QuoteSectionProps {
  quote?: string;
  author?: string;
  role?: string;
  accentNote?: string;
  variant?: 'mint' | 'sky';
}

export default function QuoteSection({
  quote = 'No puedes detener las olas del mar, pero puedes aprender a surfear.',
  author = 'Jon Kabat-Zinn',
  role = 'Pionero de la Reducción del Estrés Basada en Mindfulness (MBSR)',
  accentNote = 'Respira, estás a tiempo de empezar hoy',
  variant = 'mint',
}: QuoteSectionProps) {
  const bgClass =
    variant === 'mint'
      ? 'bg-[#83D0C6]/15 border-[#83D0C6]/30'
      : 'bg-[#84B0DF]/15 border-[#84B0DF]/30';

  const iconColor = variant === 'mint' ? 'text-[#83D0C6]' : 'text-[#84B0DF]';

  return (
    <section id="citas" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className={`relative rounded-3xl p-8 sm:p-12 md:p-14 border ${bgClass} shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center overflow-hidden transition-all duration-300`}
      >
        {/* Subtle decorative background circles */}
        <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full bg-white/40 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 rounded-full bg-white/50 blur-xl pointer-events-none" />

        {/* Circular icon container */}
        <div className="mx-auto w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xs mb-6 text-[#3D4C5A]">
          <Quote className={`w-6 h-6 ${iconColor}`} />
        </div>

        {/* Quote text */}
        <blockquote className="relative z-10 font-serif text-2xl sm:text-3xl md:text-4xl text-[#3D4C5A] font-medium leading-snug tracking-tight mb-6 max-w-3xl mx-auto italic">
          &ldquo;{quote}&rdquo;
        </blockquote>

        {/* Author info */}
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <span className="font-sans font-semibold text-base sm:text-lg text-[#3D4C5A]">
              {author}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-[#3D4C5A]/70 font-sans max-w-md">
            {role}
          </span>
        </div>

        {/* Handwritten Accent */}
        {accentNote && (
          <div className="mt-8 pt-6 border-t border-[#3D4C5A]/10 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#83D0C6]" />
            <span className="font-handwriting text-2xl sm:text-3xl text-[#3D4C5A] font-semibold">
              ~ {accentNote} ~
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
