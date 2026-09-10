/** Los precios se almacenan en céntimos; la presentación siempre es en soles. */
export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(priceCents / 100);
}

/** Todas las fechas comerciales se muestran en la zona acordada, no la del dispositivo. */
export function formatLimaDate(instant: string) {
  // Armar el texto evita diferencias de espacios y abreviaturas entre Node y navegador.
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)!.value;
  return `${value('day')}/${value('month')}/${value('year')} ${value('hour')}:${value('minute')}`;
}
