import { NextResponse } from 'next/server';
import { AuthError, requireUser } from '@/features/auth/server';
import {
  CheckoutValidationError,
  cancelCustomerOrder,
} from '@/features/commerce/server';

type Params = { params: Promise<{ id: string }> };

function statusForCode(code: string): number {
  if (code === 'ORDER_NOT_FOUND') return 404;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'ORDER_NOT_CANCELLABLE') return 409;
  return 400;
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const order = await cancelCustomerOrder(id, user.id);
    return NextResponse.json({ data: { order } });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status }
      );
    }
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: statusForCode(error.code) }
      );
    }
    console.error('[account/orders/cancel]', error);
    return NextResponse.json(
      { error: { code: 'CANCEL_FAILED', message: 'Unable to cancel order' } },
      { status: 500 }
    );
  }
}
