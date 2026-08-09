import type { Metadata } from 'next';
import FeaturedProducts from '@/components/FeaturedProducts';
import { BRAND } from '@/lib/brand';
import { parseShopSearchParams } from '@/features/catalog';

export const metadata: Metadata = {
  title: 'Shop',
  description: `Browse the ${BRAND.name} catalog — filter by category, gender, price, and sale.`,
  openGraph: {
    title: `Shop | ${BRAND.name}`,
    description: `Browse the ${BRAND.name} catalog`,
  },
  alternates: {
    canonical: '/shop',
  },
};

type ShopPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const filters = parseShopSearchParams(params);

  return (
    <div className="pt-4">
      <FeaturedProducts urlSynced initialFilters={filters} />
    </div>
  );
}
