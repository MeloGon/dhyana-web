import { Calendar, Users } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { PublicWorkshop } from '@/lib/types/catalog';

export function PublicWorkshopCard({ workshop }: { workshop: PublicWorkshop }) {
  const isIndividual = workshop.category === 'individual';
  return (
    <article className="min-w-0 rounded-3xl border border-[#3D4C5A]/10 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#467E76]">
        <Users className="h-4 w-4" aria-hidden="true" />{isIndividual ? 'Individual' : 'Grupal · Online'}
      </div>
      <h3 className="font-serif text-2xl font-semibold break-words">{workshop.title}</h3>
      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed break-words text-[#3D4C5A]/80">{workshop.summary}</p>
      {isIndividual ? <p className="mt-6 inline-block rounded-full bg-[#B2C9DC]/35 px-4 py-2 text-sm font-semibold">Agotado</p>
        : workshop.groups.length === 0 ? <p className="mt-6 text-sm text-[#3D4C5A]/70">Próximamente anunciaremos nuevos horarios.</p>
        : <ul className="mt-6 space-y-4">
          {workshop.groups.map((group) => <li key={group.id} className="rounded-2xl bg-[#F7F7F5] p-4">
            <p className="flex gap-2 text-sm"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#467E76]" aria-hidden="true" /><span className="whitespace-pre-line break-words">{group.scheduleDescription}</span></p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p><span className="font-semibold">{formatPrice(group.priceCents)}</span><span className="ml-1 text-xs">/ mes calendario</span></p>
              <span className="rounded-full bg-[#83D0C6]/25 px-3 py-1 text-xs font-semibold">{group.remainingSpots > 0 ? `${group.remainingSpots} cupos restantes` : 'Agotado'}</span>
            </div>
          </li>)}
        </ul>}
      {!isIndividual && <p className="mt-5 text-xs leading-relaxed text-[#3D4C5A]/65">Inscripciones en línea próximamente. Cada compra dará acceso por un mes calendario, sin renovación automática.</p>}
    </article>
  );
}
