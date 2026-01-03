import {
  API_BASE,
  resolveToken,
  fetchAdmin,
  authorizedJson,
  authorizedDelete,
} from './http.js';
import { pickImage, isSaleCurrentlyActive } from './mappers.js';
export { API_BASE, resolveToken };

export { getAdminMetrics } from './metrics.js';
export {
  getProductOverview,
  getProductsByCategory,
  getProductDetail,
  updateProduct,
  deleteProduct,
} from './products.js';
export {
  getCategoryOverview,
  getCategoryDetail,
  updateCategory,
  deleteCategory,
} from './categories.js';
export {
  getRecentOrders,
  updateOrderStatus,
  getOrdersPage,
  getOrderDetail,
} from './orders.js';
export { getCustomerSnapshot } from './customers.js';
export { getSettingsSnapshot } from './settings.js';

// Re-export shared utilities for legacy imports if any component uses them directly.
export {
  fetchAdmin,
  authorizedJson,
  authorizedDelete,
  pickImage,
  isSaleCurrentlyActive,
};
