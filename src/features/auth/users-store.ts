import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from '@/lib/data-dir';
import { isDatabaseConfigured } from '@/db/client';
import {
  dbGetUserByEmail,
  dbGetUserById,
  dbListUsers,
  dbSaveUser,
  dbUpdateUser,
} from '@/db/repos/users';
import type { StoredUser } from './types';

const USERS_FILE = path.join(DATA_DIR, 'users.json');

type UserStore = Record<string, StoredUser>;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<UserStore> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw) as UserStore;
  } catch {
    return {};
  }
}

async function writeStore(store: UserStore) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(store, null, 2));
}

export async function saveUser(user: StoredUser): Promise<StoredUser> {
  if (isDatabaseConfigured()) return dbSaveUser(user);
  const store = await readStore();
  store[user.id] = user;
  await writeStore(store);
  return user;
}

export async function getUserById(id: string): Promise<StoredUser | null> {
  if (isDatabaseConfigured()) return dbGetUserById(id);
  const store = await readStore();
  return store[id] ?? null;
}

export async function getUserByEmail(
  email: string
): Promise<StoredUser | null> {
  if (isDatabaseConfigured()) return dbGetUserByEmail(email);
  const store = await readStore();
  const normalized = email.trim().toLowerCase();
  return (
    Object.values(store).find((user) => user.email === normalized) ?? null
  );
}

export async function updateUser(
  id: string,
  patch: Partial<StoredUser>
): Promise<StoredUser | null> {
  if (isDatabaseConfigured()) return dbUpdateUser(id, patch);
  const store = await readStore();
  const existing = store[id];
  if (!existing) return null;
  const next = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store[id] = next;
  await writeStore(store);
  return next;
}

export async function listUsers(): Promise<StoredUser[]> {
  if (isDatabaseConfigured()) return dbListUsers();
  const store = await readStore();
  return Object.values(store).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
