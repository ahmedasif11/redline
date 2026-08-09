export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface StoredUser extends AuthUser {
  passwordHash: string;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface SyncedCartLine {
  productId: string;
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

export interface AccountRecord {
  userId: string;
  addresses: Address[];
  cart: SyncedCartLine[];
  wishlist: string[];
  updatedAt: string;
}

export interface PublicSession {
  user: AuthUser;
}
