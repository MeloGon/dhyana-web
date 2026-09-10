import type { AdminWorkshop, WorkshopSaveInput } from '@/lib/types/admin-catalog';
import type { PublicWorkshop } from '@/lib/types/catalog';

async function requestCatalog<T>(url: string, method = 'GET', body?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, signal, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicWorkshops = (signal?: AbortSignal) => requestCatalog<PublicWorkshop[]>('/api/workshops', 'GET', undefined, signal);
export const getAdminWorkshops = () => requestCatalog<AdminWorkshop[]>('/api/admin/workshops');
export const saveWorkshop = (input: WorkshopSaveInput, id?: string) =>
  requestCatalog<AdminWorkshop>(`/api/admin/workshops${id ? `/${id}` : ''}`, id ? 'PUT' : 'POST', input);
export const deleteWorkshop = (id: string) =>
  requestCatalog<{ deleted: boolean }>(`/api/admin/workshops/${id}`, 'DELETE', {});
