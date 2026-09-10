import test from 'node:test';
import assert from 'node:assert/strict';

// Estas pruebas no modifican la configuración ni necesitan una cuenta.
const origin = process.env.CONTACT_TEST_ORIGIN ?? 'http://localhost:3000';

test('datos de consulta: respuesta pública explícita y enlaces seguros', async () => {
  const response = await fetch(`${origin}/api/contact-settings`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const data = await response.json();
  assert.deepEqual(Object.keys(data).sort(), [
    'title', 'address', 'addressNote', 'phone', 'phoneNote', 'email', 'hours', 'hoursNote',
    'whatsappPhone', 'whatsappMessage', 'whatsappLabel', 'phoneHref', 'emailHref', 'whatsappHref',
  ].sort());
  assert.match(data.phoneHref, /^tel:\+[1-9][0-9]{6,14}$/);
  assert.equal(decodeURIComponent(data.emailHref.slice(7)), data.email);
  assert.ok(data.emailHref.startsWith('mailto:'));
  const whatsapp = new URL(data.whatsappHref);
  assert.equal(whatsapp.origin, 'https://wa.me');
  assert.equal(whatsapp.pathname, `/${data.whatsappPhone}`);
  assert.equal(whatsapp.searchParams.get('text') ?? '', data.whatsappMessage);
});

test('datos de consulta: visitante sin acceso privado y origen ajeno rechazado', async () => {
  const page = await fetch(`${origin}/admin/contact`, { redirect: 'manual' });
  assert.equal(page.status, 307);
  assert.ok(page.headers.get('location').endsWith('/admin/login'));
  for (const method of ['GET', 'PUT']) {
    const response = await fetch(`${origin}/api/admin/contact-settings`, { method,
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: 'sb-fake-auth-token=fake' },
      body: method === 'GET' ? undefined : '{}' });
    assert.equal(response.status, 401);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  const foreign = await fetch(`${origin}/api/admin/contact-settings`, { method: 'PUT',
    headers: { Origin: 'https://example.com', 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(foreign.status, 403);
});
