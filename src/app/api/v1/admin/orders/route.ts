import { NextResponse } from 'next/server';
import { AuthError, requireAdmin } from '@/features/auth/server';
import { listAdminOrders } from '@/features/admin/server';

export async function GET() {
  try {
    await requireAdmin();
    const orders = await listAdminOrders();
    return NextResponse.json({ data: { orders } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: { code: 'ORDERS_FAILED', message: 'Unable to load orders' } },
      { status: 500 }
    );
  }
}
