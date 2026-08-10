'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import AccountNav from '@/features/auth/components/AccountNav';
import RequireAuth from '@/features/auth/components/RequireAuth';
import { useApp } from '@/components/context/AppContext';
import { formatCents } from '@/features/commerce';
import type { Order } from '@/features/commerce';

const inputClass =
  'w-full border-2 border-gray-200 px-4 py-3 focus:border-[#E3002C] focus:outline-none transition-colors';

export default function AccountOverview() {
  const { state, dispatch } = useApp();
  const [name, setName] = useState(state.user?.name ?? '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(state.user?.name ?? '');
  }, [state.user?.name]);

  useEffect(() => {
    if (!state.user) return;
    void fetch('/api/v1/account/orders')
      .then((r) => r.json())
      .then((payload) => {
        if (payload?.data?.orders) setOrders(payload.data.orders.slice(0, 3));
      })
      .catch(() => undefined);
  }, [state.user]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Update failed');
        return;
      }
      dispatch({
        type: 'SET_USER',
        payload: {
          id: payload.data.user.id,
          name: payload.data.user.name,
          email: payload.data.user.email,
          isLoggedIn: true,
          role:
            payload.data.user.role === 'admin' ? 'admin' : 'customer',
        },
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth loginNext="/account">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <AccountNav />

        <div className="grid lg:grid-cols-2 gap-10">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-lg font-bold tracking-wide">PROFILE</h2>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              placeholder="Full name"
            />
            <input
              disabled
              value={state.user?.email ?? ''}
              className={`${inputClass} bg-gray-50 text-gray-500`}
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-black hover:bg-[#E3002C] disabled:bg-gray-400 text-white px-8 py-3 font-bold tracking-wide transition-colors"
            >
              {saving ? 'SAVING...' : 'SAVE PROFILE'}
            </button>
          </form>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold tracking-wide">RECENT ORDERS</h2>
              <Link
                href="/account/orders"
                className="text-sm font-bold text-[#E3002C] hover:underline"
              >
                VIEW ALL
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-gray-500">No orders yet.</p>
            ) : (
              <ul className="space-y-3">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="flex items-center justify-between bg-gray-50 p-4"
                  >
                    <div>
                      <p className="font-medium text-sm">{order.id}</p>
                      <p className="text-xs text-gray-500 uppercase">
                        {order.status.replace('_', ' ')}
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
      </section>
    </RequireAuth>
  );
}
