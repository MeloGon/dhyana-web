import { handleAdminComplaintSheetsGet } from '@/lib/server/complaint-book-http';

export async function GET(request: Request) { return handleAdminComplaintSheetsGet(request); }
