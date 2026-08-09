import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Size Guide',
  description: `${BRAND.name} size guide`,
};

export default function SizeGuidePage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        SIZE GUIDE
      </h1>
      <p className="text-gray-600 max-w-xl">
        Detailed fit charts arrive with catalog Phase B. Measure against your
        usual athletic sizing for now.
      </p>
    </section>
  );
}
