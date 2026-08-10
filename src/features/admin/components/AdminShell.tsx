'use client';

import type { ReactNode } from 'react';
import AdminNav from '@/features/admin/components/AdminNav';
import RequireAuth from '@/features/auth/components/RequireAuth';

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireAuth roles={['admin']} loginNext="/admin" fallbackHref="/account">
      <div className="min-h-screen bg-gray-50 text-black">
        <AdminNav />
        <main
          id="admin-content"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}
