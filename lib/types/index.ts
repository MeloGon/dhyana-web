import type { LucideIcon } from 'lucide-react';

// Tipos compartidos del proyecto. Vive acá todo lo que usan 2+ archivos —
// si un tipo lo usa un solo componente, se declara en ese archivo y listo.

// ---------------------------------------------------------------------------
// Contenido
// ---------------------------------------------------------------------------

/** Video de fondo del Hero (sección "inicio"). */
export interface HeroVideoSource {
  id: string;
  name: string;
  url: string;
  poster: string;
}

/** Pilar del enfoque terapéutico (sección "sobre-mi"). */
export interface AboutPillar {
  icon: LucideIcon;
  title: string;
  description: string;
  accentBg: string;
  iconColor: string;
}

/** Servicio terapéutico ofrecido (sección "servicios"). */
export interface ServiceItem {
  id: string;
  title: string;
  icon: LucideIcon;
  badge: string;
  badgeColor: string;
  cardBg: string;
  borderAccent: string;
  iconBg: string;
  description: string;
  benefits: string[];
  duration: string;
  modality: string;
}

/** Taller grupal con cupos y temario (sección "talleres"). */
export interface WorkshopItem {
  id: string;
  title: string;
  category: 'grupal' | 'individual';
  type: string;
  schedule: string;
  duration: string;
  modality: string;
  totalSpots: number;
  remainingSpots: number;
  price?: string;
  summary: string;
  syllabus: string[];
  includes: string[];
  colorBadge: string;
}

/** Pregunta frecuente del acordeón (sección "contacto"). */
export interface Faq {
  q: string;
  a: string;
}

// ---------------------------------------------------------------------------
// Formularios
// ---------------------------------------------------------------------------

/** Datos del formulario de contacto / solicitud de cita. */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  modality: string;
  service: string;
  schedulePreference: string;
  message: string;
  agreePrivacy: boolean;
}

/** Datos del formulario de inscripción a talleres. */
export interface WorkshopFormData {
  workshopChoice: string;
  categoryChoice: string;
  fullName: string;
  email: string;
  phone: string;
  modality: string;
  priorExperience: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Respuestas de lib/api
// ---------------------------------------------------------------------------

/**
 * Resultado de un envío a backend. Todas las funciones de `lib/api/`
 * devuelven esta forma, así los hooks no tienen que saber de dónde viene
 * el dato ni cambiar cuando se conecte el backend real.
 */
export interface SubmitResult {
  ok: boolean;
  referenceCode: string;
}
