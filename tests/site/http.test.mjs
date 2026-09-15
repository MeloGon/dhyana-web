import test from 'node:test';
import assert from 'node:assert/strict';
const origin = process.env.SITE_TEST_ORIGIN ?? 'http://localhost:3000';

test('sitio: lectura pública, formatos explícitos y sin caché', async () => {
  const response = await fetch(`${origin}/api/site-settings`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), ['logoUrl', 'services', 'settings', 'videoUrl']);
  assert.equal(typeof data.settings.texts.brandTitle, 'string');
  assert.ok(data.services.every((service) => service.isPublished));
});

test('sitio: panel, edición y subidas exigen administrador; rechazan Origin ajeno', async () => {
  for (const page of ['/admin/site', '/admin/services']) {
    const response = await fetch(origin + page, { redirect: 'manual' });
    assert.equal(response.status, 307);
    assert.ok(response.headers.get('location').endsWith('/admin/login'));
  }
  const get = await fetch(`${origin}/api/admin/site-settings`);
  assert.equal(get.status, 401);
  for (const [path, method] of [['site-settings', 'PUT'], ['services', 'PUT'], ['site-media/logo', 'POST'], ['site-media/video', 'POST']]) {
    for (const [requestOrigin, expected] of [[origin, 401], ['https://example.com', 403]]) {
      const response = await fetch(`${origin}/api/admin/${path}`, { method, headers: { Origin: requestOrigin, 'Content-Type': 'application/json', Cookie: 'sb-fake-auth-token=fake' }, body: '{}' });
      assert.equal(response.status, expected, `${path}: ${requestOrigin}`);
      assert.match(response.headers.get('cache-control'), /no-store/);
    }
  }
});
