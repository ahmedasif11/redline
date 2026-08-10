import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/features/auth/components/LoginForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Sign in',
  description: `Sign in to your ${BRAND.name} account`,
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="max-w-md mx-auto px-4 py-20">
          <p className="text-gray-500 text-sm font-bold tracking-wider uppercase">
            Loading…
          </p>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
