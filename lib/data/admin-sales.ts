import type { ManualPaymentMethod } from '@/lib/types/admin-sales';

export const MANUAL_PAYMENT_METHODS: { value: ManualPaymentMethod; label: string }[] = [
  { value: 'yape', label: 'Yape directo' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'other', label: 'Otro medio externo' },
];
export const ACCESS_LABELS = { active: 'Vigente', expired: 'Vencido', upcoming: 'Próximo' };
