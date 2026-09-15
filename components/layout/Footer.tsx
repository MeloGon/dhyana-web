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
  return <footer id="footer-section" className="bg-[#3D4C5A] pt-16 pb-12 text-white border-t border-white/10">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {visibility.footerNotice && <div className="mb-12 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-6">
        <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#83D0C6]" />
        <div><strong className="block text-sm">{texts.footerNoticeTitle}</strong><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/75">{texts.footerNoticeBody}</p></div>
      </div>}
      <div className="grid grid-cols-1 gap-8 border-b border-white/15 pb-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><SiteLogo url={content.logoUrl} /><div><span className="block font-serif text-lg font-bold leading-tight">{texts.brandTitle}</span><span className="text-xs text-[#83D0C6]">{texts.brandSubtitle}</span></div></div>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/75">{texts.footerDescription}</p>
          {texts.footerCredentials && <div className="flex items-start gap-2 text-xs text-white/60"><ShieldCheck className="h-4 w-4 shrink-0 text-[#83D0C6]" /><span>{texts.footerCredentials}</span></div>}
        </div>
        {links.length > 0 && <div><h3 className="mb-4 font-serif font-semibold text-[#83D0C6]">Navegación</h3><ul className="space-y-3 text-sm text-white/80">{links.map((link) => <li key={link.id}><a href={`#${link.id}`} onClick={(e) => { e.preventDefault(); onScrollTo(link.id); }} className="hover:text-[#83D0C6]">{link.label}</a></li>)}</ul></div>}
        {visibility.servicios && content.services.length > 0 && <div><h3 className="mb-4 font-serif font-semibold text-[#84B0DF]">Especialidades</h3><ul className="space-y-3 text-sm text-white/75">{content.services.map((service) => <li key={service.id}>{service.title}</li>)}</ul></div>}
        {visibility.footerContact && contact && <div className="space-y-3 text-sm text-white/80">
          <h3 className="font-serif font-semibold text-[#83D0C6]">Contacto Directo</h3>
          <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#84B0DF]" /><span>{contact.address}</span></p>
          <a href={contact.phoneHref} className="flex items-center gap-2"><PhoneCall className="h-4 w-4 shrink-0 text-[#83D0C6]" />{contact.phone}</a>
          <a href={contact.emailHref} className="flex items-start gap-2 break-all"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#84B0DF]" />{contact.email}</a>
          <a href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#83D0C6]"><MessageCircle className="h-4 w-4 shrink-0" />WhatsApp</a>
          <p className="pt-2 text-xs text-white/60">{contact.hours}</p>{contact.hoursNote && <p className="text-xs text-white/60">{contact.hoursNote}</p>}
        </div>}
      </div>
      <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/60 sm:flex-row">
        <p>© {new Date().getFullYear()} {texts.brandTitle}. Todos los derechos reservados.</p>
        <div className="flex items-center gap-4">{texts.footerMotto && <span className="font-handwriting text-xl text-[#83D0C6]">{texts.footerMotto}</span>}<button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Volver al inicio"><ArrowUp className="h-4 w-4" /></button></div>
      </div>
    </div>
  </footer>;
}
