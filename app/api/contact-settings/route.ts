import { handleContactSettingsGet } from '@/lib/server/contact-settings-http';

export async function GET() { return handleContactSettingsGet(false); }
