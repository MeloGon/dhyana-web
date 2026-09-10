// Se comparte entre la vista previa y el servidor; este último decide el valor final.
export function workshopSlug(title: string) {
  return title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'taller';
}
