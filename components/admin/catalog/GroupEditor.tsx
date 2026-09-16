'use client';

import type { GroupDraft } from '@/lib/types/admin-catalog';

export function GroupEditor({ group, index, onChange, onRemove }: {
  group: GroupDraft; index: number;
  onChange: <K extends keyof GroupDraft>(key: string, field: K, value: GroupDraft[K]) => void;
  onRemove: (key: string) => void;
}) {
  const prefix = `group-${index}`;
  const inputClass = 'mt-2 w-full rounded-xl border border-[color:var(--ink)]/25 bg-[var(--surface)] px-4 py-3 text-base focus:outline-2 focus:outline-[#467E76]';
  const regularNum = parseFloat(group.regularPrice.replace(',', '.')) || 0;
  const discountNum = parseFloat(group.discount.replace(',', '.')) || 0;
  const hasValidRegular = regularNum > 0;
  const hasDiscount = discountNum > 0 && discountNum < regularNum;
  const finalPriceNum = hasValidRegular ? Math.max(0, regularNum - discountNum) : 0;
  const discountPercent = hasDiscount ? Math.round((discountNum / regularNum) * 100) : 0;
  const finalPriceDisplay = hasValidRegular ? finalPriceNum.toFixed(2) : '--';
  const isDiscountInvalid = discountNum >= regularNum && regularNum > 0 && discountNum > 0;

  return (
    <section aria-labelledby={`${prefix}-heading`} className="rounded-2xl border border-[color:var(--ink)]/15 bg-[var(--page)]/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${prefix}-heading`} className="font-semibold">Horario {index + 1}</h3>
        <button type="button" onClick={() => onRemove(group.key)} aria-label={`Quitar horario ${index + 1}`} className="text-sm text-[color:var(--danger)] underline underline-offset-4">Quitar</button>
      </div>
      <div className="mt-4 space-y-4">
        <div><label htmlFor={`${prefix}-schedule`} className="text-sm">Horario del grupo</label>
          <input id={`${prefix}-schedule`} required maxLength={500} value={group.scheduleDescription} onChange={(e) => onChange(group.key, 'scheduleDescription', e.target.value)} placeholder="Sábados de 10:00 a 12:00, hora de Perú" className={inputClass} /></div>

        {/* Fila de Precios y Descuento */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor={`${prefix}-regular-price`} className="text-sm font-medium">Precio regular (S/)</label>
            <input
              id={`${prefix}-regular-price`}
              type="text"
              inputMode="decimal"
              required
              value={group.regularPrice}
              onChange={(e) => onChange(group.key, 'regularPrice', e.target.value)}
              placeholder="120.00"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor={`${prefix}-discount`} className="text-sm font-medium">Descuento (S/)</label>
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-[#EC4899] bg-[#EC4899]/15 px-2 py-0.5 rounded-full">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <input
              id={`${prefix}-discount`}
              type="text"
              inputMode="decimal"
              value={group.discount}
              onChange={(e) => onChange(group.key, 'discount', e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
            {isDiscountInvalid && (
              <p className="mt-1 text-xs text-[color:var(--danger)]">El descuento debe ser menor al precio regular.</p>
            )}
          </div>

          <div>
            <label htmlFor={`${prefix}-final-price`} className="text-sm font-medium">
              Precio final (S/) <span className="text-xs text-[color:var(--ink)]/60">(automático)</span>
            </label>
            <input
              id={`${prefix}-final-price`}
              type="text"
              readOnly
              value={finalPriceDisplay}
              aria-label="Precio final calculado automáticamente"
              className={`${inputClass} bg-[var(--surface-soft)] font-bold text-[#6366F1] cursor-not-allowed`}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${prefix}-capacity`} className="text-sm font-medium">Capacidad total (privada)</label>
          <input
            id={`${prefix}-capacity`}
            type="number"
            required
            min={1}
            max={2147483647}
            step={1}
            value={group.capacity}
            onChange={(e) => onChange(group.key, 'capacity', e.target.value)}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={group.isPublished}
            onChange={(e) => onChange(group.key, 'isPublished', e.target.checked)}
            className="h-5 w-5 accent-[#6366F1]"
          />
          Publicar este horario
        </label>
      </div>
    </section>
  );
}
