/** Client-safe admin exports */
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
