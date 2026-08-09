import type { Metadata } from 'next';
import AdminShell from '@/features/admin/components/AdminShell';
import AdminCustomers from '@/features/admin/components/AdminCustomers';

export const metadata: Metadata = {
  title: 'Admin · Customers',
  robots: { index: false, follow: false },
};

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <AdminCustomers />
    </AdminShell>
  );
}
