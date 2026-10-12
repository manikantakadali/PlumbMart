/**
 * Zoho Inventory Service
 * Manages stock levels, deductions upon order placement, and replenishment in Zoho Workbook.
 */

const { getStore, saveStore } = require('../../store');

const zohoInventoryService = {
  /**
   * Check if requested items have sufficient stock in Zoho Workbook
   * @param {Array} items [{ productId, qty }]
   * @returns {Object} validation result
   */
  checkStockAvailability: (items) => {
    const store = getStore();
    for (const item of items) {
      const pId = item.productId || item.product?.id || item.id;
      const product = store.zohoWorkbookProducts.find((p) => p.id === pId);
      const qty = Number(item.qty || item.quantity || 1);
      if (!product) {
        return {
          available: false,
          error: `Product ${pId} was not found in Zoho Inventory.`
        };
      }
      if (product.stockQuantity < qty) {
        return {
          available: false,
          error: `Insufficient stock in Zoho Workbook for "${product.name}". Available: ${product.stockQuantity}, Requested: ${qty}`
        };
      }
    }
    return { available: true };
  },

  /**
   * Deduct stock in Zoho Workbook for a confirmed order
   * @param {Array} items [{ productId, qty }]
   * @returns {boolean} success
   */
  deductStock: (items) => {
    const store = getStore();
    for (const item of items) {
      const pId = item.productId || item.product?.id || item.id;
      const product = store.zohoWorkbookProducts.find((p) => p.id === pId);
      const qty = Number(item.qty || item.quantity || 1);
      if (product) {
        product.stockQuantity = Math.max(0, product.stockQuantity - qty);
      }
    }
    store.zohoMeta.lastSyncedAt = new Date().toISOString();
    saveStore(store);
    return true;
  },

  /**
   * Replenish or adjust inventory quantity in Zoho Workbook
   * @param {string} productId 
   * @param {number} newQuantity 
   */
  adjustStock: (productId, newQuantity) => {
    const store = getStore();
    const product = store.zohoWorkbookProducts.find((p) => p.id === productId);
    if (!product) return null;
    product.stockQuantity = Math.max(0, Number(newQuantity));
    store.zohoMeta.lastSyncedAt = new Date().toISOString();
    saveStore(store);
    return product;
  }
};

module.exports = zohoInventoryService;
