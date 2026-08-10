/** Client-safe auth exports */
export type {
  AccountRecord,
  Address,
  AuthUser,
  SyncedCartLine,
  UserRole,
} from './types';
export {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  addressSchema,
  mergeGuestSchema,
} from './schema';
export {
  defaultHomeForRole,
  safeInternalPath,
} from './lib/paths';
