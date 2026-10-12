import { apiRequest } from '../api';

/**
 * Frontend Zoho Inventory Service
 * Manages inventory inspection and stock level tracking.
 */
export const zohoInventoryService = {
  /**
   * Get inventory summary directly from Zoho Workbook
   */
  getInventoryOverview: async () => {
    const data = await apiRequest('/api/admin/overview');
    return {
      zohoMeta: data.zohoMeta,
      products: data.products,
      totalUnits: data.products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)
    };
  }
};
