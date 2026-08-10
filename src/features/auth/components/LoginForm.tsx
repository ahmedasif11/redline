'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { useApp, type CartItem } from '@/components/context/AppContext';
import type { Product } from '@/features/catalog';
import type { SyncedCartLine } from '@/features/auth';
import RedirectIfAuthenticated from '@/features/auth/components/RedirectIfAuthenticated';
import {
  defaultHomeForRole,
  safeInternalPath,
} from '@/features/auth/lib/paths';

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

export default function LoginForm() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          guest: toGuestPayload(state.cart, state.wishlist),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Sign in failed');
        return;
      }

      const { user, cart, wishlist } = payload.data;
      const role = user.role === 'admin' ? 'admin' : 'customer';
      dispatch({
        type: 'SET_USER',
        payload: {
          id: user.id,
          name: user.name,
          email: user.email,
          isLoggedIn: true,
          role,
        },
      });
      dispatch({
        type: 'HYDRATE_PERSISTED',
        payload: {
          cart: hydrateCart(cart ?? [], state.products),
          wishlist: wishlist ?? [],
        },
      });
      toast.success(`Welcome back, ${user.name}`);
      const dest =
        safeInternalPath(searchParams.get('next')) ??
        defaultHomeForRole(role);
      router.push(dest);
    } catch {
      toast.error('Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16 sm:py-20">
      <RedirectIfAuthenticated next={searchParams.get('next')} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          SIGN IN
        </h1>
        <p className="text-gray-600 mb-8">
          Access orders, addresses, and synced cart.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            minLength={8}
          />
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white py-4 font-bold tracking-wide transition-colors"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </motion.button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          New here?{' '}
          <Link href="/register" className="font-bold text-[#E3002C] hover:underline">
            Create account
          </Link>
        </p>
      </motion.div>
    </section>
  );
}
