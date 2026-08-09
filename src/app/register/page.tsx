import type { Metadata } from 'next';
import RegisterForm from '@/features/auth/components/RegisterForm';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Create account',
  description: `Create your ${BRAND.name} account`,
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
