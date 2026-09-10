export type ManualPaymentMethod = 'yape' | 'transfer' | 'cash' | 'other';
export type AccessStatus = 'active' | 'expired' | 'upcoming' | 'cancelled';
export type SaleAction = 'cancel' | 'delete';

export interface SaleActionInput {
  reason: string;
  confirmationCode: string;
  isTestOrMistake: boolean;
}

export interface ManualSaleInput {
  requestId: string;
  groupId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amountCents: number;
  purchasedAt: string;
  paymentMethod: ManualPaymentMethod;
  paymentReference: string;
  paymentVerified: boolean;
}

export interface AdminSale {
  id: string;
  status: 'paid' | 'cancelled';
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  referenceCode: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amountCents: number;
  origin: 'manual' | 'culqi';
  paymentMethod: ManualPaymentMethod | null;
  paymentReference: string | null;
  purchasedAt: string;
  coordinatedAt: string | null;
  workshopTitle: string;
  scheduleDescription: string;
  startsAt: string;
  endsAt: string;
  accessStatus: AccessStatus;
}

export interface SalesFilters {
  query: string;
  access: 'all' | AccessStatus;
  coordination: 'all' | 'pending' | 'done';
  page: number;
}

export interface AdminSalesPage {
  items: AdminSale[];
  total: number;
  page: number;
  pageSize: number;
  asOf: string;
}

export interface ManualSaleResult {
  id: string;
  referenceCode: string;
  startsAt: string;
  endsAt: string;
}
