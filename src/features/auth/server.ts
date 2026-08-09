/** Server-only auth — do not import from Client Components. */
export type {
  AccountRecord,
  Address,
  AuthUser,
  PublicSession,
  SyncedCartLine,
  UserRole,
} from './types';
export {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  addressSchema,
  mergeGuestSchema,
  syncedCartLineSchema,
} from './schema';
export {
  AuthError,
  registerUser,
  loginUser,
  logoutUser,
  requireUser,
  requireAdmin,
  ensureAdminFromEnv,
  getCurrentUser,
  updateProfileName,
  addAddress,
  deleteAddress,
  mergeGuestData,
  syncCart,
  syncWishlist,
} from './service';
export { getAccount } from './accounts-store';
export { listUsers, toPublicUser } from './users-store';
export { getSessionUser } from './session';
