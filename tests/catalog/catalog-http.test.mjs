import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

// Sin fixture: solo pruebas de visitantes. Con fixture: usar exclusivamente
// dos identidades temporales y limpiar los IDs registrados al terminar.
const origin = process.env.CATALOG_TEST_ORIGIN ?? 'http://localhost:3000';
const fixturePath = process.env.CATALOG_TEST_FIXTURES;
const fixture = fixturePath ? JSON.parse(readFileSync(fixturePath, 'utf8')) : null;

function createSession() {
  const jar = new Map();
  return async (path, method = 'GET', body, headers = {}) => {
    const response = await fetch(origin + path, { method, redirect: 'manual',
      headers: { Origin: origin, 'Content-Type': 'application/json',
        Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; '), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body) });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';'); const index = pair.indexOf('=');
      if (/Max-Age=0/i.test(cookie)) jar.delete(pair.slice(0, index));
      else jar.set(pair.slice(0, index), pair.slice(index + 1));
    }
    return response;
  };
}

test('visitantes no pueden leer ni modificar catálogo privado', async () => {
  const request = createSession(); const id = randomUUID();
  for (const [path, method] of [
    ['/api/admin/workshops', 'GET'], ['/api/admin/workshops', 'POST'],
    [`/api/admin/workshops/${id}`, 'PUT'], [`/api/admin/workshops/${id}`, 'DELETE'],
  ]) assert.equal((await request(path, method, method === 'GET' ? undefined : {})).status, 401);
  assert.equal((await request('/api/admin/workshops', 'POST', {}, { Origin: 'https://example.com' })).status, 403);
  const publicResponse = await request('/api/workshops');
  assert.equal(publicResponse.status, 200);
  assert.match(publicResponse.headers.get('cache-control'), /no-store/);
});

test('catálogo completo: persistencia, privacidad, publicación y ocupación', { skip: !fixture }, async (t) => {
  process.loadEnvFile('.env.local');
  const database = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } });
  const request = createSession();
  const artifacts = { workshopIds: [], groupIds: [], purchaseIds: [] };
  const record = () => writeFileSync(fixturePath + '.rows', JSON.stringify(artifacts), { mode: 0o600 });
  const input = { title: `Prueba temporal de catálogo ${randomUUID()}`,
    summary: 'Descripción temporal para verificar publicación.', category: 'group', isPublished: false };
  const groupInput = { scheduleDescription: 'Sábado 10:00, hora de Perú', priceCents: 12050, capacity: 3, isPublished: true };
  let workshop, group;
  const save = (changes = {}, groups = [{ ...groupInput, id: group.id }]) => request(`/api/admin/workshops/${workshop.id}`, 'PUT', { ...input, isPublished: true, ...changes, groups });
  const publicItem = async () => (await (await request('/api/workshops')).json()).find((item) => item.id === workshop.id);

  await t.test('login y creación de taller/grupo', async () => {
    assert.equal((await request('/api/auth/login', 'POST', fixture.admin)).status, 200);
    const response = await request('/api/admin/workshops', 'POST', { ...input, groups: [groupInput] });
    assert.equal(response.status, 201); workshop = await response.json();
    artifacts.workshopIds.push(workshop.id); record();
    group = workshop.groups[0];
    artifacts.groupIds.push(group.id); record();
    assert.match(workshop.slug, /^prueba-temporal-de-catalogo-/);
    const catalog = await (await request('/api/admin/workshops')).json();
    assert.equal(catalog.find((item) => item.id === workshop.id).groups[0].capacity, 3);
    assert.equal(await publicItem(), undefined);
  });
  if (!workshop || !group) return;

  await t.test('publicar, ocultar horarios y no filtrar capacidad privada', async () => {
    assert.equal((await save()).status, 200);
    const item = await publicItem();
    assert.equal(item.groups.length, 1);
    assert.deepEqual(Object.keys(item).sort(), ['category', 'groups', 'id', 'slug', 'summary', 'title']);
    assert.deepEqual(Object.keys(item.groups[0]).sort(), ['currency', 'id', 'priceCents', 'remainingSpots', 'scheduleDescription']);
    assert.equal(item.groups[0].remainingSpots, 3);
    assert.equal(item.groups[0].priceCents, 12050);
    const updated = await save({}, [{ ...groupInput, id: group.id, priceCents: 13000, isPublished: false }]);
    assert.equal(updated.status, 200); assert.deepEqual((await publicItem()).groups, []);
    await save({}, [{ ...groupInput, id: group.id, priceCents: 13000 }]);
    assert.equal((await publicItem()).groups[0].priceCents, 13000);
  });

  await t.test('validación, relaciones ajenas y eliminación de taller sin compras', async () => {
    for (const invalid of [{ priceCents: 1.5 }, { capacity: 0 }, { scheduleDescription: ' ' }]) {
      assert.equal((await save({}, [{ ...groupInput, ...invalid }])).status, 400);
    }
    assert.equal((await request('/api/admin/workshops/invalid', 'PUT', { ...input, groups: [] })).status, 400);
    const other = await (await request('/api/admin/workshops', 'POST', { ...input, groups: [] })).json();
    artifacts.workshopIds.push(other.id); record();
    assert.equal(other.slug, workshop.slug + '-2');
    assert.equal((await request(`/api/admin/workshops/${other.id}`, 'PUT', { ...input, groups: [{ ...groupInput, id: group.id }] })).status, 404);
    assert.equal((await publicItem()).groups[0].id, group.id);
    assert.equal((await request(`/api/admin/workshops/${other.id}`, 'DELETE', {})).status, 200);
    assert.equal((await request(`/api/admin/workshops/${other.id}`, 'DELETE', {})).status, 404);
  });

  await t.test('editar título y agregar, editar y quitar horarios en guardados consecutivos', async () => {
    let response = await save({ title: input.title + ' editado' }, [{ ...groupInput, id: group.id }, groupInput]);
    assert.equal(response.status, 200);
    const saved = await response.json();
    const added = saved.groups[1]; artifacts.groupIds.push(added.id); record();
    assert.equal(saved.groups[0].id, group.id);
    assert.match(saved.slug, /-editado$/);
    response = await save({}, [{ ...groupInput, id: group.id }, { ...groupInput, id: added.id, priceCents: 18000 }]);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).groups[1].priceCents, 18000);
    response = await save();
    assert.equal((await response.json()).groups.length, 1);
  });

  await t.test('cupos cuentan solo accesos vigentes y no permiten reducir capacidad por debajo', async () => {
    for (const days of [-1, -2, -90, 60]) {
      const purchasedAt = new Date(Date.now() + days * 86400000).toISOString();
      const { data: purchase, error } = await database.from('purchases').insert({ group_id: group.id,
        buyer_name: 'Prueba de catálogo', buyer_email: 'catalog-test@example.com', buyer_phone: '000000000',
        amount_cents: 12050, currency: 'PEN', origin: 'culqi', status: 'paid', payment_reference: randomUUID(), purchased_at: purchasedAt }).select('id').single();
      assert.ok(!error, 'Compra temporal insertada'); artifacts.purchaseIds.push(purchase.id); record();
      const access = await database.from('monthly_accesses').insert({ purchase_id: purchase.id, starts_at: purchasedAt });
      assert.ok(!access.error, 'Acceso temporal insertado');
    }
    assert.equal((await publicItem()).groups[0].remainingSpots, 1);
    assert.equal((await save({}, [{ ...groupInput, id: group.id, capacity: 1 }])).status, 409);
    assert.equal((await save({}, [{ ...groupInput, id: group.id, capacity: 2 }])).status, 200);
    assert.equal((await publicItem()).groups[0].remainingSpots, 0);
    assert.equal((await request(`/api/admin/workshops/${workshop.id}`, 'DELETE', {})).status, 409);
    assert.equal((await save({}, [])).status, 409);
  });

  await t.test('individual sin horarios públicos; despublicar taller lo retira', async () => {
    await save({ category: 'individual' });
    assert.equal((await publicItem()).category, 'individual');
    assert.deepEqual((await publicItem()).groups, []);
    await save({ isPublished: false });
    assert.equal(await publicItem(), undefined);
  });

  await t.test('usuario sin permiso no modifica talleres existentes', async () => {
    const outsider = createSession();
    assert.equal((await outsider('/api/auth/login', 'POST', fixture.outsider)).status, 403);
    assert.equal((await outsider(`/api/admin/workshops/${workshop.id}`, 'PUT', input)).status, 401);
    assert.equal((await request('/api/auth/logout', 'POST', {})).status, 200);
  });
});
