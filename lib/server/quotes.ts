import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import type { AdminQuote, QuoteInput, QuoteItem, QuoteVariant } from '@/lib/types/quotes';
import type { Database } from '@/lib/types/database';

type QuoteRow = Database['public']['Tables']['quotes']['Row'];
const columns = 'id,quote,author,role,accent_note,variant,sort_order,is_published,created_at' as const;

function adminDto(row: QuoteRow): AdminQuote {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role,
    accentNote: row.accent_note,
    variant: row.variant as QuoteVariant,
    sortOrder: row.sort_order,
    isPublished: row.is_published,
  };
}

function publicDto(row: QuoteRow): QuoteItem {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role,
    accentNote: row.accent_note,
    variant: row.variant as QuoteVariant,
    sortOrder: row.sort_order,
  };
}

function validateId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new HttpError(400, 'Identificador inválido.');
  }
}

function parseInput(body: Record<string, unknown>): QuoteInput {
  function text(key: string, label: string, max: number, optional = false) {
    const value = body[key];
    if (typeof value !== 'string' || (!optional && !value.trim()) || value.trim().length > max || value.includes('\0')) {
      throw new HttpError(400, `${label}: ${optional ? 'usa' : 'completa el campo usando'} hasta ${max} caracteres.`);
    }
    return value.trim();
  }

  if (typeof body.sortOrder !== 'number' || !Number.isInteger(body.sortOrder) || body.sortOrder < 1 || body.sortOrder > 10000) {
    throw new HttpError(400, 'El orden debe ser un entero entre 1 y 10000.');
  }
  if (typeof body.isPublished !== 'boolean') throw new HttpError(400, 'Estado de publicación inválido.');

  const variant = body.variant;
  if (variant !== 'mint' && variant !== 'sky' && variant !== 'lavender') {
    throw new HttpError(400, 'Variante de color inválida (mint, sky o lavender).');
  }

  return {
    quote: text('quote', 'Cita o reflexión', 1000),
    author: text('author', 'Autor', 150),
    role: text('role', 'Rol o descripción del autor', 250, true),
    accentNote: text('accentNote', 'Nota manuscrita de acento', 300, true),
    variant,
    sortOrder: body.sortOrder,
    isPublished: body.isPublished,
  };
}

export async function getAdminQuotes(): Promise<AdminQuote[]> {
  await requireAdmin();
  const { data, error } = await createDatabaseAdminClient()
    .from('quotes')
    .select(columns)
    .order('sort_order')
    .order('id');
  if (error) throw new Error('No se pudieron leer las citas.');
  return data.map(adminDto);
}

export async function getPublicQuotes(): Promise<QuoteItem[]> {
  const { data, error } = await createDatabaseAdminClient()
    .from('quotes')
    .select(columns)
    .eq('is_published', true)
    .order('sort_order')
    .order('id');
  if (error) throw new Error('No se pudieron leer las reflexiones.');
  return data.map(publicDto);
}

export async function saveQuote(body: Record<string, unknown>, id?: string): Promise<AdminQuote> {
  await requireAdmin();
  if (id) validateId(id);
  const input = parseInput(body);
  const row = {
    quote: input.quote,
    author: input.author,
    role: input.role,
    accent_note: input.accentNote,
    variant: input.variant,
    sort_order: input.sortOrder,
    is_published: input.isPublished,
  };
  const table = createDatabaseAdminClient().from('quotes');
  const query = id ? table.update(row).eq('id', id) : table.insert(row);
  const { data, error } = await query.select(columns).maybeSingle();
  if (error) throw new Error('No se pudo guardar la cita.');
  if (!data) throw new HttpError(404, 'La cita ya no existe.');
  return adminDto(data);
}

export async function deleteQuote(id: string) {
  await requireAdmin();
  validateId(id);
  const { data, error } = await createDatabaseAdminClient()
    .from('quotes')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw new Error('No se pudo eliminar la cita.');
  if (!data) throw new HttpError(404, 'La cita ya no existe.');
  return { deleted: true };
}
