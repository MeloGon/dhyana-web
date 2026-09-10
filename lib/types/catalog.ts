/** Contratos públicos del catálogo persistido, consultado desde la landing. */
export type WorkshopCategory = 'group' | 'individual';

/** Solo datos públicos: la capacidad total nunca forma parte de este contrato. */
export interface PublicWorkshopGroup {
  id: string;
  scheduleDescription: string;
  /** Entero en céntimos: S/ 120.00 se representa como 12000. */
  priceCents: number;
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
