import { eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { accounts } from '@/db/schema';
import { accountFromRow, accountToRow } from '@/db/mappers';
import type { AccountRecord } from '@/features/auth/types';

function emptyAccount(userId: string): AccountRecord {
  return {
    userId,
    addresses: [],
    cart: [],
    wishlist: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function dbGetAccount(userId: string): Promise<AccountRecord> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .limit(1);

  if (row) return accountFromRow(row);

  const account = emptyAccount(userId);
  await db.insert(accounts).values(accountToRow(account));
  return account;
}

export async function dbSaveAccount(
  account: AccountRecord
): Promise<AccountRecord> {
  const db = getDb();
  const next = { ...account, updatedAt: new Date().toISOString() };
  const row = accountToRow(next);
  await db
    .insert(accounts)
    .values(row)
    .onConflictDoUpdate({
      target: accounts.userId,
      set: {
        addresses: row.addresses,
        cart: row.cart,
        wishlist: row.wishlist,
        updatedAt: row.updatedAt,
      },
    });
  return next;
}
