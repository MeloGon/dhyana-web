import 'server-only';
import { connection } from 'next/server';
import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { parseSiteSettings, parseSiteServices } from '@/lib/server/site-validation';
import { assertSiteAsset, siteAssetUrl } from '@/lib/server/site-media';
import type { SiteContent } from '@/lib/types/site-settings';
import type { Json } from '@/lib/types/database';
import { getPublicContactSettings } from '@/lib/server/contact-settings';

async function readContent(): Promise<SiteContent> {
  const { data, error } = await createDatabaseAdminClient().from('site_settings').select('content,services').eq('id', true).single();
  if (error) throw new Error('No se pudo leer la configuración del sitio.');
  const settings = parseSiteSettings(data.content);
  return { settings, services: parseSiteServices(data.services), logoUrl: siteAssetUrl(settings.logoPath), videoUrl: siteAssetUrl(settings.videoPath) };
}

export async function getPublicSiteContent(): Promise<SiteContent> {
  // Evita prerenderizar visibilidad antigua durante el build.
  await connection();
  const content = await readContent();
  return { ...content, services: content.services.filter((service) => service.isPublished) };
}

export async function getAdminSiteContent(): Promise<SiteContent> {
  await requireAdmin();
  return readContent();
}

export async function getPublicHomeContent() {
  const content = await getPublicSiteContent();
  const visibility = content.settings.visibility;
  const contact = visibility.footerContact || (visibility.contacto && visibility.contactInfo) ? await getPublicContactSettings() : null;
  return { content, contact };
}

export async function saveSiteSettings(body: unknown) {
  await requireAdmin();
  const settings = parseSiteSettings(body);
  await Promise.all([assertSiteAsset(settings.logoPath, 'logo'), assertSiteAsset(settings.videoPath, 'video')]);
  const { error } = await createDatabaseAdminClient().from('site_settings').update({ content: settings as unknown as Json }).eq('id', true).select('id').single();
  if (error) throw new Error('No se pudo guardar la configuración del sitio.');
  return readContent();
}

export async function saveSiteServices(body: unknown) {
  await requireAdmin();
  const services = parseSiteServices(body);
  // Actualiza solo servicios; no sobrescribe textos o visibilidad desde otro editor.
  const { error } = await createDatabaseAdminClient().from('site_settings').update({ services: services as unknown as Json }).eq('id', true).select('id').single();
  if (error) throw new Error('No se pudieron guardar los servicios.');
  return services;
}
