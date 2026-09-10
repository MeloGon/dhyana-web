import test from 'node:test';
import assert from 'node:assert/strict';

const origin = process.env.QUOTES_TEST_ORIGIN ?? 'http://localhost:3000';

test('citas: respuesta pública explícita y sin caché', async () => {
  const response = await fetch(`${origin}/api/quotes`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  const data = await response.json();
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 4);
  assert.deepEqual(Object.keys(data[0]).sort(), [
    'accentNote', 'author', 'id', 'quote', 'role', 'sortOrder', 'variant',
  ].sort());
});

test('citas: panel y mutaciones rechazan visitantes, cookies falsas y otro origen', async () => {
  const page = await fetch(`${origin}/admin/quotes`, { redirect: 'manual' });
  assert.equal(page.status, 307);
  assert.ok(page.headers.get('location')?.endsWith('/admin/login'));

  for (const method of ['GET', 'POST']) {
    const response = await fetch(`${origin}/api/admin/quotes`, {
      method,
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: 'sb-fake-auth-token=fake' },
      body: method === 'POST' ? '{}' : undefined,
    });
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  }

  const foreign = await fetch(`${origin}/api/admin/quotes`, {
    method: 'POST',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(foreign.status, 403);
});
