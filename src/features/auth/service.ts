import { randomUUID } from 'crypto';
import { hashPassword, verifyPassword } from './password';
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
} from './session';
import {
  getUserByEmail,
  getUserById,
  saveUser,
  toPublicUser,
  updateUser,
} from './users-store';
import {
  getAccount,
  mergeCartLines,
  mergeWishlist,
  saveAccount,
  setAddresses,
  setCart,
  setWishlist,
} from './accounts-store';
import type { LoginInput, RegisterInput } from './schema';
import type { Address, AuthUser, SyncedCartLine } from './types';

export class AuthError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.status = status;
  }
}

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const existing = await getUserByEmail(email);
  if (existing) {
    throw new AuthError('EMAIL_TAKEN', 'An account with this email already exists');
  }

  const now = new Date().toISOString();
  const user = await saveUser({
    id: `usr_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    email,
    name: input.name.trim(),
    role: 'customer',
    passwordHash: await hashPassword(input.password),
    createdAt: now,
    updatedAt: now,
  });

  await getAccount(user.id);
  const token = await createSessionToken(toPublicUser(user));
  await setSessionCookie(token);
  return toPublicUser(user);
}

export async function loginUser(input: LoginInput): Promise<AuthUser> {
  const email = input.email.trim().toLowerCase();
  const user = await getUserByEmail(email);
  if (!user) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    throw new AuthError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const token = await createSessionToken(toPublicUser(user));
  await setSessionCookie(token);
  return toPublicUser(user);
}

export async function logoutUser() {
  await clearSessionCookie();
}

export async function requireUser(): Promise<AuthUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new AuthError('UNAUTHORIZED', 'Sign in required', 401);
  }
  const user = await getUserById(session.id);
  if (!user) {
    throw new AuthError('UNAUTHORIZED', 'Sign in required', 401);
  }
  return toPublicUser(user);
}

export async function requireAdmin(): Promise<AuthUser> {
  await ensureAdminFromEnv();
  const user = await requireUser();
  if (user.role !== 'admin') {
    throw new AuthError('FORBIDDEN', 'Admin access required', 403);
  }
  return user;
}

/**
 * Upserts an admin account from ADMIN_EMAIL / ADMIN_PASSWORD when set.
 * Creates the user once; promotes an existing email to admin if needed.
 * Does not rewrite the password on every call.
 */
export async function ensureAdminFromEnv(): Promise<AuthUser | null> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;

  const existing = await getUserByEmail(email);
  if (existing) {
    if (existing.role === 'admin') return toPublicUser(existing);
    const updated = await updateUser(existing.id, { role: 'admin' });
    return updated ? toPublicUser(updated) : null;
  }

  const now = new Date().toISOString();
  const user = await saveUser({
    id: `usr_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
    email,
    name: 'Admin',
    role: 'admin',
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  });
  await getAccount(user.id);
  return toPublicUser(user);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSessionUser();
  if (!session) return null;
  const user = await getUserById(session.id);
  return user ? toPublicUser(user) : null;
}

export async function updateProfileName(
  userId: string,
  name: string
): Promise<AuthUser> {
  const updated = await updateUser(userId, { name: name.trim() });
  if (!updated) {
    throw new AuthError('NOT_FOUND', 'User not found', 404);
  }
  const token = await createSessionToken(toPublicUser(updated));
  await setSessionCookie(token);
  return toPublicUser(updated);
}

export async function addAddress(
  userId: string,
  address: Omit<Address, 'id'>
): Promise<Address[]> {
  const account = await getAccount(userId);
  const next: Address = {
    ...address,
    id: `addr_${randomUUID().replace(/-/g, '').slice(0, 12)}`,
    line2: address.line2 || undefined,
    phone: address.phone || undefined,
  };

  let addresses = [...account.addresses];
  if (next.isDefault || addresses.length === 0) {
    addresses = addresses.map((a) => ({ ...a, isDefault: false }));
    next.isDefault = true;
  }
  addresses.push(next);
  await setAddresses(userId, addresses);
  return addresses;
}

export async function deleteAddress(
  userId: string,
  addressId: string
): Promise<Address[]> {
  const account = await getAccount(userId);
  let addresses = account.addresses.filter((a) => a.id !== addressId);
  if (addresses.length && !addresses.some((a) => a.isDefault)) {
    addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  await setAddresses(userId, addresses);
  return addresses;
}

export async function mergeGuestData(
  userId: string,
  guestCart: SyncedCartLine[],
  guestWishlist: string[]
) {
  const account = await getAccount(userId);
  const cart = mergeCartLines(account.cart, guestCart);
  const wishlist = mergeWishlist(account.wishlist, guestWishlist);
  const saved = await saveAccount({ ...account, cart, wishlist });
  return saved;
}

export async function syncCart(userId: string, cart: SyncedCartLine[]) {
  return setCart(userId, cart);
}

export async function syncWishlist(userId: string, wishlist: string[]) {
  return setWishlist(userId, wishlist);
}
