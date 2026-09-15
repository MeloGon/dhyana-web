// Metadatos del editor; los textos publicados viven únicamente en Supabase.
export const SITE_TEXT_FIELDS = {
  brandTitle: { label: 'Nombre del centro (navbar y footer)', group: 'Identidad', max: 100 },
  brandSubtitle: { label: 'Subtítulo (navbar y footer)', group: 'Identidad', max: 120 },
  footerDescription: { label: 'Descripción del centro', group: 'Footer', max: 1000 },
  footerCredentials: { label: 'Credenciales (opcional)', group: 'Footer', max: 200 },
  footerMotto: { label: 'Frase al pie (opcional)', group: 'Footer', max: 150 },
  footerNoticeTitle: { label: 'Título del aviso', group: 'Footer', max: 200 },
  footerNoticeBody: { label: 'Contenido del aviso', group: 'Footer', max: 2000 },
  heroEyebrow: { label: 'Etiqueta de inicio', group: 'Inicio', max: 120 },
  heroTitle: { label: 'Título de inicio', group: 'Inicio', max: 200 },
  heroSubtitle: { label: 'Descripción de inicio', group: 'Inicio', max: 700 },
  servicesEyebrow: { label: 'Etiqueta de servicios', group: 'Servicios', max: 120 },
  servicesTitle: { label: 'Título de servicios', group: 'Servicios', max: 200 },
  servicesSubtitle: { label: 'Descripción de servicios', group: 'Servicios', max: 700 },
  workshopsEyebrow: { label: 'Etiqueta de talleres', group: 'Talleres', max: 120 },
  workshopsTitle: { label: 'Título de talleres', group: 'Talleres', max: 200 },
  workshopsSubtitle: { label: 'Descripción de talleres', group: 'Talleres', max: 700 },
  opinionsEyebrow: { label: 'Etiqueta de opiniones', group: 'Opiniones', max: 120 },
  opinionsTitle: { label: 'Título de opiniones', group: 'Opiniones', max: 200 },
  contactEyebrow: { label: 'Etiqueta de contacto', group: 'Contacto', max: 120 },
  contactTitle: { label: 'Título de contacto', group: 'Contacto', max: 200 },
  contactSubtitle: { label: 'Descripción de contacto', group: 'Contacto', max: 700 },
  faqTitle: { label: 'Título de preguntas frecuentes', group: 'Contacto', max: 120 },
} as const;

export const SITE_VISIBILITY_FIELDS = {
  inicio: 'Inicio', servicios: 'Servicios', talleres: 'Talleres', opiniones: 'Opiniones',
  'sobre-nosotros': 'Sobre nosotros', contacto: 'Bloque de contacto y preguntas frecuentes',
  contactForm: 'Formulario de contacto (demostración, aún no envía mensajes)',
  contactInfo: 'Tarjeta de datos de consulta', faqs: 'Preguntas frecuentes',
  footerNotice: 'Aviso del footer', footerContact: 'Contacto directo del footer',
} as const;

export const SITE_NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' }, { id: 'servicios', label: 'Servicios' },
  { id: 'talleres', label: 'Talleres' }, { id: 'opiniones', label: 'Opiniones' },
  { id: 'sobre-nosotros', label: 'Sobre nosotros' }, { id: 'contacto', label: 'Contacto' },
] as const;

export const SERVICE_ICONS = { user: 'Persona', users: 'Pareja / grupo', wind: 'Respiración', compass: 'Orientación' } as const;
