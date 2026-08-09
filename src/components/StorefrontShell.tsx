'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import WishlistPage from '@/components/WishlistPage';
import { Toaster } from '@/components/Toaster';
import { AppProvider } from '@/components/context/AppContext';
import AuthSessionBootstrap from '@/features/auth/components/AuthSessionBootstrap';

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <AuthSessionBootstrap />
      <ShellBody>{children}</ShellBody>
    </AppProvider>
  );
}

function ShellBody({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
      <CartSidebar />
      <WishlistPage />
      <Toaster />
    </div>
  );
}
