import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Pruebas HTTP contra Next en ejecución. Por defecto no escriben datos ni envían
// correos. La cobertura autenticada exige identidades temporales de prueba.
const origin = process.env.AUTH_TEST_ORIGIN ?? 'http://localhost:3000';
const fixturePath = process.env.AUTH_TEST_FIXTURES;
const fixtures = fixturePath ? JSON.parse(readFileSync(fixturePath, 'utf8')) : null;

function session() {
  const jar = new Map();
  return async (path, body, options = {}) => {
    const response = await fetch(`${origin}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      redirect: 'manual',
      headers: {
        Origin: origin,
        'Content-Type': 'application/json',
        Cookie: [...jar].map(([name, value]) => `${name}=${value}`).join('; '),
        ...options.headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of response.headers.getSetCookie()) {
      const [pair] = cookie.split(';');
      const index = pair.indexOf('=');
      const name = pair.slice(0, index);
      const value = pair.slice(index + 1);
      if (!value || /Max-Age=0/i.test(cookie)) jar.delete(name);
      else jar.set(name, value);
    }
    return response;
  };
}

test('páginas privadas redirigen sin sesión y no se comparten en caché', async () => {
  for (const path of ['/admin', '/admin/password']) {
    const response = await session()(path);
    assert.equal(response.status, 307);
    assert.ok(response.headers.get('location')?.endsWith('/admin/login'));
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
});

test('API privada rechaza visitantes y cookies inventadas', async () => {
  const response = await session()('/api/admin/session');
  assert.equal(response.status, 401);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const forged = await session()('/api/admin/session', undefined, {
    headers: { Cookie: 'sb-vabbjwjfwcypweucfjhx-auth-token=base64-eyJ1c2VyIjp7ImlkIjoiYWRtaW4ifX0' },
  });
  assert.equal(forged.status, 401);
});

test('CSRF: bloquear origen externo, ausente y subdominio falso', async () => {
  for (const Origin of ['https://example.com', '', `${origin}.evil.example`]) {
    const response = await session()('/api/auth/logout', {}, { headers: { Origin } });
    assert.equal(response.status, 403);
  }
});

test('validar tipo de contenido, cuerpo y acceso a cambio de contraseña', async () => {
  const plain = await session()('/api/auth/login', {}, { headers: { 'Content-Type': 'text/plain' } });
  assert.equal(plain.status, 415);
  assert.equal((await session()('/api/auth/login', [])).status, 400);
  assert.equal((await session()('/api/auth/login', { email: 'inválido', password: 'x' })).status, 400);
  assert.equal((await session()('/api/auth/login', { email: 'x'.repeat(17000) })).status, 413);
  assert.equal((await session()('/api/auth/password', { password: 'password-is-not-authority' })).status, 401);
});

test('enlace inventado no concede acceso', async () => {
  const client = session();
  assert.equal((await client('/api/auth/confirm', { tokenHash: 'invalid', type: 'invite' })).status, 401);
  assert.equal((await client('/api/admin/session')).status, 401);
});

test('invitación, contraseña, login y logout con administrador temporal', { skip: !fixtures }, async () => {
  const client = session();
  const confirmed = await client('/api/auth/confirm', { tokenHash: fixtures.admin.tokenHash, type: fixtures.admin.type ?? 'invite' });
  assert.equal(confirmed.status, 200);
  const cookies = confirmed.headers.getSetCookie();
  assert.ok(cookies.length > 0);
  assert.ok(cookies.every((cookie) => /httponly/i.test(cookie) && /samesite=lax/i.test(cookie)));
  assert.match(confirmed.headers.get('cache-control'), /no-store/);
  const identity = await client('/api/admin/session');
  assert.equal(identity.status, 200);
  assert.equal((await identity.json()).id, fixtures.admin.id);
  assert.equal((await client('/admin')).status, 200);
  assert.equal((await client('/admin/password')).status, 200);
  assert.equal((await client('/api/auth/password', { password: 'short' })).status, 400);
  assert.equal((await client('/api/auth/password', { password: fixtures.admin.password })).status, 200);
  assert.equal((await client('/api/auth/logout', {})).status, 200);
  assert.equal((await client('/api/admin/session')).status, 401);
  assert.equal((await client('/api/auth/login', { email: fixtures.admin.email, password: fixtures.admin.password })).status, 200);
  assert.equal((await client('/api/admin/session')).status, 200);
  assert.equal((await client('/api/auth/logout', {})).status, 200);
  // El enlace es de un solo uso.
  assert.equal((await client('/api/auth/confirm', { tokenHash: fixtures.admin.tokenHash, type: fixtures.admin.type ?? 'invite' })).status, 401);
});

test('usuario autenticado sin permiso queda fuera aunque edite user_metadata', { skip: !fixtures }, async () => {
  const client = session();
  const response = await client('/api/auth/login', {
    email: fixtures.outsider.email, password: fixtures.outsider.password,
  });
  assert.equal(response.status, 403);
  assert.equal((await client('/api/admin/session')).status, 401);
  assert.equal((await client('/admin')).status, 307);
});
