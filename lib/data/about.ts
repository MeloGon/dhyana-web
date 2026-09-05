import { HeartHandshake, Brain, Sparkles, ShieldCheck } from 'lucide-react';
import type { AboutPillar } from '@/lib/types';

// Los 4 pilares del enfoque terapéutico (sección "Sobre Mí").
// `icon` guarda la referencia al componente de lucide-react, no un string:
// el componente lo renderiza directo con <Icon />.
export const ABOUT_PILLARS: AboutPillar[] = [
  {
    icon: HeartHandshake,
    title: 'Vínculo Seguro y Empatía',
    description: 'Un entorno libre de juicios donde podrás expresarte con total confianza, validación y respeto a tu ritmo.',
    accentBg: 'bg-[#83D0C6]/20',
    iconColor: 'text-[#3D4C5A]',
  },
  {
    icon: Brain,
    title: 'Terapia Basada en Evidencia',
    description: 'Integración de Terapia Cognitivo-Conductual (TCC), Terapia de Aceptación y Compromiso (ACT) y Mindfulness.',
    accentBg: 'bg-[#84B0DF]/20',
    iconColor: 'text-[#3D4C5A]',
  },
  {
    icon: Sparkles,
    title: 'Herramientas Prácticas',
    description: 'Estrategias concretas de autorregulación emocional, respiración y límites sanos para tu vida cotidiana.',
    accentBg: 'bg-[#D1D3E8]/40',
    iconColor: 'text-[#3D4C5A]',
  },
  {
    icon: ShieldCheck,
    title: 'Ética y Confidencialidad',
    description: 'Práctica clínica avalada por el Colegio Oficial de la Psicología, garantizando máxima reserva y rigor.',
    accentBg: 'bg-[#B2C9DC]/30',
    iconColor: 'text-[#3D4C5A]',
  },
];
