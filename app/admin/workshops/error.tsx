'use client';

import { CatalogError } from '@/components/admin/catalog/CatalogError';

// Next 16.3 entrega retry para volver a consultar y renderizar esta ruta.
export default function AdminWorkshopsError({ retry }: { retry: () => void }) {
  return <CatalogError retry={retry} />;
}
