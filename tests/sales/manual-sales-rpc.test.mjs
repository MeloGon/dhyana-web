import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

// Opt-in: crea únicamente talleres y ventas artificiales. Conserva todos los IDs
// para limpieza por SQL privilegiado, porque service_role no puede borrar ventas.
const adminId = process.env.SALES_RPC_TEST_ADMIN_ID;
const artifactsPath = process.env.SALES_RPC_TEST_ARTIFACTS;

test('Supabase real: concurrencia de cupos, reintentos y edición de capacidad', { skip: !adminId || !artifactsPath }, async (t) => {
  process.loadEnvFile('.env.local');
  const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const artifacts = { workshopIds: [], groupIds: [] };
  const record = () => writeFileSync(artifactsPath, JSON.stringify(artifacts), { mode: 0o600 });
  record();
  async function fixture(capacity) {
    const { data, error } = await db.rpc('save_workshop_catalog', { p_workshop_id: null, p_slug: `sales-test-${randomUUID()}`,
      p_workshop: { title: 'Prueba temporal de ventas', summary: 'Fixture temporal de concurrencia', category: 'group', isPublished: false,
        groups: [{ scheduleDescription: 'Horario temporal', priceCents: 12000, capacity, isPublished: false }] } });
    assert.equal(error, null);
    artifacts.workshopIds.push(data.workshop.id); artifacts.groupIds.push(data.groups[0].id); record();
    return data;
  }
  const input = (groupId) => ({ requestId: randomUUID(), groupId, buyerName: 'Prueba técnica temporal', buyerEmail: 'sales-test@example.com',
    buyerPhone: '+51999999999', amountCents: 12000, purchasedAt: new Date(Date.now() - 60000).toISOString(),
    paymentMethod: 'yape', paymentReference: '', paymentVerified: true });
  const sale = (body) => db.rpc('register_manual_sale', { p_admin_id: adminId, p_input: body });

  await t.test('dos ventas disputan un cupo: solo una compra y un acceso', async () => {
    const f = await fixture(1);
    const results = await Promise.all([sale(input(f.groups[0].id)), sale(input(f.groups[0].id))]);
    assert.equal(results.filter((result) => !result.error).length, 1);
    assert.equal(results.find((result) => result.error)?.error.code, 'PT409');
    const rows = await db.from('purchases').select('id,monthly_accesses(purchase_id)').eq('group_id', f.groups[0].id);
    assert.equal(rows.error, null); assert.equal(rows.data.length, 1); assert.ok(rows.data[0].monthly_accesses);
  });
  await t.test('reintentos simultáneos devuelven la misma venta incluso con cupo lleno', async () => {
    const f = await fixture(1); const body = input(f.groups[0].id);
    const results = await Promise.all([sale(body), sale(body), sale(body)]);
    assert.ok(results.every((result) => !result.error));
    assert.equal(new Set(results.map((result) => result.data)).size, 1);
  });
  await t.test('reducir capacidad y registrar venta simultáneamente no deja sobrecupo', async () => {
    const f = await fixture(2);
    assert.equal((await sale(input(f.groups[0].id))).error, null);
    const edit = { title: f.workshop.title, summary: f.workshop.summary, category: 'group', isPublished: false,
      groups: [{ id: f.groups[0].id, scheduleDescription: 'Horario temporal', priceCents: 12000, capacity: 1, isPublished: false }] };
    const results = await Promise.all([sale(input(f.groups[0].id)), db.rpc('save_workshop_catalog', {
      p_workshop_id: f.workshop.id, p_slug: f.workshop.slug, p_workshop: edit })]);
    assert.equal(results.filter((result) => !result.error).length, 1);
    assert.equal(results.find((result) => result.error)?.error.code, 'PT409');
    const group = await db.from('workshop_groups').select('capacity').eq('id', f.groups[0].id).single();
    const count = await db.from('purchases').select('id', { count: 'exact', head: true }).eq('group_id', f.groups[0].id);
    assert.ok(count.count <= group.data.capacity);
  });
});
