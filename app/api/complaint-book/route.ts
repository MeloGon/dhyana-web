import { handleComplaintBookSettingsGet, handleComplaintSheetSubmit } from '@/lib/server/complaint-book-http';

export async function GET() { return handleComplaintBookSettingsGet(false); }
export async function POST(request: Request) { return handleComplaintSheetSubmit(request); }
