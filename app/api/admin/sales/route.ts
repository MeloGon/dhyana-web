import { handleManualSale, handleSalesGet } from '@/lib/server/sales-http';

export const GET = handleSalesGet;
export const POST = handleManualSale;
