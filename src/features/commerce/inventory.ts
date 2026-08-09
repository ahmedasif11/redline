import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from '@/lib/data-dir';
import { isDatabaseConfigured } from '@/db/client';
import {
  dbAssertStockAvailable,
  dbDecrementStock,
  dbGetInventoryMap,
  dbGetStock,
  dbSetStock,
} from '@/db/repos/inventory';
import { listStoredProducts } from '@/features/catalog/products-store';

const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

type InventoryMap = Record<string, number>;

function stockKey(productId: string, size: number): string {
  return `${productId}:${size}`;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function seedFromCatalog(): Promise<InventoryMap> {
  const map: InventoryMap = {};
  const products = await listStoredProducts();
  for (const product of products) {
    for (const [size, qty] of Object.entries(product.stockBySize)) {
      map[stockKey(product.id, Number(size))] = qty;
    }
  }
  return map;
}

async function readInventory(): Promise<InventoryMap> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(INVENTORY_FILE, 'utf8');
    return JSON.parse(raw) as InventoryMap;
  } catch {
    const seeded = await seedFromCatalog();
    await fs.writeFile(INVENTORY_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeInventory(map: InventoryMap) {
  await ensureDataDir();
  await fs.writeFile(INVENTORY_FILE, JSON.stringify(map, null, 2));
}

export async function getStock(
  productId: string,
  size: number
): Promise<number> {
  if (isDatabaseConfigured()) return dbGetStock(productId, size);
  const map = await readInventory();
  return map[stockKey(productId, size)] ?? 0;
}

export async function getInventoryMap(): Promise<InventoryMap> {
  if (isDatabaseConfigured()) return dbGetInventoryMap();
  return readInventory();
}

export async function setStock(
  productId: string,
  size: number,
  quantity: number
): Promise<number> {
  if (!Number.isFinite(quantity) || quantity < 0) {
    throw new InventoryError('Stock quantity must be a non-negative number');
  }
  if (isDatabaseConfigured()) {
    return dbSetStock(productId, size, quantity);
  }
  const map = await readInventory();
  const key = stockKey(productId, size);
  map[key] = Math.floor(quantity);
  await writeInventory(map);
  return map[key];
}

export async function assertStockAvailable(
  lines: {
    productId: string;
    selectedSize: number;
    quantity: number;
    name?: string;
  }[]
): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await dbAssertStockAvailable(lines);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === 'INSUFFICIENT_STOCK'
      ) {
        throw new InventoryError(error.message);
      }
      throw error;
    }
  }

  const map = await readInventory();
  const needed: Record<string, number> = {};

  for (const line of lines) {
    const key = stockKey(line.productId, line.selectedSize);
    needed[key] = (needed[key] ?? 0) + line.quantity;
  }

  const products = await listStoredProducts();
  for (const [key, qty] of Object.entries(needed)) {
    const available = map[key] ?? 0;
    if (qty > available) {
      const [productId, size] = key.split(':');
      const product = products.find((p) => p.id === productId);
      throw new InventoryError(
        `Insufficient stock for ${product?.name ?? productId} (size ${size}). Available: ${available}.`
      );
    }
  }
}

export async function decrementStock(
  lines: { productId: string; selectedSize: number; quantity: number }[]
): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await dbDecrementStock(lines);
      return;
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === 'INSUFFICIENT_STOCK'
      ) {
        throw new InventoryError(error.message);
      }
      throw error;
    }
  }

  await assertStockAvailable(lines);
  const map = await readInventory();

  for (const line of lines) {
    const key = stockKey(line.productId, line.selectedSize);
    map[key] = (map[key] ?? 0) - line.quantity;
  }

  await writeInventory(map);
}

export class InventoryError extends Error {
  code = 'INSUFFICIENT_STOCK' as const;
  constructor(message: string) {
    super(message);
    this.name = 'InventoryError';
  }
}
