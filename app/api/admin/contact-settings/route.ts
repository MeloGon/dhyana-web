import { handleContactSettingsGet, handleContactSettingsSave } from '@/lib/server/contact-settings-http';

export async function GET() { return handleContactSettingsGet(true); }
export async function PUT(request: Request) { return handleContactSettingsSave(request); }
