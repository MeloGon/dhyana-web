import { handleComplaintBookSettingsGet, handleComplaintBookSettingsSave } from '@/lib/server/complaint-book-http';

export async function GET() { return handleComplaintBookSettingsGet(true); }
export async function PUT(request: Request) { return handleComplaintBookSettingsSave(request); }
