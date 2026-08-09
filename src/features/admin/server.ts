/** Server-only admin — do not import from Client Components. */
export type {
  AdminCustomerRow,
  AdminMetrics,
  AdminProductRow,
  OrderStatus,
} from './types';
export {
  inventoryUpdateSchema,
  orderStatusUpdateSchema,
  productUpsertSchema,
} from './schema';
export {
  AdminError,
  deleteAdminProduct,
  getAdminMetrics,
  listAdminProducts,
  updateInventory,
  listAdminOrders,
  updateOrderStatus,
  listAdminCustomers,
  upsertAdminProduct,
} from './service';
