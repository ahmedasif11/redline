import { and, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { inventory, products } from '@/db/schema';
import { inventoryMapFromRows } from '@/db/mappers';

function sizeStr(size: number): string {
  return size.toFixed(1);
}

export async function dbGetInventoryMap(): Promise<Record<string, number>> {
  const db = getDb();
  const rows = await db.select().from(inventory);
  return inventoryMapFromRows(rows);
}

export async function dbGetStock(
  productId: string,
  size: number
): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(inventory)
    .where(
      and(
        eq(inventory.productId, productId),
        eq(inventory.size, sizeStr(size))
      )
    )
    .limit(1);
  return row?.quantity ?? 0;
}

export async function dbSetStock(
  productId: string,
  size: number,
  quantity: number
): Promise<number> {
  const db = getDb();
  const now = new Date();
  const qty = Math.floor(quantity);

  await db
    .insert(inventory)
    .values({
      productId,
      size: sizeStr(size),
      quantity: qty,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [inventory.productId, inventory.size],
      set: { quantity: qty, updatedAt: now },
    });

  return qty;
}

export async function dbAssertStockAvailable(
  lines: {
    productId: string;
    selectedSize: number;
    quantity: number;
    name?: string;
  }[]
): Promise<void> {
  const map = await dbGetInventoryMap();
  const needed: Record<string, number> = {};

  for (const line of lines) {
    const key = `${line.productId}:${line.selectedSize}`;
    needed[key] = (needed[key] ?? 0) + line.quantity;
  }

  for (const [key, qty] of Object.entries(needed)) {
    const available = map[key] ?? 0;
    if (qty > available) {
      const [productId, size] = key.split(':');
      const [product] = await getDb()
        .select({ name: products.name })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      throw Object.assign(
        new Error(
          `Insufficient stock for ${product?.name ?? productId} (size ${size}). Available: ${available}.`
        ),
        { code: 'INSUFFICIENT_STOCK', name: 'InventoryError' }
      );
    }
  }
}

export async function dbDecrementStock(
  lines: { productId: string; selectedSize: number; quantity: number }[]
): Promise<void> {
  await dbAssertStockAvailable(lines);
  const db = getDb();
  const now = new Date();

  for (const line of lines) {
    const result = await db
      .update(inventory)
      .set({
        quantity: sql`${inventory.quantity} - ${line.quantity}`,
        updatedAt: now,
      })
      .where(
        and(
          eq(inventory.productId, line.productId),
          eq(inventory.size, sizeStr(line.selectedSize)),
          sql`${inventory.quantity} >= ${line.quantity}`
        )
      )
      .returning({ quantity: inventory.quantity });

    if (result.length === 0) {
      throw Object.assign(
        new Error(
          `Insufficient stock for ${line.productId} (size ${line.selectedSize}).`
        ),
        { code: 'INSUFFICIENT_STOCK', name: 'InventoryError' }
      );
    }
  }
}
