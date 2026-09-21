import { handleLegalSettingsGet, handleLegalSettingsSave } from '@/lib/server/legal-settings-http';

export async function GET() { return handleLegalSettingsGet(true); }
export async function PUT(request: Request) { return handleLegalSettingsSave(request); }
