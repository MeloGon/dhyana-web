import { SITE_TEXT_FIELDS, SITE_VISIBILITY_FIELDS, SERVICE_ICONS } from '@/lib/data/site-fields';
import { HttpError } from '@/lib/server/http-error';
import type { SiteSettings, SiteService, SiteTextKey, SiteVisibilityKey } from '@/lib/types/site-settings';

export function inputObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new HttpError(400, 'Datos inválidos.');
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string, max: number, optional = false) {
  if (typeof value !== 'string' || (!optional && !value.trim()) || value.length > max || value.includes('\0')) {
    throw new HttpError(400, `${label}: ${optional ? 'usa' : 'completa con'} hasta ${max} caracteres.`);
  }
  return value.trim();
}

export function parseAssetPath(value: unknown, kind: 'logo' | 'video') {
  const path = text(value, 'Archivo', 100, true);
  const extension = kind === 'logo' ? 'svg' : '(mp4|webm)';
  if (path && !new RegExp(`^${kind}/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.${extension}$`).test(path)) {
    throw new HttpError(400, 'Selecciona un archivo subido desde este panel.');
  }
  return path;
}

export function parseSiteSettings(value: unknown): SiteSettings {
  const body = inputObject(value);
  const sourceTexts = inputObject(body.texts);
  const sourceVisibility = inputObject(body.visibility);
  const texts = {} as SiteSettings['texts'];
  for (const key of Object.keys(SITE_TEXT_FIELDS) as SiteTextKey[]) {
    const field = SITE_TEXT_FIELDS[key];
    texts[key] = text(sourceTexts[key], field.label, field.max, key === 'footerCredentials' || key === 'footerMotto');
  }
  const visibility = {} as SiteSettings['visibility'];
  for (const key of Object.keys(SITE_VISIBILITY_FIELDS) as SiteVisibilityKey[]) {
    if (typeof sourceVisibility[key] !== 'boolean') throw new HttpError(400, 'Revisa la visibilidad de las secciones.');
    visibility[key] = sourceVisibility[key];
  }
  return { texts, visibility, logoPath: parseAssetPath(body.logoPath, 'logo'), videoPath: parseAssetPath(body.videoPath, 'video') };
}

export function parseSiteServices(value: unknown): SiteService[] {
  if (!Array.isArray(value) || value.length > 24) throw new HttpError(400, 'Se permiten hasta 24 servicios.');
  const ids = new Set<string>();
  return value.map((item) => {
    const body = inputObject(item);
    const id = text(body.id, 'Identificador', 64);
    if (!/^[a-z0-9-]+$/.test(id) || ids.has(id)) throw new HttpError(400, 'Identificador de servicio inválido o repetido.');
    ids.add(id);
    if (typeof body.icon !== 'string' || !Object.hasOwn(SERVICE_ICONS, body.icon)) throw new HttpError(400, 'Selecciona un icono de la lista.');
    if (typeof body.isPublished !== 'boolean') throw new HttpError(400, 'Revisa la publicación del servicio.');
    if (!Array.isArray(body.benefits) || body.benefits.length > 8) throw new HttpError(400, 'Usa hasta ocho beneficios por servicio.');
    return { id, title: text(body.title, 'Título', 150), description: text(body.description, 'Descripción', 1000),
      benefits: body.benefits.map((benefit) => text(benefit, 'Beneficio', 250)),
      duration: text(body.duration, 'Duración', 100), modality: text(body.modality, 'Modalidad', 100),
      badge: text(body.badge, 'Etiqueta', 80, true), icon: body.icon as SiteService['icon'], isPublished: body.isPublished };
  });
}
