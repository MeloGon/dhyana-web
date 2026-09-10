import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import type { ContactSettings, PublicContactSettings } from '@/lib/types/contact-settings';
import type { Database } from '@/lib/types/database';

type ContactRow = Database['public']['Tables']['contact_settings']['Row'];
const columns = 'title,address,address_note,phone,phone_note,email,hours,hours_note,whatsapp_phone,whatsapp_message,whatsapp_label' as const;

function dto(row: Omit<ContactRow, 'id'>): ContactSettings {
  return { title: row.title, address: row.address, addressNote: row.address_note,
    phone: row.phone, phoneNote: row.phone_note, email: row.email, hours: row.hours,
    hoursNote: row.hours_note, whatsappPhone: row.whatsapp_phone,
    whatsappMessage: row.whatsapp_message, whatsappLabel: row.whatsapp_label };
}

function parseInput(body: Record<string, unknown>): ContactSettings {
  function text(key: string, label: string, max: number, optional = false) {
    const value = body[key];
    if (typeof value !== 'string' || (!optional && !value.trim()) || value.trim().length > max || value.includes('\0')) {
      throw new HttpError(400, `${label}: ${optional ? 'usa' : 'completa el campo usando'} hasta ${max} caracteres.`);
    }
    return value.trim();
  }
  const phone = text('phone', 'Teléfono', 40);
  const whatsappPhone = text('whatsappPhone', 'Número de WhatsApp', 16).replace(/^\+/, '');
  const email = text('email', 'Correo electrónico', 254);
  // Se admiten espacios y separadores para mostrar el teléfono, pero el enlace usa solo dígitos.
  if (!/^\+[0-9 ()-]+$/.test(phone) || !/^[1-9][0-9]{6,14}$/.test(phone.replace(/\D/g, ''))) {
    throw new HttpError(400, 'Teléfono: incluye + y código de país, con 7 a 15 dígitos.');
  }
  if (!/^[1-9][0-9]{6,14}$/.test(whatsappPhone)) throw new HttpError(400, 'WhatsApp: usa código de país y número, con 7 a 15 dígitos sin espacios.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Ingresa un correo electrónico válido.');
  return { title: text('title', 'Título', 120), address: text('address', 'Dirección', 300),
    addressNote: text('addressNote', 'Referencia de dirección', 300, true), phone,
    phoneNote: text('phoneNote', 'Nota del teléfono', 300, true), email,
    hours: text('hours', 'Horario principal', 500), hoursNote: text('hoursNote', 'Horario adicional', 500, true),
    whatsappPhone, whatsappMessage: text('whatsappMessage', 'Mensaje de WhatsApp', 1000, true),
    whatsappLabel: text('whatsappLabel', 'Texto del botón', 120) };
}

async function readSettings(): Promise<ContactSettings> {
  const { data, error } = await createDatabaseAdminClient().from('contact_settings').select(columns).eq('id', true).single();
  if (error) throw new Error('No se pudieron leer los datos de la consulta.');
  return dto(data);
}

export async function getAdminContactSettings(): Promise<ContactSettings> {
  await requireAdmin();
  return readSettings();
}

export async function getPublicContactSettings(): Promise<PublicContactSettings> {
  const data = await readSettings();
  return { ...data, phoneHref: `tel:+${data.phone.replace(/\D/g, '')}`,
    emailHref: `mailto:${encodeURIComponent(data.email)}`,
    whatsappHref: `https://wa.me/${data.whatsappPhone}${data.whatsappMessage ? `?text=${encodeURIComponent(data.whatsappMessage)}` : ''}` };
}

export async function saveContactSettings(body: Record<string, unknown>): Promise<ContactSettings> {
  await requireAdmin();
  const input = parseInput(body);
  // Una sola fila: todos los campos se guardan juntos en una operación atómica.
  const { data, error } = await createDatabaseAdminClient().from('contact_settings').update({
    title: input.title, address: input.address, address_note: input.addressNote,
    phone: input.phone, phone_note: input.phoneNote, email: input.email,
    hours: input.hours, hours_note: input.hoursNote, whatsapp_phone: input.whatsappPhone,
    whatsapp_message: input.whatsappMessage, whatsapp_label: input.whatsappLabel,
  }).eq('id', true).select(columns).single();
  if (error) throw new Error('No se pudieron guardar los datos de la consulta.');
  return dto(data);
}
