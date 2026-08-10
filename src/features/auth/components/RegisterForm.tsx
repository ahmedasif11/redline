'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useApp, type CartItem } from '@/components/context/AppContext';
import type { Product } from '@/features/catalog';
import type { SyncedCartLine } from '@/features/auth';
import RedirectIfAuthenticated from '@/features/auth/components/RedirectIfAuthenticated';

const inputClass =
  'w-full border-2 border-gray-200 px-4 py-3 focus:border-[#E3002C] focus:outline-none transition-colors';

function toGuestPayload(cart: CartItem[], wishlist: string[]) {
  return {
    cart: cart.map(
      (item): SyncedCartLine => ({
        productId: item.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
      })
    ),
    wishlist,
  };
}

function hydrateCart(lines: SyncedCartLine[], products: Product[]): CartItem[] {
  return lines
    .map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) return null;
      return {
        ...product,
        quantity: line.quantity,
        selectedSize: line.selectedSize,
        selectedColor: line.selectedColor,
      };
    })
    .filter((item): item is CartItem => item !== null);
}

export default function RegisterForm() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          guest: toGuestPayload(state.cart, state.wishlist),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Registration failed');
        return;
      }

      const { user } = payload.data;
      dispatch({
        type: 'SET_USER',
        payload: {
          id: user.id,
          name: user.name,
          email: user.email,
          isLoggedIn: true,
          role: user.role === 'admin' ? 'admin' : 'customer',
        },
      });

      // After register, merge already happened server-side — refresh synced state
      const me = await fetch('/api/v1/auth/me');
      const mePayload = await me.json();
      if (me.ok && mePayload.data?.cart) {
        dispatch({
          type: 'HYDRATE_PERSISTED',
          payload: {
            cart: hydrateCart(mePayload.data.cart, state.products),
            wishlist: mePayload.data.wishlist ?? state.wishlist,
          },
        });
      }

      toast.success('Account created');
      router.push('/account');
    } catch {
      toast.error('Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16 sm:py-20">
      <RedirectIfAuthenticated />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          CREATE ACCOUNT
        </h1>
        <p className="text-gray-600 mb-8">
          Save addresses, track orders, and sync your cart.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoComplete="name"
          />
          <input
            required
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
          <input
            required
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="new-password"
            minLength={8}
          />
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white py-4 font-bold tracking-wide transition-colors"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </motion.button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#E3002C] hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
