import { NextResponse } from 'next/server';
import {
  CheckoutValidationError,
  createCheckoutSession,
  checkoutSessionSchema,
} from '@/features/commerce/server';
import { getCurrentUser } from '@/features/auth/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkoutSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid checkout payload',
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const result = await createCheckoutSession(parsed.data, user?.id);

    return NextResponse.json({
      data: {
        orderId: result.order.id,
        checkoutUrl: result.checkoutUrl,
        mode: result.mode,
        totals: result.order.totals,
      },
    });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: 400 }
      );
    }

    console.error('[checkout/session]', error);
    return NextResponse.json(
      {
        error: {
          code: 'CHECKOUT_FAILED',
          message: 'Unable to start checkout',
        },
      },
      { status: 500 }
    );
  }
}
