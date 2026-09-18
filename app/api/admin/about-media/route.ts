import { handleAboutMediaUpload } from '@/lib/server/about-settings-http';

export async function POST(request: Request) {
  return handleAboutMediaUpload(request);
}