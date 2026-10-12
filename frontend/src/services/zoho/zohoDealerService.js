import { apiRequest } from '../api';

/**
 * Frontend Zoho Dealer & Credit Service
 * Validates dealer credit limits and 30-day / 90-day credit eligibility.
 */
export const zohoDealerService = {
  /**
   * Check if a dealer is eligible for 30-Day or 90-Day Credit
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
