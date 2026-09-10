export type QuoteVariant = 'mint' | 'sky' | 'lavender';

/** Cita o reflexión visible públicamente en la landing. */
export interface QuoteItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  accentNote: string;
  variant: QuoteVariant;
  sortOrder: number;
}

/** Cita o reflexión en el panel de administración (incluye estado de publicación). */
export interface AdminQuote extends QuoteItem {
  isPublished: boolean;
}

/** Datos del formulario para crear o editar una cita. */
export interface QuoteInput {
  quote: string;
  author: string;
  role: string;
  accentNote: string;
  variant: QuoteVariant;
  sortOrder: number;
  isPublished: boolean;
}
