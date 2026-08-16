import type { Metadata } from 'next';
import CheckoutForm from '@/features/commerce/components/CheckoutForm';
import { abandonCheckoutByReturn } from '@/features/commerce/server';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Checkout',
  description: `Secure checkout — ${BRAND.name}`,
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{
    cancelled?: string;
    abandoned?: string;
    orderId?: string;
    session_id?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const paymentAbandoned =
    params.abandoned === '1' || params.cancelled === '1';

  if (paymentAbandoned) {
    try {
      await abandonCheckoutByReturn({
        orderId: params.orderId,
        sessionId: params.session_id,
      });
    } catch (error) {
      console.error('[checkout] abandon return failed', error);
    }
  }

  return <CheckoutForm paymentAbandoned={paymentAbandoned} />;
}
