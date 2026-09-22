import 'server-only';

import { HttpError } from '@/lib/server/http-error';
import { validateId } from '@/lib/server/catalog-validation';
import type {
  ComplaintDocumentType,
  ComplaintFilters,
  ComplaintGoodType,
  ComplaintResponseInput,
  ComplaintSheetInput,
  ComplaintType,
} from '@/lib/types/complaint-book';

function text(body: Record<string, unknown>, key: string, label: string, max: number, optional = false) {
  const value = body[key];
  if (typeof value !== 'string' || (!optional && !value.trim()) || value.trim().length > max || value.includes('\0')) {
    throw new HttpError(400, `${label}: ${optional ? 'usa' : 'completa el campo usando'} hasta ${max} caracteres.`);
  }
  return value.trim();
}

// Mismos datos mínimos que exige la norma: si falta alguno, el reclamo se
// considera "no presentado" y no debe llegar a crear una hoja.
export function parseComplaintSheetInput(body: Record<string, unknown>): ComplaintSheetInput {
  if (body.tipo !== 'reclamo' && body.tipo !== 'queja') throw new HttpError(400, 'Selecciona si es un reclamo o una queja.');
  if (body.consumidorDocumentoTipo !== 'dni' && body.consumidorDocumentoTipo !== 'ce'
    && body.consumidorDocumentoTipo !== 'pasaporte' && body.consumidorDocumentoTipo !== 'ruc') {
    throw new HttpError(400, 'Selecciona un tipo de documento válido.');
  }
  if (body.bienTipo !== 'producto' && body.bienTipo !== 'servicio') throw new HttpError(400, 'Indica si reclamas por un producto o un servicio.');
  if (typeof body.esMenorEdad !== 'boolean') throw new HttpError(400, 'Indica si el consumidor es menor de edad.');

  const consumidorCorreo = text(body, 'consumidorCorreo', 'Correo electrónico', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(consumidorCorreo)) throw new HttpError(400, 'Ingresa un correo electrónico válido.');
  const consumidorTelefono = text(body, 'consumidorTelefono', 'Teléfono', 40);
  if (!/^\+?[\d ()-]+$/.test(consumidorTelefono) || consumidorTelefono.replace(/\D/g, '').length < 6) {
    throw new HttpError(400, 'Ingresa un teléfono válido.');
  }

  const esMenorEdad = body.esMenorEdad;
  const representanteNombre = esMenorEdad ? text(body, 'representanteNombre', 'Nombre del representante', 200) : '';
  const representanteDocumentoNumero = esMenorEdad ? text(body, 'representanteDocumentoNumero', 'Documento del representante', 20) : '';

  let montoReclamadoCents: number | null = null;
  if (body.montoReclamadoCents !== null && body.montoReclamadoCents !== undefined) {
    if (typeof body.montoReclamadoCents !== 'number' || !Number.isSafeInteger(body.montoReclamadoCents) || body.montoReclamadoCents < 0) {
      throw new HttpError(400, 'El monto reclamado debe ser un importe válido en soles.');
    }
    montoReclamadoCents = body.montoReclamadoCents;
  }

  return {
    tipo: body.tipo as ComplaintType,
    consumidorNombre: text(body, 'consumidorNombre', 'Nombre completo', 200),
    consumidorDomicilio: text(body, 'consumidorDomicilio', 'Domicilio', 300),
    consumidorDocumentoTipo: body.consumidorDocumentoTipo as ComplaintDocumentType,
    consumidorDocumentoNumero: text(body, 'consumidorDocumentoNumero', 'Número de documento', 20),
    consumidorTelefono,
    consumidorCorreo,
    esMenorEdad,
    representanteNombre,
    representanteDocumentoNumero,
    bienTipo: body.bienTipo as ComplaintGoodType,
    bienDescripcion: text(body, 'bienDescripcion', 'Descripción del producto o servicio', 2000),
    montoReclamadoCents,
    detalleHechos: text(body, 'detalleHechos', 'Detalle de los hechos', 5000),
    detallePedido: text(body, 'detallePedido', 'Pedido concreto', 2000),
  };
}

export function parseComplaintFilters(params: URLSearchParams): ComplaintFilters {
  const estado = params.get('estado') ?? 'all';
  const page = Number(params.get('page') ?? 1);
  if (!['all', 'registrado', 'en_tramite', 'respondido'].includes(estado) || !Number.isInteger(page) || page < 1 || page > 100000) {
    throw new HttpError(400, 'Filtros inválidos.');
  }
  return { estado: estado as ComplaintFilters['estado'], page };
}

export function parseComplaintResponse(body: Record<string, unknown>): ComplaintResponseInput {
  const respuestaTexto = text(body, 'respuestaTexto', 'Respuesta', 5000);
  const respuestaFecha = text(body, 'respuestaFecha', 'Fecha de la respuesta', 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(respuestaFecha)) throw new HttpError(400, 'Fecha de la respuesta inválida.');
  return { respuestaTexto, respuestaFecha };
}

export { validateId };
