import 'server-only';

import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from '@/lib/data-dir';
import { CATALOG_PRODUCTS } from '@/features/catalog/data/products';
import { productSchema } from '@/features/catalog/schema';
import type { Product } from '@/features/catalog/types';
import { isDatabaseConfigured } from '@/db/client';
import {
  dbCountProducts,
  dbDeleteProduct,
  dbGetProductById,
  dbGetProductBySlug,
  dbListProducts,
  dbUpsertProduct,
} from '@/db/repos/products';

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

type ProductStore = Record<string, Product>;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readJsonStore(): Promise<ProductStore> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as ProductStore;
    return parsed;
  } catch {
    const seeded: ProductStore = {};
    for (const product of CATALOG_PRODUCTS) {
      seeded[product.id] = product;
    }
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeJsonStore(store: ProductStore) {
  await ensureDataDir();
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(store, null, 2));
}

async function jsonListProducts(): Promise<Product[]> {
  const store = await readJsonStore();
  return Object.values(store).sort((a, b) => a.name.localeCompare(b.name));
}

async function jsonGetProductById(id: string): Promise<Product | null> {
  const store = await readJsonStore();
  return store[id] ?? null;
}

async function jsonGetProductBySlug(slug: string): Promise<Product | null> {
  const store = await readJsonStore();
  return Object.values(store).find((p) => p.slug === slug) ?? null;
}

async function jsonUpsertProduct(product: Product): Promise<Product> {
  const parsed = productSchema.parse(product);
  const store = await readJsonStore();
  store[parsed.id] = parsed;
  await writeJsonStore(store);
  return parsed;
}

async function jsonDeleteProduct(id: string): Promise<boolean> {
  const store = await readJsonStore();
  if (!store[id]) return false;
  delete store[id];
  await writeJsonStore(store);
  return true;
}

export async function listStoredProducts(): Promise<Product[]> {
  if (isDatabaseConfigured()) return dbListProducts();
  return jsonListProducts();
}

export async function getStoredProductById(
  id: string
): Promise<Product | null> {
  if (isDatabaseConfigured()) return dbGetProductById(id);
  return jsonGetProductById(id);
}

export async function getStoredProductBySlug(
  slug: string
): Promise<Product | null> {
  if (isDatabaseConfigured()) return dbGetProductBySlug(slug);
  return jsonGetProductBySlug(slug);
}

export async function upsertStoredProduct(
  product: Product
): Promise<Product> {
  const parsed = productSchema.parse(product);
  if (isDatabaseConfigured()) return dbUpsertProduct(parsed);
  return jsonUpsertProduct(parsed);
}

export async function deleteStoredProduct(id: string): Promise<boolean> {
  if (isDatabaseConfigured()) return dbDeleteProduct(id);
  return jsonDeleteProduct(id);
}

export async function countStoredProducts(): Promise<number> {
  if (isDatabaseConfigured()) return dbCountProducts();
  const products = await jsonListProducts();
  return products.length;
}

export function createProductId(): string {
  return `prd_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
