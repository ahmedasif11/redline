import { NextResponse } from 'next/server';
import { AuthError, requireUser } from '@/features/auth/server';
import { listOrdersByUserId } from '@/features/commerce/orders-store';

export async function GET() {
  try {
    const user = await requireUser();
    const orders = await listOrdersByUserId(user.id);
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
