'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { BRAND } from '@/lib/brand';
import { readJsonStorage, writeJsonStorage } from '@/lib/storage';
import {
  CATALOG_PRODUCTS,
  type Product,
  type ProductCategory,
} from '@/features/catalog';

export type { Product, ProductCategory };

export interface CartItem extends Product {
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  role?: 'customer' | 'admin';
}

export interface AppState {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  user: User | null;
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  searchQuery: string;
  selectedCategory: string;
  selectedGender: string;
  priceRange: [number, number];
  isLoading: boolean;
  hasHydrated: boolean;
  /** True after `/api/v1/auth/me` finishes (user or guest). */
  hasSessionResolved: boolean;
}

type AppAction =
  | {
      type: 'ADD_TO_CART';
      payload: { product: Product; size: number; color: string };
    }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | {
      type: 'UPDATE_CART_QUANTITY';
      payload: { id: string; quantity: number };
    }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'TOGGLE_WISHLIST' }
  | { type: 'SET_WISHLIST_OPEN'; payload: boolean }
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'TOGGLE_SEARCH' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_CATEGORY'; payload: string }
  | { type: 'SET_GENDER'; payload: string }
  | { type: 'SET_PRICE_RANGE'; payload: [number, number] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SESSION_RESOLVED'; payload: boolean }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | {
      type: 'HYDRATE_PERSISTED';
      payload: { cart: CartItem[]; wishlist: string[] };
    };

/** @deprecated Prefer importing from `@/features/catalog` */
export const sampleProducts = CATALOG_PRODUCTS;

const emptyState: AppState = {
  products: CATALOG_PRODUCTS,
  cart: [],
  wishlist: [],
  user: null,
  isCartOpen: false,
  isWishlistOpen: false,
  isSearchOpen: false,
  searchQuery: '',
  selectedCategory: 'all',
  selectedGender: 'all',
  priceRange: [0, 300],
  isLoading: false,
  hasHydrated: false,
  hasSessionResolved: false,
};

function persistCart(cart: CartItem[]) {
  writeJsonStorage(BRAND.storageKeys.cart, cart);
}

function persistWishlist(wishlist: string[]) {
  writeJsonStorage(BRAND.storageKeys.wishlist, wishlist);
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'HYDRATE_PERSISTED':
      persistCart(action.payload.cart);
      persistWishlist(action.payload.wishlist);
      return {
        ...state,
        cart: action.payload.cart,
        wishlist: action.payload.wishlist,
        hasHydrated: true,
      };

    case 'ADD_TO_CART': {
      const { product, size, color } = action.payload;
      const existingItem = state.cart.find(
        (item) =>
          item.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      const nextCart = existingItem
        ? state.cart.map((item) =>
            item.id === product.id &&
            item.selectedSize === size &&
            item.selectedColor === color
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [
            ...state.cart,
            {
              ...product,
              quantity: 1,
              selectedSize: size,
              selectedColor: color,
            },
          ];

      persistCart(nextCart);
      return { ...state, cart: nextCart };
    }

    case 'REMOVE_FROM_CART': {
      const [id, size, ...colorParts] = action.payload.split('-');
      const selectedSize = Number(size);
      const selectedColor = colorParts.join('-');
      const nextCart = state.cart.filter(
        (item) =>
          !(
            item.id === id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
          )
      );
      persistCart(nextCart);
      return { ...state, cart: nextCart };
    }

    case 'UPDATE_CART_QUANTITY': {
      const { id, quantity } = action.payload;
      const nextCart =
        quantity <= 0
          ? state.cart.filter(
              (item) =>
                `${item.id}-${item.selectedSize}-${item.selectedColor}` !== id
            )
          : state.cart.map((item) =>
              `${item.id}-${item.selectedSize}-${item.selectedColor}` === id
                ? { ...item, quantity }
                : item
            );
      persistCart(nextCart);
      return { ...state, cart: nextCart };
    }

    case 'CLEAR_CART':
      persistCart([]);
      return { ...state, cart: [] };

    case 'TOGGLE_CART':
      return {
        ...state,
        isCartOpen: !state.isCartOpen,
        isWishlistOpen: !state.isCartOpen ? false : state.isWishlistOpen,
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isCartOpen: action.payload,
        isWishlistOpen: action.payload ? false : state.isWishlistOpen,
      };

    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        isWishlistOpen: !state.isWishlistOpen,
        isCartOpen: !state.isWishlistOpen ? false : state.isCartOpen,
      };

    case 'SET_WISHLIST_OPEN':
      return {
        ...state,
        isWishlistOpen: action.payload,
        isCartOpen: action.payload ? false : state.isCartOpen,
      };

    case 'ADD_TO_WISHLIST': {
      if (state.wishlist.includes(action.payload)) return state;
      const newWishlist = [...state.wishlist, action.payload];
      persistWishlist(newWishlist);
      return { ...state, wishlist: newWishlist };
    }

    case 'REMOVE_FROM_WISHLIST': {
      const newWishlist = state.wishlist.filter((id) => id !== action.payload);
      persistWishlist(newWishlist);
      return { ...state, wishlist: newWishlist };
    }

    case 'CLEAR_WISHLIST':
      persistWishlist([]);
      return { ...state, wishlist: [] };

    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'TOGGLE_SEARCH':
      return { ...state, isSearchOpen: !state.isSearchOpen };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };

    case 'SET_GENDER':
      return { ...state, selectedGender: action.payload };

    case 'SET_PRICE_RANGE':
      return { ...state, priceRange: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_SESSION_RESOLVED':
      return { ...state, hasSessionResolved: action.payload };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    default:
      return state;
  }
}

const AppContext = createContext<
  | {
      state: AppState;
      dispatch: React.Dispatch<AppAction>;
    }
  | undefined
>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, emptyState);

  useEffect(() => {
    const cart = readJsonStorage<CartItem[]>(BRAND.storageKeys.cart, []).map(
      (item) => ({
        ...item,
        images: item.images?.length ? item.images : [item.image],
        brand: item.brand ?? BRAND.name,
        tags: item.tags ?? [],
        stockBySize: item.stockBySize ?? {},
      })
    );
    const wishlist = readJsonStorage<string[]>(
      BRAND.storageKeys.wishlist,
      []
    );
    dispatch({ type: 'HYDRATE_PERSISTED', payload: { cart, wishlist } });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v1/products');
        if (!res.ok) return;
        const payload = await res.json();
        const products = payload?.data;
        if (!cancelled && Array.isArray(products) && products.length > 0) {
          dispatch({ type: 'SET_PRODUCTS', payload: products });
        }
      } catch {
        // Keep seed catalog on network failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export const getCartTotal = (cart: CartItem[]) =>
  cart.reduce((total, item) => total + item.price * item.quantity, 0);

export const getCartItemCount = (cart: CartItem[]) =>
  cart.reduce((total, item) => total + item.quantity, 0);
