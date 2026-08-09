import type { Metadata } from 'next';
import AdminShell from '@/features/admin/components/AdminShell';
import AdminDashboard from '@/features/admin/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminShell>
      <AdminDashboard />
    </AdminShell>
  );
}
