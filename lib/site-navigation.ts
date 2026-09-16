import { SITE_NAV_LINKS, DEFAULT_SECTION_ORDER } from '@/lib/data/site-fields';
import type { SiteSettings, SiteSectionKey } from '@/lib/types/site-settings';

export function visibleSiteLinks(settings: SiteSettings) {
  const visibility = settings.visibility;
  const order = settings.sectionOrder || DEFAULT_SECTION_ORDER;
  const filtered = SITE_NAV_LINKS.filter((link) => visibility[link.id] && (link.id !== 'contacto' || visibility.contactForm || visibility.contactInfo || visibility.faqs));
  return [...filtered].sort((a, b) => {
    const idxA = order.indexOf(a.id as SiteSectionKey);
    const idxB = order.indexOf(b.id as SiteSectionKey);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });
}
