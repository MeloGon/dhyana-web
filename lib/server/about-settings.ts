import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import type { AboutSettings } from '@/lib/types/about-settings';
import type { Database } from '@/lib/types/database';

type AboutRow = Database['public']['Tables']['about_settings']['Row'];

// Todos los campos menos `id` (el singleton).
const columns = 'badge,heading,introduction,profile_name,profile_title,profile_image_url,profile_image_alt,credential1,credential2,credential3,quote,approach_title,approach_paragraph1,approach_paragraph2,pillar1_title,pillar1_description,pillar2_title,pillar2_description,pillar3_title,pillar3_description,pillar4_title,pillar4_description' as const;

// Convierte la fila de Supabase (snake_case) a la interfaz de la app (camelCase).
function dto(row: Omit<AboutRow, 'id'>): AboutSettings {
  return {
    badge: row.badge,
    heading: row.heading,
    introduction: row.introduction,
    profileName: row.profile_name,
    profileTitle: row.profile_title,
    profileImageUrl: row.profile_image_url,
    profileImageAlt: row.profile_image_alt,
    credential1: row.credential1,
    credential2: row.credential2,
    credential3: row.credential3,
    quote: row.quote,
    approachTitle: row.approach_title,
    approachParagraph1: row.approach_paragraph1,
    approachParagraph2: row.approach_paragraph2,
    pillar1Title: row.pillar1_title,
    pillar1Description: row.pillar1_description,
    pillar2Title: row.pillar2_title,
    pillar2Description: row.pillar2_description,
    pillar3Title: row.pillar3_title,
    pillar3Description: row.pillar3_description,
    pillar4Title: row.pillar4_title,
    pillar4Description: row.pillar4_description,
  };
}

// Valida cada campo del formulario de edición.
function parseInput(body: Record<string, unknown>): AboutSettings {
  function text(key: string, label: string, max: number) {
    const value = body[key];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max || value.includes('\0')) {
      throw new HttpError(400, `${label}: completa el campo usando hasta ${max} caracteres.`);
    }
    return value.trim();
  }

  return {
    badge: text('badge', 'Etiqueta', 120),
    heading: text('heading', 'Título principal', 200),
    introduction: text('introduction', 'Presentación', 1000),
    profileName: text('profileName', 'Nombre', 120),
    profileTitle: text('profileTitle', 'Subtítulo del perfil', 200),
    profileImageUrl: text('profileImageUrl', 'URL de la imagen', 500),
    profileImageAlt: text('profileImageAlt', 'Texto alternativo de la imagen', 200),
    credential1: text('credential1', 'Credencial 1', 300),
    credential2: text('credential2', 'Credencial 2', 300),
    credential3: text('credential3', 'Credencial 3', 300),
    quote: text('quote', 'Cita', 500),
    approachTitle: text('approachTitle', 'Título del enfoque', 200),
    approachParagraph1: text('approachParagraph1', 'Párrafo 1 del enfoque', 1000),
    approachParagraph2: text('approachParagraph2', 'Párrafo 2 del enfoque', 1000),
    pillar1Title: text('pillar1Title', 'Pilar 1 — título', 120),
    pillar1Description: text('pillar1Description', 'Pilar 1 — descripción', 500),
    pillar2Title: text('pillar2Title', 'Pilar 2 — título', 120),
    pillar2Description: text('pillar2Description', 'Pilar 2 — descripción', 500),
    pillar3Title: text('pillar3Title', 'Pilar 3 — título', 120),
    pillar3Description: text('pillar3Description', 'Pilar 3 — descripción', 500),
    pillar4Title: text('pillar4Title', 'Pilar 4 — título', 120),
    pillar4Description: text('pillar4Description', 'Pilar 4 — descripción', 500),
  };
}

// Lectura interna (sin control de acceso).
async function readSettings(): Promise<AboutSettings> {
  const { data, error } = await createDatabaseAdminClient()
    .from('about_settings').select(columns).eq('id', true).single();
  if (error) throw new Error('No se pudo leer la sección "Sobre nosotros".');
  return dto(data);
}

/** Lectura pública — sin requireAdmin. */
export async function getAboutSettings(): Promise<AboutSettings> {
  return readSettings();
}

/** Lectura privada — requiere sesión admin activa. */
export async function getAdminAboutSettings(): Promise<AboutSettings> {
  await requireAdmin();
  return readSettings();
}

/** Guarda todos los campos en una operación atómica. Requiere admin. */
export async function saveAboutSettings(body: Record<string, unknown>): Promise<AboutSettings> {
  await requireAdmin();
  const input = parseInput(body);
  const { data, error } = await createDatabaseAdminClient()
    .from('about_settings').update({
      badge: input.badge,
      heading: input.heading,
      introduction: input.introduction,
      profile_name: input.profileName,
      profile_title: input.profileTitle,
      profile_image_url: input.profileImageUrl,
      profile_image_alt: input.profileImageAlt,
      credential1: input.credential1,
      credential2: input.credential2,
      credential3: input.credential3,
      quote: input.quote,
      approach_title: input.approachTitle,
      approach_paragraph1: input.approachParagraph1,
      approach_paragraph2: input.approachParagraph2,
      pillar1_title: input.pillar1Title,
      pillar1_description: input.pillar1Description,
      pillar2_title: input.pillar2Title,
      pillar2_description: input.pillar2Description,
      pillar3_title: input.pillar3Title,
      pillar3_description: input.pillar3Description,
      pillar4_title: input.pillar4Title,
      pillar4_description: input.pillar4Description,
    }).eq('id', true).select(columns).single();
  if (error) throw new Error('No se pudo guardar la sección "Sobre nosotros".');
  return dto(data);
}
