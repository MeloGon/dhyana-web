import { handleQuoteSave, handleQuotesGet } from '@/lib/server/quotes-http';

export async function GET() {
  return handleQuotesGet(true);
}

export async function POST(request: Request) {
  return handleQuoteSave(request);
}
