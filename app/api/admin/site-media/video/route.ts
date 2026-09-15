import { handleSiteMutation } from '@/lib/server/site-http';
export async function POST(request: Request) { return handleSiteMutation(request, 'video'); }
