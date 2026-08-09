import type { Order, OrderStatus } from '@/features/commerce';
import type { Product } from '@/features/catalog';
import type { AuthUser } from '@/features/auth';

export interface AdminMetrics {
  orderCount: number;
  paidOrderCount: number;
  revenueCents: number;
  averageOrderValueCents: number;
  productCount: number;
  lowStockCount: number;
  customerCount: number;
  recentOrders: Order[];
}

export interface AdminProductRow {
  product: Product;
  stockBySize: Record<string, number>;
  totalStock: number;
}

export interface AdminCustomerRow {
  user: AuthUser;
  orderCount: number;
  totalSpentCents: number;
}

export type { OrderStatus };
