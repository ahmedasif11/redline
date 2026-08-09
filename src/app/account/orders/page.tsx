import type { Metadata } from 'next';
import AccountOrders from '@/features/auth/components/AccountOrders';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Orders',
  description: `${BRAND.name} order history`,
  robots: { index: false, follow: false },
};

export default function AccountOrdersPage() {
  return <AccountOrders />;
}
