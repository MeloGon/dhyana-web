import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import type { AdminFaq, FaqInput, PublicFaq } from '@/lib/types/faqs';
import type { Database } from '@/lib/types/database';

type FaqRow = Database['public']['Tables']['faqs']['Row'];
const columns = 'id,question,answer,sort_order,is_published' as const;

function adminDto(row: FaqRow): AdminFaq {
  return { id: row.id, question: row.question, answer: row.answer,
    sortOrder: row.sort_order, isPublished: row.is_published };
}

function validateId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new HttpError(400, 'Identificador inválido.');
  }
}

function parseInput(body: Record<string, unknown>): FaqInput {
  function text(key: string, label: string, max: number) {
    const value = body[key];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max || value.includes('\0')) {
      throw new HttpError(400, `${label}: completa el campo usando hasta ${max} caracteres.`);
    }
    return value.trim();
  }
  if (typeof body.sortOrder !== 'number' || !Number.isInteger(body.sortOrder) || body.sortOrder < 1 || body.sortOrder > 10000) {
    throw new HttpError(400, 'El orden debe ser un entero entre 1 y 10000.');
  }
  if (typeof body.isPublished !== 'boolean') throw new HttpError(400, 'Estado de publicación inválido.');
  return { question: text('question', 'Pregunta', 300), answer: text('answer', 'Respuesta', 5000),
    sortOrder: body.sortOrder, isPublished: body.isPublished };
}

export async function getAdminFaqs(): Promise<AdminFaq[]> {
  await requireAdmin();
  const { data, error } = await createDatabaseAdminClient().from('faqs').select(columns)
    .order('sort_order').order('id');
  if (error) throw new Error('No se pudieron leer las preguntas.');
  return data.map(adminDto);
}

export async function getPublicFaqs(): Promise<PublicFaq[]> {
  const { data, error } = await createDatabaseAdminClient().from('faqs')
    .select('id,question,answer').eq('is_published', true).order('sort_order').order('id');
  if (error) throw new Error('No se pudieron leer las preguntas.');
  return data.map(({ id, question, answer }) => ({ id, question, answer }));
}

export async function saveFaq(body: Record<string, unknown>, id?: string): Promise<AdminFaq> {
  await requireAdmin();
  if (id) validateId(id);
  const input = parseInput(body);
  const row = { question: input.question, answer: input.answer,
    sort_order: input.sortOrder, is_published: input.isPublished };
  const table = createDatabaseAdminClient().from('faqs');
  const query = id ? table.update(row).eq('id', id) : table.insert(row);
  const { data, error } = await query.select(columns).maybeSingle();
  if (error) throw new Error('No se pudo guardar la pregunta.');
  if (!data) throw new HttpError(404, 'La pregunta ya no existe.');
  return adminDto(data);
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  validateId(id);
  const { data, error } = await createDatabaseAdminClient().from('faqs').delete().eq('id', id).select('id').maybeSingle();
  if (error) throw new Error('No se pudo eliminar la pregunta.');
  if (!data) throw new HttpError(404, 'La pregunta ya no existe.');
  return { deleted: true };
}
