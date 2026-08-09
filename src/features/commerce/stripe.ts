import Stripe from 'stripe';
import type { Order } from './types';
import { formatCents } from './money';

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2026-07-29.dahlia',
  });
}

export async function createStripeCheckoutSession(order: Order): Promise<{
  sessionId: string;
  url: string;
}> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: order.shipping.email,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
      },
      line_items: [
        ...order.items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: order.currency,
            unit_amount: item.unitPriceCents,
            product_data: {
              name: `${item.name} — ${item.selectedColor} / US ${item.selectedSize}`,
              images: [item.image],
            },
          },
        })),
        ...(order.totals.shippingCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: order.currency,
                  unit_amount: order.totals.shippingCents,
                  product_data: {
                    name: 'Shipping',
                  },
                },
              },
            ]
          : []),
        ...(order.totals.taxCents > 0
          ? [
              {
                quantity: 1,
                price_data: {
                  currency: order.currency,
                  unit_amount: order.totals.taxCents,
                  product_data: {
                    name: 'Estimated tax',
                  },
                },
              },
            ]
          : []),
      ],
      success_url: `${appUrl}/checkout/success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=1&orderId=${order.id}`,
    },
    { idempotencyKey: `checkout-${order.idempotencyKey}` }
  );

  if (!session.url) {
    throw new Error('Stripe session missing redirect URL');
  }

  return { sessionId: session.id, url: session.url };
}

export function describeOrderTotal(order: Order): string {
  return formatCents(order.totals.totalCents);
}
