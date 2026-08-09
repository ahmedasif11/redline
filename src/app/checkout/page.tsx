import type { Metadata } from 'next';
import CheckoutForm from '@/features/commerce/components/CheckoutForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Checkout',
  description: `Secure checkout — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
