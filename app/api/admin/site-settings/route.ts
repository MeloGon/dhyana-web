import { handleSiteGet, handleSiteMutation } from '@/lib/server/site-http';
export async function GET() { return handleSiteGet(true); }
export async function PUT(request: Request) { return handleSiteMutation(request, 'settings'); }
