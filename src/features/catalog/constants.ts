import type { CatalogFilters, ProductSort } from './types';

export const PRICE_BOUNDS = { min: 0, max: 300 } as const;

export const DEFAULT_FILTERS: CatalogFilters = {
  q: '',
  category: 'all',
  gender: 'all',
  sale: false,
  sort: 'name',
  minPrice: PRICE_BOUNDS.min,
  maxPrice: PRICE_BOUNDS.max,
};

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Products' },
  { value: 'classic-high', label: 'Court One' },
  { value: 'retro', label: 'Retro' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'new-releases', label: 'New Releases' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'unisex', label: 'Unisex' },
] as const;

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'price', label: 'Price' },
  { value: 'rating', label: 'Rating' },
];

/** Collection landing slug → shop filter mapping */
export const COLLECTION_SLUGS: Record<
  string,
  { title: string; description: string; filters: Partial<CatalogFilters> }
> = {
  'court-one': {
    title: 'COURT ONE',
    description: 'The original silhouette that defines the line.',
    filters: { category: 'classic-high' },
  },
  retro: {
    title: 'RETRO',
    description: 'Timeless designs with modern comfort.',
    filters: { category: 'retro' },
  },
  lifestyle: {
    title: 'LIFESTYLE',
    description: 'Street-ready style for everyday wear.',
    filters: { category: 'lifestyle' },
  },
  men: {
    title: "MEN'S",
    description: 'Premium sneakers for the modern athlete.',
    filters: { gender: 'men' },
  },
  women: {
    title: "WOMEN'S",
    description: 'Stylish designs for women who lead.',
    filters: { gender: 'women' },
  },
  'new-releases': {
    title: 'NEW RELEASES',
    description: 'Latest drops before they sell out.',
    filters: { category: 'new-releases' },
  },
  sale: {
    title: 'SALE',
    description: 'Exclusive deals on premium REDLINE sneakers.',
    filters: { sale: true },
  },
};
