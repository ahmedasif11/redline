import { BRAND } from '@/lib/brand';
import { productSchema } from '../schema';
import type { Product } from '../types';

function defaultStock(sizes: number[], units = 12): Record<string, number> {
  return Object.fromEntries(sizes.map((size) => [String(size), units]));
}

function product(
  input: Omit<Product, 'brand' | 'images' | 'image' | 'tags' | 'stockBySize'> & {
    images: string[];
    tags?: string[];
    stockBySize?: Record<string, number>;
  }
): Product {
  const images = input.images;
  const parsed = productSchema.parse({
    ...input,
    image: images[0],
    images,
    brand: BRAND.name,
    tags: input.tags ?? [],
    stockBySize: input.stockBySize ?? defaultStock(input.sizes),
  });
  return parsed;
}

export const CATALOG_PRODUCTS: Product[] = [
  product({
    id: '1',
    slug: 'court-one-high',
    name: 'COURT ONE HIGH',
    price: 170,
    images: [
      'https://images.unsplash.com/photo-1617813255567-ae6945acf5e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'classic-high',
    gender: 'unisex',
    colors: ['Bred', 'Chicago', 'Royal'],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    isNew: true,
    rating: 4.8,
    reviewCount: 234,
    description:
      'The silhouette that defines the line. Classic high-top with premium materials.',
    tags: ['high-top', 'heritage'],
  }),
  product({
    id: '2',
    slug: 'retro-four',
    name: 'RETRO FOUR',
    price: 200,
    images: [
      'https://images.unsplash.com/photo-1693400652052-884f8dd3dfd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1617813255567-ae6945acf5e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'retro',
    gender: 'men',
    colors: ['Black Cement', 'White Fire Red', 'Bred'],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    rating: 4.6,
    reviewCount: 189,
    description:
      'Iconic mid support with distinctive wing eyelets and court-ready cushioning.',
    tags: ['mid', 'retro'],
  }),
  product({
    id: '3',
    slug: 'patent-eleven',
    name: 'PATENT ELEVEN',
    price: 220,
    images: [
      'https://images.unsplash.com/photo-1618718315344-7cbffaa60b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1696992402197-04eca5422f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'retro',
    gender: 'unisex',
    colors: ['Concord', 'Bred', 'Space Jam'],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    rating: 4.9,
    reviewCount: 312,
    description:
      'Patent leather drama with a translucent outsole built for the spotlight.',
    tags: ['patent', 'spotlight'],
  }),
  product({
    id: '4',
    slug: 'elephant-three',
    name: 'ELEPHANT THREE',
    price: 190,
    originalPrice: 210,
    images: [
      'https://images.unsplash.com/photo-1723797942362-6a3ab47d0e6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1693400652052-884f8dd3dfd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'retro',
    gender: 'men',
    colors: ['Black Cement', 'White Fire Red', 'True Blue'],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    onSale: true,
    rating: 4.7,
    reviewCount: 156,
    description:
      'Visible cushioning and signature print—heritage energy, modern build.',
    tags: ['sale', 'heritage'],
  }),
  product({
    id: '5',
    slug: 'delta-low-women',
    name: 'DELTA LOW WOMEN',
    price: 130,
    images: [
      'https://images.unsplash.com/photo-1602231379910-61381b308c2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'lifestyle',
    gender: 'women',
    colors: ['Pink/White', 'Purple/Grey', 'Rose Gold'],
    sizes: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    isNew: true,
    rating: 4.4,
    reviewCount: 89,
    description:
      'Modern lifestyle low with everyday cushioning and clean colorways.',
    tags: ['low', 'lifestyle'],
  }),
  product({
    id: '6',
    slug: 'quilt-twelve',
    name: 'QUILT TWELVE',
    price: 190,
    images: [
      'https://images.unsplash.com/photo-1696992402197-04eca5422f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1618718315344-7cbffaa60b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'new-releases',
    gender: 'unisex',
    colors: ['Flu Game', 'Playoff', 'Taxi'],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12],
    isNew: true,
    rating: 4.5,
    reviewCount: 145,
    description:
      'Quilted leather upper with performance geometry for the latest drop.',
    tags: ['drop', 'quilted'],
  }),
  product({
    id: '7',
    slug: 'court-one-low-women',
    name: 'COURT ONE LOW WOMEN',
    price: 90,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1602231379910-61381b308c2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'classic-high',
    gender: 'women',
    colors: ['White/Pink', 'Black/Rose', 'Cream/Gold'],
    sizes: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10],
    rating: 4.3,
    reviewCount: 167,
    description:
      'Classic low silhouette designed for women with premium materials.',
    tags: ['low', 'women'],
  }),
  product({
    id: '8',
    slug: 'infrared-six',
    name: 'INFRARED SIX',
    price: 200,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
      'https://images.unsplash.com/photo-1723797942362-6a3ab47d0e6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    ],
    category: 'retro',
    gender: 'men',
    colors: ['Infrared', 'Black Cat', 'Carmine'],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13],
    rating: 4.6,
    reviewCount: 203,
    description:
      'Distinctive midfoot support and court comfort in a bold retro package.',
    tags: ['infrared', 'retro'],
  }),
];
