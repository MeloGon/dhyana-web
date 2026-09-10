import { handleQuotesGet } from '@/lib/server/quotes-http';

export async function GET() {
  return handleQuotesGet(false);
}
