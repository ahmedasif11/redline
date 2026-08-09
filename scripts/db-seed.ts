import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error(
      'DATABASE_URL is not set. Add a Neon/Postgres URL to web/.env.local first.'
    );
    process.exit(1);
  }

  // Dynamic imports so dotenv loads before db client reads env
  const { getDb, closeDb } = await import('../src/db/client');
  const { products, inventory } = await import('../src/db/schema');
  const { productToRow } = await import('../src/db/mappers');
  const { CATALOG_PRODUCTS } = await import(
    '../src/features/catalog/data/products'
  );
  const { eq } = await import('drizzle-orm');

  const db = getDb();
  const now = new Date();
  let upserted = 0;

  for (const product of CATALOG_PRODUCTS) {
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

    for (const size of product.sizes) {
      const qty = product.stockBySize[String(size)] ?? 12;
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
          set: { quantity: qty, updatedAt: now },
        });
    }

    upserted += 1;
    console.log(`✓ ${product.slug}`);
  }

  await closeDb();
  console.log(`\nSeeded ${upserted} products into Postgres.`);
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
