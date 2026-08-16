import type { Metadata } from 'next';
import CheckoutSuccess from '@/features/commerce/components/CheckoutSuccess';
import { confirmStripeCheckoutSession } from '@/features/commerce/server';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Order confirmed',
  description: `Thank you for shopping ${BRAND.name}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ orderId?: string; session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;

  if (params.session_id) {
    try {
      await confirmStripeCheckoutSession(params.session_id);
    } catch (error) {
      console.error('[checkout success] stripe confirm failed', error);
    }
  }

  return <CheckoutSuccess orderId={params.orderId} />;
}
