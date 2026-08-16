'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApp } from '@/components/context/AppContext';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';
import BrandMark from '@/components/BrandMark';

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch } = useApp();

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    dispatch({ type: 'SET_USER', payload: null });
    toast.success('Signed out');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2">
              <BrandMark className="h-8 w-8" />
              <div>
                <p className="text-[#E3002C] text-xs font-bold tracking-wider">
                  {BRAND.name} OPS
                </p>
                <p className="text-white text-sm font-bold tracking-wide">
                  {state.user?.name ?? 'Admin'}
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Admin">
            {links.map((link) => {
              const active =
                link.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-3 py-2 text-xs sm:text-sm font-bold tracking-wide transition-colors',
                    active
                      ? 'bg-[#E3002C] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {link.label.toUpperCase()}
                </Link>
              );
            })}
            <Link
              href="/"
              className="px-3 py-2 text-xs sm:text-sm font-bold tracking-wide border border-white/30 text-white hover:border-[#E3002C] hover:text-[#E3002C] transition-colors"
            >
              STORE
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-xs sm:text-sm font-bold tracking-wide border border-white/30 text-white hover:bg-white hover:text-black transition-colors"
            >
              SIGN OUT
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
