import { handleFaqsGet, handleFaqSave } from '@/lib/server/faqs-http';

export async function GET() { return handleFaqsGet(true); }
export async function POST(request: Request) { return handleFaqSave(request); }
