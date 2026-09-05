import { User, Users2, Wind, Compass } from 'lucide-react';
import type { ServiceItem } from '@/lib/types';

// Catálogo de servicios terapéuticos (sección "Servicios").
export const SERVICES: ServiceItem[] = [
  {
    id: 'individual',
    title: 'Psicoterapia Individual',
    icon: User,
    badge: 'Más Solicitado',
    badgeColor: 'bg-[#83D0C6] text-[#3D4C5A]',
    cardBg: 'bg-white',
    borderAccent: 'border-[#B2C9DC]/60 hover:border-[#83D0C6]',
    iconBg: 'bg-[#83D0C6]/25 text-[#3D4C5A]',
    description:
      'Un espacio íntimo y seguro para explorar dificultades emocionales, autoconocimiento, gestión de emociones y desarrollo personal.',
    benefits: [
      'Superación de ansiedad y estados depresivos',
      'Fortalecimiento de la autoestima y autoimagen',
      'Gestión de pensamientos rumiantes y estrés',
      'Toma de decisiones y claridad de metas vitales',
    ],
    duration: '50 min / sesión',
    modality: 'Presencial & Online',
  },
  {
    id: 'pareja',
    title: 'Terapia de Pareja',
    icon: Users2,
    badge: 'Relacional',
    badgeColor: 'bg-[#84B0DF] text-white',
    cardBg: 'bg-white',
    borderAccent: 'border-[#D1D3E8]/60 hover:border-[#84B0DF]',
    iconBg: 'bg-[#84B0DF]/25 text-[#3D4C5A]',
    description:
      'Acompañamiento a parejas para sanar heridas relacionales, reabrir canales de comunicación sincera y reconstruir la confianza.',
    benefits: [
      'Desactivación de dinámicas de discusión tóxicas',
      'Comunicación asertiva y escucha activa',
      'Reconexión emocional, afectiva y de intimidad',
      'Acompañamiento en acuerdos o cierres conscientes',
    ],
    duration: '60 - 70 min / sesión',
    modality: 'Presencial & Online',
  },
  {
    id: 'ansiedad',
    title: 'Tratamiento de Ansiedad & Estrés',
    icon: Wind,
    badge: 'Especialidad',
    badgeColor: 'bg-[#D1D3E8] text-[#3D4C5A]',
    cardBg: 'bg-white',
    borderAccent: 'border-[#83D0C6]/60 hover:border-[#83D0C6]',
    iconBg: 'bg-[#83D0C6]/20 text-[#3D4C5A]',
    description:
      'Protocolo focalizado en desarmar el ciclo del miedo, síntomas físicos del estrés, ataques de pánico y sobrecarga laboral.',
    benefits: [
      'Técnicas de regulación somática y respiración',
      'Reestructuración de pensamientos catastrofistas',
      'Prevención y abordaje del síndrome de Burnout',
      'Herramientas de Mindfulness para la vida diaria',
    ],
    duration: '50 min / sesión',
    modality: 'Presencial & Online',
  },
  {
    id: 'duelo',
    title: 'Duelo & Transiciones Vitales',
    icon: Compass,
    badge: 'Acompañamiento',
    badgeColor: 'bg-[#B2C9DC] text-[#3D4C5A]',
    cardBg: 'bg-white',
    borderAccent: 'border-[#B2C9DC]/60 hover:border-[#84B0DF]',
    iconBg: 'bg-[#B2C9DC]/30 text-[#3D4C5A]',
    description:
      'Sostén profesional para transitar la pérdida de un ser querido, rupturas significativas, procesos migratorios o cambios de ciclo.',
    benefits: [
      'Elaboración sana del dolor sin prisas',
      'Aceptación de pérdidas y redefinición del sentido',
      'Adaptación a nuevas circunstancias de vida',
      'Cuidado compasivo de la vulnerabilidad',
    ],
    duration: '50 min / sesión',
    modality: 'Presencial & Online',
  },
];
