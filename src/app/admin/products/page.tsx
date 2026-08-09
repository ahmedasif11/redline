import type { Metadata } from 'next';
import AdminShell from '@/features/admin/components/AdminShell';
import AdminProducts from '@/features/admin/components/AdminProducts';

export const metadata: Metadata = {
  title: 'Admin · Products',
  robots: { index: false, follow: false },
};

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <AdminProducts />
    </AdminShell>
  );
}
