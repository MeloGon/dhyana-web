import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Solo lectura y solicitudes rechazadas: no usa cuentas ni modifica contenido.
const origin = process.env.FAQS_TEST_ORIGIN ?? 'http://localhost:3000';

test('preguntas: lectura pública explícita y sin caché', async () => {
  const response = await fetch(`${origin}/api/faqs`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const faqs = await response.json();
  assert.ok(Array.isArray(faqs));
  for (const faq of faqs) {
    assert.deepEqual(Object.keys(faq).sort(), ['answer', 'id', 'question']);
    assert.equal(typeof faq.question, 'string');
    assert.equal(typeof faq.answer, 'string');
  }
});

test('preguntas: panel y mutaciones rechazan visitantes, cookies falsas y otro origen', async () => {
  const page = await fetch(`${origin}/admin/faqs`, { redirect: 'manual' });
  assert.equal(page.status, 307);
  assert.ok(page.headers.get('location').endsWith('/admin/login'));
  const id = randomUUID();
  for (const [path, method] of [
    ['/api/admin/faqs', 'GET'], ['/api/admin/faqs', 'POST'],
    [`/api/admin/faqs/${id}`, 'PUT'], [`/api/admin/faqs/${id}`, 'DELETE'],
  ]) {
    const response = await fetch(origin + path, { method,
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: 'sb-fake-auth-token=fake' },
      body: method === 'GET' ? undefined : '{}' });
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
    if (method !== 'GET') {
      const foreign = await fetch(origin + path, { method,
        headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(foreign.status, 403);
    }
  }
});
