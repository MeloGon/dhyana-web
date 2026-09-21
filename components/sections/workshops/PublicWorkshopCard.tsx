import { Calendar, Users } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { PublicWorkshop, PublicWorkshopGroup } from '@/lib/types/catalog';
import type { PublicContactSettings } from '@/lib/types/contact-settings';

interface Props {
  workshop: PublicWorkshop;
  /** null mientras carga o si falla: sin número no hay forma segura de armar el enlace. */
  contact: PublicContactSettings | null;
}

// No hay checkout ni reserva todavía (ver README): el "Seleccionar horario" abre
// WhatsApp con el taller y horario ya escritos, usando el mismo circuito de venta
// manual que ya existe en /admin/sales. Nada de esto reserva cupo por sí solo.
function whatsappSelectHref(contact: PublicContactSettings, workshop: PublicWorkshop, group: PublicWorkshopGroup) {
  const message = `Hola, quiero inscribirme en "${workshop.title}" (horario: ${group.scheduleDescription}).`;
  return `https://wa.me/${contact.whatsappPhone}?text=${encodeURIComponent(message)}`;
}

export function PublicWorkshopCard({ workshop, contact }: Props) {
  const isIndividual = workshop.category === 'individual';
  return (
    <article className="relative overflow-hidden min-w-0 rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] shadow-sm">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#06B6D4] shrink-0" />
      <div className="p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[color:var(--positive)]">
          <Users className="h-4 w-4" aria-hidden="true" />{isIndividual ? 'Individual' : 'Grupal · Online'}
        </div>
        <h3 className="font-serif text-2xl font-semibold break-words">{workshop.title}</h3>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed break-words text-[color:var(--ink)]/80">{workshop.summary}</p>
        {isIndividual ? <p className="mt-6 inline-block rounded-full bg-[color:var(--ink)]/10 px-4 py-2 text-sm font-semibold">Agotado</p>
          : workshop.groups.length === 0 ? <p className="mt-6 text-sm text-[color:var(--ink)]/70">Próximamente anunciaremos nuevos horarios.</p>
          : <ul className="mt-6 space-y-4">
            {workshop.groups.map((group) => <li key={group.id} className="rounded-2xl bg-[var(--page)] p-4">
              <p className="flex gap-2 text-sm"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" aria-hidden="true" /><span className="whitespace-pre-line break-words">{group.scheduleDescription}</span></p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline flex-wrap gap-2">
                  {group.discountPercentage && group.regularPriceCents ? (
                    <>
                      <span className="text-xs sm:text-sm text-[color:var(--ink)]/50 line-through">
                        {formatPrice(group.regularPriceCents)}
                      </span>
                      <span className="font-bold text-lg text-[#6366F1] dark:text-[#818CF8]">
                        {formatPrice(group.priceCents)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#EC4899]/15 text-[#EC4899] px-2 py-0.5 text-xs font-bold tracking-wide">
                        -{group.discountPercentage}%
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold">{formatPrice(group.priceCents)}</span>
                  )}
                </div>
                <span className="rounded-full bg-[#06B6D4]/15 text-[#06B6D4] px-3 py-1 text-xs font-semibold">{group.remainingSpots > 0 ? `${group.remainingSpots} cupos restantes` : 'Agotado'}</span>
              </div>
              {group.remainingSpots > 0 && contact && (
                <a
                  href={whatsappSelectHref(contact, workshop, group)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-cosmic-glow mt-4 flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold uppercase tracking-wider"
                >
                  Comprar
                </a>
              )}
            </li>)}
          </ul>}
        {!isIndividual && <p className="mt-5 text-xs leading-relaxed text-[color:var(--ink)]/65">Pago en línea próximamente. Por ahora coordinamos tu inscripción por WhatsApp.</p>}
      </div>
    </article>
  );
}
