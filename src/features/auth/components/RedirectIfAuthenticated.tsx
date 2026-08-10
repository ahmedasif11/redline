'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/context/AppContext';
import {
  defaultHomeForRole,
  safeInternalPath,
} from '@/features/auth/lib/paths';

/**
 * Soft gate for public auth pages: keep the form visible, then redirect
 * once session resolves for an already-signed-in user.
 */
export default function RedirectIfAuthenticated({
  next,
}: {
  next?: string | null;
}) {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.hasHydrated || !state.hasSessionResolved || !state.user) {
      return;
    }
    const dest = safeInternalPath(next) ?? defaultHomeForRole(state.user.role);
    router.replace(dest);
  }, [
    state.hasHydrated,
    state.hasSessionResolved,
    state.user,
    next,
    router,
  ]);

  return null;
}
