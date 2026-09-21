import test from 'node:test';
import assert from 'node:assert/strict';

// Estas pruebas no modifican la configuración ni necesitan una cuenta.
const origin = process.env.LEGAL_TEST_ORIGIN ?? 'http://localhost:3000';

test('términos y políticas: respuesta pública explícita', async () => {
  const response = await fetch(`${origin}/api/legal-settings`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), [
    'termsTitle', 'termsBody', 'privacyTitle', 'privacyBody', 'returnsTitle', 'returnsBody',
  ].sort());
  assert.equal(typeof data.termsBody, 'string');
  assert.ok(data.termsBody.length > 0);
});

test('legal: página pública responde', async () => {
  const response = await fetch(`${origin}/legal`);
  assert.equal(response.status, 200);
});

test('términos y políticas: visitante sin acceso privado y origen ajeno rechazado', async () => {
  const page = await fetch(`${origin}/admin/legal`, { redirect: 'manual' });
  assert.equal(page.status, 307);
  assert.ok(page.headers.get('location').endsWith('/admin/login'));
  for (const method of ['GET', 'PUT']) {
    const response = await fetch(`${origin}/api/admin/legal-settings`, { method,
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: 'sb-fake-auth-token=fake' },
      body: method === 'GET' ? undefined : '{}' });
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  const foreign = await fetch(`${origin}/api/admin/legal-settings`, { method: 'PUT',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(foreign.status, 403);
});
