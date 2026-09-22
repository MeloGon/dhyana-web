import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Solo lectura y solicitudes rechazadas: no usa cuentas ni escribe hojas reales.
const origin = process.env.COMPLAINT_BOOK_TEST_ORIGIN ?? 'http://localhost:3000';

test('libro de reclamaciones: configuración pública sin caché y sin correo interno', async () => {
  const response = await fetch(`${origin}/api/complaint-book`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const settings = await response.json();
  assert.deepEqual(Object.keys(settings).sort(), ['domicilio', 'razonSocial', 'ruc', 'textoAvisoOtrasVias', 'textoPlazoRespuesta']);
  assert.equal(typeof settings.ruc, 'string');
});

test('libro de reclamaciones: enviar una hoja exige Origin válido y datos completos', async () => {
  const foreign = await fetch(`${origin}/api/complaint-book`, { method: 'POST',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(foreign.status, 403);

  const incomplete = await fetch(`${origin}/api/complaint-book`, { method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(incomplete.status, 400);
  const body = await incomplete.json();
  assert.equal(typeof body.message, 'string');
});

test('libro de reclamaciones: panel y mutaciones rechazan visitantes, cookies falsas y otro origen', async () => {
  for (const path of ['/admin/complaint-book', '/admin/complaint-book/settings']) {
    const page = await fetch(`${origin}${path}`, { redirect: 'manual' });
    assert.equal(page.status, 307);
    assert.ok(page.headers.get('location').endsWith('/admin/login'));
  }

  const id = randomUUID();
  const fakeCookie = { Cookie: 'sb-fake-auth-token=fake' };
  for (const [path, method] of [
    ['/api/admin/complaint-book', 'GET'],
    [`/api/admin/complaint-book/${id}`, 'GET'],
    [`/api/admin/complaint-book/${id}`, 'PATCH'],
    [`/api/admin/complaint-book/${id}/evidence`, 'POST'],
    ['/api/admin/complaint-book/export', 'GET'],
    ['/api/admin/complaint-book-settings', 'GET'],
    ['/api/admin/complaint-book-settings', 'PUT'],
  ]) {
    const response = await fetch(origin + path, { method,
      headers: { Origin: origin, 'Content-Type': 'application/json', ...fakeCookie },
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
