import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

let db;

before(async () => {
  db = await PGlite.create();
  // Solo reproducimos roles y la FK de Auth. Esto no prueba login, JWT ni la API
  // de Supabase. Las migraciones sí se ejecutan sobre PostgreSQL, sin simular SQL.
  await db.exec(`
    create role anon;
    create role authenticated;
    create role service_role bypassrls;
    create schema auth;
    create table auth.users (id uuid primary key);
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public
      grant all on tables to anon, authenticated, service_role;
  `);

  const directory = new URL('../../supabase/migrations/', import.meta.url);
  const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();
  for (const file of files) {
    await db.exec(await readFile(new URL(file, directory), 'utf8'));
  }
});

after(async () => {
  await db?.close();
});

async function withRollback(run) {
  await db.exec('begin');
  try {
    await run();
  } finally {
    await db.exec('rollback');
  }
}

async function expectSqlError(sql, code, params = []) {
  // Un error aborta la transacción en PostgreSQL; el savepoint permite continuar
  // comprobando otros rechazos dentro de la misma prueba.
  await db.exec('savepoint expected_error');
  try {
    await assert.rejects(db.query(sql, params), { code });
  } finally {
    await db.exec('rollback to savepoint expected_error; release savepoint expected_error');
  }
}

async function createGroup() {
  const adminId = randomUUID();
  await db.query('insert into auth.users (id) values ($1)', [adminId]);
  await db.query('insert into public.admin_users (user_id) values ($1)', [adminId]);
  const { rows: workshops } = await db.query(`
    insert into public.workshops (slug, title, category)
    values ($1, 'Taller de prueba', 'group') returning id
  `, [`prueba-${randomUUID()}`]);
  const { rows: groups } = await db.query(`
    insert into public.workshop_groups (workshop_id, price_cents, capacity)
    values ($1, 12000, 10) returning id
  `, [workshops[0].id]);
  return { groupId: groups[0].id, adminId };
}

async function createPurchase(groupId, {
  purchasedAt = '2026-09-10T20:00:00Z',
  paymentReference = randomUUID(),
  origin = 'culqi',
  recordedBy = null,
} = {}) {
  const { rows } = await db.query(`
    insert into public.purchases (
      group_id, buyer_name, buyer_email, buyer_phone, amount_cents,
      origin, status, payment_reference, recorded_by, purchased_at
    ) values ($1, 'Persona de prueba', 'prueba@example.com', '+51999999999',
      12000, $2, $3, $4, $5, $6)
    returning id, reference_code, purchased_at
  `, [groupId, origin, purchasedAt ? 'paid' : 'pending', paymentReference, recordedBy, purchasedAt]);
  return rows[0];
}

async function createAccess(purchase) {
  const { rows } = await db.query(`
    insert into public.monthly_accesses (purchase_id, starts_at)
    values ($1, $2) returning starts_at, ends_at
  `, [purchase.id, purchase.purchased_at]);
  return rows[0];
}

const monthlyCases = [
  ['misma fecha y hora', '2026-09-10T20:00:00Z', '2026-10-10T20:00:00Z'],
  ['enero de 31 días a febrero', '2027-01-31T20:00:00Z', '2027-02-28T20:00:00Z'],
  ['febrero bisiesto', '2028-01-31T20:00:00Z', '2028-02-29T20:00:00Z'],
  ['compra el 29 de febrero', '2028-02-29T20:00:00Z', '2028-03-29T20:00:00Z'],
  ['cambio de año', '2026-12-31T20:00:00Z', '2027-01-31T20:00:00Z'],
  ['dos meses de 31 días', '2026-07-31T20:00:00Z', '2026-08-31T20:00:00Z'],
  ['mes de 30 a mes de 31 días', '2026-04-30T20:00:00Z', '2026-05-30T20:00:00Z'],
  // En Perú todavía es 30/01, 21:00. El mes termina 28/02, 21:00 = 01/03 UTC.
  ['fecha local distinta de UTC', '2027-01-31T02:00:00Z', '2027-03-01T02:00:00Z'],
];

for (const [name, startsAt, endsAt] of monthlyCases) {
  test(`acceso mensual: ${name}`, () => withRollback(async () => {
    // La regla usa Perú incluso si el servidor tiene otra zona configurada.
    await db.exec("set local timezone to 'Pacific/Auckland'");
    const { groupId } = await createGroup();
    const purchase = await createPurchase(groupId, { purchasedAt: startsAt });
    const access = await createAccess(purchase);
    assert.equal(access.starts_at.toISOString(), startsAt.replace('Z', '.000Z'));
    assert.equal(access.ends_at.toISOString(), endsAt.replace('Z', '.000Z'));
  }));
}

test('un pago pendiente no puede generar acceso', () => withRollback(async () => {
  const { groupId } = await createGroup();
  const purchase = await createPurchase(groupId, { purchasedAt: null });
  await expectSqlError(`
    insert into public.monthly_accesses (purchase_id, starts_at) values ($1, now())
  `, '23503', [purchase.id]);
}));

test('una compra no admite accesos duplicados ni fechas distintas del pago', () => withRollback(async () => {
  const { groupId } = await createGroup();
  const purchase = await createPurchase(groupId);
  await expectSqlError(`
    insert into public.monthly_accesses (purchase_id, starts_at)
    values ($1, '2026-09-11T20:00:00Z')
  `, '23503', [purchase.id]);
  await createAccess(purchase);
  await expectSqlError(`
    insert into public.monthly_accesses (purchase_id, starts_at) values ($1, $2)
  `, '23505', [purchase.id, purchase.purchased_at]);
  await expectSqlError(`
    update public.monthly_accesses set ends_at = '2026-12-10T20:00:00Z' where purchase_id = $1
  `, '428C9', [purchase.id]);
}));

test('venta manual conserva fecha real aunque se registre después', () => withRollback(async () => {
  const { groupId, adminId } = await createGroup();
  const purchase = await createPurchase(groupId, {
    origin: 'manual', recordedBy: adminId, purchasedAt: '2025-01-31T20:00:00Z',
  });
  const access = await createAccess(purchase);
  assert.equal(access.ends_at.toISOString(), '2025-02-28T20:00:00.000Z');
  await expectSqlError(`
    update public.purchases set recorded_by = null where id = $1
  `, '23514', [purchase.id]);
}));

test('un cargo Culqi no puede aparecer en dos compras', () => withRollback(async () => {
  const { groupId } = await createGroup();
  const purchase = await createPurchase(groupId);
  const other = await createPurchase(groupId);
  await expectSqlError(`
    update public.purchases set payment_reference = (
      select payment_reference from public.purchases where id = $1
    ) where id = $2
  `, '23505', [purchase.id, other.id]);
  await expectSqlError(`
    update public.purchases set payment_reference = null where id = $1
  `, '23514', [purchase.id]);
}));

test('editar precio del taller conserva importe de ventas anteriores', () => withRollback(async () => {
  const { groupId } = await createGroup();
  const purchase = await createPurchase(groupId);
  await db.query('update public.workshop_groups set price_cents = 15000 where id = $1', [groupId]);
  const { rows } = await db.query('select amount_cents, currency from public.purchases where id = $1', [purchase.id]);
  assert.deepEqual(rows[0], { amount_cents: 12000, currency: 'PEN' });
  await expectSqlError('update public.workshop_groups set capacity = 0 where id = $1', '23514', [groupId]);
  await expectSqlError("update public.purchases set currency = 'USD' where id = $1", '23514', [purchase.id]);
}));

test('coordinación por WhatsApp no cambia pago ni acceso', () => withRollback(async () => {
  const { groupId, adminId } = await createGroup();
  const purchase = await createPurchase(groupId);
  const access = await createAccess(purchase);
  await db.query(`
    update public.purchases set coordinated_at = '2026-09-11T20:00:00Z', coordinated_by = $2
    where id = $1
  `, [purchase.id, adminId]);
  const { rows } = await db.query(`
    select status, ends_at from public.purchases p
    join public.monthly_accesses a on a.purchase_id = p.id where p.id = $1
  `, [purchase.id]);
  assert.equal(rows[0].status, 'paid');
  assert.deepEqual(rows[0].ends_at, access.ends_at);
  const pending = await createPurchase(groupId, { purchasedAt: null });
  await expectSqlError(`
    update public.purchases set coordinated_at = now(), coordinated_by = $2 where id = $1
  `, '23514', [pending.id, adminId]);
}));

const tables = ['admin_users', 'workshops', 'workshop_groups', 'purchases', 'monthly_accesses'];

for (const role of ['anon', 'authenticated']) {
  test(`${role}: acceso directo bloqueado y sin autoasignación de administrador`, () => withRollback(async () => {
    const { groupId } = await createGroup();
    const purchase = await createPurchase(groupId);
    await createAccess(purchase);
    const userId = randomUUID();
    await db.query('insert into auth.users (id) values ($1)', [userId]);
    await db.exec(`set local role ${role}`);
    for (const table of tables) {
      await expectSqlError(`select * from public.${table}`, '42501');
    }
    await expectSqlError('insert into public.admin_users (user_id) values ($1)', '42501', [userId]);
    await expectSqlError("update public.purchases set status = 'paid'", '42501');
  }));

  test(`${role}: RLS sigue ocultando filas ante una concesión accidental de SELECT`, () => withRollback(async () => {
    const { groupId } = await createGroup();
    const purchase = await createPurchase(groupId);
    await createAccess(purchase);
    for (const table of tables) {
      await db.exec(`grant select on public.${table} to ${role}`);
    }
    await db.exec(`set local role ${role}`);
    for (const table of tables) {
      const { rows } = await db.query(`select * from public.${table}`);
      assert.equal(rows.length, 0, table);
    }
  }));
}

test('servidor puede leer y escribir ventas, pero no otorgar administradores ni borrar historial', () => withRollback(async () => {
  const { groupId } = await createGroup();
  await db.exec('set local role service_role');
  const purchase = await createPurchase(groupId);
  await createAccess(purchase);
  const { rows } = await db.query('select id from public.purchases');
  assert.equal(rows.length, 1);
  await expectSqlError('update public.admin_users set is_active = false', '42501');
  await expectSqlError('delete from public.purchases where id = $1', '42501', [purchase.id]);
}));

const catalogGroup = { scheduleDescription: 'Sábado 10:00', priceCents: 12050, capacity: 3, isPublished: true };
const catalogInput = { title: 'Regulación emocional', summary: 'Descripción', category: 'group', isPublished: false,
  groups: [catalogGroup] };
async function saveCatalog(input = catalogInput, id = null, slug = 'regulacion-emocional') {
  const { rows } = await db.query('select public.save_workshop_catalog($1, $2, $3) as result', [id, JSON.stringify(input), slug]);
  return rows[0].result;
}

test('catálogo: crear y editar juntos, conservar IDs, añadir y quitar horarios', () => withRollback(async () => {
  await db.exec('set local role service_role');
  const first = await saveCatalog();
  const groupId = first.groups[0].id;
  const updated = await saveCatalog({ ...catalogInput, title: 'Nuevo título', groups: [
    { ...catalogGroup, id: groupId, priceCents: 15000 }, { ...catalogGroup, scheduleDescription: 'Domingo 11:00' },
  ] }, first.workshop.id, 'nuevo-titulo');
  assert.equal(updated.workshop.slug, 'nuevo-titulo');
  assert.equal(updated.groups.length, 2);
  assert.equal(updated.groups[0].id, groupId);
  assert.equal(updated.groups[0].price_cents, 15000);
  const removed = await saveCatalog({ ...catalogInput, groups: [{ ...catalogGroup, id: groupId }] }, first.workshop.id);
  assert.equal(removed.groups.length, 1);
  await db.query('select public.delete_workshop_catalog($1)', [first.workshop.id]);
  assert.equal((await db.query('select id from public.workshops')).rows.length, 0);
  assert.equal((await db.query('select id from public.workshop_groups')).rows.length, 0);
}));

test('catálogo: títulos repetidos generan sufijos y el identificador no cambia en guardados sin renombrar', () => withRollback(async () => {
  const first = await saveCatalog();
  const second = await saveCatalog();
  assert.equal(first.workshop.slug, 'regulacion-emocional');
  assert.equal(second.workshop.slug, 'regulacion-emocional-2');
  const again = await saveCatalog({ ...catalogInput, groups: [{ ...catalogGroup, id: second.groups[0].id }] }, second.workshop.id);
  assert.equal(again.workshop.slug, second.workshop.slug);
  assert.equal(again.groups[0].id, second.groups[0].id);
}));

test('catálogo: un segundo horario inválido revierte toda la creación', () => withRollback(async () => {
  await expectSqlError('select public.save_workshop_catalog(null, $1, $2)', '23514', [
    JSON.stringify({ ...catalogInput, groups: [catalogGroup, { ...catalogGroup, capacity: 0 }] }), 'prueba',
  ]);
  assert.equal((await db.query('select id from public.workshops')).rows.length, 0);
  assert.equal((await db.query('select id from public.workshop_groups')).rows.length, 0);
}));

test('catálogo: grupo ajeno o repetido revierte edición y no mueve relaciones', () => withRollback(async () => {
  const first = await saveCatalog(); const other = await saveCatalog();
  for (const [groups, code] of [
    [[{ ...catalogGroup, id: other.groups[0].id }], 'PT404'],
    [[{ ...catalogGroup, id: first.groups[0].id }, { ...catalogGroup, id: first.groups[0].id }], 'PT400'],
  ]) await expectSqlError('select public.save_workshop_catalog($1, $2, $3)', code, [first.workshop.id,
    JSON.stringify({ ...catalogInput, title: 'No debe guardarse', groups }), 'no-debe-guardarse']);
  assert.equal((await db.query('select title from public.workshops where id = $1', [first.workshop.id])).rows[0].title, catalogInput.title);
  assert.equal((await db.query('select workshop_id from public.workshop_groups where id = $1', [other.groups[0].id])).rows[0].workshop_id, other.workshop.id);
}));

test('catálogo: compras bloquean eliminación y quitar horario; ningún cambio parcial', () => withRollback(async () => {
  const saved = await saveCatalog();
  await createPurchase(saved.groups[0].id, { purchasedAt: null });
  await db.exec('set local role service_role');
  await expectSqlError('select public.delete_workshop_catalog($1)', 'PT409', [saved.workshop.id]);
  await expectSqlError('select public.save_workshop_catalog($1, $2, $3)', 'PT409', [saved.workshop.id,
    JSON.stringify({ ...catalogInput, title: 'No guardar', groups: [] }), 'no-guardar']);
  assert.equal((await db.query('select title from public.workshops where id = $1', [saved.workshop.id])).rows[0].title, catalogInput.title);
  assert.equal((await db.query('select id from public.workshop_groups')).rows.length, 1);
  assert.equal((await db.query('select id from public.purchases')).rows.length, 1);
}));

test('catálogo: capacidad inferior a accesos vigentes revierte título y precio', () => withRollback(async () => {
  const saved = await saveCatalog();
  const now = new Date(Date.now() - 86400000).toISOString();
  await createAccess(await createPurchase(saved.groups[0].id, { purchasedAt: now }));
  await createAccess(await createPurchase(saved.groups[0].id, { purchasedAt: now }));
  await expectSqlError('select public.save_workshop_catalog($1, $2, $3)', 'PT409', [saved.workshop.id,
    JSON.stringify({ ...catalogInput, title: 'No guardar', groups: [{ ...catalogGroup, id: saved.groups[0].id, capacity: 1 }] }), 'no-guardar']);
}));

for (const role of ['anon', 'authenticated']) test(`${role}: no ejecuta funciones privadas del catálogo`, () => withRollback(async () => {
  await db.exec(`set local role ${role}`);
  await expectSqlError('select public.save_workshop_catalog(null, $1, $2)', '42501', [JSON.stringify(catalogInput), 'prueba']);
  await expectSqlError('select public.delete_workshop_catalog($1)', '42501', [randomUUID()]);
}));
