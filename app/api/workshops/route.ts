import { handleCatalogGet } from '@/lib/server/catalog-http';

export async function GET() { return handleCatalogGet(false); }
