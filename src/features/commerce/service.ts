import { randomUUID } from 'crypto';
import {
  buildOrderItems,
  CheckoutValidationError,
  computeTotals,
  sanitizeShipping,
} from './checkout';
import { sendOrderConfirmation } from './email';
import { decrementStock } from './inventory';
import {
  findOrderByIdempotencyKey,
  getOrderById,
  saveOrder,
  updateOrder,
} from './orders-store';
import type { CheckoutSessionInput } from './schema';
import {
  createStripeCheckoutSession,
  isStripeConfigured,
} from './stripe';
import type { Order } from './types';

export async function createCheckoutSession(
  input: CheckoutSessionInput,
  userId?: string
): Promise<{
  order: Order;
  checkoutUrl: string;
  mode: 'stripe' | 'demo';
}> {
  const existing = await findOrderByIdempotencyKey(input.idempotencyKey);
  if (existing) {
    if (existing.status === 'paid') {
      return {
        order: existing,
        checkoutUrl: `/checkout/success?orderId=${existing.id}`,
        mode: existing.paymentProvider,
      };
    }
    if (existing.stripeSessionId && isStripeConfigured()) {
      // Recreate session URL if still pending — fall through to new session below by updating
    } else if (existing.status === 'pending_payment' && existing.paymentProvider === 'demo') {
      return {
        order: existing,
        checkoutUrl: `/checkout/success?orderId=${existing.id}`,
        mode: 'demo',
      };
    }
  }

  const shipping = sanitizeShipping(input.shipping);
  const items = await buildOrderItems(input.items);
  const totals = computeTotals(items);
  const now = new Date().toISOString();

  let order: Order = existing ?? {
    id: `ord_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    userId,
    status: 'pending_payment',
    items,
    shipping,
    totals,
    currency: 'usd',
    paymentProvider: isStripeConfigured() ? 'stripe' : 'demo',
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
    updatedAt: now,
  };

  if (existing) {
    order = {
      ...existing,
      userId: userId ?? existing.userId,
      items,
      shipping,
      totals,
      updatedAt: now,
      paymentProvider: isStripeConfigured() ? 'stripe' : 'demo',
    };
  }

  await saveOrder(order);

  if (isStripeConfigured()) {
    const session = await createStripeCheckoutSession(order);
    const updated = await updateOrder(order.id, {
      stripeSessionId: session.sessionId,
      paymentProvider: 'stripe',
    });
    return {
      order: updated ?? order,
      checkoutUrl: session.url,
      mode: 'stripe',
    };
  }

  // Demo mode: complete payment locally so the storefront works without Stripe keys.
  const paid = await markOrderPaid(order.id, { provider: 'demo' });
  return {
    order: paid,
    checkoutUrl: `/checkout/success?orderId=${paid.id}`,
    mode: 'demo',
  };
}

export async function markOrderPaid(
  orderId: string,
  options?: {
    provider?: 'stripe' | 'demo';
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new CheckoutValidationError('ORDER_NOT_FOUND', 'Order not found');
  }

  if (order.status === 'paid') {
    return order;
  }

  await decrementStock(order.items);

  const paidAt = new Date().toISOString();
  let updated = await updateOrder(orderId, {
    status: 'paid',
    paidAt,
    paymentProvider: options?.provider ?? order.paymentProvider,
    stripeSessionId: options?.stripeSessionId ?? order.stripeSessionId,
    stripePaymentIntentId:
      options?.stripePaymentIntentId ?? order.stripePaymentIntentId,
  });

  if (!updated) {
    throw new CheckoutValidationError('ORDER_NOT_FOUND', 'Order not found');
  }

  const emailed = await sendOrderConfirmation(updated);
  if (emailed) {
    updated =
      (await updateOrder(orderId, { emailSentAt: new Date().toISOString() })) ??
      updated;
  }

  return updated;
}
