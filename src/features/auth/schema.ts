import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80),
});

export const addressSchema = z.object({
  label: z.string().min(1).max(40).default('Home'),
  fullName: z.string().min(2).max(120),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().length(2).default('US'),
  phone: z.string().max(30).optional().or(z.literal('')),
  isDefault: z.boolean().optional(),
});

export const syncedCartLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
  selectedSize: z.number().positive(),
  selectedColor: z.string().min(1),
});

export const mergeGuestSchema = z.object({
  cart: z.array(syncedCartLineSchema).max(50).default([]),
  wishlist: z.array(z.string()).max(100).default([]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
