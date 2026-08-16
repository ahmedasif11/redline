'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, Menu, X, Heart, User } from 'lucide-react';
import { useApp, getCartItemCount } from '@/components/context/AppContext';
import { BRAND } from '@/lib/brand';
import { buildShopHref } from '@/features/catalog';

type NavItem = {
  name: string;
  href: string;
  action: 'scroll' | 'filter' | 'route';
  filter?: { gender?: string; category?: string; sale?: boolean };
};

export default function Header() {
  const { state, dispatch } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems: NavItem[] = [
    { name: 'HOME', href: '/', action: 'route' },
    {
      name: 'MEN',
      href: buildShopHref({ gender: 'men' }),
      action: 'filter',
      filter: { gender: 'men' },
    },
    {
      name: 'WOMEN',
      href: buildShopHref({ gender: 'women' }),
      action: 'filter',
      filter: { gender: 'women' },
    },
    {
      name: 'NEW RELEASES',
      href: buildShopHref({ category: 'new-releases' }),
      action: 'filter',
      filter: { category: 'new-releases' },
    },
    { name: 'COLLECTIONS', href: '/#collections', action: 'scroll' },
    {
      name: 'SALE',
      href: buildShopHref({ sale: true }),
      action: 'filter',
      filter: { sale: true },
    },
  ];

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(buildShopHref({ q }));
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'route') {
      router.push(item.href);
    } else if (item.action === 'scroll') {
      if (pathname !== '/') {
        router.push(item.href);
      } else {
        scrollToId(item.href.replace('/#', '').replace('#', ''));
      }
    } else if (item.action === 'filter') {
      router.push(item.href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      className="sticky top-0 z-50 bg-black border-b border-white/10 backdrop-blur-sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <motion.div
            className="flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <div
                className="w-8 h-8 rounded-sm bg-[#E3002C] flex items-center justify-center"
                aria-hidden
              >
                <span className="text-white text-xs font-black tracking-tighter">
                  RL
                </span>
              </div>
              <span className="text-white text-lg sm:text-xl font-bold tracking-wider">
                {BRAND.name}
              </span>
            </Link>
          </motion.div>

          <nav className="hidden lg:block flex-1" aria-label="Primary">
            <div className="flex items-center justify-center space-x-4 xl:space-x-6">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.name}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className="text-white hover:text-[#E3002C] transition-colors text-sm font-medium tracking-wide whitespace-nowrap px-2"
                  whileHover={{ y: -2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
          </nav>

          <div className="hidden xl:block flex-1 max-w-sm">
            <form onSubmit={handleSearch} className="relative" role="search">
              <label htmlFor="header-search" className="sr-only">
                Search products
              </label>
              <input
                id="header-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${BRAND.name} sneakers...`}
                className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-2 pl-10 rounded-full border border-white/20 focus:border-[#E3002C] focus:outline-none transition-colors"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                aria-hidden
              />
            </form>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <motion.button
              type="button"
              aria-label="Open search"
              className="xl:hidden text-white hover:text-[#E3002C] transition-colors p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => dispatch({ type: 'TOGGLE_SEARCH' })}
            >
              <Search size={20} />
            </motion.button>

            <motion.button
              type="button"
              aria-label={`Wishlist${state.wishlist.length ? `, ${state.wishlist.length} items` : ''}`}
              aria-expanded={state.isWishlistOpen}
              onClick={() => dispatch({ type: 'TOGGLE_WISHLIST' })}
              className="text-white hover:text-[#E3002C] transition-colors p-2 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart size={20} />
              {state.hasHydrated && state.wishlist.length > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-[#E3002C] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={state.wishlist.length}
                  aria-hidden
                >
                  {state.wishlist.length}
                </motion.span>
              )}
            </motion.button>

            <Link
              href={
                state.user?.role === 'admin'
                  ? '/admin'
                  : state.user
                    ? '/account'
                    : '/login'
              }
              aria-label={
                state.user?.role === 'admin'
                  ? 'Admin'
                  : state.user
                    ? 'Account'
                    : 'Sign in'
              }
              className="text-white hover:text-[#E3002C] transition-colors p-2"
            >
              <motion.span
                className="block"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <User size={20} />
              </motion.span>
            </Link>

            <motion.button
              type="button"
              aria-label={`Cart${getCartItemCount(state.cart) ? `, ${getCartItemCount(state.cart)} items` : ''}`}
              aria-expanded={state.isCartOpen}
              onClick={() => dispatch({ type: 'TOGGLE_CART' })}
              className="text-white hover:text-[#E3002C] transition-colors p-2 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart size={20} />
              {state.hasHydrated && getCartItemCount(state.cart) > 0 && (
                <motion.span
                  className="absolute -top-1 -right-1 bg-[#E3002C] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={getCartItemCount(state.cart)}
                  aria-hidden
                >
                  {getCartItemCount(state.cart)}
                </motion.span>
              )}
            </motion.button>

            <motion.button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white hover:text-[#E3002C] transition-colors p-2"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="lg:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-white/10">
                {navigationItems.map((item) => (
                  <motion.button
                    key={item.name}
                    type="button"
                    onClick={() => handleNavClick(item)}
                    className="block w-full text-left px-3 py-3 text-white hover:text-[#E3002C] hover:bg-white/5 transition-colors text-base font-medium tracking-wide rounded-lg"
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {state.isSearchOpen && (
            <motion.div
              className="xl:hidden border-t border-white/10"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4">
                <form onSubmit={handleSearch} className="relative" role="search">
                  <label htmlFor="header-search-mobile" className="sr-only">
                    Search products
                  </label>
                  <input
                    id="header-search-mobile"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${BRAND.name} sneakers...`}
                    className="w-full bg-white/10 text-white placeholder-white/60 px-4 py-3 pl-10 rounded-lg border border-white/20 focus:border-[#E3002C] focus:outline-none transition-colors"
                    autoFocus
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"
                    aria-hidden
                  />
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
