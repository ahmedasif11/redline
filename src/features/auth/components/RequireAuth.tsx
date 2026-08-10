'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/context/AppContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { safeInternalPath } from '@/features/auth/lib/paths';

type Role = 'customer' | 'admin';

interface RequireAuthProps {
  children: ReactNode;
  /** If set, user.role must be one of these. */
  roles?: Role[];
  /** Path passed to login as ?next= (protected destination). */
  loginNext?: string;
  /** Where to send authenticated users with the wrong role. */
  fallbackHref?: string;
}

/**
 * Shared gate for protected routes (account + admin).
 * Fullscreen spinner = session / redirect only; page data uses inline loaders.
 */
export default function RequireAuth({
  children,
  roles,
  loginNext = '/account',
  fallbackHref = '/',
}: RequireAuthProps) {
  const { state } = useApp();
  const router = useRouter();
  const ready = state.hasHydrated && state.hasSessionResolved;
  const user = state.user;
  const roleOk =
    !!user && (!roles || (user.role != null && roles.includes(user.role)));

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      const next = safeInternalPath(loginNext) ?? '/account';
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (roles && (!user.role || !roles.includes(user.role))) {
      router.replace(fallbackHref);
    }
  }, [ready, user, roles, loginNext, fallbackHref, router]);

  if (!ready) {
    return (
      <LoadingSpinner fullscreen size="lg" label="Checking session" />
    );
  }

  if (!roleOk) {
    return <LoadingSpinner fullscreen size="lg" label="Redirecting" />;
  }

  return <>{children}</>;
}
