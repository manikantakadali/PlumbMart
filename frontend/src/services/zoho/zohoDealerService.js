import { apiRequest } from '../api';

/**
 * Frontend Zoho Dealer & Credit Service
 * Validates dealer credit limits, 30-day / 90-day credit eligibility,
 * and communicates with backend Dealer Cart & Order APIs.
 */
export const zohoDealerService = {
  /**
   * Fetch live credit eligibility and available credit limits from backend
   * @param {string} dealerId
   * @param {number} orderAmount
   */
  getCreditEligibility: async (dealerId, orderAmount = 0) => {
    const query = orderAmount ? `?orderAmount=${orderAmount}` : '';
    return apiRequest(`/api/dealer/${dealerId}/credit-eligibility${query}`);
  },

  /**
   * Fetch dealer's wholesale products with category, search, and sort filters
   */
  getProducts: async ({ categoryId = 'all', search = '', sort = '', filter = '' } = {}) => {
    const params = new URLSearchParams({ role: 'dealer' });
    if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (filter) params.append('filter', filter);
    return apiRequest(`/api/products?${params.toString()}`);
  },

  /**
   * Fetch single product details with dealer wholesale pricing and live stock
   */
  getProductById: async (productId) => {
    return apiRequest(`/api/products/${productId}?role=dealer`);
  },

  /**
   * Fetch Dealer Cart from Backend
   */
  getCart: async (dealerId) => {
    return apiRequest(`/api/cart?dealerId=${dealerId}&role=dealer`);
  },

  /**
   * Add wholesale product to Dealer Cart with backend stock validation
   */
  addToCart: async (dealerId, productId, qty = 1) => {
    return apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({
        dealerId,
        role: 'dealer',
        productId,
        qty: Number(qty)
      })
    });
  },

  /**
   * Update quantity in Dealer Cart
   */
  updateCartQty: async (dealerId, productId, delta, qty) => {
    const payload = {
      dealerId,
      role: 'dealer'
    };
    if (delta !== undefined) payload.delta = delta;
    if (qty !== undefined) payload.qty = qty;

    return apiRequest(`/api/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Remove product from Dealer Cart
   */
  removeCartItem: async (dealerId, productId) => {
    return apiRequest(`/api/cart/${productId}?dealerId=${dealerId}&role=dealer`, {
      method: 'DELETE'
    });
  },

  /**
   * Clear Dealer Cart
   */
  clearCart: async (dealerId) => {
    return apiRequest(`/api/cart?dealerId=${dealerId}&role=dealer`, {
      method: 'DELETE'
    });
  },

  /**
   * Check if a dealer is eligible for 30-Day or 90-Day Credit (Synchronous helper)
   * @param {Object} dealer 
   * @param {string} paymentMethod 'UPFRONT' | 'CREDIT_30_DAYS' | 'CREDIT_90_DAYS'
   */
  checkPaymentEligibility: (dealer, paymentMethod) => {
    if (!dealer || !dealer.zohoVerified) {
      return { eligible: false, reason: 'Dealer is not verified in Zoho CRM.' };
    }

    if (paymentMethod === 'UPFRONT') {
      return { eligible: true, label: 'Upfront Payment (Instant Online Settlement)' };
    }

    if (paymentMethod === 'CREDIT_30_DAYS') {
      if (!dealer.creditEligible || !dealer.credit30DaysAllowed) {
        return { eligible: false, reason: '30-Day Credit is not permitted for your dealership.' };
      }
      return { eligible: true, label: '30-Day Net Credit via Zoho Books' };
    }

    if (paymentMethod === 'CREDIT_90_DAYS') {
      if (!dealer.creditEligible || !dealer.credit90DaysAllowed) {
        return {
          eligible: false,
          reason: '90-Day Credit is restricted to selected/approved Platinum dealers only.'
        };
      }
      return { eligible: true, label: '90-Day Approved Dealer Credit Line' };
    }

    return { eligible: false, reason: 'Unknown payment option.' };
  }
};

