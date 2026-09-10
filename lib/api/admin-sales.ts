import type { AdminSalesPage, ManualSaleInput, ManualSaleResult, SalesFilters, SaleActionInput } from '@/lib/types/admin-sales';

async function requestSales<T>(url: string, method = 'GET', body?: object): Promise<T> {
  const response = await fetch(url, { method, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(data.message ?? 'No se pudo completar la operación.');
  return data;
}
export function getAdminSales(filters: SalesFilters) {
  const params = new URLSearchParams({ query: filters.query, access: filters.access, coordination: filters.coordination, page: String(filters.page) });
  return requestSales<AdminSalesPage>(`/api/admin/sales?${params}`);
}
export const registerManualSale = (input: ManualSaleInput) => requestSales<ManualSaleResult>('/api/admin/sales', 'POST', input);
export const setSaleCoordination = (id: string, coordinated: boolean) =>
  requestSales<{ updated: boolean }>(`/api/admin/sales/${id}/coordination`, 'PATCH', { coordinated });

export const cancelSale = (id: string, reason: string) =>
  requestSales<{ updated: boolean }>(`/api/admin/sales/${id}/cancel`, 'POST', { reason });
export const deleteManualSale = (id: string, input: SaleActionInput) =>
  requestSales<{ deleted: boolean }>(`/api/admin/sales/${id}`, 'DELETE', { confirmationCode: input.confirmationCode, isTestOrMistake: input.isTestOrMistake });
