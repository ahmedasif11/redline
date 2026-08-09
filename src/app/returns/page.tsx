import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Returns',
  description: `${BRAND.name} returns`,
};

export default function ReturnsPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        RETURNS
      </h1>
      <p className="text-gray-600 max-w-xl">
        30-day returns. Request flow and RMA tooling come with commerce Phase C.
      </p>
    </section>
  );
}
