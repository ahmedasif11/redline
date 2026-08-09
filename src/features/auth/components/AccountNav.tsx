'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useApp } from '@/components/context/AppContext';
import { cn } from '@/lib/cn';

const links = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
];

export default function AccountNav() {
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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <div>
        <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-1">
          ACCOUNT
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          {state.user?.name ?? 'Member'}
        </h1>
        <p className="text-gray-600 text-sm mt-1">{state.user?.email}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-4 py-2 text-sm font-bold tracking-wide transition-colors',
              pathname === link.href
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            )}
          >
            {link.label.toUpperCase()}
          </Link>
        ))}
        {state.user?.role === 'admin' ? (
          <Link
            href="/admin"
            className="px-4 py-2 text-sm font-bold tracking-wide bg-[#E3002C] text-white hover:bg-[#C5001F] transition-colors"
          >
            ADMIN
          </Link>
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-bold tracking-wide border-2 border-black hover:bg-black hover:text-white transition-all"
        >
          SIGN OUT
        </button>
      </div>
    </div>
  );
}
