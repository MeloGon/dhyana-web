'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Quote, Sparkles, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { QuoteItem, QuoteVariant } from '@/lib/types/quotes';

interface QuoteDeckSectionProps {
  quotes: QuoteItem[];
}

const variantStyles: Record<
  QuoteVariant,
  { cardBg: string; borderColor: string; iconColor: string; badgeBg: string }
> = {
  mint: {
    cardBg: 'bg-[#F9FCFB]',
    borderColor: 'border-[#83D0C6]/30',
    iconColor: 'text-[#83D0C6]',
    badgeBg: 'bg-[#83D0C6]/15',
  },
  sky: {
    cardBg: 'bg-[#F8FAFD]',
    borderColor: 'border-[#84B0DF]/30',
    iconColor: 'text-[#84B0DF]',
    badgeBg: 'bg-[#84B0DF]/15',
  },
  lavender: {
    cardBg: 'bg-[#FAF9FC]',
    borderColor: 'border-[#D1D3E8]/50',
    iconColor: 'text-[#7D82B8]',
    badgeBg: 'bg-[#D1D3E8]/30',
  },
};

export default function QuoteDeckSection({ quotes }: QuoteDeckSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const total = quotes.length;

  const nextCard = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setIsAnimating(false);
    }, 320);
  }, [total, isAnimating]);

  const prevCard = useCallback(() => {
    if (total <= 1 || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + total) % total);
      setIsAnimating(false);
    }, 320);
  }, [total, isAnimating]);

  // Auto-rotación cada 6 segundos; se pausa si el usuario pasa el cursor por encima
  useEffect(() => {
    if (total <= 1 || isHovered || isPaused) return;

    timeoutRef.current = setInterval(() => {
      nextCard();
    }, 6000);

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [total, isHovered, isPaused, nextCard]);

  if (quotes.length === 0) return null;

  // Calculamos hasta 4 cartas del mazo para el efecto visual apilado
  const stackLayers = Math.min(quotes.length, 4);
  const visibleCards = Array.from({ length: stackLayers }, (_, offset) => {
    const quoteIndex = (currentIndex + offset) % total;
    return { quote: quotes[quoteIndex], offset };
  });

  const activeQuote = quotes[currentIndex];

  return (
    <section id="citas" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto scroll-mt-20">
      {/* Cabecera de la sección */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#83D0C6]/20 text-[#3D4C5A] text-xs font-semibold uppercase tracking-wider mb-3">
          <span>Reflexiones & Bienestar</span>
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-[#3D4C5A] font-bold tracking-tight">
          Palabras para acompañar tu proceso
        </h2>
      </div>

      {/* Contenedor del mazo de cartas: ancho generoso (max-w-5xl) igual que el diseño original */}
      <div
        className="relative max-w-4xl mx-auto px-2 sm:px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Altura espaciosa para dar aire al texto y que nada quede apretado */}
        <div className="relative min-h-[420px] sm:min-h-[440px] md:min-h-[460px] flex items-center justify-center">
          {/* Renderizamos las cartas del fondo (offset > 0) como lienzos limpios de soporte */}
          {visibleCards.reverse().map(({ quote, offset }) => {
            const styles = variantStyles[quote.variant] ?? variantStyles.mint;
            const isFront = offset === 0;

            // Transformaciones para el efecto mazo de cartas (rotaciones angulares sin empuje hacia abajo)
            let transformClass = '';
            let zIndex = 10;
            let opacityClass = 'opacity-100';

            if (isFront) {
              zIndex = 30;
              transformClass = isAnimating
                ? '-translate-y-10 rotate-[-3deg] scale-105 opacity-0'
                : 'translate-y-0 rotate-0 scale-100';
            } else if (offset === 1) {
              zIndex = 20;
              transformClass = isAnimating
                ? 'translate-y-0 rotate-0 scale-100'
                : 'translate-y-1 rotate-[2.2deg] scale-[0.985]';
              opacityClass = 'opacity-95';
            } else if (offset === 2) {
              zIndex = 15;
              transformClass = isAnimating
                ? 'translate-y-1 rotate-[2.2deg] scale-[0.985]'
                : 'translate-y-2 -rotate-[2.5deg] scale-[0.97]';
              opacityClass = 'opacity-85';
            } else if (offset === 3) {
              zIndex = 10;
              transformClass = isAnimating
                ? 'translate-y-2 -rotate-[2.5deg] scale-[0.97]'
                : 'translate-y-3 rotate-[1.5deg] scale-[0.955]';
              opacityClass = 'opacity-70';
            }

            return (
              <div
                key={quote.id}
                onClick={isFront ? nextCard : undefined}
                style={{ zIndex }}
                className={`absolute inset-0 rounded-[32px] border ${styles.borderColor} ${styles.cardBg}
                  shadow-[0_8px_30px_rgba(61,76,90,0.06)] overflow-hidden transition-all duration-500 ease-out select-none
                  ${transformClass} ${opacityClass} ${isFront ? 'cursor-pointer' : 'pointer-events-none'}`}
              >
                {/* Destellos decorativos ambientales */}
                <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-white/60 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/70 blur-2xl pointer-events-none" />

                {/* Si es la carta frontal, renderizamos el contenido completo con padding amplio */}
                {isFront ? (
                  <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-12 md:p-14 text-center">
                    {/* Icono circular de comillas centrado con aire */}
                    <div className="mx-auto w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-xs text-[#3D4C5A] mb-4">
                      <Quote className={`w-6 h-6 ${styles.iconColor}`} />
                    </div>

                    {/* Cita en tipografía Playfair destacada y centrada */}
                    <blockquote className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#3D4C5A] font-medium leading-relaxed tracking-tight my-auto px-4 sm:px-8 max-w-3xl mx-auto">
                      &ldquo;{activeQuote.quote}&rdquo;
                    </blockquote>

                    {/* Bloque inferior: Autor y Nota manuscrita con respiro visual */}
                    <div className="mt-6 pt-6 border-t border-[#3D4C5A]/10">
                      <div className="flex flex-col items-center justify-center">
                        <span className="font-sans font-semibold text-base sm:text-lg text-[#3D4C5A]">
                          {activeQuote.author}
                        </span>
                        {activeQuote.role && (
                          <span className="text-xs sm:text-sm text-[#3D4C5A]/70 font-sans mt-0.5 max-w-md">
                            {activeQuote.role}
                          </span>
                        )}
                      </div>

                      {activeQuote.accentNote && (
                        <div className="mt-5 flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#83D0C6]" />
                          <span className="font-handwriting text-2xl sm:text-3xl text-[#3D4C5A] font-semibold">
                            ~ {activeQuote.accentNote} ~
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Las cartas de fondo NO muestran texto para no confundir ni saturar la vista */
                  <div className="h-full w-full flex items-start justify-center pt-8 opacity-40">
                    <div className="w-12 h-12 rounded-full bg-white/70 flex items-center justify-center shadow-xs">
                      <Quote className={`w-5 h-5 ${styles.iconColor}`} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controles de navegación y estado al pie del mazo */}
        <div className="mt-12 flex items-center justify-between max-w-md mx-auto px-4">
          <button
            onClick={prevCard}
            disabled={total <= 1 || isAnimating}
            className="w-10 h-10 rounded-full border border-[#3D4C5A]/15 bg-white text-[#3D4C5A] flex items-center justify-center shadow-xs hover:border-[#83D0C6] hover:text-[#467E76] disabled:opacity-40 transition-all cursor-pointer"
            aria-label="Carta anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Contador de cartas y barra de puntos interactiva */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs font-sans font-semibold uppercase tracking-widest text-[#3D4C5A]/70">
              {currentIndex + 1} de {total}
            </span>
            <div className="flex items-center gap-1.5">
              {quotes.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    if (isAnimating) return;
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentIndex(idx);
                      setIsAnimating(false);
                    }, 250);
                  }}
                  aria-label={`Ver carta ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-6 bg-[#83D0C6]' : 'w-2 bg-[#3D4C5A]/20 hover:bg-[#3D4C5A]/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="w-8 h-8 rounded-full border border-[#3D4C5A]/15 bg-white text-[#3D4C5A]/60 flex items-center justify-center hover:text-[#3D4C5A] transition-all cursor-pointer"
              title={isPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
              aria-label={isPaused ? 'Reanudar rotación' : 'Pausar rotación'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 ml-0.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={nextCard}
              disabled={total <= 1 || isAnimating}
              className="w-10 h-10 rounded-full border border-[#3D4C5A]/15 bg-white text-[#3D4C5A] flex items-center justify-center shadow-xs hover:border-[#83D0C6] hover:text-[#467E76] disabled:opacity-40 transition-all cursor-pointer"
              aria-label="Siguiente carta"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
