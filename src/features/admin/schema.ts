import { z } from 'zod';
import {
  productCategorySchema,
  productGenderSchema,
} from '@/features/catalog/schema';

export const inventoryUpdateSchema = z.object({
  productId: z.string().min(1),
  size: z.number().positive(),
  quantity: z.number().int().min(0).max(9999),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    'pending_payment',
    'paid',
    'fulfilled',
    'cancelled',
    'refunded',
  ]),
});

export const productUpsertSchema = z.object({
  id: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  name: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  image: z.string().url().optional(),
  images: z.array(z.string().url()).min(1),
  category: productCategorySchema,
  gender: productGenderSchema,
  colors: z.array(z.string().min(1)).min(1),
  sizes: z.array(z.number().positive()).min(1),
  stockBySize: z.record(z.string(), z.number().int().nonnegative()).optional(),
  isNew: z.boolean().optional(),
  onSale: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().nonnegative().optional(),
  description: z.string().min(1),
  brand: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type InventoryUpdateInput = z.infer<typeof inventoryUpdateSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
export type ProductUpsertInput = z.infer<typeof productUpsertSchema>;
