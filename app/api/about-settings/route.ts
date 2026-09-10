import { handleAboutSettingsGet } from '@/lib/server/about-settings-http';

export async function GET() { return handleAboutSettingsGet(false); }
