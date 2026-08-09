import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Shipping',
  description: `${BRAND.name} shipping information`,
};

export default function ShippingPage() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        SHIPPING
      </h1>
      <p className="text-gray-600 max-w-xl">
        Free shipping on orders over ${BRAND.freeShippingThreshold}. Full
        shipping policy content ships with commerce Phase C.
      </p>
    </section>
  );
}
