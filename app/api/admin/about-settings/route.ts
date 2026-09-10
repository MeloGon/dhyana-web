import { handleAboutSettingsGet, handleAboutSettingsSave } from '@/lib/server/about-settings-http';

export async function GET() { return handleAboutSettingsGet(true); }
export async function PUT(request: Request) { return handleAboutSettingsSave(request); }
