'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AccountNav from '@/features/auth/components/AccountNav';
import RequireAuth from '@/features/auth/components/RequireAuth';
import { useApp } from '@/components/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCents, type Order, type OrderStatus } from '@/features/commerce';

function statusLabel(status: OrderStatus) {
  return status.replaceAll('_', ' ');
}

function statusClass(status: OrderStatus) {
  if (status === 'pending_payment') return 'bg-amber-100 text-amber-800';
  if (status === 'cancelled') return 'bg-gray-200 text-gray-700';
  if (status === 'refunded') return 'bg-gray-100 text-gray-600';
  if (status === 'paid') return 'bg-green-100 text-green-800';
  return 'bg-black text-white';
}

function AccountOrdersContent() {
  const { state } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    if (!state.user) return;
    void fetch('/api/v1/account/orders')
      .then((r) => r.json())
      .then((payload) => setOrders(payload?.data?.orders ?? []))
      .finally(() => setLoading(false));
  }, [state.user]);

  const payOrder = async (orderId: string) => {
    setActingId(orderId);
    try {
      const res = await fetch(`/api/v1/account/orders/${orderId}/pay`, {
        method: 'POST',
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Unable to resume payment');
        if (payload?.error?.code === 'ORDER_NOT_PAYABLE') {
          const list = await fetch('/api/v1/account/orders').then((r) =>
            r.json()
          );
          setOrders(list?.data?.orders ?? []);
        }
        return;
      }
      const url = payload?.data?.checkoutUrl as string | undefined;
      if (url) {
        window.location.assign(url);
        return;
      }
      toast.error('Missing checkout URL');
    } catch {
      toast.error('Unable to resume payment');
    } finally {
      setActingId(null);
    }
  };

  const cancelOrder = async (orderId: string) => {
    setActingId(orderId);
    try {
      const res = await fetch(`/api/v1/account/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Unable to cancel order');
        const list = await fetch('/api/v1/account/orders').then((r) => r.json());
        setOrders(list?.data?.orders ?? []);
        return;
      }
      const updated = payload.data.order as Order;
      setOrders((prev) =>
        prev.map((order) => (order.id === updated.id ? updated : order))
      );
      toast.success('Order cancelled');
    } catch {
      toast.error('Unable to cancel order');
    } finally {
      setActingId(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <AccountNav />
      <h2 className="text-lg font-bold tracking-wide mb-6">ORDER HISTORY</h2>

      {loading ? (
        <LoadingSpinner size="md" label="Loading orders" />
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-6">No orders yet.</p>
          <Link
            href="/shop"
            className="inline-block bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-3 font-bold tracking-wide"
          >
            SHOP NOW
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const busy = actingId === order.id;
            const confirmed =
              order.status === 'paid' ||
              order.status === 'fulfilled' ||
              order.status === 'refunded';

            return (
              <li key={order.id} className="border border-gray-200 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-bold">{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <span
                      className={`inline-block mt-2 text-xs font-bold uppercase tracking-wide px-2 py-1 ${statusClass(order.status)}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-[#E3002C]">
                    {formatCents(order.totals.totalCents)}
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {order.items.map((item) => (
                    <li
                      key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                    >
                      {item.name} — {item.selectedColor} / US {item.selectedSize}{' '}
                      × {item.quantity}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3 mt-4">
                  {order.status === 'pending_payment' ? (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void payOrder(order.id)}
                        className="bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white px-5 py-2 text-sm font-bold tracking-wide"
                      >
                        {busy ? 'WORKING…' : 'PAY NOW'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void cancelOrder(order.id)}
                        className="border-2 border-black disabled:border-gray-300 disabled:text-gray-400 px-5 py-2 text-sm font-bold tracking-wide"
                      >
                        CANCEL ORDER
                      </button>
                    </>
                  ) : null}
                  {order.status === 'cancelled' ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void payOrder(order.id)}
                      className="bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white px-5 py-2 text-sm font-bold tracking-wide"
                    >
                      {busy ? 'WORKING…' : 'PAY AGAIN'}
                    </button>
                  ) : null}
                  {confirmed ? (
                    <Link
                      href={`/checkout/success?orderId=${order.id}`}
                      className="inline-block text-sm font-bold text-[#E3002C] hover:underline py-2"
                    >
                      VIEW CONFIRMATION →
                    </Link>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default function AccountOrders() {
  return (
    <RequireAuth loginNext="/account/orders">
      <AccountOrdersContent />
    </RequireAuth>
  );
}
