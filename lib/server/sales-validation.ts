import 'server-only';

import { HttpError } from '@/lib/server/http-error';
import { validateId } from '@/lib/server/catalog-validation';
import type { ManualSaleInput, SalesFilters } from '@/lib/types/admin-sales';

function text(body: Record<string, unknown>, key: string, max: number) {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(400, 'Completa los datos del participante y del pago.');
  return value.trim();
}

export function parseManualSale(body: Record<string, unknown>): ManualSaleInput {
  const buyerName = text(body, 'buyerName', 160);
  const buyerEmail = text(body, 'buyerEmail', 254).toLowerCase();
  const buyerPhone = text(body, 'buyerPhone', 40);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) throw new HttpError(400, 'Ingresa un correo válido.');
  if (!/^\+?[\d ()-]+$/.test(buyerPhone) || buyerPhone.replace(/\D/g, '').length < 6 || buyerPhone.replace(/\D/g, '').length > 15) throw new HttpError(400, 'Ingresa un teléfono válido con código de país.');
  if (typeof body.amountCents !== 'number' || !Number.isSafeInteger(body.amountCents) || body.amountCents < 1 || body.amountCents > 2147483647) throw new HttpError(400, 'Ingresa un importe válido en soles, con máximo dos decimales.');
  if (body.paymentVerified !== true) throw new HttpError(400, 'Confirma que verificaste el pago antes de registrarlo.');
  if (!['yape', 'transfer', 'cash', 'other'].includes(String(body.paymentMethod))) throw new HttpError(400, 'Medio de pago inválido.');
  // datetime-local no incluye zona. La pantalla siempre solicita hora de Perú.
  const localDate = text(body, 'purchasedAt', 16);
  const instant = new Date(`${localDate}-05:00`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localDate) || localDate.startsWith('0000') || !Number.isFinite(instant.getTime())
    || new Date(instant.getTime() - 5 * 3600000).toISOString().slice(0, 16) !== localDate) throw new HttpError(400, 'Fecha y hora del pago inválidas.');
  if (instant.getTime() > Date.now()) throw new HttpError(400, 'La fecha del pago no puede estar en el futuro.');
  if (typeof body.paymentReference !== 'string' || body.paymentReference.trim().length > 100) throw new HttpError(400, 'Referencia de pago inválida.');
  return { requestId: validateId(text(body, 'requestId', 36)), groupId: validateId(text(body, 'groupId', 36)),
    buyerName, buyerEmail, buyerPhone, amountCents: body.amountCents, purchasedAt: instant.toISOString(),
    paymentMethod: body.paymentMethod as ManualSaleInput['paymentMethod'], paymentReference: body.paymentReference.trim().toUpperCase(), paymentVerified: true };
}

export function parseSalesFilters(params: URLSearchParams): SalesFilters {
  const query = (params.get('query') ?? '').trim();
  const access = params.get('access') ?? 'all';
  const coordination = params.get('coordination') ?? 'all';
  const page = Number(params.get('page') ?? 1);
  if (query.length > 100 || !['all', 'active', 'expired', 'upcoming'].includes(access)
    || !['all', 'pending', 'done'].includes(coordination) || !Number.isInteger(page) || page < 1 || page > 100000) throw new HttpError(400, 'Filtros inválidos.');
  return { query, access: access as SalesFilters['access'], coordination: coordination as SalesFilters['coordination'], page };
}
