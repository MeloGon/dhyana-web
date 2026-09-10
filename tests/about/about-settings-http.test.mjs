import test from 'node:test';
import assert from 'node:assert/strict';

// Estas pruebas no modifican la configuración ni necesitan una cuenta.
const origin = process.env.ABOUT_TEST_ORIGIN ?? 'http://localhost:3000';

test('sobre nosotros: respuesta pública explícita y campos completos', async () => {
  const response = await fetch(`${origin}/api/about-settings`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), [
    'badge', 'heading', 'introduction',
    'profileName', 'profileTitle', 'profileImageUrl', 'profileImageAlt',
    'credential1', 'credential2', 'credential3',
    'quote', 'approachTitle', 'approachParagraph1', 'approachParagraph2',
    'pillar1Title', 'pillar1Description',
    'pillar2Title', 'pillar2Description',
    'pillar3Title', 'pillar3Description',
    'pillar4Title', 'pillar4Description',
  ].sort());
  assert.equal(data.badge, 'Sobre el Terapeuta');
  assert.equal(data.profileName, 'Lic. Alejandro Morales');
  assert.ok(data.profileImageUrl.startsWith('http'));
});

test('sobre nosotros: visitante sin acceso privado y origen ajeno rechazado', async () => {
  const page = await fetch(`${origin}/admin/about`, { redirect: 'manual' });
  assert.equal(page.status, 307);
  assert.ok(page.headers.get('location').endsWith('/admin/login'));
  for (const method of ['GET', 'PUT']) {
    const response = await fetch(`${origin}/api/admin/about-settings`, {
      method,
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: 'sb-fake-auth-token=fake' },
      body: method === 'GET' ? undefined : '{}',
    });
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  const foreign = await fetch(`${origin}/api/admin/about-settings`, {
    method: 'PUT',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(foreign.status, 403);
});
