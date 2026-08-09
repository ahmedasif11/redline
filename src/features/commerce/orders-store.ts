import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from '@/lib/data-dir';
import { isDatabaseConfigured } from '@/db/client';
import {
  dbFindOrderByIdempotencyKey,
  dbFindOrderByStripeSessionId,
  dbGetOrderById,
  dbListAllOrders,
  dbListOrdersByUserId,
  dbSaveOrder,
  dbUpdateOrder,
} from '@/db/repos/orders';
import type { Order } from './types';

const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

type OrderStore = Record<string, Order>;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<OrderStore> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf8');
    return JSON.parse(raw) as OrderStore;
  } catch {
    return {};
  }
}

async function writeStore(store: OrderStore) {
  await ensureDataDir();
  await fs.writeFile(ORDERS_FILE, JSON.stringify(store, null, 2));
}

export async function saveOrder(order: Order): Promise<Order> {
  if (isDatabaseConfigured()) return dbSaveOrder(order);
  const store = await readStore();
  store[order.id] = order;
  await writeStore(store);
  return order;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isDatabaseConfigured()) return dbGetOrderById(id);
  const store = await readStore();
  return store[id] ?? null;
}

export async function findOrderByIdempotencyKey(
  key: string
): Promise<Order | null> {
  if (isDatabaseConfigured()) return dbFindOrderByIdempotencyKey(key);
  const store = await readStore();
  return (
    Object.values(store).find((order) => order.idempotencyKey === key) ?? null
  );
}

export async function findOrderByStripeSessionId(
  sessionId: string
): Promise<Order | null> {
  if (isDatabaseConfigured()) return dbFindOrderByStripeSessionId(sessionId);
  const store = await readStore();
  return (
    Object.values(store).find((order) => order.stripeSessionId === sessionId) ??
    null
  );
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>
): Promise<Order | null> {
  if (isDatabaseConfigured()) return dbUpdateOrder(id, patch);
  const store = await readStore();
  const existing = store[id];
  if (!existing) return null;
  const next: Order = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store[id] = next;
  await writeStore(store);
  return next;
}

export async function listOrdersByUserId(userId: string): Promise<Order[]> {
  if (isDatabaseConfigured()) return dbListOrdersByUserId(userId);
  const store = await readStore();
  return Object.values(store)
    .filter((order) => order.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export async function listAllOrders(): Promise<Order[]> {
  if (isDatabaseConfigured()) return dbListAllOrders();
  const store = await readStore();
  return Object.values(store).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
