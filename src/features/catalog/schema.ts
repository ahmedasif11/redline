import { z } from 'zod';

export const productCategorySchema = z.enum([
  'classic-high',
  'retro',
  'lifestyle',
  'new-releases',
]);

export const productGenderSchema = z.enum(['men', 'women', 'unisex']);

export const productSortSchema = z.enum(['name', 'price', 'rating']);

export const productSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  image: z.string().url(),
  images: z.array(z.string().url()).min(1),
  category: productCategorySchema,
  gender: productGenderSchema,
  colors: z.array(z.string()).min(1),
  sizes: z.array(z.number()).min(1),
  stockBySize: z.record(z.string(), z.number().int().nonnegative()),
  isNew: z.boolean().optional(),
  onSale: z.boolean().optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  description: z.string(),
  brand: z.string(),
  tags: z.array(z.string()),
});

export const catalogFiltersSchema = z.object({
  q: z.string().default(''),
  category: z.string().default('all'),
  gender: z.string().default('all'),
  sale: z.boolean().default(false),
  sort: productSortSchema.default('name'),
  minPrice: z.number().nonnegative().default(0),
  maxPrice: z.number().positive().default(300),
});

export type ProductInput = z.infer<typeof productSchema>;
