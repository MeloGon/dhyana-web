import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const origin = process.env.SALES_TEST_ORIGIN ?? 'http://localhost:3000';
test('ventas: visitante sin acceso a participantes, registro, coordinación, anulación ni borrado', async () => {
  for (const [path, method] of [['/api/admin/sales', 'GET'], ['/api/admin/sales', 'POST'],
    [`/api/admin/sales/${randomUUID()}/coordination`, 'PATCH'], [`/api/admin/sales/${randomUUID()}/cancel`, 'POST'], [`/api/admin/sales/${randomUUID()}`, 'DELETE']]) {
    const response = await fetch(origin + path, { method, headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : '{}' });
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
    assert.deepEqual(Object.keys(await response.json()), ['message']);
  }
});
test('ventas: mutaciones rechazan origen externo antes de procesar datos', async () => {
  for (const [path, method] of [['/api/admin/sales', 'POST'], [`/api/admin/sales/${randomUUID()}/coordination`, 'PATCH'], [`/api/admin/sales/${randomUUID()}/cancel`, 'POST'], [`/api/admin/sales/${randomUUID()}`, 'DELETE']]) {
    const response = await fetch(origin + path, { method, headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: '{}' });
    assert.equal(response.status, 403);
  }
});
