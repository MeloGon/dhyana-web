import { SITE_NAV_LINKS } from '@/lib/data/site-fields';
import type { SiteSettings } from '@/lib/types/site-settings';

export function visibleSiteLinks(settings: SiteSettings) {
  const visibility = settings.visibility;
  return SITE_NAV_LINKS.filter((link) => visibility[link.id] && (link.id !== 'contacto' || visibility.contactForm || visibility.contactInfo || visibility.faqs));
}
