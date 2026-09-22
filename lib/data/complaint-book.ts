// Identificador técnico de canal, no un dato de negocio editable. Agregar otro
// canal (app, sede física) es sumar otra constante: la numeración ya es por
// (código de establecimiento, año), no se rompe al incorporar uno nuevo.
export const ESTABLISHMENT_CODE = 'WEB';

export const COMPLAINT_TYPE_OPTIONS: { value: 'reclamo' | 'queja'; label: string }[] = [
  { value: 'reclamo', label: 'Reclamo — disconformidad con el bien o servicio' },
  { value: 'queja', label: 'Queja — disconformidad con la atención al consumidor' },
];

export const COMPLAINT_GOOD_TYPE_OPTIONS: { value: 'producto' | 'servicio'; label: string }[] = [
  { value: 'producto', label: 'Producto' },
  { value: 'servicio', label: 'Servicio' },
];

export const COMPLAINT_DOCUMENT_TYPE_OPTIONS: { value: 'dni' | 'ce' | 'pasaporte' | 'ruc'; label: string }[] = [
  { value: 'dni', label: 'DNI' },
  { value: 'ce', label: 'Carné de extranjería' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'ruc', label: 'RUC' },
];

export const COMPLAINT_STATUS_LABELS: Record<'registrado' | 'en_tramite' | 'respondido', string> = {
  registrado: 'Registrado',
  en_tramite: 'En trámite',
  respondido: 'Respondido',
};

// Solo excluye sábados y domingos; sin calendario de feriados peruanos (limitación conocida).
export function businessDaysSince(from: Date, until: Date = new Date()): number {
  let count = 0;
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(until);
  end.setHours(0, 0, 0, 0);
  while (cursor < end) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) count += 1;
  }
  return count;
}

export const COMPLAINT_RESPONSE_DEADLINE_DAYS = 15;
