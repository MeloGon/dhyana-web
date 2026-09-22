import { handleComplaintBookExport } from '@/lib/server/complaint-book-http';

export async function GET() { return handleComplaintBookExport(); }
