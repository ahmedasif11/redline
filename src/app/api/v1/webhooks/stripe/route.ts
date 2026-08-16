import { NextResponse } from 'next/server';
import {
  CheckoutValidationError,
  abandonStripeCheckout,
  fulfillOrderFromStripeSession,
  getStripe,
  isStripeConfigured,
} from '@/features/commerce/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error: {
          code: 'STRIPE_NOT_CONFIGURED',
          message: 'Stripe webhooks require STRIPE_SECRET_KEY',
        },
      },
      { status: 503 }
    );
  }

  const stripe = getStripe();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      {
        error: {
          code: 'WEBHOOK_MISCONFIGURED',
          message: 'Missing Stripe signature or webhook secret',
        },
      },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('[stripe webhook] signature failed', error);
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_SIGNATURE',
          message: 'Webhook signature verification failed',
        },
      },
      { status: 400 }
    );
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object;
      const order = await fulfillOrderFromStripeSession(session);
      if (!order) {
        console.error('[stripe webhook] order not found for session', session.id);
      }
    } else if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object;
      await abandonStripeCheckout(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    if (error instanceof CheckoutValidationError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: 400 }
      );
    }
    console.error('[stripe webhook]', error);
    return NextResponse.json(
      { error: { code: 'WEBHOOK_HANDLER_FAILED', message: 'Handler error' } },
      { status: 500 }
    );
  }
}
