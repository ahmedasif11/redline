import type { Metadata } from 'next';
import AccountOverview from '@/features/auth/components/AccountOverview';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Account',
  description: `Your ${BRAND.name} account`,
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountOverview />;
}
