import { getProductByIdAsync } from '@/features/catalog/server';
import { BRAND } from '@/lib/brand';
import { assertStockAvailable, InventoryError } from './inventory';
import { dollarsToCents } from './money';
import type {
  CheckoutLineInput,
  OrderItem,
  OrderTotals,
  ShippingAddress,
} from './types';

export class CheckoutValidationError extends Error {
  code: string;
  details?: unknown;
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'CheckoutValidationError';
    this.code = code;
    this.details = details;
  }
}

export async function buildOrderItems(
  lines: CheckoutLineInput[]
): Promise<OrderItem[]> {
  const items: OrderItem[] = [];

  for (const line of lines) {
    const product = await getProductByIdAsync(line.productId);
    if (!product) {
      throw new CheckoutValidationError(
        'PRODUCT_NOT_FOUND',
        `Product ${line.productId} not found`
      );
    }

    if (!product.sizes.includes(line.selectedSize)) {
      throw new CheckoutValidationError(
        'INVALID_SIZE',
        `Size ${line.selectedSize} is not available for ${product.name}`
      );
    }

    if (!product.colors.includes(line.selectedColor)) {
      throw new CheckoutValidationError(
        'INVALID_COLOR',
        `Color ${line.selectedColor} is not available for ${product.name}`
      );
    }

    const unitPriceCents = dollarsToCents(product.price);
    items.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image,
      selectedSize: line.selectedSize,
      selectedColor: line.selectedColor,
      quantity: line.quantity,
      unitPriceCents,
      lineTotalCents: unitPriceCents * line.quantity,
    });
  }

  try {
    await assertStockAvailable(items);
  } catch (error) {
    if (error instanceof InventoryError) {
      throw new CheckoutValidationError(
        error.code,
        error.message
      );
    }
    throw error;
  }

  return items;
}

export function computeTotals(items: OrderItem[]): OrderTotals {
  const subtotalCents = items.reduce(
    (sum, item) => sum + item.lineTotalCents,
    0
  );
  const thresholdCents = dollarsToCents(BRAND.freeShippingThreshold);
  const shippingCents = subtotalCents >= thresholdCents ? 0 : 999;
  const taxCents = Math.round(subtotalCents * 0.08);
  const totalCents = subtotalCents + shippingCents + taxCents;

  return { subtotalCents, shippingCents, taxCents, totalCents };
}

export function sanitizeShipping(shipping: ShippingAddress): ShippingAddress {
  return {
    ...shipping,
    email: shipping.email.trim().toLowerCase(),
    fullName: shipping.fullName.trim(),
    line1: shipping.line1.trim(),
    line2: shipping.line2?.trim() || undefined,
    city: shipping.city.trim(),
    state: shipping.state.trim(),
    postalCode: shipping.postalCode.trim(),
    country: (shipping.country || 'US').toUpperCase(),
    phone: shipping.phone?.trim() || undefined,
  };
}
