'use client';

import { useEffect } from 'react';
import { useApp, type CartItem } from '@/components/context/AppContext';
import type { Product } from '@/features/catalog';
import type { SyncedCartLine } from '@/features/auth';

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

/** Restores session user + merges server cart/wishlist after local hydrate. */
export default function AuthSessionBootstrap() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (!state.hasHydrated) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/me');
        const payload = await res.json();
        if (cancelled) return;

        if (payload?.data?.user) {
          const { user, cart, wishlist } = payload.data;
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

          if (Array.isArray(cart) || Array.isArray(wishlist)) {
            dispatch({
              type: 'HYDRATE_PERSISTED',
              payload: {
                cart: hydrateCart(cart ?? [], state.products),
                wishlist: wishlist ?? [],
              },
            });
          }
        }
      } catch {
        // Guest mode — ignore
      } finally {
        if (!cancelled) {
          dispatch({ type: 'SET_SESSION_RESOLVED', payload: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.hasHydrated, dispatch]);

  // Debounced sync of cart/wishlist to server when logged in
  useEffect(() => {
    if (!state.user?.isLoggedIn || !state.hasHydrated) return;

    const timer = setTimeout(() => {
      void fetch('/api/v1/account/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: state.cart.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })),
          wishlist: state.wishlist,
        }),
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [state.cart, state.wishlist, state.user?.isLoggedIn, state.hasHydrated]);

  return null;
}
