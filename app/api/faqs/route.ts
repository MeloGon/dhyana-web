import { handleFaqsGet } from '@/lib/server/faqs-http';

export async function GET() { return handleFaqsGet(false); }
