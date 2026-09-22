import 'server-only';

import { requireAdmin } from '@/lib/server/admin-auth';
import { createDatabaseAdminClient } from '@/lib/server/database';
import { HttpError } from '@/lib/server/http-error';
import { parseComplaintFilters, parseComplaintResponse, parseComplaintSheetInput, validateId } from '@/lib/server/complaint-book-validation';
import { renderComplaintSheetPdf } from '@/lib/server/complaint-book-pdf';
import { sendComplaintConfirmationEmails } from '@/lib/server/complaint-book-email';
import { ESTABLISHMENT_CODE } from '@/lib/data/complaint-book';
import type {
  AdminComplaintSheet,
  AdminComplaintSheetDetail,
  AdminComplaintSheetsPage,
  ComplaintBookSettings,
  ComplaintSheetConfirmation,
  PublicComplaintBookSettings,
} from '@/lib/types/complaint-book';
import type { Database } from '@/lib/types/database';

type EntryRow = Database['public']['Tables']['complaint_book_entries']['Row'];
const bucket = 'complaint-book';
const pageSize = 20;

const settingsColumns = 'ruc,razon_social,domicilio,correo_reclamos_interno,texto_aviso_otras_vias,texto_plazo_respuesta' as const;
const listColumns = 'id,numero_hoja,created_at,tipo,estado,consumidor_nombre,consumidor_correo,bien_descripcion,respuesta_fecha' as const;
const detailColumns = '*' as const;

function databaseError(error: { code: string; message: string }): never {
  if (['PT400', 'PT403', 'PT404', 'PT409'].includes(error.code)) throw new HttpError(Number(error.code.slice(2)), error.message);
  throw new Error('No se pudo completar la operación del libro de reclamaciones.');
}

function settingsDto(row: Omit<Database['public']['Tables']['complaint_book_settings']['Row'], 'id'>): ComplaintBookSettings {
  return {
    ruc: row.ruc, razonSocial: row.razon_social, domicilio: row.domicilio,
    correoReclamosInterno: row.correo_reclamos_interno,
    textoAvisoOtrasVias: row.texto_aviso_otras_vias, textoPlazoRespuesta: row.texto_plazo_respuesta,
  };
}

function listDto(row: Pick<EntryRow, 'id' | 'numero_hoja' | 'created_at' | 'tipo' | 'estado' | 'consumidor_nombre' | 'consumidor_correo' | 'bien_descripcion' | 'respuesta_fecha'>): AdminComplaintSheet {
  return {
    id: row.id, numeroHoja: row.numero_hoja, createdAt: row.created_at,
    tipo: row.tipo as AdminComplaintSheet['tipo'], estado: row.estado as AdminComplaintSheet['estado'],
    consumidorNombre: row.consumidor_nombre, consumidorCorreo: row.consumidor_correo,
    bienDescripcion: row.bien_descripcion, respuestaFecha: row.respuesta_fecha,
  };
}

async function detailDto(row: EntryRow): Promise<AdminComplaintSheetDetail> {
  let pdfUrl: string | null = null;
  if (row.pdf_path) {
    const { data } = await createDatabaseAdminClient().storage.from(bucket).createSignedUrl(row.pdf_path, 300);
    pdfUrl = data?.signedUrl ?? null;
  }
  return {
    ...listDto(row),
    consumidorDomicilio: row.consumidor_domicilio,
    consumidorDocumentoTipo: row.consumidor_documento_tipo as AdminComplaintSheetDetail['consumidorDocumentoTipo'],
    consumidorDocumentoNumero: row.consumidor_documento_numero,
    consumidorTelefono: row.consumidor_telefono,
    esMenorEdad: row.es_menor_edad,
    representanteNombre: row.representante_nombre,
    representanteDocumentoNumero: row.representante_documento_numero,
    bienTipo: row.bien_tipo as AdminComplaintSheetDetail['bienTipo'],
    montoReclamadoCents: row.monto_reclamado_cents,
    detalleHechos: row.detalle_hechos,
    detallePedido: row.detalle_pedido,
    respuestaTexto: row.respuesta_texto,
    respuestaEvidenciaPath: row.respuesta_evidencia_path,
    respondidoPor: row.respondido_por,
    pdfUrl,
    emailConsumidorEnviado: row.email_consumidor_enviado,
    emailInternoEnviado: row.email_interno_enviado,
  };
}

async function readSettings(): Promise<Omit<Database['public']['Tables']['complaint_book_settings']['Row'], 'id'>> {
  const { data, error } = await createDatabaseAdminClient().from('complaint_book_settings').select(settingsColumns).eq('id', true).single();
  if (error) throw new Error('No se pudo leer la configuración del libro de reclamaciones.');
  return data;
}

export async function getPublicComplaintBookSettings(): Promise<PublicComplaintBookSettings> {
  const row = await readSettings();
  return { ruc: row.ruc, razonSocial: row.razon_social, domicilio: row.domicilio,
    textoAvisoOtrasVias: row.texto_aviso_otras_vias, textoPlazoRespuesta: row.texto_plazo_respuesta };
}

export async function getAdminComplaintBookSettings(): Promise<ComplaintBookSettings> {
  await requireAdmin();
  return settingsDto(await readSettings());
}

function parseSettingsInput(body: Record<string, unknown>): ComplaintBookSettings {
  function field(key: string, label: string, max: number) {
    const value = body[key];
    if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new HttpError(400, `${label}: revisa el campo.`);
    return value.trim();
  }
  const ruc = field('ruc', 'RUC', 11);
  if (!/^\d{11}$/.test(ruc)) throw new HttpError(400, 'El RUC debe tener 11 dígitos.');
  const correo = field('correoReclamosInterno', 'Correo de reclamos', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) throw new HttpError(400, 'Ingresa un correo de reclamos válido.');
  return {
    ruc, razonSocial: field('razonSocial', 'Razón social', 200), domicilio: field('domicilio', 'Domicilio', 300),
    correoReclamosInterno: correo,
    textoAvisoOtrasVias: field('textoAvisoOtrasVias', 'Aviso de otras vías', 2000),
    textoPlazoRespuesta: field('textoPlazoRespuesta', 'Plazo de respuesta', 2000),
  };
}

export async function saveComplaintBookSettings(body: Record<string, unknown>): Promise<ComplaintBookSettings> {
  await requireAdmin();
  const input = parseSettingsInput(body);
  const { data, error } = await createDatabaseAdminClient().from('complaint_book_settings').update({
    ruc: input.ruc, razon_social: input.razonSocial, domicilio: input.domicilio,
    correo_reclamos_interno: input.correoReclamosInterno,
    texto_aviso_otras_vias: input.textoAvisoOtrasVias, texto_plazo_respuesta: input.textoPlazoRespuesta,
  }).eq('id', true).select(settingsColumns).single();
  if (error) throw new Error('No se pudo guardar la configuración del libro de reclamaciones.');
  return settingsDto(data);
}

// Registra la hoja de forma atómica (numeración) y luego intenta, sin bloquear
// la confirmación al consumidor, generar el PDF y enviar las copias por correo.
export async function submitComplaintSheet(body: Record<string, unknown>): Promise<ComplaintSheetConfirmation> {
  const input = parseComplaintSheetInput(body);
  const client = createDatabaseAdminClient();
  const { data, error } = await client.rpc('register_complaint_sheet', {
    p_codigo_establecimiento: ESTABLISHMENT_CODE,
    p_input: input as unknown as Database['public']['Functions']['register_complaint_sheet']['Args']['p_input'],
  });
  if (error) databaseError(error);
  const result = data as unknown as { id: string; numeroHoja: string; createdAt: string };
  // La hoja ya quedó registrada: PDF y correo son pasos independientes de mejor
  // esfuerzo. Si uno falla, el otro se intenta igual y el error queda anotado.
  const errors: string[] = [];
  const settings = await readSettings().catch(() => null);
  let pdf: Buffer | null = null;
  let pdfUrl: string | null = null;

  try {
    if (!settings) throw new Error('No se pudo leer la configuración del proveedor.');
    const rendered = await renderComplaintSheetPdf(settingsDto(settings), { ...input, numeroHoja: result.numeroHoja, createdAt: result.createdAt });
    const [codigo, anio] = result.numeroHoja.split('-');
    const pdfPath = `hojas/${codigo}/${anio}/${result.numeroHoja}.pdf`;
    const { error: uploadError } = await client.storage.from(bucket).upload(pdfPath, rendered, { contentType: 'application/pdf', upsert: false });
    if (uploadError) throw new Error(uploadError.message);
    pdf = rendered;
    await client.from('complaint_book_entries').update({ pdf_path: pdfPath }).eq('id', result.id);
    // Vigencia corta: alcanza para que el mismo visitante descargue su constancia
    // en esta sesión; no queda una URL pública permanente.
    pdfUrl = (await client.storage.from(bucket).createSignedUrl(pdfPath, 600)).data?.signedUrl ?? null;
  } catch (pdfError) {
    errors.push(`PDF: ${pdfError instanceof Error ? pdfError.message : 'no se pudo generar.'}`);
  }

  const emailResult = await sendComplaintConfirmationEmails({
    numeroHoja: result.numeroHoja, tipo: input.tipo, createdAt: result.createdAt,
    consumidorCorreo: input.consumidorCorreo, correoReclamosInterno: settings?.correo_reclamos_interno ?? '', pdf,
  });
  if (emailResult.error) errors.push(emailResult.error);
  await client.from('complaint_book_entries').update({
    email_consumidor_enviado: emailResult.consumidorEnviado, email_interno_enviado: emailResult.internoEnviado,
    email_error: errors.join(' '),
  }).eq('id', result.id);

  return { id: result.id, numeroHoja: result.numeroHoja, createdAt: result.createdAt, pdfUrl };
}

export async function getAdminComplaintSheets(params = new URLSearchParams()): Promise<AdminComplaintSheetsPage> {
  await requireAdmin();
  const filters = parseComplaintFilters(params);
  let query = createDatabaseAdminClient().from('complaint_book_entries').select(listColumns, { count: 'exact' });
  if (filters.estado !== 'all') query = query.eq('estado', filters.estado);
  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query.order('created_at', { ascending: false }).range(from, from + pageSize - 1);
  if (error) throw new Error('No se pudieron leer las hojas del libro de reclamaciones.');
  return { total: count ?? 0, page: filters.page, pageSize, items: data.map(listDto) };
}

export async function getAdminComplaintSheetDetail(id: string): Promise<AdminComplaintSheetDetail> {
  await requireAdmin();
  validateId(id);
  const { data, error } = await createDatabaseAdminClient().from('complaint_book_entries').select(detailColumns).eq('id', id).maybeSingle();
  if (error) throw new Error('No se pudo leer la hoja.');
  if (!data) throw new HttpError(404, 'Hoja no encontrada.');
  return detailDto(data);
}

export async function setComplaintSheetStatus(id: string, body: Record<string, unknown>) {
  const admin = await requireAdmin();
  validateId(id);
  if (body.estado !== 'en_tramite') throw new HttpError(400, 'Transición de estado inválida.');
  const { error } = await createDatabaseAdminClient().rpc('set_complaint_sheet_status', { p_admin_id: admin.id, p_id: id, p_estado: body.estado });
  if (error) databaseError(error);
  return { updated: true };
}

export async function respondComplaintSheet(id: string, body: Record<string, unknown>) {
  const admin = await requireAdmin();
  validateId(id);
  const input = parseComplaintResponse(body);
  const evidenciaPath = typeof body.respuestaEvidenciaPath === 'string' ? body.respuestaEvidenciaPath : '';
  const { error } = await createDatabaseAdminClient().rpc('respond_complaint_sheet', {
    p_admin_id: admin.id, p_id: id, p_respuesta_texto: input.respuestaTexto,
    p_respuesta_fecha: input.respuestaFecha, p_evidencia_path: evidenciaPath,
  });
  if (error) databaseError(error);
  return { updated: true };
}

export async function uploadComplaintEvidence(id: string, file: File): Promise<{ path: string }> {
  await requireAdmin();
  validateId(id);
  const allowed: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
  const extension = allowed[file.type];
  if (!extension || file.size === 0 || file.size > 10485760) throw new HttpError(400, 'Selecciona un PDF o una imagen de hasta 10 MB.');
  const path = `evidencia/${id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await createDatabaseAdminClient().storage.from(bucket).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (error) throw new Error('No se pudo subir la evidencia.');
  return { path };
}

function csvField(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function exportComplaintSheets(): Promise<string> {
  await requireAdmin();
  const { data, error } = await createDatabaseAdminClient().from('complaint_book_entries')
    .select('numero_hoja,created_at,tipo,estado,consumidor_nombre,consumidor_correo,bien_descripcion,respuesta_fecha')
    .order('created_at', { ascending: false });
  if (error) throw new Error('No se pudo exportar el listado.');
  const header = ['Número de hoja', 'Fecha', 'Tipo', 'Estado', 'Consumidor', 'Correo', 'Bien reclamado', 'Fecha de respuesta'];
  const rows = data.map((row) => [row.numero_hoja, row.created_at, row.tipo, row.estado, row.consumidor_nombre, row.consumidor_correo, row.bien_descripcion, row.respuesta_fecha ?? '']);
  return [header, ...rows].map((row) => row.map(csvField).join(',')).join('\n');
}
