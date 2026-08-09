import { z } from 'zod';

export const shippingAddressSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().or(z.literal('')),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().length(2).default('US'),
  phone: z.string().max(30).optional().or(z.literal('')),
});

export const checkoutLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(10),
  selectedSize: z.number().positive(),
  selectedColor: z.string().min(1),
});

export const checkoutSessionSchema = z.object({
  shipping: shippingAddressSchema,
  items: z.array(checkoutLineSchema).min(1).max(50),
  idempotencyKey: z.string().min(8).max(120),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionSchema>;
