import 'server-only';

import { CATALOG_PRODUCTS } from './data/products';
import {
  filterAndSortProducts,
  getRelatedProducts,
} from './query';
import {
  getStoredProductById,
  getStoredProductBySlug,
  listStoredProducts,
} from './products-store';
import type { CatalogFilters, Product } from './types';

let catalogCache: Product[] | null = null;
let catalogCacheAt = 0;
const CACHE_TTL_MS = 5_000;

export function invalidateCatalogCache() {
  catalogCache = null;
  catalogCacheAt = 0;
}

export async function ensureCatalogCache(force = false): Promise<Product[]> {
  const fresh =
    catalogCache && !force && Date.now() - catalogCacheAt < CACHE_TTL_MS;
  if (fresh && catalogCache) return catalogCache;

  try {
    catalogCache = await listStoredProducts();
    catalogCacheAt = Date.now();
    return catalogCache;
  } catch {
    catalogCache = CATALOG_PRODUCTS;
    catalogCacheAt = Date.now();
    return catalogCache;
  }
}

export async function listProductsAsync(): Promise<Product[]> {
  return ensureCatalogCache();
}

export async function getProductBySlugAsync(
  slug: string
): Promise<Product | undefined> {
  await ensureCatalogCache();
  const cached = catalogCache?.find((p) => p.slug === slug);
  if (cached) return cached;
  return (await getStoredProductBySlug(slug)) ?? undefined;
}

export async function getProductByIdAsync(
  id: string
): Promise<Product | undefined> {
  await ensureCatalogCache();
  const cached = catalogCache?.find((p) => p.id === id);
  if (cached) return cached;
  return (await getStoredProductById(id)) ?? undefined;
}

export async function getRelatedProductsAsync(
  product: Product,
  limit = 4
): Promise<Product[]> {
  await ensureCatalogCache();
  const products = catalogCache ?? CATALOG_PRODUCTS;
  return products
    .filter(
      (item) =>
        item.id !== product.id &&
        (item.category === product.category || item.gender === product.gender)
    )
    .slice(0, limit);
}

export async function queryProductsAsync(
  filters: CatalogFilters
): Promise<Product[]> {
  const products = await listProductsAsync();
  return filterAndSortProducts(products, filters);
}

export {
  createProductId,
  deleteStoredProduct,
  getStoredProductById,
  getStoredProductBySlug,
  listStoredProducts,
  upsertStoredProduct,
} from './products-store';

// Re-export sync helpers used alongside async APIs in server modules
export { getRelatedProducts };
