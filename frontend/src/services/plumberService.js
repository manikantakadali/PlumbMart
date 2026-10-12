import { apiRequest } from './api';

/**
 * Helper to build auth headers for Plumber API requests
 */
function getPlumberHeaders(tokenOrUser) {
  const headers = {};
  if (!tokenOrUser) return headers;

  if (typeof tokenOrUser === 'string') {
    if (tokenOrUser.startsWith('jwt-')) {
      headers.Authorization = `Bearer ${tokenOrUser}`;
    } else {
      headers['x-plumber-id'] = tokenOrUser;
    }
  } else if (typeof tokenOrUser === 'object') {
    if (tokenOrUser.token) {
      headers.Authorization = `Bearer ${tokenOrUser.token}`;
    }
    if (tokenOrUser.id) {
      headers['x-plumber-id'] = tokenOrUser.id;
    }
  }
  return headers;
}

export const plumberService = {
  /**
   * 1. Get Plumber Dashboard Overview & Dynamic Stats
   */
  getDashboard: async (auth) => {
    return await apiRequest('/api/plumber/dashboard', {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 2. Get Assigned / Completed Activities
   */
  getActivities: async (auth, filter = 'all', search = '') => {
    const params = new URLSearchParams();
    if (filter && filter !== 'all') params.append('filter', filter);
    if (search) params.append('search', search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/plumber/activities${query}`, {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 3. Get Single Activity Details
   */
  getActivityById: async (auth, activityId) => {
    return await apiRequest(`/api/plumber/activities/${encodeURIComponent(activityId)}`, {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 4. Update Activity Status (ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED)
   */
  updateActivityStatus: async (auth, activityId, status, remarks = '') => {
    return await apiRequest(`/api/plumber/activities/${encodeURIComponent(activityId)}/status`, {
      method: 'PATCH',
      headers: getPlumberHeaders(auth),
      body: JSON.stringify({ status, remarks })
    });
  },

  /**
   * 5. Add / Update Activity Remarks
   */
  updateActivityRemarks: async (auth, activityId, remarks) => {
    return await apiRequest(`/api/plumber/activities/${encodeURIComponent(activityId)}/remarks`, {
      method: 'PATCH',
      headers: getPlumberHeaders(auth),
      body: JSON.stringify({ remarks })
    });
  },

  /**
   * 6. Get Products Catalog with Technical Requirements
   */
  getProducts: async (auth, { categoryId = 'all', search = '', sort = '', filter = '' } = {}) => {
    const params = new URLSearchParams();
    if (categoryId && categoryId !== 'all') params.append('categoryId', categoryId);
    if (search) params.append('search', search);
    if (sort) params.append('sort', sort);
    if (filter) params.append('filter', filter);

    const query = params.toString() ? `?${params.toString()}` : '';
    return await apiRequest(`/api/plumber/products${query}`, {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 7. Get Product Details & Available Linking Activities
   */
  getProductById: async (auth, productId) => {
    return await apiRequest(`/api/plumber/products/${encodeURIComponent(productId)}`, {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 8. Get Plumber's Submitted Product Requests
   */
  getProductRequests: async (auth, status = 'all') => {
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    return await apiRequest(`/api/plumber/product-requests${query}`, {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 9. Submit Product Requirement / Request
   */
  createProductRequest: async (auth, { productId, quantity, reason, activityId, remarks }) => {
    return await apiRequest('/api/plumber/product-requests', {
      method: 'POST',
      headers: getPlumberHeaders(auth),
      body: JSON.stringify({ productId, quantity, reason, activityId, remarks })
    });
  },

  /**
   * 10. Cancel Product Request (Pending only)
   */
  cancelProductRequest: async (auth, requestId) => {
    return await apiRequest(`/api/plumber/product-requests/${encodeURIComponent(requestId)}/cancel`, {
      method: 'PATCH',
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 11. Get Plumber Notifications
   */
  getNotifications: async (auth) => {
    return await apiRequest('/api/plumber/notifications', {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 12. Mark Single Notification as Read
   */
  markNotificationRead: async (auth, notifId) => {
    return await apiRequest(`/api/plumber/notifications/${encodeURIComponent(notifId)}/read`, {
      method: 'PATCH',
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 13. Mark All Notifications as Read
   */
  markAllNotificationsRead: async (auth) => {
    return await apiRequest('/api/plumber/notifications/read-all', {
      method: 'PATCH',
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 14. Get Plumber Profile
   */
  getProfile: async (auth) => {
    return await apiRequest('/api/plumber/profile', {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 15. Update Plumber Profile
   */
  updateProfile: async (auth, profileData) => {
    return await apiRequest('/api/plumber/profile', {
      method: 'PATCH',
      headers: getPlumberHeaders(auth),
      body: JSON.stringify(profileData)
    });
  },

  /**
   * 16. Get Plumber Settings
   */
  getSettings: async (auth) => {
    return await apiRequest('/api/plumber/settings', {
      headers: getPlumberHeaders(auth)
    });
  },

  /**
   * 17. Update Plumber Settings
   */
  updateSettings: async (auth, settingsData) => {
    return await apiRequest('/api/plumber/settings', {
      method: 'PATCH',
      headers: getPlumberHeaders(auth),
      body: JSON.stringify(settingsData)
    });
  }
};
