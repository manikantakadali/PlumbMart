import { apiRequest } from '../api';

/**
 * Frontend Zoho Auth & Dealer Verification Service
 * Handles Zoho CRM verification checks during Dealer OTP login flow.
 */
export const zohoAuthService = {
  /**
   * Check if a dealer's mobile number is pre-registered and verified in Zoho CRM
   * @param {string} mobile 10-digit mobile number
   */
  verifyDealerInZoho: async (mobile) => {
    return await apiRequest(`/api/auth/zoho-verify/${encodeURIComponent(mobile)}`);
  },

  /**
   * Request OTP for any role (Customer, Dealer, Plumber, Admin)
   */
  requestOtp: async (mobile, role, name) => {
    return await apiRequest('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, role, name })
    });
  },

  /**
   * Verify OTP and receive authentication token + user profile
   */
  verifyOtp: async (mobile, otp, role, name, address) => {
    return await apiRequest('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ mobile, otp, role, name, address })
    });
  }
};
