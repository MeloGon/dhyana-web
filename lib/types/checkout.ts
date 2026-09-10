export type PurchaseStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type PurchaseOrigin = 'culqi' | 'manual';

export interface BuyerDetails {
  name: string;
  email: string;
  phone: string;
}

/** El servidor determina importe, moneda, fechas y estado; el cliente no los envía. */
export interface CreatePurchaseInput {
  groupId: string;
  buyer: BuyerDetails;
}

export interface MonthlyAccess {
  /** Instantes ISO 8601 con zona; se presentan al usuario en hora de Perú. */
  startsAt: string;
  /** El acceso deja de estar vigente cuando ahora >= endsAt. */
  endsAt: string;
}

interface PurchaseSummary {
  referenceCode: string;
  amountCents: number;
  currency: 'PEN';
}

/**
 * Contrato para la futura consulta de estado, sin datos personales.
 * La unión impide presentar un acceso como confirmado si el pago sigue pendiente.
 * El endpoint deberá proteger la consulta; el código no confirma un pago por sí solo.
 */
export type PurchaseStatusResult = PurchaseSummary & (
  | { status: 'paid'; access: MonthlyAccess }
  | { status: Exclude<PurchaseStatus, 'paid'>; access: null }
);
