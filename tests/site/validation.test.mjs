import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import ts from 'typescript';

// Carga validadores puros con los alias de TypeScript, sin arrancar Next ni Auth.
const require = createRequire(import.meta.url);
const root = new URL('../../', import.meta.url);
function moduleUrl(path) {
  const source = ts.transpileModule(readFileSync(new URL(path, root), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
    .replace(/import ['"]server-only['"];?/g, '')
    .replace(/from ['"]([^'"]+)['"]/g, (_, name) => `from ${JSON.stringify(name.startsWith('@/') ? moduleUrl(`${name.slice(2)}.ts`) : pathToFileURL(require.resolve(name)).href)}`);
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}
const { parseSiteSettings, parseSiteServices, parseAssetPath, parseFloatingSocial } = await import(moduleUrl('lib/server/site-validation.ts'));
const { validateLogoSvg } = await import(moduleUrl('lib/server/svg-validation.ts'));
const { visibleSiteLinks } = await import(moduleUrl('lib/site-navigation.ts'));
const { SITE_TEXT_FIELDS, SITE_VISIBILITY_FIELDS, DEFAULT_SECTION_ORDER, DEFAULT_FLOATING_SOCIAL } = await import(moduleUrl('lib/data/site-fields.ts'));
const settings = () => ({ texts: Object.fromEntries(Object.keys(SITE_TEXT_FIELDS).map((key) => [key, 'Texto válido'])), visibility: Object.fromEntries(Object.keys(SITE_VISIBILITY_FIELDS).map((key) => [key, true])), sectionOrder: [...DEFAULT_SECTION_ORDER], logoPath: '', videoPath: '', floatingSocial: { ...DEFAULT_FLOATING_SOCIAL } });
const service = () => ({ id: 'test-service', title: 'Servicio', description: 'Descripción', benefits: ['Beneficio'], duration: '50 min', modality: 'Online', badge: '', icon: 'user', isPublished: false });

test('configuración: valida todos los campos y no acepta rutas arbitrarias', () => {
  assert.deepEqual(parseSiteSettings(settings()), settings());
  const customOrder = ['contacto', 'opiniones', 'talleres', 'servicios', 'sobre-nosotros', 'inicio'];
  assert.deepEqual(parseSiteSettings({ ...settings(), sectionOrder: customOrder }).sectionOrder, customOrder);
  for (const input of [
    null, {}, { ...settings(), visibility: {} },
    { ...settings(), logoPath: 'https://example.com/logo.svg' },
    { ...settings(), texts: { ...settings().texts, heroTitle: '' } },
    { ...settings(), sectionOrder: ['inicio', 'servicios'] },
    { ...settings(), sectionOrder: ['inicio', 'servicios', 'talleres', 'opiniones', 'sobre-nosotros', 'inicio'] },
    { ...settings(), sectionOrder: ['inicio', 'servicios', 'talleres', 'opiniones', 'sobre-nosotros', 'invalid'] },
  ]) assert.throws(() => parseSiteSettings(input));
  assert.equal(parseAssetPath('video/12345678-1234-4123-8123-123456789abc.mp4', 'video'), 'video/12345678-1234-4123-8123-123456789abc.mp4');
  for (const path of ['../secret', 'logo/12345678-1234-4123-8123-123456789abc.svg', 'video/12345678-1234-4123-8123-123456789abc.html']) assert.throws(() => parseAssetPath(path, 'video'));
});

test('servicios: mantiene orden y borradores; rechaza iconos, IDs y tamaños inválidos', () => {
  assert.deepEqual(parseSiteServices([service()]), [service()]);
  assert.deepEqual(parseSiteServices([]), []);
  for (const input of [[service(), service()], [{ ...service(), icon: 'script' }], [{ ...service(), isPublished: 'true' }], [{ ...service(), benefits: [''] }], [{ ...service(), title: 'x'.repeat(151) }], Array.from({ length: 25 }, (_, i) => ({ ...service(), id: `test-${i}` }))]) assert.throws(() => parseSiteServices(input));
});

test('visibilidad: retira secciones y enlaces; contacto requiere algún bloque visible', () => {
  const input = settings();
  assert.deepEqual(visibleSiteLinks(input).map((link) => link.id), ['inicio', 'servicios', 'talleres', 'opiniones', 'sobre-nosotros', 'contacto']);
  // Orden personalizado se refleja en visibleSiteLinks
  const inverted = { ...input, sectionOrder: ['contacto', 'sobre-nosotros', 'opiniones', 'talleres', 'servicios', 'inicio'] };
  assert.deepEqual(visibleSiteLinks(inverted).map((link) => link.id), ['contacto', 'sobre-nosotros', 'opiniones', 'talleres', 'servicios', 'inicio']);
  input.visibility.opiniones = false;
  input.visibility.contactForm = input.visibility.contactInfo = input.visibility.faqs = false;
  assert.deepEqual(visibleSiteLinks(input).map((link) => link.id), ['inicio', 'servicios', 'talleres', 'sobre-nosotros']);
});

test('SVG: acepta trazados y gradientes locales; bloquea scripts, entidades y recursos externos', () => {
  const wrap = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${inner}</svg>`;
  assert.match(validateLogoSvg(wrap('<path d="M0 0 L128 128" fill="none" stroke="#83D0C6"/>')), /<path/);
  assert.match(validateLogoSvg(wrap('<defs><linearGradient id="a"><stop offset="0" stop-color="red"/></linearGradient></defs><rect width="10" height="10" fill="url(#a)"/>')), /url\(#a\)/);
  for (const source of [wrap('<script>alert(1)</script>'), wrap('<image href="https://example.com/a.png"/>'), wrap('<path onload="alert(1)"/>'), wrap('<style>svg{}</style>'), wrap('<foreignObject/>'), wrap('<rect fill="url(https://example.com/x)"/>'), wrap('<rect fill="url(&#104;ttps://example.com/x)"/>'), wrap('<g xmlns="https://example.com"/>'), '<!DOCTYPE svg [<!ENTITY x "a">]>' + wrap('<title>&x;</title>'), '<svg/>', wrap('<path>'), wrap('x'.repeat(262145))]) assert.throws(() => validateLogoSvg(source));
});

test('redes flotantes: valida estilos, visibilidad y enlaces seguros', () => {
  assert.deepEqual(parseFloatingSocial(undefined), { ...DEFAULT_FLOATING_SOCIAL });
  assert.deepEqual(parseFloatingSocial(null), { ...DEFAULT_FLOATING_SOCIAL });
  const valid = {
    isEnabled: true,
    design: 'pill',
    facebookEnabled: true,
    facebookUrl: 'https://facebook.com/dhyana',
    instagramEnabled: false,
    instagramUrl: '',
    youtubeEnabled: true,
    youtubeUrl: 'https://youtube.com/@dhyana',
  };
  assert.deepEqual(parseFloatingSocial(valid), valid);
  // Rechaza diseño no permitido
  assert.throws(() => parseFloatingSocial({ ...valid, design: 'modal' }));
  // Rechaza tipo no booleano
  assert.throws(() => parseFloatingSocial({ ...valid, isEnabled: 'true' }));
  assert.throws(() => parseFloatingSocial({ ...valid, facebookEnabled: null }));
  // Rechaza URL sin protocolo http/https
  assert.throws(() => parseFloatingSocial({ ...valid, facebookUrl: 'javascript:alert(1)' }));
  assert.throws(() => parseFloatingSocial({ ...valid, facebookUrl: 'ftp://files.example.com' }));
  assert.throws(() => parseFloatingSocial({ ...valid, facebookUrl: 'x'.repeat(301) }));
});

