import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import StorefrontShell from '@/components/StorefrontShell';
import { BRAND } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Premium Performance Footwear`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  icons: {
    icon: '/redline.svg',
    shortcut: '/redline.svg',
    apple: '/redline.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <StorefrontShell>{children}</StorefrontShell>
        <Analytics />
      </body>
    </html>
  );
}
