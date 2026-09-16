/** Contratos públicos del catálogo persistido, consultado desde la landing. */
export type WorkshopCategory = 'group' | 'individual';

/** Solo datos públicos: la capacidad total nunca forma parte de este contrato. */
export interface PublicWorkshopGroup {
  id: string;
  scheduleDescription: string;
  /** Entero en céntimos: precio final con descuento si aplica (ej: S/ 100.00 -> 10000). */
  priceCents: number;
  /** Precio regular antes de descuento (presente solo si tiene descuento activo). */
  regularPriceCents?: number;
  /** Descuento en céntimos (presente solo si tiene descuento activo). */
  discountCents?: number;
  /** Porcentaje de descuento calculado (ej: 17 para 17% de rebaja). */
  discountPercentage?: number;
  currency: 'PEN';
  /** Capacidad menos accesos vigentes. Se añadirán reservas al implementar checkout. */
  remainingSpots: number;
}

export interface PublicWorkshop {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: WorkshopCategory;
  groups: PublicWorkshopGroup[];
}
