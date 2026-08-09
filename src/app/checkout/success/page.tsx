import type { Metadata } from 'next';
import CheckoutSuccess from '@/features/commerce/components/CheckoutSuccess';
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
  return <CheckoutSuccess orderId={params.orderId} />;
}
