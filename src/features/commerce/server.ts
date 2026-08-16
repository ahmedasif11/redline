/** Server-only commerce API — do not import from Client Components. */
export {
  buildOrderItems,
  computeTotals,
  sanitizeShipping,
  CheckoutValidationError,
} from './checkout';
export {
  createCheckoutSession,
  markOrderPaid,
  fulfillOrderFromStripeSession,
  confirmStripeCheckoutSession,
  abandonStripeCheckout,
  abandonCheckoutByReturn,
  resumeOrderCheckout,
  cancelCustomerOrder,
} from './service';
export {
  getOrderById,
  saveOrder,
  updateOrder,
  findOrderByIdempotencyKey,
  findOrderByStripeSessionId,
  listOrdersByUserId,
  claimUnlinkedOrdersByEmail,
} from './orders-store';
export {
  createStripeCheckoutSession,
  getStripe,
  isStripeConfigured,
} from './stripe';
export { isEmailConfigured, sendOrderConfirmation } from './email';
export {
  getStock,
  assertStockAvailable,
  decrementStock,
  InventoryError,
} from './inventory';
export { checkoutSessionSchema } from './schema';
