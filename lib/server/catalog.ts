import 'server-only';

import { HttpError } from '@/lib/server/http-error';

import { createDatabaseAdminClient } from '@/lib/server/database';
import { requireAdmin } from '@/lib/server/admin-auth';
import { parseWorkshop, validateId } from '@/lib/server/catalog-validation';
import type { AdminWorkshop, AdminGroup } from '@/lib/types/admin-catalog';
import type { PublicWorkshop } from '@/lib/types/catalog';
import { workshopSlug } from '@/lib/workshop-slug';
import type { Database, Json } from '@/lib/types/database';

type WorkshopRow = Database['public']['Tables']['workshops']['Row'];
type GroupRow = Database['public']['Tables']['workshop_groups']['Row'];

function groupDto(group: GroupRow): AdminGroup {
  return { id: group.id, workshopId: group.workshop_id, scheduleDescription: group.schedule_description,
    priceCents: group.price_cents, capacity: group.capacity, isPublished: group.is_published };
}

function workshopDto(workshop: WorkshopRow, groups: GroupRow[] = []): AdminWorkshop {
  return { id: workshop.id, title: workshop.title, slug: workshop.slug, summary: workshop.summary,
    category: workshop.category === 'individual' ? 'individual' : 'group',
    isPublished: workshop.is_published, groups: groups.map(groupDto) };
}

function databaseError(error: { code: string; message: string }) {
  if (['PT400', 'PT404', 'PT409'].includes(error.code)) throw new HttpError(Number(error.code.slice(2)), error.message);
  if (error.code === '23503') throw new HttpError(409, 'Hay compras asociadas. Despublica el taller u horario para conservar el historial.');
  if (error.code === '23505') throw new HttpError(409, 'Ya existe un taller con ese identificador.');
  if (error.code === '23514') throw new HttpError(400, 'Los datos no cumplen las reglas del catálogo.');
  throw new Error('No se pudo guardar el catálogo.');
}

export async function getAdminCatalog(): Promise<AdminWorkshop[]> {
  await requireAdmin();
  const { data, error } = await createDatabaseAdminClient().from('workshops')
    .select('*,workshop_groups(*)').order('created_at', { ascending: false });
  if (error) throw new Error('No se pudo leer el catálogo.');
  return data.map((row) => workshopDto(row, row.workshop_groups.sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))));
}

export async function saveWorkshop(body: Record<string, unknown>, id?: string) {
  await requireAdmin();
  if (id) validateId(id);
  const input = parseWorkshop(body);
  const client = createDatabaseAdminClient();
  const { data, error } = await client.rpc('save_workshop_catalog', {
    // El generador de Supabase no refleja argumentos SQL anulables; null significa crear.
    p_workshop_id: (id ?? null) as string, p_workshop: input as unknown as Json, p_slug: workshopSlug(input.title),
  });
  if (error) databaseError(error);
  // La función devuelve la misma transacción: incluye los IDs de horarios recién creados.
  const result = data as unknown as { workshop: WorkshopRow; groups: GroupRow[] };
  return workshopDto(result.workshop, result.groups);
}

export async function deleteWorkshop(id: string) {
  await requireAdmin();
  validateId(id);
  const { error } = await createDatabaseAdminClient().rpc('delete_workshop_catalog', { p_workshop_id: id });
  if (error) databaseError(error);
  return { deleted: true };
}

async function activeAccessCount(groupId: string, at: string) {
  const { count, error } = await createDatabaseAdminClient().from('monthly_accesses')
    .select('purchase_id,purchases!inner(group_id)', { count: 'exact', head: true })
    .eq('purchases.group_id', groupId).eq('purchases.status', 'paid').lte('starts_at', at).gt('ends_at', at);
  if (error || count === null) throw new Error('No se pudo comprobar la disponibilidad.');
  return count;
}

export async function getPublicCatalog(): Promise<PublicWorkshop[]> {
  const { data, error } = await createDatabaseAdminClient().from('workshops')
    .select('id,slug,title,summary,category,workshop_groups(id,schedule_description,price_cents,capacity,created_at,sort_order)')
    .eq('is_published', true).eq('workshop_groups.is_published', true).order('created_at');
  if (error) throw new Error('No se pudo leer el catálogo público.');
  const at = new Date().toISOString();
  // Contrato público explícito: no propagar filas con spread, porque incluyen capacidad privada.
  return Promise.all(data.map(async (row) => ({
    id: row.id, slug: row.slug, title: row.title, summary: row.summary,
    category: row.category === 'individual' ? 'individual' as const : 'group' as const,
    groups: row.category === 'individual' ? [] : await Promise.all(row.workshop_groups
      .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)).map(async (group) => ({
        id: group.id, scheduleDescription: group.schedule_description,
        priceCents: group.price_cents, currency: 'PEN' as const,
        remainingSpots: Math.max(0, group.capacity - await activeAccessCount(group.id, at)),
      }))),
  })));
}
