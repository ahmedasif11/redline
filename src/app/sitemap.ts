import type { MetadataRoute } from 'next';
import { COLLECTION_SLUGS } from '@/features/catalog';
import { listProductsAsync } from '@/features/catalog/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://redline.example';

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop',
    '/checkout',
    '/size-guide',
    '/shipping',
    '/returns',
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' || path === '/shop' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : path === '/shop' ? 0.9 : 0.5,
  }));

  const catalog = await listProductsAsync();
  const products = catalog.map((product) => ({
    url: `${base}/product/${product.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const collections = Object.keys(COLLECTION_SLUGS).map((slug) => ({
    url: `${base}/collections/${slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...products, ...collections];
}
