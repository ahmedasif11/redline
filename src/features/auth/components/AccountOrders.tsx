'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AccountNav from '@/features/auth/components/AccountNav';
import RequireAuth from '@/features/auth/components/RequireAuth';
import { useApp } from '@/components/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCents, type Order } from '@/features/commerce';

function AccountOrdersContent() {
  const { state } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) return;
    void fetch('/api/v1/account/orders')
      .then((r) => r.json())
      .then((payload) => setOrders(payload?.data?.orders ?? []))
      .finally(() => setLoading(false));
  }, [state.user]);

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
          {orders.map((order) => (
            <li key={order.id} className="border border-gray-200 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold">{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()} ·{' '}
                    <span className="uppercase">
                      {order.status.replace('_', ' ')}
                    </span>
                  </p>
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
              <Link
                href={`/checkout/success?orderId=${order.id}`}
                className="inline-block mt-4 text-sm font-bold text-[#E3002C] hover:underline"
              >
                VIEW CONFIRMATION →
              </Link>
            </li>
          ))}
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
