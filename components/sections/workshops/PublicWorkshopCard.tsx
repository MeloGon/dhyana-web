'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, ZoomIn, X, Maximize2 } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { PublicWorkshop, PublicWorkshopGroup } from '@/lib/types/catalog';
import type { PublicContactSettings } from '@/lib/types/contact-settings';

interface Props {
  workshop: PublicWorkshop;
  /** null mientras carga o si falla: sin número no hay forma segura de armar el enlace. */
  contact: PublicContactSettings | null;
}

// No hay checkout ni reserva todavía (ver README): el "Comprar" abre
// WhatsApp con el taller y horario ya escritos, usando el mismo circuito de venta
// manual que ya existe en /admin/sales. Nada de esto reserva cupo por sí solo.
function whatsappSelectHref(
  contact: PublicContactSettings,
  workshop: PublicWorkshop,
  group: PublicWorkshopGroup,
  currency: 'pen' | 'usd'
) {
  const usdText = currency === 'usd' && group.usdPriceCents
    ? ` (ref. $${(group.usdPriceCents / 100).toFixed(2)} USD)`
    : '';
  const message = `Hola, quiero inscribirme en "${workshop.title}" (horario: ${group.scheduleDescription}${usdText}).`;
  return `https://wa.me/${contact.whatsappPhone}?text=${encodeURIComponent(message)}`;
}

function WorkshopGroupItem({
  workshop,
  group,
  contact,
}: {
  workshop: PublicWorkshop;
  group: PublicWorkshopGroup;
  contact: PublicContactSettings | null;
}) {
  const [currency, setCurrency] = useState<'pen' | 'usd'>('pen');
  const hasUsd = Boolean(group.usdPriceCents && group.usdPriceCents > 0);

  return (
    <li className="rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--page)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[color:var(--ink)]/10">
        <p className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
          <Calendar className="h-4 w-4 shrink-0 text-[#8B5CF6]" aria-hidden="true" />
          <span className="whitespace-pre-line break-words text-[color:var(--ink)]">{group.scheduleDescription}</span>
        </p>

        {/* Selector de moneda interactivo si tiene precio USD referencial configurado */}
        {hasUsd && (
          <div className="inline-flex p-0.5 rounded-lg bg-[var(--surface)] border border-[color:var(--ink)]/15 text-xs">
            <button
              type="button"
              onClick={() => setCurrency('pen')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                currency === 'pen'
                  ? 'bg-[#6366F1] text-white shadow-xs'
                  : 'text-[color:var(--ink)]/70 hover:text-[color:var(--ink)]'
              }`}
            >
              PEN (S/)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('usd')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                currency === 'usd'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[color:var(--ink)]/70 hover:text-[color:var(--ink)]'
              }`}
            >
              USD ($)
            </button>
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {currency === 'usd' && hasUsd ? (
            <div className="flex items-baseline flex-wrap gap-2">
              <span className="font-bold text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
                ${(group.usdPriceCents! / 100).toFixed(2)} USD
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-xs font-semibold">
                Aprox. referencial
              </span>
            </div>
          ) : (
            <div className="flex items-baseline flex-wrap gap-2">
              {group.discountPercentage && group.regularPriceCents ? (
                <>
                  <span className="text-xs sm:text-sm text-[color:var(--ink)]/50 line-through">
                    {formatPrice(group.regularPriceCents)}
                  </span>
                  <span className="font-bold text-xl sm:text-2xl text-[#6366F1] dark:text-[#818CF8]">
                    {formatPrice(group.priceCents)}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#EC4899]/15 text-[#EC4899] px-2 py-0.5 text-xs font-bold tracking-wide">
                    -{group.discountPercentage}%
                  </span>
                </>
              ) : (
                <span className="font-bold text-xl sm:text-2xl text-[#6366F1] dark:text-[#818CF8]">
                  {formatPrice(group.priceCents)}
                </span>
              )}
            </div>
          )}
        </div>
        <span className="rounded-full bg-[#06B6D4]/15 text-[#06B6D4] px-3 py-1 text-xs font-semibold shrink-0">
          {group.remainingSpots > 0 ? `${group.remainingSpots} cupos restantes` : 'Agotado'}
        </span>
      </div>

      {group.remainingSpots > 0 && contact && (
        <a
          href={whatsappSelectHref(contact, workshop, group, currency)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cosmic-glow mt-4 flex w-full items-center justify-center rounded-full px-5 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider"
        >
          Comprar
        </a>
      )}
    </li>
  );
}

export function PublicWorkshopCard({ workshop, contact }: Props) {
  const isIndividual = workshop.category === 'individual';
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    }
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  return (
    <>
      <article className="relative overflow-hidden min-w-0 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] shadow-md hover:shadow-lg transition-all">
        {/* Barra decorativa superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] shrink-0" />

        {/* Estructura Split: Celular apilado vertical 100% / PC horizontal lado a lado */}
        <div className="flex flex-col lg:flex-row items-stretch">
          {/* Columna Izquierda: Afiche del taller (si tiene imagen) */}
          {workshop.imageUrl ? (
            <div className="w-full lg:w-5/12 p-4 sm:p-6 bg-[var(--page)] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-[color:var(--ink)]/10">
              <div
                onClick={() => setIsLightboxOpen(true)}
                className="relative w-full max-w-[360px] aspect-square rounded-2xl overflow-hidden shadow-sm border border-[color:var(--ink)]/10 group cursor-pointer"
                title="Haz clic para ver el afiche completo"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={workshop.imageUrl}
                  alt={`Afiche del taller ${workshop.title}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Indicador táctil / móvil en la esquina */}
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-md bg-black/70 text-white text-[11px] font-semibold backdrop-blur-xs shadow flex items-center gap-1">
                  <Maximize2 className="h-3 w-3" />
                  <span>Ampliar</span>
                </div>
                {/* Hover overlay en PC */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-900 font-semibold text-xs shadow-lg flex items-center gap-1.5">
                    <ZoomIn className="h-4 w-4" />
                    Ver afiche completo
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] text-[color:var(--ink)]/70 hover:text-[color:var(--ink)] transition-colors"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span>Toca el afiche para ampliar en alta resolución</span>
              </button>
            </div>
          ) : null}

          {/* Columna Derecha: Contenido, Información y Horarios de Compra */}
          <div className="w-full lg:flex-1 p-5 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Badge de Modalidad */}
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  {isIndividual ? 'Individual' : 'Grupal · Online'}
                </span>
              </div>

              {/* Título y Descripción */}
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[color:var(--ink)] break-words">
                {workshop.title}
              </h3>
              <p className="mt-3 whitespace-pre-line text-xs sm:text-sm leading-relaxed break-words text-[color:var(--ink)]/80">
                {workshop.summary}
              </p>
            </div>

            {/* Horarios y Compras */}
            <div className="mt-6 pt-4 border-t border-[color:var(--ink)]/10">
              {isIndividual ? (
                <p className="inline-block rounded-full bg-[color:var(--ink)]/10 px-4 py-2 text-sm font-semibold">
                  Agotado
                </p>
              ) : workshop.groups.length === 0 ? (
                <p className="text-sm text-[color:var(--ink)]/70">
                  Próximamente anunciaremos nuevos horarios.
                </p>
              ) : (
                <ul className="space-y-4">
                  {workshop.groups.map((group) => (
                    <WorkshopGroupItem
                      key={group.id}
                      workshop={workshop}
                      group={group}
                      contact={contact}
                    />
                  ))}
                </ul>
              )}

              {!isIndividual && (
                <p className="mt-4 text-xs leading-relaxed text-[color:var(--ink)]/65">
                  Pago en línea próximamente. Por ahora coordinamos tu inscripción por WhatsApp.
                </p>
              )}
            </div>
          </div>
        </div>
      </article>

      {/* Modal Lightbox para ver afiche completo en alta resolución */}
      {isLightboxOpen && workshop.imageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Afiche completo: ${workshop.title}`}
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-xs animate-in fade-in duration-200"
        >
          {/* Botón de cierre */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors cursor-pointer"
            aria-label="Cerrar vista ampliada"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl shadow-2xl bg-black/90 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workshop.imageUrl}
              alt={`Afiche de ${workshop.title}`}
              className="max-h-[85vh] max-w-[88vw] object-contain rounded-2xl"
            />
            <div className="w-full py-2.5 px-4 text-center bg-black/80 border-t border-white/10">
              <p className="text-xs sm:text-sm font-serif font-medium text-white truncate">
                {workshop.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
