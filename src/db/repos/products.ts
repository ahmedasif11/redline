import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { products, inventory } from '@/db/schema';
import { productFromRow, productToRow, inventoryMapFromRows } from '@/db/mappers';
import type { Product } from '@/features/catalog/types';

export async function dbListProducts(): Promise<Product[]> {
  const db = getDb();
  const [rows, stockRows] = await Promise.all([
    db.select().from(products).orderBy(products.name),
    db.select().from(inventory),
  ]);
  const stockMap = inventoryMapFromRows(stockRows);

  return rows.map((row) => {
    const stockBySize: Record<string, number> = {};
    for (const size of row.sizes ?? []) {
      stockBySize[String(size)] =
        stockMap[`${row.id}:${size}`] ?? 0;
    }
    return productFromRow(row, stockBySize);
  });
}

export async function dbGetProductById(id: string): Promise<Product | null> {
  const all = await dbListProducts();
  return all.find((p) => p.id === id) ?? null;
}

export async function dbGetProductBySlug(
  slug: string
): Promise<Product | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!row) return null;
  const stockRows = await db
    .select()
    .from(inventory)
    .where(eq(inventory.productId, row.id));
  const stockMap = inventoryMapFromRows(stockRows);
  const stockBySize: Record<string, number> = {};
  for (const size of row.sizes ?? []) {
    stockBySize[String(size)] = stockMap[`${row.id}:${size}`] ?? 0;
  }
  return productFromRow(row, stockBySize);
}

export async function dbUpsertProduct(product: Product): Promise<Product> {
  const db = getDb();
  const now = new Date();
  const row = productToRow(product, now);

  const existing = await db
    .select({ id: products.id, createdAt: products.createdAt })
    .from(products)
    .where(eq(products.id, product.id))
    .limit(1);

  if (existing[0]) {
    await db
      .update(products)
      .set({ ...row, createdAt: existing[0].createdAt, updatedAt: now })
      .where(eq(products.id, product.id));
  } else {
    await db.insert(products).values(row);
  }

  // Ensure inventory rows exist for every size
  for (const size of product.sizes) {
    const qty = product.stockBySize[String(size)] ?? 0;
    await db
      .insert(inventory)
      .values({
        productId: product.id,
        size: size.toFixed(1),
        quantity: qty,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [inventory.productId, inventory.size],
        set: {
          quantity: qty,
          updatedAt: now,
        },
      });
  }

  const saved = await dbGetProductById(product.id);
  if (!saved) throw new Error('Failed to persist product');
  return saved;
}

export async function dbDeleteProduct(id: string): Promise<boolean> {
  const db = getDb();
  const deleted = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return deleted.length > 0;
}

export async function dbCountProducts(): Promise<number> {
  const db = getDb();
  const rows = await db.select({ id: products.id }).from(products);
  return rows.length;
}
