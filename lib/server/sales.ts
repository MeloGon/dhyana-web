import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import { validateId } from '@/lib/server/catalog-validation';
import { parseManualSale, parseSalesFilters } from '@/lib/server/sales-validation';
import type { AdminSalesPage, ManualSaleResult } from '@/lib/types/admin-sales';
import type { Json } from '@/lib/types/database';

function databaseError(error: { code: string; message: string }) {
  if (['PT400', 'PT403', 'PT404', 'PT409'].includes(error.code)) throw new HttpError(Number(error.code.slice(2)), error.message);
  if (error.code === '23505') throw new HttpError(409, 'La referencia de este pago ya está registrada. Busca la venta antes de registrarla otra vez.');
  if (['23514', '23502', '22P02', '22008'].includes(error.code)) throw new HttpError(400, 'Revisa los datos del pago.');
  throw new Error('No se pudo completar la operación de ventas.');
}

export async function getAdminSales(params = new URLSearchParams()): Promise<AdminSalesPage> {
  await requireAdmin();
  const filters = parseSalesFilters(params);
  const { data, error } = await createDatabaseAdminClient().rpc('admin_sales_page', {
    p_query: filters.query, p_access: filters.access, p_coordination: filters.coordination, p_page: filters.page,
  });
  if (error) databaseError(error);
  return data as unknown as AdminSalesPage;
}

export async function registerManualSale(body: Record<string, unknown>): Promise<ManualSaleResult> {
  const admin = await requireAdmin();
  const input = parseManualSale(body);
  const client = createDatabaseAdminClient();
  const { data: id, error } = await client.rpc('register_manual_sale', { p_admin_id: admin.id, p_input: input as unknown as Json });
  if (error) databaseError(error);
  const { data: sale, error: readError } = await client.from('purchases')
    .select('id,status,reference_code,monthly_accesses(starts_at,ends_at)').eq('id', id!).single();
  // PostgREST devuelve una lista por la FK compuesta; la PK permite un solo acceso.
  const access = sale?.monthly_accesses?.[0];
  if (readError || !sale || !access?.ends_at) throw new HttpError(503, 'No se pudo recuperar la confirmación. Reintenta sin cambiar los datos; la venta no se duplicará.');
  if (sale.status !== 'paid') throw new HttpError(409, 'Esta venta fue anulada. Revisa el historial antes de registrar otra compra.');
  return { id: sale.id, referenceCode: sale.reference_code, startsAt: access.starts_at, endsAt: access.ends_at };
}

export async function setSaleCoordination(id: string, body: Record<string, unknown>) {
  const admin = await requireAdmin();
  validateId(id);
  if (typeof body.coordinated !== 'boolean') throw new HttpError(400, 'Estado de coordinación inválido.');
  const { error } = await createDatabaseAdminClient().rpc('set_sale_coordination', {
    p_admin_id: admin.id, p_purchase_id: id, p_coordinated: body.coordinated,
  });
  if (error) databaseError(error);
  return { updated: true };
}

export async function cancelSale(id: string, body: Record<string, unknown>) {
  const admin = await requireAdmin();
  validateId(id);
  if (typeof body.reason !== 'string' || body.reason.trim().length < 5 || body.reason.trim().length > 500) throw new HttpError(400, 'Indica un motivo de entre 5 y 500 caracteres.');
  const { error } = await createDatabaseAdminClient().rpc('cancel_sale', {
    p_admin_id: admin.id, p_purchase_id: id, p_reason: body.reason.trim(),
  });
  if (error) databaseError(error);
  return { updated: true };
}

export async function deleteManualSale(id: string, body: Record<string, unknown>) {
  const admin = await requireAdmin();
  validateId(id);
  if (body.isTestOrMistake !== true) throw new HttpError(400, 'Confirma que es una prueba o un error de registro.');
  const code = typeof body.confirmationCode === 'string' ? body.confirmationCode.trim().toUpperCase() : '';
  if (!/^(DHY-)?[A-F0-9]{32}$/.test(code)) throw new HttpError(400, 'Escribe el código de la compra para confirmar el borrado.');
  const { error } = await createDatabaseAdminClient().rpc('delete_manual_sale', {
    p_admin_id: admin.id, p_purchase_id: id, p_code: code.startsWith('DHY-') ? code : `DHY-${code}`, p_is_test: true,
  });
  if (error) databaseError(error);
  return { deleted: true };
}
