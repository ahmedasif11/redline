'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCents, type Order, type OrderStatus } from '@/features/commerce';

const STATUSES: OrderStatus[] = [
  'pending_payment',
  'paid',
  'fulfilled',
  'cancelled',
  'refunded',
];

type StatusFilter = 'all' | 'pending_payment' | 'cancelled' | 'paid';

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/admin/orders');
        const payload = await res.json();
        if (!res.ok) {
          if (!cancelled) {
            toast.error(payload?.error?.message ?? 'Failed to load orders');
          }
          return;
        }
        if (!cancelled) setOrders(payload.data.orders);
      } catch {
        if (!cancelled) toast.error('Unable to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'pending_payment') {
      return orders.filter((order) => order.status === 'pending_payment');
    }
    if (filter === 'cancelled') {
      return orders.filter((order) => order.status === 'cancelled');
    }
    return orders.filter(
      (order) =>
        order.status === 'paid' ||
        order.status === 'fulfilled' ||
        order.status === 'refunded'
    );
  }, [filter, orders]);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setSavingId(orderId);
    try {
      const res = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Update failed');
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? payload.data.order : o))
      );
      toast.success('Order updated');
    } catch {
      toast.error('Unable to update order');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" label="Loading orders" />;
  }

  const filters: { id: StatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending_payment', label: 'Awaiting payment' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'paid', label: 'Paid+' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-1">
          FULFILLMENT
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-gray-600 mt-2">
          Unpaid drafts and customer cancels appear here as soon as you refresh.
          Refunds via Stripe dashboard for now.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`px-4 py-2 text-xs font-bold tracking-wide uppercase border-2 ${
              filter === item.id
                ? 'border-black bg-black text-white'
                : 'border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visibleOrders.length === 0 ? (
        <p className="text-gray-500 bg-white border border-gray-200 p-6">
          No orders in this view.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead className="bg-black text-white text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 font-bold">ORDER</th>
                <th className="px-4 py-3 font-bold">CUSTOMER</th>
                <th className="px-4 py-3 font-bold">TOTAL</th>
                <th className="px-4 py-3 font-bold">PROVIDER</th>
                <th className="px-4 py-3 font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.items.length} item
                      {order.items.length === 1 ? '' : 's'}
                    </p>
                    <span
                      className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-1 ${statusClass(order.status)}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p>{order.shipping.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {order.shipping.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top font-bold text-[#E3002C]">
                    {formatCents(order.totals.totalCents)}
                  </td>
                  <td className="px-4 py-3 align-top uppercase text-xs tracking-wide">
                    {order.paymentProvider}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={order.status}
                      disabled={savingId === order.id}
                      onChange={(e) =>
                        void updateStatus(
                          order.id,
                          e.target.value as OrderStatus
                        )
                      }
                      className="border-2 border-gray-200 px-2 py-2 focus:border-[#E3002C] focus:outline-none disabled:bg-gray-50 uppercase text-xs font-bold tracking-wide"
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
