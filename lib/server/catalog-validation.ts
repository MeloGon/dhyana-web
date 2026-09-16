import 'server-only';

import { HttpError } from '@/lib/server/http-error';

import type { GroupInput, WorkshopSaveInput } from '@/lib/types/admin-catalog';

// Los endpoints devuelven errores HTTP esperados; el navegador solo recibe mensaje y estado.
export function validateId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new HttpError(400, 'Identificador inválido.');
  }
  return id;
}

function text(body: Record<string, unknown>, key: string, label: string, max: number) {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new HttpError(400, `${label}: completa el campo usando hasta ${max} caracteres.`);
  }
  return value.trim();
}

function published(body: Record<string, unknown>) {
  if (typeof body.isPublished !== 'boolean') throw new HttpError(400, 'Estado de publicación inválido.');
  return body.isPublished;
}

export function parseWorkshop(body: Record<string, unknown>): WorkshopSaveInput {
  const title = text(body, 'title', 'Título', 160);
  if (body.category !== 'group' && body.category !== 'individual') throw new HttpError(400, 'Categoría inválida.');
  if (!Array.isArray(body.groups) || body.groups.length > 50) throw new HttpError(400, 'Incluye hasta 50 horarios.');
  const groups = body.groups.map((group: unknown) => {
    if (!group || typeof group !== 'object' || Array.isArray(group)) throw new HttpError(400, 'Horario inválido.');
    const row = group as Record<string, unknown>;
    if (row.id !== undefined && typeof row.id !== 'string') throw new HttpError(400, 'Identificador inválido.');
    return { ...parseGroup(row), ...(typeof row.id === 'string' ? { id: validateId(row.id) } : {}) };
  });
  const ids = groups.flatMap((group) => group.id ? [group.id] : []);
  if (new Set(ids).size !== ids.length) throw new HttpError(400, 'No repitas un mismo horario.');
  return { title, summary: text(body, 'summary', 'Descripción', 3000), category: body.category, isPublished: published(body), groups };
}

export function parseGroup(body: Record<string, unknown>): GroupInput {
  const priceCents = body.priceCents;
  const regularPriceCents = body.regularPriceCents !== undefined ? body.regularPriceCents : priceCents;
  const discountCents = body.discountCents !== undefined ? body.discountCents : 0;
  const capacity = body.capacity;

  if (typeof regularPriceCents !== 'number' || !Number.isSafeInteger(regularPriceCents) || regularPriceCents <= 0 || regularPriceCents > 2147483647) {
    throw new HttpError(400, 'Ingresa un precio regular válido en soles, con máximo dos decimales.');
  }
  if (typeof discountCents !== 'number' || !Number.isSafeInteger(discountCents) || discountCents < 0 || discountCents >= regularPriceCents) {
    throw new HttpError(400, 'El descuento debe ser un monto menor al precio regular.');
  }
  const finalPriceCents = regularPriceCents - discountCents;
  if (typeof priceCents === 'number' && priceCents !== finalPriceCents) {
    throw new HttpError(400, 'El precio final no coincide con el precio regular menos el descuento.');
  }
  if (typeof capacity !== 'number' || !Number.isSafeInteger(capacity) || capacity <= 0 || capacity > 2147483647) {
    throw new HttpError(400, 'La capacidad debe ser un número entero mayor que cero.');
  }
  return {
    scheduleDescription: text(body, 'scheduleDescription', 'Horario', 500),
    priceCents: finalPriceCents,
    regularPriceCents,
    discountCents,
    capacity,
    isPublished: published(body),
  };
}
