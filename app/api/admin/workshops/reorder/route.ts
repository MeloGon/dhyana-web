import { handleWorkshopReorder } from '@/lib/server/catalog-http';

export async function PATCH(request: Request) { return handleWorkshopReorder(request); }
