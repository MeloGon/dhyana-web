'use client';

import Link from 'next/link';
import {
  Calendar,
  Users,
  UserCheck,
  Sparkles,
  MessageSquareQuote,
  HelpCircle,
  Palette,
  PhoneCall,
  Scale,
  BookText,
  ArrowRight,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { useAdminLogout } from '@/hooks/useAdminAuth';
import type { AdminIdentity } from '@/lib/types/admin-auth';

const ADMIN_MODULES = [
  {
    href: '/admin/workshops',
    title: 'Gestionar Talleres',
    description: 'Catálogo de talleres, horarios grupales, precios y cupos disponibles.',
    icon: Calendar,
    action: 'Administrar',
    accentColor: 'text-[#6366F1]',
    bgColor: 'bg-[#6366F1]/10',
    hoverBorder: 'hover:border-[#6366F1]/50',
  },
  {
    href: '/admin/sales',
    title: 'Ventas y Participantes',
    description: 'Ventas manuales, coordinación por WhatsApp y accesos mensuales.',
    icon: Users,
    action: 'Consultar ventas',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    hoverBorder: 'hover:border-emerald-500/50',
  },
  {
    href: '/admin/about',
    title: 'Sobre Nosotros',
    description: 'Fotografía de perfil 4:3, biografía, credenciales y pilares.',
    icon: UserCheck,
    action: 'Editar perfil',
    accentColor: 'text-[#8B5CF6]',
    bgColor: 'bg-[#8B5CF6]/10',
    hoverBorder: 'hover:border-[#8B5CF6]/50',
  },
  {
    href: '/admin/services',
    title: 'Servicios Terapéuticos',
    description: 'Tarjetas de especialidades individuales, beneficios y orden.',
    icon: Sparkles,
    action: 'Configurar',
    accentColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    hoverBorder: 'hover:border-purple-500/50',
  },
  {
    href: '/admin/quotes',
    title: 'Opiniones',
    description: 'Citas de testimonios y reflexiones del mazo interactivo.',
    icon: MessageSquareQuote,
    action: 'Gestionar citas',
    accentColor: 'text-[#EC4899]',
    bgColor: 'bg-[#EC4899]/10',
    hoverBorder: 'hover:border-[#EC4899]/50',
  },
  {
    href: '/admin/faqs',
    title: 'Preguntas Frecuentes',
    description: 'Respuestas a dudas comunes desplegadas en el acordeón.',
    icon: HelpCircle,
    action: 'Editar FAQ',
    accentColor: 'text-[#06B6D4]',
    bgColor: 'bg-[#06B6D4]/10',
    hoverBorder: 'hover:border-[#06B6D4]/50',
  },
  {
    href: '/admin/site',
    title: 'Diseño del Sitio',
    description: 'Logo SVG, video de inicio, títulos y visibilidad/orden de bloques.',
    icon: Palette,
    action: 'Personalizar',
    accentColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    hoverBorder: 'hover:border-amber-500/50',
  },
  {
    href: '/admin/contact',
    title: 'Datos de Consulta',
    description: 'Dirección física, número de WhatsApp directo, teléfono y horarios.',
    icon: PhoneCall,
    action: 'Editar contacto',
    accentColor: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-500/10',
    hoverBorder: 'hover:border-teal-500/50',
  },
  {
    href: '/admin/legal',
    title: 'Términos y Políticas',
    description: 'Términos y condiciones, privacidad y cambios/devoluciones publicados en /legal.',
    icon: Scale,
    action: 'Editar textos legales',
    accentColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-500/10',
    hoverBorder: 'hover:border-rose-500/50',
  },
  {
    href: '/admin/complaint-book',
    title: 'Libro de Reclamaciones',
    description: 'Hojas registradas, respuestas al consumidor y plazo de 15 días hábiles.',
    icon: BookText,
    action: 'Ver hojas',
    accentColor: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    hoverBorder: 'hover:border-orange-500/50',
  },
];

export function AdminPanel({ admin }: { admin: AdminIdentity }) {
  const { isSubmitting, errorMessage, handleLogout } = useAdminLogout();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8">
      {/* Header superior */}
      <header className="flex flex-wrap items-center justify-between gap-5 border-b border-[color:var(--ink)]/15 pb-6">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[color:var(--positive)] uppercase">
            DHYANA · ADMINISTRACIÓN
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-[color:var(--ink)]">
            Panel de administración
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[color:var(--positive)]/10 text-[color:var(--positive)] border border-[color:var(--positive)]/25">
            <span className="w-2 h-2 rounded-full bg-[color:var(--positive)] animate-pulse" />
            Acceso habilitado
          </span>
          <button
            onClick={handleLogout}
            disabled={isSubmitting}
            className="rounded-full border border-[color:var(--ink)]/30 bg-[var(--surface)] px-5 py-2 text-xs font-medium text-[color:var(--ink)] hover:bg-[color:var(--ink)]/5 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Cerrando…' : 'Cerrar sesión'}
          </button>
        </div>
      </header>

      {errorMessage && (
        <p role="alert" className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-[color:var(--danger)]">
          {errorMessage}
        </p>
      )}

      {/* Tarjeta de Identidad y accesos directos */}
      <section className="mt-8 rounded-2xl border border-[color:var(--ink)]/10 bg-[var(--surface)] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[color:var(--ink)]/60 uppercase tracking-wider">
            Administrador conectado
          </span>
          <h2 className="mt-0.5 break-all font-serif text-xl font-bold text-[color:var(--ink)]">
            {admin.email}
          </h2>
          <p className="mt-1 text-xs text-[color:var(--ink)]/75">
            Administra talleres, horarios, precios, cupos y el contenido editorial de la web.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-2 sm:pt-0 border-t sm:border-t-0 border-[color:var(--ink)]/10">
          <Link
            href="/admin/password"
            className="inline-flex items-center gap-1.5 text-[#6366F1] hover:underline"
          >
            <KeyRound className="w-3.5 h-3.5 shrink-0" />
            Cambiar contraseña
          </Link>
          <span className="hidden sm:inline text-[color:var(--ink)]/30">·</span>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-[#6366F1] hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            Ver sitio público
          </Link>
        </div>
      </section>

      {/* Grid de Módulos (Propuesta 1) */}
      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[color:var(--ink)]/70">
            Módulos del Sistema
          </h2>
          <span className="text-xs text-[color:var(--ink)]/50">{ADMIN_MODULES.length} áreas configurables</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ADMIN_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--surface)] border border-[color:var(--ink)]/10 ${mod.hoverBorder} shadow-xs hover:shadow-md transition-all duration-150`}
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-xl ${mod.bgColor} ${mod.accentColor} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base text-[color:var(--ink)] group-hover:text-[#6366F1] transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-[color:var(--ink)]/70 mt-1.5 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[color:var(--ink)]/5 flex items-center justify-between text-xs font-semibold text-[#6366F1]">
                  <span>{mod.action}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
