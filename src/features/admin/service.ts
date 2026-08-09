import {
  getProductByIdAsync,
  invalidateCatalogCache,
  listProductsAsync,
  createProductId,
  deleteStoredProduct,
  upsertStoredProduct,
} from '@/features/catalog/server';
import { BRAND } from '@/lib/brand';
import {
  getInventoryMap,
  setStock,
} from '@/features/commerce/inventory';
import {
  listAllOrders,
  updateOrder,
  getOrderById,
} from '@/features/commerce/orders-store';
import { listUsers, toPublicUser } from '@/features/auth/server';
import type { Order, OrderStatus } from '@/features/commerce';
import type { Product } from '@/features/catalog';
import type {
  AdminCustomerRow,
  AdminMetrics,
  AdminProductRow,
} from './types';
import type {
  InventoryUpdateInput,
  ProductUpsertInput,
} from './schema';

const LOW_STOCK_THRESHOLD = 3;

function toAdminRow(
  product: Product,
  inventory: Record<string, number>
): AdminProductRow {
  const stockBySize: Record<string, number> = {};
  let totalStock = 0;
  for (const size of product.sizes) {
    const qty = inventory[`${product.id}:${size}`] ?? product.stockBySize[String(size)] ?? 0;
    stockBySize[String(size)] = qty;
    totalStock += qty;
  }
  return { product: { ...product, stockBySize }, stockBySize, totalStock };
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const [orders, inventory, users, products] = await Promise.all([
    listAllOrders(),
    getInventoryMap(),
    listUsers(),
    listProductsAsync(),
  ]);

  const paid = orders.filter(
    (o) => o.status === 'paid' || o.status === 'fulfilled'
  );
  const revenueCents = paid.reduce((sum, o) => sum + o.totals.totalCents, 0);
  const lowStockCount = Object.values(inventory).filter(
    (qty) => qty > 0 && qty <= LOW_STOCK_THRESHOLD
  ).length;

  return {
    orderCount: orders.length,
    paidOrderCount: paid.length,
    revenueCents,
    averageOrderValueCents:
      paid.length > 0 ? Math.round(revenueCents / paid.length) : 0,
    productCount: products.length,
    lowStockCount,
    customerCount: users.filter((u) => u.role === 'customer').length,
    recentOrders: orders.slice(0, 8),
  };
}

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const [products, inventory] = await Promise.all([
    listProductsAsync(),
    getInventoryMap(),
  ]);
  return products.map((product) => toAdminRow(product, inventory));
}

export async function updateInventory(
  input: InventoryUpdateInput
): Promise<AdminProductRow> {
  const product = await getProductByIdAsync(input.productId);
  if (!product) {
    throw new AdminError('NOT_FOUND', `Product not found: ${input.productId}`, 404);
  }
  if (!product.sizes.includes(input.size)) {
    throw new AdminError(
      'INVALID_SIZE',
      `Size ${input.size} is not available for ${product.name}`,
      400
    );
  }

  await setStock(input.productId, input.size, input.quantity);
  invalidateCatalogCache();
  const inventory = await getInventoryMap();
  const refreshed = await getProductByIdAsync(input.productId);
  if (!refreshed) {
    throw new AdminError('NOT_FOUND', 'Product not found after update', 404);
  }
  return toAdminRow(refreshed, inventory);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function upsertAdminProduct(
  input: ProductUpsertInput
): Promise<AdminProductRow> {
  const images = input.images;
  const slug = input.slug?.trim() || slugify(input.name);
  if (!slug) {
    throw new AdminError('INVALID_SLUG', 'A valid slug is required', 400);
  }

  const existing = input.id
    ? await getProductByIdAsync(input.id)
    : undefined;

  const id = existing?.id ?? input.id ?? createProductId();
  const stockBySize =
    input.stockBySize ??
    existing?.stockBySize ??
    Object.fromEntries(input.sizes.map((size) => [String(size), 12]));

  const product: Product = {
    id,
    slug,
    name: input.name.trim(),
    price: input.price,
    originalPrice: input.originalPrice,
    image: images[0],
    images,
    category: input.category,
    gender: input.gender,
    colors: input.colors,
    sizes: input.sizes,
    stockBySize,
    isNew: input.isNew,
    onSale: input.onSale,
    rating: input.rating ?? existing?.rating ?? 0,
    reviewCount: input.reviewCount ?? existing?.reviewCount ?? 0,
    description: input.description.trim(),
    brand: input.brand?.trim() || BRAND.name,
    tags: input.tags ?? existing?.tags ?? [],
  };

  const saved = await upsertStoredProduct(product);
  for (const size of saved.sizes) {
    const qty = saved.stockBySize[String(size)] ?? 0;
    await setStock(saved.id, size, qty);
  }
  invalidateCatalogCache();

  const inventory = await getInventoryMap();
  return toAdminRow(saved, inventory);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  const existing = await getProductByIdAsync(id);
  if (!existing) {
    throw new AdminError('NOT_FOUND', 'Product not found', 404);
  }
  const ok = await deleteStoredProduct(id);
  if (!ok) {
    throw new AdminError('NOT_FOUND', 'Product not found', 404);
  }
  invalidateCatalogCache();
}

export async function listAdminOrders(): Promise<Order[]> {
  return listAllOrders();
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const existing = await getOrderById(orderId);
  if (!existing) {
    throw new AdminError('NOT_FOUND', 'Order not found', 404);
  }
  const updated = await updateOrder(orderId, { status });
  if (!updated) {
    throw new AdminError('NOT_FOUND', 'Order not found', 404);
  }
  return updated;
}

export async function listAdminCustomers(): Promise<AdminCustomerRow[]> {
  const [users, orders] = await Promise.all([listUsers(), listAllOrders()]);

  return users.map((user) => {
    const userOrders = orders.filter((o) => o.userId === user.id);
    const spent = userOrders
      .filter((o) => o.status === 'paid' || o.status === 'fulfilled')
      .reduce((sum, o) => sum + o.totals.totalCents, 0);
    return {
      user: toPublicUser(user),
      orderCount: userOrders.length,
      totalSpentCents: spent,
    };
  });
}

export class AdminError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'AdminError';
    this.code = code;
    this.status = status;
  }
}
