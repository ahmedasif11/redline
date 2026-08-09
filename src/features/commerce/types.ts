export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded';

export interface ShippingAddress {
  email: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface CheckoutLineInput {
  productId: string;
  quantity: number;
  selectedSize: number;
  selectedColor: string;
}

export interface OrderItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  selectedSize: number;
  selectedColor: string;
  quantity: number;
  /** Unit price snapshot in cents */
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderTotals {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

export interface Order {
  id: string;
  userId?: string;
  status: OrderStatus;
  items: OrderItem[];
  shipping: ShippingAddress;
  totals: OrderTotals;
  currency: 'usd';
  paymentProvider: 'stripe' | 'demo';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  emailSentAt?: string;
}
