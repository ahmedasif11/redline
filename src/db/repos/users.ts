import { desc, eq } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { users } from '@/db/schema';
import { userFromRow, userToRow } from '@/db/mappers';
import type { StoredUser } from '@/features/auth/types';

export async function dbSaveUser(user: StoredUser): Promise<StoredUser> {
  const db = getDb();
  const row = userToRow(user);
  await db
    .insert(users)
    .values(row)
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: row.email,
        name: row.name,
        role: row.role,
        passwordHash: row.passwordHash,
        updatedAt: row.updatedAt,
      },
    });
  return user;
}

export async function dbGetUserById(id: string): Promise<StoredUser | null> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row ? userFromRow(row) : null;
}

export async function dbGetUserByEmail(
  email: string
): Promise<StoredUser | null> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return row ? userFromRow(row) : null;
}

export async function dbUpdateUser(
  id: string,
  patch: Partial<StoredUser>
): Promise<StoredUser | null> {
  const existing = await dbGetUserById(id);
  if (!existing) return null;
  const next = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await dbSaveUser(next);
  return next;
}

export async function dbListUsers(): Promise<StoredUser[]> {
  const db = getDb();
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));
  return rows.map(userFromRow);
}
