import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { Address, SyncedCartLine } from '@/features/auth/types';
import type {
  OrderItem,
  OrderTotals,
  ShippingAddress,
} from '@/features/commerce/types';

export const userRoleEnum = pgEnum('user_role', ['customer', 'admin']);

export const orderStatusEnum = pgEnum('order_status', [
  'pending_payment',
  'paid',
  'fulfilled',
  'cancelled',
  'refunded',
]);

export const paymentProviderEnum = pgEnum('payment_provider', [
  'stripe',
  'demo',
]);

export const productCategoryEnum = pgEnum('product_category', [
  'classic-high',
  'retro',
  'lifestyle',
  'new-releases',
]);

export const productGenderEnum = pgEnum('product_gender', [
  'men',
  'women',
  'unisex',
]);

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    name: text('name').notNull(),
    role: userRoleEnum('role').notNull().default('customer'),
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex('users_email_uidx').on(table.email)]
);

export const products = pgTable(
  'products',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    /** Display price in dollars (matches storefront Product.price). */
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    images: jsonb('images').$type<string[]>().notNull(),
    category: productCategoryEnum('category').notNull(),
    gender: productGenderEnum('gender').notNull(),
    colors: jsonb('colors').$type<string[]>().notNull(),
    sizes: jsonb('sizes').$type<number[]>().notNull(),
    isNew: boolean('is_new').notNull().default(false),
    onSale: boolean('on_sale').notNull().default(false),
    rating: numeric('rating', { precision: 2, scale: 1 }).notNull(),
    reviewCount: integer('review_count').notNull().default(0),
    description: text('description').notNull(),
    brand: text('brand').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex('products_slug_uidx').on(table.slug)]
);

export const inventory = pgTable(
  'inventory',
  {
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    size: numeric('size', { precision: 4, scale: 1 }).notNull(),
    quantity: integer('quantity').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.productId, table.size] })]
);

export const orders = pgTable(
  'orders',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    status: orderStatusEnum('status').notNull(),
    items: jsonb('items').$type<OrderItem[]>().notNull(),
    shipping: jsonb('shipping').$type<ShippingAddress>().notNull(),
    totals: jsonb('totals').$type<OrderTotals>().notNull(),
    currency: text('currency').notNull().default('usd'),
    paymentProvider: paymentProviderEnum('payment_provider').notNull(),
    stripeSessionId: text('stripe_session_id'),
    stripePaymentIntentId: text('stripe_payment_intent_id'),
    idempotencyKey: text('idempotency_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('orders_idempotency_uidx').on(table.idempotencyKey),
    uniqueIndex('orders_stripe_session_uidx').on(table.stripeSessionId),
  ]
);

export const accounts = pgTable('accounts', {
  userId: text('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  addresses: jsonb('addresses').$type<Address[]>().notNull().default([]),
  cart: jsonb('cart').$type<SyncedCartLine[]>().notNull().default([]),
  wishlist: jsonb('wishlist').$type<string[]>().notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});
