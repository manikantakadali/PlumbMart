import { apiRequest } from './api';

/**
 * Customer Service
 * Communicates with backend for all dynamic Customer-specific operations:
 * Profile, Categories, Products, Cart, Addresses, Orders, Notifications, Banners.
 */
export const customerService = {
  // 1. Promotional Banners
  getBanners: async () => {
    return await apiRequest('/api/customer/banners');
  },

  // 2. Dynamic Categories
  getCategories: async () => {
    return await apiRequest('/api/categories');
  },

  // 3. Products
  getProducts: async ({ categoryId = 'all', search = '', sort = '', filter = '' } = {}) => {
    const params = new URLSearchParams({
      role: 'customer',
      categoryId,
      search,
      sort,
      filter
    });
    return await apiRequest(`/api/products?${params.toString()}`);
  },

  getProductById: async (productId) => {
    return await apiRequest(`/api/products/${productId}?role=customer`);
  },

  // 4. Dynamic Cart (Backend Persisted)
  getCart: async (customerId) => {
    return await apiRequest(`/api/cart?customerId=${encodeURIComponent(customerId)}`);
  },

  addToCart: async (customerId, productId, qty = 1) => {
    return await apiRequest('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ customerId, productId, qty })
    });
  },

  updateCartQty: async (customerId, productId, delta) => {
    return await apiRequest(`/api/cart/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify({ customerId, delta })
    });
  },

  removeFromCart: async (customerId, productId) => {
    return await apiRequest(`/api/cart/${productId}?customerId=${encodeURIComponent(customerId)}`, {
      method: 'DELETE'
    });
  },

  clearCart: async (customerId) => {
    return await apiRequest(`/api/cart?customerId=${encodeURIComponent(customerId)}`, {
      method: 'DELETE'
    });
  },

  // 5. Customer Addresses
  getAddresses: async (customerId) => {
    return await apiRequest(`/api/customer/addresses?customerId=${encodeURIComponent(customerId)}`);
  },

  addAddress: async (customerId, addressData) => {
    return await apiRequest('/api/customer/addresses', {
      method: 'POST',
      body: JSON.stringify({ customerId, ...addressData })
    });
  },

  deleteAddress: async (customerId, addressId) => {
    return await apiRequest(`/api/customer/addresses/${addressId}?customerId=${encodeURIComponent(customerId)}`, {
      method: 'DELETE'
    });
  },

  // 6. Customer Profile
  getProfile: async (customerId) => {
    return await apiRequest(`/api/customer/profile?customerId=${encodeURIComponent(customerId)}`);
  },

  updateProfile: async (customerId, profileData) => {
    return await apiRequest('/api/customer/profile', {
      method: 'PATCH',
      body: JSON.stringify({ customerId, ...profileData })
    });
  },

  // 7. Orders & Tracking
  getMyOrders: async (customerId) => {
    return await apiRequest(`/api/orders/my?customerId=${encodeURIComponent(customerId)}`);
  },

  getOrderById: async (orderId) => {
    return await apiRequest(`/api/orders/${orderId}`);
  },

  createOrder: async (orderPayload) => {
    return await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  // 8. Notifications
  getNotifications: async (customerId) => {
    return await apiRequest(`/api/notifications?role=customer&userId=${encodeURIComponent(customerId)}`);
  },

  markNotificationRead: async (customerId, notifId) => {
    return await apiRequest(`/api/notifications/${notifId}/read?userId=${encodeURIComponent(customerId)}`, {
      method: 'PATCH'
    });
  }
};
