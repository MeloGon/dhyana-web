import 'server-only';
import { connection } from 'next/server';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import type { LegalSettings } from '@/lib/types/legal';
import type { Database } from '@/lib/types/database';

type LegalRow = Database['public']['Tables']['legal_settings']['Row'];
const columns = 'terms_title,terms_body,privacy_title,privacy_body,returns_title,returns_body' as const;

function dto(row: Omit<LegalRow, 'id'>): LegalSettings {
  return {
    termsTitle: row.terms_title, termsBody: row.terms_body,
    privacyTitle: row.privacy_title, privacyBody: row.privacy_body,
    returnsTitle: row.returns_title, returnsBody: row.returns_body,
  };
}

function parseInput(body: Record<string, unknown>): LegalSettings {
  function text(key: string, label: string, max: number) {
    const value = body[key];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max || value.includes('\0')) {
      throw new HttpError(400, `${label}: completa el campo usando hasta ${max} caracteres.`);
    }
    return value.trim();
  }
  return {
    termsTitle: text('termsTitle', 'Título de Términos y condiciones', 200),
    termsBody: text('termsBody', 'Contenido de Términos y condiciones', 20000),
    privacyTitle: text('privacyTitle', 'Título de Política de privacidad', 200),
    privacyBody: text('privacyBody', 'Contenido de Política de privacidad', 20000),
    returnsTitle: text('returnsTitle', 'Título de Política de cambios y devoluciones', 200),
    returnsBody: text('returnsBody', 'Contenido de Política de cambios y devoluciones', 20000),
  };
}

async function readSettings(): Promise<LegalSettings> {
  const { data, error } = await createDatabaseAdminClient().from('legal_settings').select(columns).eq('id', true).single();
  if (error) throw new Error('No se pudieron leer los términos y políticas.');
  return dto(data);
}

export async function getAdminLegalSettings(): Promise<LegalSettings> {
  await requireAdmin();
  return readSettings();
}

export async function getPublicLegalSettings(): Promise<LegalSettings> {
  // Evita prerenderizar /legal con datos fijados durante el build.
  await connection();
  return readSettings();
}

export async function saveLegalSettings(body: Record<string, unknown>): Promise<LegalSettings> {
  await requireAdmin();
  const input = parseInput(body);
  // Una sola fila: los tres documentos se guardan juntos en una operación atómica.
  const { data, error } = await createDatabaseAdminClient().from('legal_settings').update({
    terms_title: input.termsTitle, terms_body: input.termsBody,
    privacy_title: input.privacyTitle, privacy_body: input.privacyBody,
    returns_title: input.returnsTitle, returns_body: input.returnsBody,
  }).eq('id', true).select(columns).single();
  if (error) throw new Error('No se pudieron guardar los términos y políticas.');
  return dto(data);
}
