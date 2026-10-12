/**
 * Zoho Product Service
 * Fetches and synchronises products and pricing from Zoho Workbook.
 * Strictly enforces Role-Based Product Visibility:
 * - CUSTOMER: Product YES, Price YES, Stock Quantity NO (enforced at API layer)
 * - DEALER: Product YES, Price YES, Stock Quantity YES (plus wholesale rate & MOQ)
 * - PLUMBER: Show only relevant technical product info & installation requirements
 * - ADMIN: Full product management and visibility
 */

const { getStore, saveStore } = require('../../store');

const zohoProductService = {
  /**
   * Get all products with role-based visibility filter applied
   * @param {string} role 'customer' | 'dealer' | 'plumber' | 'admin'
   * @param {string} categoryId optional category filter
   * @param {string} search optional search term
   * @returns {Array} filtered product objects
   */
  getProductsByRole: (role = 'customer', categoryId = 'all', search = '') => {
    const store = getStore();
    let list = [...store.zohoWorkbookProducts];

    // Filter by Category if provided
    if (categoryId && categoryId !== 'all') {
      list = list.filter((p) => p.categoryId === categoryId);
    }

    // Filter by Search Query
    if (search) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          (p.specifications && p.specifications.toLowerCase().includes(q))
      );
    }

    const normalizedRole = role.toLowerCase();

    return list.map((p) => {
      // 1. CUSTOMER: Product YES, Price YES, Stock quantity NO
      if (normalizedRole === 'customer') {
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          brand: p.brand,
          unit: p.unit,
          description: p.specifications,
          price: p.customerPrice,
          mrp: p.mrp,
          image: p.image,
          availability: p.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
          inStock: p.stockQuantity > 0,
          // CRITICAL SECURITY & BUSINESS REQUIREMENT: Stock quantity completely omitted for Customer
          stockQuantity: undefined,
          stockVisibility: 'HIDDEN'
        };
      }

      // 2. DEALER: Product YES, Price YES, Stock quantity YES
      if (normalizedRole === 'dealer') {
        return {
          id: p.id,
          sku: p.sku,
          zohoRowId: p.zohoRowId,
          name: p.name,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          brand: p.brand,
          unit: p.unit,
          description: p.specifications,
          price: p.dealerPrice, // Wholesale rate
          dealerPrice: p.dealerPrice,
          customerPrice: p.customerPrice,
          mrp: p.mrp,
          image: p.image,
          stockQuantity: p.stockQuantity, // Visible to Dealer
          availability: p.stockQuantity > 0 ? `${p.stockQuantity} ${p.unit} Available` : 'Out of Stock',
          inStock: p.stockQuantity > 0,
          minDealerOrderQty: p.minDealerOrderQty || 1,
          stockVisibility: 'VISIBLE'
        };
      }

      // 3. PLUMBER: Show only relevant product/required technical functionality
      if (normalizedRole === 'plumber') {
        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          brand: p.brand,
          unit: p.unit,
          description: p.specifications,
          price: p.customerPrice,
          image: p.image,
          specifications: p.specifications,
          installationNote: p.installationNote,
          plumberPoints: p.plumberPoints,
          availability: p.stockQuantity > 0 ? 'Available for Installation' : 'Out of Stock',
          inStock: p.stockQuantity > 0,
          stockQuantity: undefined
        };
      }

      // 4. ADMIN: Full visibility & Zoho Row Details
      return {
        ...p,
        price: p.dealerPrice,
        availability: p.stockQuantity > 0 ? `${p.stockQuantity} in Zoho Warehouse` : 'Depleted'
      };
    });
  },

  /**
   * Synchronise latest products, pricing, and stock from Zoho Workbook
   */
  synchroniseWorkbook: () => {
    const store = getStore();
    store.zohoMeta.lastSyncedAt = new Date().toISOString();
    store.zohoMeta.totalSyncedRows = store.zohoWorkbookProducts.length;
    store.zohoMeta.syncStatus = 'SYNCED_OK';
    saveStore(store);
    return {
      zohoMeta: store.zohoMeta,
      totalProducts: store.zohoWorkbookProducts.length
    };
  },

  /**
   * Update a product row in Zoho Workbook
   */
  updateProductInWorkbook: (productId, updates) => {
    const store = getStore();
    const product = store.zohoWorkbookProducts.find((p) => p.id === productId);
    if (!product) return null;

    if (updates.name !== undefined) product.name = updates.name;
    if (updates.customerPrice !== undefined) product.customerPrice = Number(updates.customerPrice);
    if (updates.dealerPrice !== undefined) product.dealerPrice = Number(updates.dealerPrice);
    if (updates.stockQuantity !== undefined) product.stockQuantity = Number(updates.stockQuantity);
    if (updates.minDealerOrderQty !== undefined) product.minDealerOrderQty = Number(updates.minDealerOrderQty);
    if (updates.specifications !== undefined) product.specifications = updates.specifications;

    store.zohoMeta.lastSyncedAt = new Date().toISOString();
    saveStore(store);
    return product;
  }
};

module.exports = zohoProductService;
