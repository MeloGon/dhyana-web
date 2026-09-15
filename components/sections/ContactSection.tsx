'use client';

import { Calendar } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';
import { usePublicFaqs } from '@/hooks/usePublicFaqs';
import ContactInfoCard from '@/components/sections/contact/ContactInfoCard';
import ContactFaqAccordion from '@/components/sections/contact/ContactFaqAccordion';
import ContactForm from '@/components/sections/contact/ContactForm';
import type { SiteContent } from '@/lib/types/site-settings';
import type { PublicContactSettings } from '@/lib/types/contact-settings';

function Faqs({ title }: { title: string }) {
  const faqs = usePublicFaqs();
  return <ContactFaqAccordion {...faqs} title={title} />;
}
function Form({ service, services }: { service: string; services: string[] }) {
  const model = useContactForm(service);
  return <div className="rounded-3xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-6 sm:p-10">
    <p className="mb-5 rounded-xl bg-[#D1D3E8]/30 p-3 text-sm">Formulario de demostración: aún no envía mensajes. Para contactar, utiliza los datos del footer.</p>
    <ContactForm services={services} formData={model.formData} setFormData={model.setFormData} isSubmitting={model.isSubmitting} isSubmitted={model.isSubmitted} confirmationCode={model.confirmationCode} errorMessage={model.errorMessage} onSubmit={model.handleSubmit} onReset={model.handleReset} />
  </div>;
}
interface Props { content: SiteContent; contact: PublicContactSettings | null; preselectedService: string }
export default function ContactSection({ content, contact, preselectedService }: Props) {
  const { visibility, texts } = content.settings;
  const hasContact = visibility.contactForm || visibility.contactInfo;
  const hasLeft = visibility.contactInfo || visibility.faqs;
  if (!hasContact && !visibility.faqs) return null;
  return <section id="contacto" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
    {hasContact && <div className="mx-auto mb-12 max-w-3xl text-center">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#83D0C6]/20 px-4 py-1 text-xs font-semibold uppercase tracking-wider"><Calendar className="h-4 w-4" /><span>{texts.contactEyebrow}</span></div>
      <h2 className="mb-4 font-serif text-3xl font-bold sm:text-4xl md:text-5xl">{texts.contactTitle}</h2>
      <p className="whitespace-pre-line text-base leading-relaxed text-[color:var(--ink)]/80">{texts.contactSubtitle}</p>
    </div>}
    <div className={visibility.contactForm && hasLeft ? 'grid items-start gap-8 lg:grid-cols-2' : 'mx-auto max-w-3xl'}>
      {hasLeft && <div className="space-y-6">
        {visibility.contactInfo && contact && <ContactInfoCard settings={contact} isLoading={false} errorMessage="" handleRetry={() => {}} />}
        {visibility.faqs && <Faqs title={texts.faqTitle} />}
      </div>}
      {visibility.contactForm && <Form service={preselectedService} services={content.services.map((service) => service.title)} />}
    </div>
  </section>;
}
