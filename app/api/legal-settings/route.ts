import { handleLegalSettingsGet } from '@/lib/server/legal-settings-http';

export async function GET() { return handleLegalSettingsGet(false); }
