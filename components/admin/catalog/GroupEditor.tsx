'use client';

import type { GroupDraft } from '@/lib/types/admin-catalog';

export function GroupEditor({ group, index, onChange, onRemove }: {
  group: GroupDraft; index: number;
  onChange: <K extends keyof GroupDraft>(key: string, field: K, value: GroupDraft[K]) => void;
  onRemove: (key: string) => void;
}) {
  const prefix = `group-${index}`;
  const inputClass = 'mt-2 w-full rounded-xl border border-[#3D4C5A]/25 bg-white px-4 py-3 text-base focus:outline-2 focus:outline-[#467E76]';
  return (
    <section aria-labelledby={`${prefix}-heading`} className="rounded-2xl border border-[#3D4C5A]/15 bg-[#F7F7F5]/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${prefix}-heading`} className="font-semibold">Horario {index + 1}</h3>
        <button type="button" onClick={() => onRemove(group.key)} aria-label={`Quitar horario ${index + 1}`} className="text-sm text-[#9B3024] underline underline-offset-4">Quitar</button>
      </div>
      <div className="mt-4 space-y-4">
        <div><label htmlFor={`${prefix}-schedule`} className="text-sm">Horario del grupo</label>
          <input id={`${prefix}-schedule`} required maxLength={500} value={group.scheduleDescription} onChange={(e) => onChange(group.key, 'scheduleDescription', e.target.value)} placeholder="Sábados de 10:00 a 12:00, hora de Perú" className={inputClass} /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label htmlFor={`${prefix}-price`} className="text-sm">Precio por mes (S/)</label>
            <input id={`${prefix}-price`} type="text" inputMode="decimal" required value={group.price} onChange={(e) => onChange(group.key, 'price', e.target.value)} placeholder="120.00" className={inputClass} /></div>
          <div><label htmlFor={`${prefix}-capacity`} className="text-sm">Capacidad total (privada)</label>
            <input id={`${prefix}-capacity`} type="number" required min={1} max={2147483647} step={1} value={group.capacity} onChange={(e) => onChange(group.key, 'capacity', e.target.value)} className={inputClass} /></div>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={group.isPublished} onChange={(e) => onChange(group.key, 'isPublished', e.target.checked)} className="h-5 w-5 accent-[#467E76]" />Publicar este horario</label>
      </div>
    </section>
  );
}
