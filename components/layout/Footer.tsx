'use client';

import { PhoneCall, AlertTriangle, ShieldCheck, Mail, MapPin, ArrowUp, MessageCircle } from 'lucide-react';
import { SiteLogo } from '@/components/layout/SiteLogo';
import { visibleSiteLinks } from '@/lib/site-navigation';
import type { SiteContent } from '@/lib/types/site-settings';
import type { PublicContactSettings } from '@/lib/types/contact-settings';

interface FooterProps {
  content: SiteContent;
  contact: PublicContactSettings | null;
  onScrollTo: (sectionId: string) => void;
}

export default function Footer({ content, contact, onScrollTo }: FooterProps) {
  const { texts, visibility } = content.settings;
  const links = visibleSiteLinks(content.settings);
  return <footer id="footer-section" className="bg-[#111827] pt-16 pb-12 text-white border-t border-white/10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {visibility.footerNotice && <div className="mb-12 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-6">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#06B6D4]" />
        <div><strong className="block text-sm">{texts.footerNoticeTitle}</strong><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">{texts.footerNoticeBody}</p></div>
      </div>}
      <div className="grid grid-cols-1 gap-8 border-b border-white/15 pb-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><SiteLogo url={content.logoUrl} className="h-14 w-14 sm:h-16 sm:w-16" /><div><span className="block font-serif text-lg font-bold leading-tight">{texts.brandTitle}</span><span className="text-xs text-[#8B5CF6]">{texts.brandSubtitle}</span></div></div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{texts.footerDescription}</p>
          {texts.footerCredentials && <div className="flex items-start gap-2 text-xs text-white/60"><ShieldCheck className="h-4 w-4 shrink-0 text-[#06B6D4]" /><span>{texts.footerCredentials}</span></div>}
        </div>
        {links.length > 0 && <div><h3 className="mb-4 font-serif font-semibold text-[#06B6D4]">Navegación</h3><ul className="space-y-3 text-sm text-white/80">{links.map((link) => <li key={link.id}><a href={`#${link.id}`} onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }} className="hover:text-[#06B6D4] transition-colors">{link.label}</a></li>)}</ul></div>}
        {visibility.servicios && content.services.length > 0 && <div><h3 className="mb-4 font-serif font-semibold text-[#8B5CF6]">Especialidades</h3><ul className="space-y-3 text-sm text-white/75">{content.services.map((service) => <li key={service.id}>{service.title}</li>)}</ul></div>}
        {visibility.footerContact && contact && <div className="space-y-3 text-sm text-white/80">
          <h3 className="font-serif font-semibold text-[#06B6D4]">Contacto Directo</h3>
          <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" /><span>{contact.address}</span></p>
          <a href={contact.phoneHref} className="flex items-center gap-2 hover:text-[#06B6D4] transition-colors"><PhoneCall className="h-4 w-4 shrink-0 text-[#06B6D4]" />{contact.phone}</a>
          <a href={contact.emailHref} className="flex items-start gap-2 break-all hover:text-[#8B5CF6] transition-colors"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#8B5CF6]" />{contact.email}</a>
          <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#06B6D4] hover:underline"><MessageCircle className="h-4 w-4 shrink-0" />WhatsApp</a>
          <p className="pt-2 text-xs text-white/60">{contact.hours}</p>{contact.hoursNote && <p className="text-xs text-white/60">{contact.hoursNote}</p>}
        </div>}
      </div>
      <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/60 sm:flex-row">
        <p>© {new Date().getFullYear()} {texts.brandTitle}. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">{texts.footerMotto && <span className="font-handwriting text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#EC4899] font-bold">{texts.footerMotto}</span>}<button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors" aria-label="Volver al inicio"><ArrowUp className="h-4 w-4" /></button></div>
      </div>
    </div>
  </footer>;
}
