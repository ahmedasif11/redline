export type ProductCategory =
  | 'classic-high'
  | 'retro'
  | 'lifestyle'
  | 'new-releases';

export type ProductGender = 'men' | 'women' | 'unisex';

export type ProductSort = 'name' | 'price' | 'rating';

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  /** Primary image (also first of `images`) */
  image: string;
  images: string[];
  category: ProductCategory;
  gender: ProductGender;
  colors: string[];
  sizes: number[];
  /** Units available per size (shared across colorways for MVP) */
  stockBySize: Record<string, number>;
  isNew?: boolean;
  onSale?: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  brand: string;
  tags: string[];
}

export interface CatalogFilters {
  q: string;
  category: string;
  gender: string;
  sale: boolean;
  sort: ProductSort;
  minPrice: number;
  maxPrice: number;
}
