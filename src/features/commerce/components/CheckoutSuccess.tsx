'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import type { Order } from '@/features/commerce';
import { formatCents } from '@/features/commerce';
import { BRAND } from '@/lib/brand';

export default function CheckoutSuccess({ orderId }: { orderId?: string }) {
  const { dispatch } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('redline-checkout-idemp');
    }
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('Missing order id');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/orders/${orderId}`);
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error?.message ?? 'Order not found');
        }
        if (!cancelled) setOrder(payload.data as Order);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load order');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;
    dispatch({ type: 'CLEAR_CART' });
  }, [dispatch, orderId]);

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Confirming your order…</p>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">ORDER NOT FOUND</h1>
        <p className="text-gray-600 mb-8">{error ?? 'Something went wrong.'}</p>
        <Link
          href="/shop"
          className="inline-block bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-3 font-bold tracking-wide"
        >
          BACK TO SHOP
        </Link>
      </section>
    );
  }

  const confirmed =
    order.status === 'paid' ||
    order.status === 'fulfilled' ||
    order.status === 'refunded';
  const pending = order.status === 'pending_payment';

  const heading = confirmed
    ? 'ORDER CONFIRMED'
    : pending
      ? 'PAYMENT PENDING'
      : 'ORDER CANCELLED';
  const Icon = confirmed ? CheckCircle2 : pending ? Clock3 : XCircle;

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Icon
          className="mx-auto mb-4 text-[#E3002C]"
          size={56}
          aria-hidden
        />
        <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-2">
          {BRAND.name}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          {heading}
        </h1>
        {confirmed ? (
          <p className="text-gray-600">
            Thanks {order.shipping.fullName}. Confirmation sent to{' '}
            {order.shipping.email}
            {order.emailSentAt ? '' : ' when email is configured'}.
          </p>
        ) : pending ? (
          <p className="text-gray-600">
            Payment is still processing, or was not completed. You can finish
            paying from your account order history.
          </p>
        ) : (
          <p className="text-gray-600">
            This order was cancelled and you were not charged. You can pay again
            from your account.
          </p>
        )}
        <p className="text-sm text-gray-500 mt-3">
          Order ID: <span className="font-medium text-black">{order.id}</span>
          {' · '}
          <span className="uppercase tracking-wide">
            {order.status.replaceAll('_', ' ')}
          </span>
          {order.paymentProvider === 'demo' ? ' · Demo payment' : ''}
        </p>
        {pending ? (
          <p className="text-sm text-amber-700 mt-2">
            This updates to paid once Stripe confirms it.
          </p>
        ) : null}
      </motion.div>

      <div className="bg-gray-50 p-6 sm:p-8 space-y-4 mb-10">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
            className="flex gap-4"
          >
            <div className="w-20 h-20 bg-white overflow-hidden shrink-0">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.selectedColor} / US {item.selectedSize} × {item.quantity}
              </p>
            </div>
            <p className="font-bold text-[#E3002C]">
              {formatCents(item.lineTotalCents)}
            </p>
          </div>
        ))}

        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCents(order.totals.subtotalCents)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {order.totals.shippingCents === 0
                ? 'FREE'
                : formatCents(order.totals.shippingCents)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCents(order.totals.taxCents)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2">
            <span>Total</span>
            <span className="text-[#E3002C]">
              {formatCents(order.totals.totalCents)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {confirmed ? (
          <>
            <Link
              href="/shop"
              className="inline-block text-center bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-3 font-bold tracking-wide transition-colors"
            >
              CONTINUE SHOPPING
            </Link>
            <Link
              href="/"
              className="inline-block text-center border-2 border-black text-black hover:bg-black hover:text-white px-8 py-3 font-bold tracking-wide transition-all"
            >
              BACK HOME
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/account/orders"
              className="inline-block text-center bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-3 font-bold tracking-wide transition-colors"
            >
              VIEW ORDER HISTORY
            </Link>
            <Link
              href="/shop"
              className="inline-block text-center border-2 border-black text-black hover:bg-black hover:text-white px-8 py-3 font-bold tracking-wide transition-all"
            >
              BACK TO SHOP
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
