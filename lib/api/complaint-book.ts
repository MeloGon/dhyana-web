import type {
  AdminComplaintSheetDetail,
  AdminComplaintSheetsPage,
  ComplaintBookSettings,
  ComplaintSheetConfirmation,
  ComplaintSheetInput,
  PublicComplaintBookSettings,
} from '@/lib/types/complaint-book';

async function request<T>(url: string, method = 'GET', body?: object, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { method, signal, cache: 'no-store', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la solicitud.');
  return result;
}

export const getPublicComplaintBookSettings = (signal?: AbortSignal) =>
  request<PublicComplaintBookSettings>('/api/complaint-book', 'GET', undefined, signal);

export const submitComplaintSheet = (input: ComplaintSheetInput) =>
  request<ComplaintSheetConfirmation>('/api/complaint-book', 'POST', input);

export const getAdminComplaintBookSettings = () => request<ComplaintBookSettings>('/api/admin/complaint-book-settings');
export const saveComplaintBookSettings = (input: ComplaintBookSettings) =>
  request<ComplaintBookSettings>('/api/admin/complaint-book-settings', 'PUT', input);

export const getAdminComplaintSheets = (params: { estado: string; page: number }) =>
  request<AdminComplaintSheetsPage>(`/api/admin/complaint-book?estado=${params.estado}&page=${params.page}`);

export const getAdminComplaintSheetDetail = (id: string) => request<AdminComplaintSheetDetail>(`/api/admin/complaint-book/${id}`);

export const setComplaintSheetStatus = (id: string) =>
  request<{ updated: boolean }>(`/api/admin/complaint-book/${id}`, 'PATCH', { action: 'status', estado: 'en_tramite' });

export const respondComplaintSheet = (id: string, input: { respuestaTexto: string; respuestaFecha: string; respuestaEvidenciaPath: string }) =>
  request<{ updated: boolean }>(`/api/admin/complaint-book/${id}`, 'PATCH', { action: 'respond', ...input });

export async function uploadComplaintEvidence(id: string, file: File): Promise<{ path: string }> {
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(`/api/admin/complaint-book/${id}/evidence`, { method: 'POST', credentials: 'same-origin', body: form });
  const result = await response.json().catch(() => { throw new Error('No se pudo leer la respuesta.'); });
  if (!response.ok) throw new Error(result.message ?? 'No se pudo subir la evidencia.');
  return result;
}
