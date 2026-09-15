import { handleSiteGet } from '@/lib/server/site-http';
export async function GET() { return handleSiteGet(false); }
