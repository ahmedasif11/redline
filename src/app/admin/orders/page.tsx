import type { Metadata } from 'next';
import AdminShell from '@/features/admin/components/AdminShell';
import AdminOrders from '@/features/admin/components/AdminOrders';

export const metadata: Metadata = {
  title: 'Admin · Orders',
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <AdminOrders />
    </AdminShell>
  );
}
