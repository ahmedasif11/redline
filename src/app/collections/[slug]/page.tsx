import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import FeaturedProducts from '@/components/FeaturedProducts';
import {
  COLLECTION_SLUGS,
  DEFAULT_FILTERS,
  buildShopHref,
  getCollectionBySlug,
} from '@/features/catalog';
import { BRAND } from '@/lib/brand';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(COLLECTION_SLUGS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return { title: 'Collection' };
  }

  return {
    title: collection.title,
    description: collection.description,
    openGraph: {
      title: `${collection.title} | ${BRAND.name}`,
      description: collection.description,
    },
    alternates: {
      canonical: `/collections/${slug}`,
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const filters = {
    ...DEFAULT_FILTERS,
    ...collection.filters,
  };

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-4">
        <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-2">
          {BRAND.name} COLLECTION
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
          {collection.title}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-6">
          {collection.description}
        </p>
        <Link
          href={buildShopHref(collection.filters)}
          className="text-sm font-bold tracking-wide text-gray-600 hover:text-[#E3002C] transition-colors"
        >
          OPEN IN SHOP →
        </Link>
      </section>
      <FeaturedProducts
        urlSynced
        initialFilters={filters}
        showHeader={false}
      />
    </div>
  );
}
