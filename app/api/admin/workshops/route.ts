import { handleCatalogGet, handleWorkshopSave } from '@/lib/server/catalog-http';

export async function GET() { return handleCatalogGet(true); }
export async function POST(request: Request) { return handleWorkshopSave(request); }
