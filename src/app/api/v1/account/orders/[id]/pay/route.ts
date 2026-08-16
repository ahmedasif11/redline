import { NextResponse } from 'next/server';
import { AuthError, requireUser } from '@/features/auth/server';
import {
  CheckoutValidationError,
  resumeOrderCheckout,
} from '@/features/commerce/server';

type Params = { params: Promise<{ id: string }> };

function statusForCode(code: string): number {
  if (code === 'ORDER_NOT_FOUND') return 404;
  if (code === 'FORBIDDEN') return 403;
  if (code === 'ORDER_NOT_PAYABLE') return 409;
  return 400;
}

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const result = await resumeOrderCheckout(id, user.id);
    return NextResponse.json({
      data: {
        orderId: result.order.id,
        checkoutUrl: result.checkoutUrl,
        mode: result.mode,
        status: result.order.status,
      },
    });
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
    console.error('[account/orders/pay]', error);
    return NextResponse.json(
      { error: { code: 'PAY_FAILED', message: 'Unable to resume payment' } },
      { status: 500 }
    );
  }
}
