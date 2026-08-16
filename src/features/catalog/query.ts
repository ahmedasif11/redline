import { BRAND } from '@/lib/brand';
import {
  COLLECTION_SLUGS,
  DEFAULT_FILTERS,
  PRICE_BOUNDS,
} from './constants';
import { CATALOG_PRODUCTS } from './data/products';
import { productSortSchema } from './schema';
import type { CatalogFilters, Product, ProductSort } from './types';

/** Sync seed catalog for Client Components. Prefer API / `listProductsAsync` on server. */
export function listProducts(): Product[] {
  return CATALOG_PRODUCTS;
}

export function getProductBySlug(slug: string): Product | undefined {
  return CATALOG_PRODUCTS.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return CATALOG_PRODUCTS.find((product) => product.id === id);
}

export function getProductImages(product: {
  image?: string;
  images?: string[] | null;
}): string[] {
  const fromList = (product.images ?? []).filter(Boolean);
  if (fromList.length > 0) return fromList;
  return product.image ? [product.image] : [];
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return CATALOG_PRODUCTS.filter(
    (item) =>
      item.id !== product.id &&
      (item.category === product.category || item.gender === product.gender)
  ).slice(0, limit);
}

export function parseShopSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): CatalogFilters {
  const get = (key: string): string => {
    if (params instanceof URLSearchParams) {
      return params.get(key) ?? '';
    }
    const value = params[key];
    if (Array.isArray(value)) return value[0] ?? '';
    return value ?? '';
  };

  const sortParsed = productSortSchema.safeParse(get('sort') || 'name');
  const minRaw = Number(get('min') || PRICE_BOUNDS.min);
  const maxRaw = Number(get('max') || PRICE_BOUNDS.max);

  return {
    q: get('q').trim(),
    category: get('category') || 'all',
    gender: get('gender') || 'all',
    sale: get('sale') === '1' || get('sale') === 'true',
    sort: (sortParsed.success ? sortParsed.data : 'name') as ProductSort,
    minPrice: Number.isFinite(minRaw) ? minRaw : PRICE_BOUNDS.min,
    maxPrice: Number.isFinite(maxRaw) ? maxRaw : PRICE_BOUNDS.max,
  };
}

export function buildShopQuery(filters: Partial<CatalogFilters>): string {
  const merged: CatalogFilters = { ...DEFAULT_FILTERS, ...filters };
  const params = new URLSearchParams();

  if (merged.q) params.set('q', merged.q);
  if (merged.category !== 'all') params.set('category', merged.category);
  if (merged.gender !== 'all') params.set('gender', merged.gender);
  if (merged.sale) params.set('sale', '1');
  if (merged.sort !== 'name') params.set('sort', merged.sort);
  if (merged.minPrice !== PRICE_BOUNDS.min) {
    params.set('min', String(merged.minPrice));
  }
  if (merged.maxPrice !== PRICE_BOUNDS.max) {
    params.set('max', String(merged.maxPrice));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function buildShopHref(filters: Partial<CatalogFilters> = {}): string {
  return `/shop${buildShopQuery(filters)}`;
}

export function filtersFromContext(state: {
  searchQuery: string;
  selectedCategory: string;
  selectedGender: string;
  priceRange: [number, number];
}): CatalogFilters {
  const sale = state.searchQuery === 'sale';
  return {
    ...DEFAULT_FILTERS,
    q: sale ? '' : state.searchQuery,
    category: state.selectedCategory,
    gender: state.selectedGender,
    sale,
    minPrice: state.priceRange[0],
    maxPrice: state.priceRange[1],
  };
}

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilters
): Product[] {
  let filtered = [...products];

  if (filters.sale) {
    filtered = filtered.filter((product) => product.onSale);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filters.category !== 'all') {
    filtered = filtered.filter(
      (product) => product.category === filters.category
    );
  }

  if (filters.gender !== 'all') {
    filtered = filtered.filter(
      (product) =>
        product.gender === filters.gender || product.gender === 'unisex'
    );
  }

  filtered = filtered.filter(
    (product) =>
      product.price >= filters.minPrice && product.price <= filters.maxPrice
  );

  filtered.sort((a, b) => {
    switch (filters.sort) {
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return filtered;
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.q !== '' ||
    filters.category !== 'all' ||
    filters.gender !== 'all' ||
    filters.sale ||
    filters.minPrice !== PRICE_BOUNDS.min ||
    filters.maxPrice !== PRICE_BOUNDS.max
  );
}

export function getCatalogCopy(filters: CatalogFilters): {
  title: string;
  subtitle: string;
} {
  if (filters.q) {
    return {
      title: 'SEARCH RESULTS',
      subtitle: `Showing results for "${filters.q}"`,
    };
  }
  if (filters.sale) {
    return {
      title: 'SALE PRODUCTS',
      subtitle: `Exclusive deals on premium ${BRAND.name} sneakers`,
    };
  }
  if (filters.gender !== 'all') {
    return {
      title: `${filters.gender.toUpperCase()}'S COLLECTION`,
      subtitle: `Premium ${BRAND.name} collection for ${filters.gender}`,
    };
  }
  if (filters.category !== 'all') {
    return {
      title: filters.category.replace(/-/g, ' ').toUpperCase(),
      subtitle: `Discover the latest and greatest from the ${BRAND.name} collection`,
    };
  }
  return {
    title: 'FEATURED PRODUCTS',
    subtitle: `Discover the latest and greatest from the ${BRAND.name} collection`,
  };
}

export function getCollectionBySlug(slug: string) {
  return COLLECTION_SLUGS[slug] ?? null;
}

export function queryProducts(filters: CatalogFilters): Product[] {
  return filterAndSortProducts(listProducts(), filters);
}
