import type { Product } from '@/features/catalog/types';
import type { StoredUser, AccountRecord } from '@/features/auth/types';
import type { Order } from '@/features/commerce/types';
import type { InferSelectModel } from 'drizzle-orm';
import {
  accounts,
  inventory,
  orders,
  products,
  users,
} from './schema';

type ProductRow = InferSelectModel<typeof products>;
type UserRow = InferSelectModel<typeof users>;
type OrderRow = InferSelectModel<typeof orders>;
type AccountRow = InferSelectModel<typeof accounts>;
type InventoryRow = InferSelectModel<typeof inventory>;

function num(value: string | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export function productFromRow(
  row: ProductRow,
  stockBySize: Record<string, number> = {}
): Product {
  const images = row.images ?? [];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: num(row.price),
    originalPrice: row.originalPrice != null ? num(row.originalPrice) : undefined,
    image: images[0] ?? '',
    images,
    category: row.category,
    gender: row.gender,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    stockBySize,
    isNew: row.isNew || undefined,
    onSale: row.onSale || undefined,
    rating: num(row.rating),
    reviewCount: row.reviewCount,
    description: row.description,
    brand: row.brand,
    tags: row.tags ?? [],
  };
}

export function productToRow(product: Product, now = new Date()) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price.toFixed(2),
    originalPrice:
      product.originalPrice != null
        ? product.originalPrice.toFixed(2)
        : null,
    images: product.images,
    category: product.category,
    gender: product.gender,
    colors: product.colors,
    sizes: product.sizes,
    isNew: Boolean(product.isNew),
    onSale: Boolean(product.onSale),
    rating: product.rating.toFixed(1),
    reviewCount: product.reviewCount,
    description: product.description,
    brand: product.brand,
    tags: product.tags,
    createdAt: now,
    updatedAt: now,
  };
}

export function userFromRow(row: UserRow): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function userToRow(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    passwordHash: user.passwordHash,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

export function orderFromRow(row: OrderRow): Order {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    status: row.status,
    items: row.items,
    shipping: row.shipping,
    totals: row.totals,
    currency: 'usd',
    paymentProvider: row.paymentProvider,
    stripeSessionId: row.stripeSessionId ?? undefined,
    stripePaymentIntentId: row.stripePaymentIntentId ?? undefined,
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    paidAt: row.paidAt?.toISOString(),
    emailSentAt: row.emailSentAt?.toISOString(),
  };
}

export function orderToRow(order: Order) {
  return {
    id: order.id,
    userId: order.userId ?? null,
    status: order.status,
    items: order.items,
    shipping: order.shipping,
    totals: order.totals,
    currency: order.currency,
    paymentProvider: order.paymentProvider,
    stripeSessionId: order.stripeSessionId ?? null,
    stripePaymentIntentId: order.stripePaymentIntentId ?? null,
    idempotencyKey: order.idempotencyKey,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
    paidAt: order.paidAt ? new Date(order.paidAt) : null,
    emailSentAt: order.emailSentAt ? new Date(order.emailSentAt) : null,
  };
}

export function accountFromRow(row: AccountRow): AccountRecord {
  return {
    userId: row.userId,
    addresses: row.addresses,
    cart: row.cart,
    wishlist: row.wishlist,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function accountToRow(account: AccountRecord) {
  return {
    userId: account.userId,
    addresses: account.addresses,
    cart: account.cart,
    wishlist: account.wishlist,
    updatedAt: new Date(account.updatedAt),
  };
}

export function inventoryKey(productId: string, size: number | string): string {
  return `${productId}:${size}`;
}

export function inventoryMapFromRows(
  rows: InventoryRow[]
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[inventoryKey(row.productId, num(row.size))] = row.quantity;
  }
  return map;
}
