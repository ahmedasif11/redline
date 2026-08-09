import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetail from '@/features/catalog/components/ProductDetail';
import {
  getProductBySlugAsync,
  getRelatedProductsAsync,
  listProductsAsync,
} from '@/features/catalog/server';
import { BRAND } from '@/lib/brand';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const products = await listProductsAsync();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    return { title: 'Product not found' };
  }

  const description =
    product.description.length > 155
      ? `${product.description.slice(0, 152)}...`
      : product.description;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} | ${BRAND.name}`,
      description,
      type: 'website',
      images: [{ url: product.image, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: [product.image],
    },
    alternates: {
      canonical: `/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlugAsync(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProductsAsync(product);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `/product/${product.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
