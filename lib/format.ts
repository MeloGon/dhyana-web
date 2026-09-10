/** Los precios se almacenan en céntimos; la presentación siempre es en soles. */
export function formatPrice(priceCents: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(priceCents / 100);
}
