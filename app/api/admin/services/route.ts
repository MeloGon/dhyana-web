import { handleSiteMutation } from '@/lib/server/site-http';
export async function PUT(request: Request) { return handleSiteMutation(request, 'services'); }
