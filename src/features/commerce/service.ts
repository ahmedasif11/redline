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
  findOrderByStripeSessionId,
  getOrderById,
  saveOrder,
  updateOrder,
} from './orders-store';
import { setCart } from '@/features/auth/accounts-store';
import { getUserByEmail } from '@/features/auth/users-store';
import type { CheckoutSessionInput } from './schema';
import {
  createStripeCheckoutSession,
  expireStripeCheckoutSession,
  isStripeConfigured,
  retrieveStripeCheckoutSession,
} from './stripe';
import type { Order } from './types';

type StripeCheckoutSessionLike = {
  id: string;
  payment_status: string;
  metadata?: Record<string, string> | null;
  client_reference_id?: string | null;
  payment_intent?: string | { id: string } | null;
};

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
    if (existing.status === 'paid' || existing.status === 'fulfilled') {
      return {
        order: existing,
        checkoutUrl: `/checkout/success?orderId=${existing.id}`,
        mode: existing.paymentProvider,
      };
    }
    if (existing.status === 'refunded') {
      return {
        order: existing,
        checkoutUrl: `/checkout/success?orderId=${existing.id}`,
        mode: existing.paymentProvider,
      };
    }
    if (existing.stripeSessionId && isStripeConfigured()) {
      // Recreate a Stripe session if still pending or previously cancelled
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

  let resolvedUserId = userId;
  if (!resolvedUserId) {
    const account = await getUserByEmail(shipping.email);
    resolvedUserId = account?.id;
  }

  let order: Order = existing ?? {
    id: `ord_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    userId: resolvedUserId,
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
      userId: resolvedUserId ?? existing.userId,
      items,
      shipping,
      totals,
      status: 'pending_payment',
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

  if (
    order.status === 'paid' ||
    order.status === 'fulfilled' ||
    order.status === 'refunded'
  ) {
    return order;
  }

  if (order.status !== 'pending_payment') {
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

  if (updated.userId) {
    await setCart(updated.userId, []);
  }

  return updated;
}

function stripePaymentIntentId(
  session: StripeCheckoutSessionLike
): string | undefined {
  if (typeof session.payment_intent === 'string') {
    return session.payment_intent;
  }
  return session.payment_intent?.id;
}

export async function fulfillOrderFromStripeSession(
  session: StripeCheckoutSessionLike
): Promise<Order | null> {
  const order = await findOrderFromStripeSession(session);
  if (!order) return null;
  if (session.payment_status !== 'paid') {
    return order;
  }

  return markOrderPaid(order.id, {
    provider: 'stripe',
    stripeSessionId: session.id,
    stripePaymentIntentId: stripePaymentIntentId(session),
  });
}

export async function confirmStripeCheckoutSession(
  sessionId: string
): Promise<Order | null> {
  if (!isStripeConfigured() || !sessionId.startsWith('cs_')) {
    return null;
  }

  const session = await retrieveStripeCheckoutSession(sessionId);
  return fulfillOrderFromStripeSession(session);
}

async function findOrderFromStripeSession(
  session: StripeCheckoutSessionLike
): Promise<Order | null> {
  const orderId =
    session.metadata?.orderId ?? session.client_reference_id ?? undefined;
  if (orderId) {
    const byId = await getOrderById(orderId);
    if (byId) return byId;
  }
  if (session.id) {
    return findOrderByStripeSessionId(session.id);
  }
  return null;
}

export async function cancelPendingOrder(orderId: string): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;
  if (order.status !== 'pending_payment') {
    return order;
  }
  if (order.stripeSessionId) {
    await expireStripeCheckoutSession(order.stripeSessionId);
  }
  return updateOrder(orderId, { status: 'cancelled' });
}

export async function abandonStripeCheckout(
  session: StripeCheckoutSessionLike
): Promise<Order | null> {
  if (session.payment_status === 'paid') {
    return fulfillOrderFromStripeSession(session);
  }

  return findOrderFromStripeSession(session);
}

export async function abandonCheckoutByReturn(options: {
  orderId?: string;
  sessionId?: string;
}): Promise<Order | null> {
  if (
    options.sessionId &&
    isStripeConfigured() &&
    options.sessionId.startsWith('cs_')
  ) {
    const session = await retrieveStripeCheckoutSession(options.sessionId);
    return abandonStripeCheckout(session);
  }

  if (!options.orderId) return null;
  return getOrderById(options.orderId);
}

function assertOrderOwner(order: Order, userId: string) {
  if (order.userId !== userId) {
    throw new CheckoutValidationError(
      'FORBIDDEN',
      'You do not have access to this order'
    );
  }
}

export async function resumeOrderCheckout(
  orderId: string,
  userId: string
): Promise<{
  order: Order;
  checkoutUrl: string;
  mode: 'stripe' | 'demo';
}> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new CheckoutValidationError('ORDER_NOT_FOUND', 'Order not found');
  }
  assertOrderOwner(order, userId);

  if (
    order.status === 'paid' ||
    order.status === 'fulfilled' ||
    order.status === 'refunded'
  ) {
    throw new CheckoutValidationError(
      'ORDER_NOT_PAYABLE',
      'This order is already paid'
    );
  }

  if (order.status !== 'pending_payment' && order.status !== 'cancelled') {
    throw new CheckoutValidationError(
      'ORDER_NOT_PAYABLE',
      'This order cannot be paid'
    );
  }

  let current = order;
  if (order.status === 'cancelled') {
    const reopened = await updateOrder(order.id, { status: 'pending_payment' });
    if (!reopened) {
      throw new CheckoutValidationError('ORDER_NOT_FOUND', 'Order not found');
    }
    current = reopened;
  }

  if (!isStripeConfigured()) {
    const paid = await markOrderPaid(current.id, { provider: 'demo' });
    return {
      order: paid,
      checkoutUrl: `/checkout/success?orderId=${paid.id}`,
      mode: 'demo',
    };
  }

  if (current.stripeSessionId) {
    try {
      const session = await retrieveStripeCheckoutSession(current.stripeSessionId);
      if (session.payment_status === 'paid') {
        const paid = await fulfillOrderFromStripeSession(session);
        if (paid) {
          return {
            order: paid,
            checkoutUrl: `/checkout/success?orderId=${paid.id}`,
            mode: 'stripe',
          };
        }
      }
      if (session.status === 'open' && session.url) {
        return {
          order: current,
          checkoutUrl: session.url,
          mode: 'stripe',
        };
      }
    } catch (error) {
      console.error('[checkout] retrieve session failed', error);
    }
  }

  const touched = await updateOrder(current.id, {
    paymentProvider: 'stripe',
  });
  const forSession = touched ?? current;
  const session = await createStripeCheckoutSession(forSession);
  const updated = await updateOrder(forSession.id, {
    stripeSessionId: session.sessionId,
    paymentProvider: 'stripe',
  });

  return {
    order: updated ?? forSession,
    checkoutUrl: session.url,
    mode: 'stripe',
  };
}

export async function cancelCustomerOrder(
  orderId: string,
  userId: string
): Promise<Order> {
  const order = await getOrderById(orderId);
  if (!order) {
    throw new CheckoutValidationError('ORDER_NOT_FOUND', 'Order not found');
  }
  assertOrderOwner(order, userId);

  if (order.status === 'cancelled') {
    return order;
  }

  if (order.status !== 'pending_payment') {
    throw new CheckoutValidationError(
      'ORDER_NOT_CANCELLABLE',
      'This order can no longer be cancelled'
    );
  }

  const cancelled = await cancelPendingOrder(order.id);
  if (!cancelled) {
    throw new CheckoutValidationError('ORDER_NOT_FOUND', 'Order not found');
  }
  if (cancelled.status !== 'cancelled') {
    throw new CheckoutValidationError(
      'ORDER_NOT_CANCELLABLE',
      'This order can no longer be cancelled'
    );
  }
  return cancelled;
}
