import { promises as fs } from 'fs';
import path from 'path';
import { DATA_DIR } from '@/lib/data-dir';
import { isDatabaseConfigured } from '@/db/client';
import { dbGetAccount, dbSaveAccount } from '@/db/repos/accounts';
import type { AccountRecord, Address, SyncedCartLine } from './types';

const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');

type AccountStore = Record<string, AccountRecord>;

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<AccountStore> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ACCOUNTS_FILE, 'utf8');
    return JSON.parse(raw) as AccountStore;
  } catch {
    return {};
  }
}

async function writeStore(store: AccountStore) {
  await ensureDataDir();
  await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(store, null, 2));
}

function emptyAccount(userId: string): AccountRecord {
  return {
    userId,
    addresses: [],
    cart: [],
    wishlist: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getAccount(userId: string): Promise<AccountRecord> {
  if (isDatabaseConfigured()) return dbGetAccount(userId);
  const store = await readStore();
  if (store[userId]) return store[userId];
  const account = emptyAccount(userId);
  store[userId] = account;
  await writeStore(store);
  return account;
}

export async function saveAccount(
  account: AccountRecord
): Promise<AccountRecord> {
  if (isDatabaseConfigured()) return dbSaveAccount(account);
  const store = await readStore();
  const next = { ...account, updatedAt: new Date().toISOString() };
  store[account.userId] = next;
  await writeStore(store);
  return next;
}

export async function setAddresses(
  userId: string,
  addresses: Address[]
): Promise<AccountRecord> {
  const account = await getAccount(userId);
  return saveAccount({ ...account, addresses });
}

export async function setCart(
  userId: string,
  cart: SyncedCartLine[]
): Promise<AccountRecord> {
  const account = await getAccount(userId);
  return saveAccount({ ...account, cart });
}

export async function setWishlist(
  userId: string,
  wishlist: string[]
): Promise<AccountRecord> {
  const account = await getAccount(userId);
  return saveAccount({
    ...account,
    wishlist: [...new Set(wishlist)],
  });
}

export function mergeCartLines(
  server: SyncedCartLine[],
  guest: SyncedCartLine[]
): SyncedCartLine[] {
  const map = new Map<string, SyncedCartLine>();

  for (const line of [...server, ...guest]) {
    const key = `${line.productId}-${line.selectedSize}-${line.selectedColor}`;
    const existing = map.get(key);
    if (existing) {
      map.set(key, {
        ...existing,
        quantity: Math.min(10, existing.quantity + line.quantity),
      });
    } else {
      map.set(key, { ...line });
    }
  }

  return [...map.values()];
}

export function mergeWishlist(server: string[], guest: string[]): string[] {
  return [...new Set([...server, ...guest])];
}
