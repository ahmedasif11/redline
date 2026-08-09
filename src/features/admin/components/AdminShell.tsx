'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/context/AppContext';
import AdminNav from '@/features/admin/components/AdminNav';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminShell({ children }: { children: ReactNode }) {
  const { state } = useApp();
  const router = useRouter();
  const ready = state.hasHydrated && state.hasSessionResolved;

  useEffect(() => {
    if (!ready) return;
    if (!state.user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (state.user.role !== 'admin') {
      router.replace('/account');
    }
  }, [ready, state.user, router]);

  // Wait for cart hydrate + auth/me — never flash a "sign in required" panel
  if (!ready || !state.user || state.user.role !== 'admin') {
    return (
      <LoadingSpinner
        fullscreen
        size="lg"
        label={!ready ? 'Authenticating' : 'Redirecting'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <AdminNav />
      <main
        id="admin-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        {children}
      </main>
    </div>
  );
}
