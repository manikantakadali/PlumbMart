import { apiRequest } from '../api';

/**
 * Frontend Zoho Product Service
 * Fetches products and prices synchronised from Zoho Workbook.
 * Strictly respects role-based visibility:
 * - Customer: products + prices (NO stock quantity)
 * - Dealer: products + prices + AVAILABLE STOCK QUANTITY
 * - Plumber: technical installation specs & requirements
 */
export const zohoProductService = {
  /**
   * Fetch products with role-based visibility filter applied
   */
  getProductsByRole: async (role = 'customer', categoryId = 'all', search = '') => {
    const params = new URLSearchParams({ role, categoryId, search });
    return await apiRequest(`/api/products?${params.toString()}`);
  },

  /**
   * Trigger Zoho Workbook Live Synchronisation
   */
  syncZohoWorkbook: async () => {
    return await apiRequest('/api/zoho/sync', { method: 'POST' });
  },

  /**
   * Update a product row in Zoho Workbook (Admin feature)
   */
  updateProductInWorkbook: async (productId, updates) => {
    return await apiRequest(`/api/zoho/workbook/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
};
