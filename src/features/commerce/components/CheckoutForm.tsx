'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  useApp,
  getCartTotal,
  getCartItemCount,
} from '@/components/context/AppContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { BRAND } from '@/lib/brand';
import { formatDollars } from '@/features/commerce';
import type { Address } from '@/features/auth';
import AddressPickerModal from '@/features/commerce/components/AddressPickerModal';

const inputClass =
  'w-full border-2 border-gray-200 px-4 py-3 focus:border-[#E3002C] focus:outline-none transition-colors';

export default function CheckoutForm({
  paymentAbandoned = false,
}: {
  paymentAbandoned?: boolean;
}) {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });

  useEffect(() => {
    if (!paymentAbandoned) return;
    toast.message(
      'Payment was not completed. Your unpaid order is saved in Order history.'
    );
    router.replace('/checkout');
  }, [paymentAbandoned, router]);

  useEffect(() => {
    const existing = sessionStorage.getItem('redline-checkout-idemp');
    if (existing) {
      setIdempotencyKey(existing);
      return;
    }
    const key = `chk_${crypto.randomUUID()}`;
    sessionStorage.setItem('redline-checkout-idemp', key);
    setIdempotencyKey(key);
  }, []);

  const applyAddress = (address: Address, email: string) => {
    setForm((prev) => ({
      ...prev,
      email: prev.email || email,
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'US',
      phone: address.phone ?? prev.phone,
    }));
  };

  useEffect(() => {
    if (!state.user) {
      setSavedAddresses([]);
      setSelectedAddressId('new');
      return;
    }

    setForm((prev) => ({
      ...prev,
      email: prev.email || state.user!.email,
      fullName: prev.fullName || state.user!.name,
    }));

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/account/addresses');
        const payload = await res.json();
        if (!res.ok || cancelled) return;
        const addresses: Address[] = payload.data.addresses ?? [];
        setSavedAddresses(addresses);
        const defaultAddress =
          addresses.find((address) => address.isDefault) ?? addresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          applyAddress(defaultAddress, state.user!.email);
        }
      } catch {
        // Guest-style checkout if addresses fail to load
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.user]);

  const subtotal = getCartTotal(state.cart);
  const shipping =
    subtotal >= BRAND.freeShippingThreshold || state.cart.length === 0
      ? 0
      : 9.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const [idempotencyKey, setIdempotencyKey] = useState('');

  const updateField = (key: keyof typeof form, value: string) => {
    if (
      selectedAddressId !== 'new' &&
      key !== 'email'
    ) {
      setSelectedAddressId('new');
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const selectedSavedAddress = savedAddresses.find(
    (address) => address.id === selectedAddressId
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state.cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipping: form,
          items: state.cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          idempotencyKey:
            idempotencyKey ||
            `chk_${crypto.randomUUID()}`,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload?.error?.message ?? 'Checkout failed');
        return;
      }

      const { checkoutUrl, mode } = payload.data as {
        checkoutUrl: string;
        mode: 'stripe' | 'demo';
      };

      if (mode === 'demo') {
        dispatch({ type: 'CLEAR_CART' });
        sessionStorage.removeItem('redline-checkout-idemp');
        toast.success('Order placed (demo mode)');
      }

      if (checkoutUrl.startsWith('http')) {
        window.location.href = checkoutUrl;
      } else {
        router.push(checkoutUrl);
      }
    } catch {
      toast.error('Unable to start checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state.hasHydrated) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="text-gray-500">Loading checkout…</p>
      </section>
    );
  }

  if (state.cart.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
          CHECKOUT
        </h1>
        <p className="text-gray-600 mb-8">Your cart is empty.</p>
        <Link
          href="/shop"
          className="inline-block bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-3 font-bold tracking-wide transition-colors"
        >
          CONTINUE SHOPPING
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          CHECKOUT
        </h1>
        <p className="text-gray-600 mb-10">
          {state.user ? (
            <>
              Signed in as {state.user.email} —{' '}
              <Link href="/account" className="text-[#E3002C] font-medium hover:underline">
                account
              </Link>
            </>
          ) : (
            <>
              Guest checkout —{' '}
              <Link href="/login" className="text-[#E3002C] font-medium hover:underline">
                sign in
              </Link>{' '}
              to save orders
            </>
          )}
          {' · '}
          {getCartItemCount(state.cart)} item
          {getCartItemCount(state.cart) === 1 ? '' : 's'}
        </p>
      </motion.div>

      <form
        onSubmit={handleSubmit}
        className="grid lg:grid-cols-5 gap-10 lg:gap-14"
      >
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h2 className="text-lg font-bold tracking-wide mb-4">CONTACT</h2>
            <div className="space-y-4">
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={inputClass}
                autoComplete="email"
              />
              <input
                type="tel"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-wide mb-4">SHIPPING</h2>
            {state.user ? (
              savedAddresses.length > 0 ? (
                <div className="mb-4 space-y-3">
                  <div
                    className={`border-2 p-4 ${
                      selectedSavedAddress
                        ? 'border-[#E3002C] bg-red-50/40'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        {selectedSavedAddress ? (
                          <>
                            <p className="font-bold text-sm">
                              {selectedSavedAddress.label}
                              {selectedSavedAddress.isDefault ? (
                                <span className="ml-2 text-[10px] tracking-wide text-[#E3002C]">
                                  DEFAULT
                                </span>
                              ) : null}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {selectedSavedAddress.fullName}
                              <br />
                              {selectedSavedAddress.line1}
                              {selectedSavedAddress.line2 ? (
                                <>
                                  <br />
                                  {selectedSavedAddress.line2}
                                </>
                              ) : null}
                              <br />
                              {selectedSavedAddress.city},{' '}
                              {selectedSavedAddress.state}{' '}
                              {selectedSavedAddress.postalCode}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-bold text-sm">New address</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Fill in the fields below, or change to a saved
                              address.
                            </p>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="text-sm font-bold tracking-wide text-gray-700 hover:text-[#E3002C] shrink-0"
                      >
                        CHANGE
                      </button>
                    </div>
                  </div>
                  {selectedAddressId !== 'new' ? (
                    <button
                      type="button"
                      onClick={() => setSelectedAddressId('new')}
                      className="text-sm text-gray-600 hover:text-[#E3002C] font-medium"
                    >
                      Use a different address
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  No saved addresses yet.{' '}
                  <Link
                    href="/account/addresses"
                    className="text-[#E3002C] font-medium hover:underline"
                  >
                    Add one in your account
                  </Link>{' '}
                  to reuse it here.
                </p>
              )
            ) : null}
            <div className="space-y-4">
              <input
                required
                placeholder="Full name"
                value={form.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
              <input
                required
                placeholder="Address"
                value={form.line1}
                onChange={(e) => updateField('line1', e.target.value)}
                className={inputClass}
                autoComplete="address-line1"
              />
              <input
                placeholder="Apartment, suite, etc. (optional)"
                value={form.line2}
                onChange={(e) => updateField('line2', e.target.value)}
                className={inputClass}
                autoComplete="address-line2"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  className={inputClass}
                  autoComplete="address-level2"
                />
                <input
                  required
                  placeholder="State"
                  value={form.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  className={inputClass}
                  autoComplete="address-level1"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="ZIP / Postal code"
                  value={form.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  className={inputClass}
                  autoComplete="postal-code"
                />
                <select
                  required
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  className={inputClass}
                  autoComplete="country"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-50 p-6 sm:p-8 space-y-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold tracking-wide">ORDER SUMMARY</h2>

            <ul className="space-y-4 max-h-72 overflow-auto">
              {state.cart.map((item) => {
                const key = `${item.id}-${item.selectedSize}-${item.selectedColor}`;
                return (
                  <li key={key} className="flex gap-3">
                    <div className="w-16 h-16 bg-white overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.selectedColor} / US {item.selectedSize} ×{' '}
                        {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-[#E3002C] mt-1">
                        {formatDollars(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatDollars(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {shipping === 0 ? 'FREE' : formatDollars(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. tax</span>
                <span>{formatDollars(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#E3002C]">{formatDollars(total)}</span>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white py-4 font-bold tracking-wide flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              <Lock size={18} aria-hidden />
              {isSubmitting ? 'PROCESSING...' : 'PAY NOW'}
            </motion.button>

            <p className="text-xs text-gray-500 text-center">
              Secure checkout. Cards are never stored on {BRAND.name} servers.
              Without Stripe keys, demo mode completes the order locally.
            </p>
          </div>
        </div>
      </form>

      {state.user ? (
        <AddressPickerModal
          isOpen={pickerOpen}
          addresses={savedAddresses}
          selectedId={selectedAddressId}
          onSelect={(address) => {
            setSelectedAddressId(address.id);
            applyAddress(address, state.user!.email);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      ) : null}
    </section>
  );
}
