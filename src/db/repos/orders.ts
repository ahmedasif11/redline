import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { orders } from '@/db/schema';
import { orderFromRow, orderToRow } from '@/db/mappers';
import type { Order } from '@/features/commerce/types';

export async function dbSaveOrder(order: Order): Promise<Order> {
  const db = getDb();
  const row = orderToRow(order);
  await db
    .insert(orders)
    .values(row)
    .onConflictDoUpdate({
      target: orders.id,
      set: {
        userId: row.userId,
        status: row.status,
        items: row.items,
        shipping: row.shipping,
        totals: row.totals,
        currency: row.currency,
        paymentProvider: row.paymentProvider,
        stripeSessionId: row.stripeSessionId,
        stripePaymentIntentId: row.stripePaymentIntentId,
        idempotencyKey: row.idempotencyKey,
        updatedAt: row.updatedAt,
        paidAt: row.paidAt,
        emailSentAt: row.emailSentAt,
      },
    });
  return order;
}

export async function dbGetOrderById(id: string): Promise<Order | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  return row ? orderFromRow(row) : null;
}

export async function dbFindOrderByIdempotencyKey(
  key: string
): Promise<Order | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.idempotencyKey, key))
    .limit(1);
  return row ? orderFromRow(row) : null;
}

export async function dbFindOrderByStripeSessionId(
  sessionId: string
): Promise<Order | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(orders)
    .where(eq(orders.stripeSessionId, sessionId))
    .limit(1);
  return row ? orderFromRow(row) : null;
}

export async function dbUpdateOrder(
  id: string,
  patch: Partial<Order>
): Promise<Order | null> {
  const existing = await dbGetOrderById(id);
  if (!existing) return null;
  const next: Order = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await dbSaveOrder(next);
  return next;
}

export async function dbClaimUnlinkedOrdersByEmail(
  userId: string,
  email: string
): Promise<number> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const result = await db
    .update(orders)
    .set({
      userId,
      updatedAt: new Date(),
    })
    .where(
      and(
        isNull(orders.userId),
        sql`lower(${orders.shipping}->>'email') = ${normalized}`
      )
    )
    .returning({ id: orders.id });
  return result.length;
}

export async function dbListOrdersByUserId(userId: string): Promise<Order[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return rows.map(orderFromRow);
}

export async function dbListAllOrders(): Promise<Order[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));
  return rows.map(orderFromRow);
}
