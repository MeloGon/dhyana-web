'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';
import ContactInfoCard from '@/components/sections/contact/ContactInfoCard';
import ContactFaqAccordion from '@/components/sections/contact/ContactFaqAccordion';
import ContactForm from '@/components/sections/contact/ContactForm';
import { usePublicFaqs } from '@/hooks/usePublicFaqs';

// Orquestador de la sección de contacto: arma el layout y conecta las piezas.
// Toda la lógica del formulario (estado, envío, reset) vive en
// hooks/useContactForm.ts, y la llamada al backend en lib/api/contact.ts.
// Este archivo no sabe *cómo* se envía nada — solo pinta.
interface ContactSectionProps {
  preselectedService?: string;
}

export default function ContactSection({ preselectedService = 'Psicoterapia Individual' }: ContactSectionProps) {
  const contactForm = useContactForm(preselectedService);
  const publicFaqs = usePublicFaqs();

  return (
    <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#83D0C6]/20 text-[#3D4C5A] text-xs font-semibold uppercase tracking-wider mb-3">
          <Calendar className="w-3.5 h-3.5 text-[#83D0C6]" />
          <span>Contacto & Solicitud de Cita</span>
        </div>
        <h2 className="font-serif italic text-3xl sm:text-4xl md:text-5xl text-[#3D4C5A] font-bold tracking-tight mb-4">
          Comienza tu Proceso Terapéutico
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#3D4C5A]/80 font-normal leading-relaxed">
          Dar el primer paso suele ser el más difícil. Escríbeme y responderé en un plazo máximo de 24 horas laborables para coordinar nuestra primera sesión.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Side: Contact Information & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          <ContactInfoCard />
          <ContactFaqAccordion {...publicFaqs} />
        </div>

        {/* Right Side: Interactive Contact Form */}
        <div className="lg:col-span-7">
          <div className="rounded-[24px] p-6 sm:p-10 bg-white border border-[#3D4C5A]/10 shadow-sm h-full flex flex-col justify-between">
            <ContactForm
              formData={contactForm.formData}
              setFormData={contactForm.setFormData}
              isSubmitting={contactForm.isSubmitting}
              isSubmitted={contactForm.isSubmitted}
              confirmationCode={contactForm.confirmationCode}
              errorMessage={contactForm.errorMessage}
              onSubmit={contactForm.handleSubmit}
              onReset={contactForm.handleReset}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
