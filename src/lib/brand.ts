export const BRAND = {
  name: 'REDLINE',
  tagline: 'Premium performance footwear',
  freeShippingThreshold: 50,
  storageKeys: {
    cart: 'redline-cart',
    wishlist: 'redline-wishlist',
  },
} as const;

export type BrandName = typeof BRAND.name;
