'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AccountNav from '@/features/auth/components/AccountNav';
import { useApp } from '@/components/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Address } from '@/features/auth';

const inputClass =
  'w-full border-2 border-gray-200 px-4 py-3 focus:border-[#E3002C] focus:outline-none transition-colors';

const emptyForm = {
  label: 'Home',
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  phone: '',
  isDefault: true,
};

export default function AccountAddresses() {
  const { state } = useApp();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.hasHydrated && state.hasSessionResolved && !state.user) {
      router.replace('/login');
    }
  }, [state.hasHydrated, state.hasSessionResolved, state.user, router]);

  const load = async () => {
    const res = await fetch('/api/v1/account/addresses');
    const payload = await res.json();
    if (res.ok) setAddresses(payload.data.addresses ?? []);
  };

  useEffect(() => {
    if (!state.user) return;
    void load();
  }, [state.user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/v1/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Unable to save address');
        return;
      }
      setAddresses(payload.data.addresses);
      setForm({ ...emptyForm, isDefault: false });
      toast.success('Address saved');
    } catch {
      toast.error('Unable to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/v1/account/addresses?id=${id}`, {
      method: 'DELETE',
    });
    const payload = await res.json();
    if (!res.ok) {
      toast.error(payload?.error?.message ?? 'Unable to delete');
      return;
    }
    setAddresses(payload.data.addresses);
    toast.success('Address removed');
  };

  if (!state.hasHydrated || !state.hasSessionResolved || !state.user) {
    return <LoadingSpinner fullscreen size="lg" label="Loading account" />;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <AccountNav />

      <div className="grid lg:grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg font-bold tracking-wide mb-4">SAVED ADDRESSES</h2>
          {addresses.length === 0 ? (
            <p className="text-gray-500">No addresses yet.</p>
          ) : (
            <ul className="space-y-4">
              {addresses.map((address) => (
                <li key={address.id} className="bg-gray-50 p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-bold">
                        {address.label}
                        {address.isDefault ? (
                          <span className="ml-2 text-xs text-[#E3002C]">
                            DEFAULT
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.fullName}
                        <br />
                        {address.line1}
                        {address.line2 ? (
                          <>
                            <br />
                            {address.line2}
                          </>
                        ) : null}
                        <br />
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      className="text-sm font-bold text-gray-500 hover:text-[#E3002C]"
                    >
                      REMOVE
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-lg font-bold tracking-wide">ADD ADDRESS</h2>
          <input
            required
            placeholder="Label (Home, Work…)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className={inputClass}
          />
          <input
            required
            placeholder="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
          />
          <input
            required
            placeholder="Address"
            value={form.line1}
            onChange={(e) => setForm({ ...form, line1: e.target.value })}
            className={inputClass}
          />
          <input
            placeholder="Apt, suite (optional)"
            value={form.line2}
            onChange={(e) => setForm({ ...form, line2: e.target.value })}
            className={inputClass}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputClass}
            />
            <input
              required
              placeholder="State"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="ZIP"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className={inputClass}
            />
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className={inputClass}
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="accent-[#E3002C]"
            />
            Set as default
          </label>
          <button
            type="submit"
            disabled={saving}
            className="bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white px-8 py-3 font-bold tracking-wide transition-colors"
          >
            {saving ? 'SAVING...' : 'SAVE ADDRESS'}
          </button>
        </form>
      </div>
    </section>
  );
}
