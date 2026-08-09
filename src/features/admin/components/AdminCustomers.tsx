'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCents } from '@/features/commerce';
import type { AdminCustomerRow } from '@/features/admin';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/admin/customers');
        const payload = await res.json();
        if (!res.ok) {
          if (!cancelled) {
            toast.error(payload?.error?.message ?? 'Failed to load customers');
          }
          return;
        }
        if (!cancelled) setCustomers(payload.data.customers);
      } catch {
        if (!cancelled) toast.error('Unable to load customers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner size="md" label="Loading customers" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-1">
          MEMBERS
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-gray-600 mt-2">
          Account lookup with order counts and lifetime spend.
        </p>
      </div>

      {customers.length === 0 ? (
        <p className="text-gray-500 bg-white border border-gray-200 p-6">
          No accounts yet.
        </p>
      ) : (
        <div className="bg-white border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[640px]">
            <thead className="bg-black text-white text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 font-bold">NAME</th>
                <th className="px-4 py-3 font-bold">EMAIL</th>
                <th className="px-4 py-3 font-bold">ROLE</th>
                <th className="px-4 py-3 font-bold">ORDERS</th>
                <th className="px-4 py-3 font-bold">SPENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((row) => (
                <tr key={row.user.id}>
                  <td className="px-4 py-3 font-medium">{row.user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{row.user.email}</td>
                  <td className="px-4 py-3 uppercase text-xs font-bold tracking-wide">
                    {row.user.role}
                  </td>
                  <td className="px-4 py-3">{row.orderCount}</td>
                  <td className="px-4 py-3 font-bold text-[#E3002C]">
                    {formatCents(row.totalSpentCents)}
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
