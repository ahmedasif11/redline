import type { Metadata } from 'next';
import AccountAddresses from '@/features/auth/components/AccountAddresses';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Addresses',
  description: `${BRAND.name} saved addresses`,
  robots: { index: false, follow: false },
};

export default function AccountAddressesPage() {
  return <AccountAddresses />;
}
