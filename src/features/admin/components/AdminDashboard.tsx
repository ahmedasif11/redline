'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCents } from '@/features/commerce';
import type { AdminMetrics } from '@/features/admin';

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 p-5">
      <p className="text-xs font-bold tracking-wider text-gray-500 mb-2">
        {label}
      </p>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="text-xs text-gray-500 mt-2">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/admin/metrics');
        const payload = await res.json();
        if (!res.ok) {
          if (!cancelled) {
            setError(payload?.error?.message ?? 'Failed to load metrics');
          }
          return;
        }
        if (!cancelled) setMetrics(payload.data.metrics);
      } catch {
        if (!cancelled) setError('Unable to load dashboard');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-[#E3002C] font-medium">{error}</p>;
  }

  if (!metrics) {
    return <LoadingSpinner size="md" label="Loading ops" />;
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-1">
          OVERVIEW
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Ops dashboard</h1>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Sales, stock pressure, and recent orders — brand tokens, denser layout.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile
          label="REVENUE"
          value={formatCents(metrics.revenueCents)}
          hint={`${metrics.paidOrderCount} paid / fulfilled`}
        />
        <MetricTile
          label="AOV"
          value={formatCents(metrics.averageOrderValueCents)}
        />
        <MetricTile
          label="ORDERS"
          value={String(metrics.orderCount)}
          hint={`${metrics.customerCount} customers`}
        />
        <MetricTile
          label="LOW STOCK SKUs"
          value={String(metrics.lowStockCount)}
          hint={`${metrics.productCount} products`}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-wide">RECENT ORDERS</h2>
          <Link
            href="/admin/orders"
            className="text-sm font-bold text-[#E3002C] hover:underline"
          >
            VIEW ALL
          </Link>
        </div>
        {metrics.recentOrders.length === 0 ? (
          <p className="text-gray-500 bg-white border border-gray-200 p-6">
            No orders yet. Run a demo checkout to populate this feed.
          </p>
        ) : (
          <ul className="bg-white border border-gray-200 divide-y divide-gray-100">
            {metrics.recentOrders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4"
              >
                <div>
                  <p className="font-medium text-sm">{order.id}</p>
                  <p className="text-xs text-gray-500">
                    {order.shipping.email} ·{' '}
                    <span className="uppercase">
                      {order.status.replace('_', ' ')}
                    </span>
                  </p>
                </div>
                <p className="font-bold text-[#E3002C]">
                  {formatCents(order.totals.totalCents)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
