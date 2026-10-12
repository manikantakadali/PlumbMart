/**
 * Zoho Dealer & Credit Service
 * Governs Dealer Verification and Credit Eligibility:
 * 1. Upfront Payment (Allowed for all verified dealers)
 * 2. Credit Payment - 30 Days (According to dealer eligibility)
 * 3. Credit Payment - 90 Days (ONLY for selected/approved dealers)
 * 4. Credit balance, limit & ledger tracking (Zoho Books)
 */

const { getStore, saveStore } = require('../../store');

const zohoDealerService = {
  /**
   * Get all registered dealers
   */
  getAllDealers: () => {
    const store = getStore();
    return store.users.dealers;
  },

  /**
   * Get single dealer by ID
   */
  getDealerById: (dealerId) => {
    const store = getStore();
    return store.users.dealers.find((d) => d.id === dealerId) || null;
  },

  /**
   * Validate dealer eligibility for a requested payment method
   * @param {string} dealerId 
   * @param {string} paymentMethod 'UPFRONT' | 'CREDIT_30_DAYS' | 'CREDIT_90_DAYS'
   * @param {number} orderAmount 
   * @returns {Object} validation result
   */
  validatePaymentEligibility: (dealerId, paymentMethod, orderAmount) => {
    const store = getStore();
    const dealer = store.users.dealers.find((d) => d.id === dealerId);

    if (!dealer) {
      return { allowed: false, error: 'Dealer not found.' };
    }

    if (!dealer.zohoVerified) {
      return { allowed: false, error: 'Dealer is not verified in Zoho CRM.' };
    }

    // 1. Upfront Payment: Always allowed for verified dealers
    if (paymentMethod === 'UPFRONT') {
      return { allowed: true, terms: 'Immediate Upfront Payment via Corporate Banking/UPI' };
    }

    // 2. 30-Day Credit: Check credit eligibility & 30-day permission
    if (paymentMethod === 'CREDIT_30_DAYS') {
      if (!dealer.creditEligible || !dealer.credit30DaysAllowed) {
        return {
          allowed: false,
          error: '30-Day Credit Payment is not enabled for your dealer account. Contact PlumbMart Admin.'
        };
      }
      const available = dealer.creditLimit - dealer.creditUsed;
      if (orderAmount > available) {
        return {
          allowed: false,
          error: `Order amount (₹${orderAmount.toLocaleString('en-IN')}) exceeds available credit limit (₹${available.toLocaleString('en-IN')}).`
        };
      }
      const due = new Date();
      due.setDate(due.getDate() + 30);
      return {
        allowed: true,
        creditDays: 30,
        dueDate: due.toISOString().split('T')[0],
        terms: '30-Day Zoho Books Net Credit'
      };
    }

    // 3. 90-Day Credit: ONLY for selected/approved dealers
    if (paymentMethod === 'CREDIT_90_DAYS') {
      if (!dealer.creditEligible || !dealer.credit90DaysAllowed) {
        return {
          allowed: false,
          error: '90-Day Credit Payment is strictly restricted to Selected & Approved Platinum Dealers only. Your account is not approved for 90-Day credit.'
        };
      }
      const available = dealer.creditLimit - dealer.creditUsed;
      if (orderAmount > available) {
        return {
          allowed: false,
          error: `Order amount (₹${orderAmount.toLocaleString('en-IN')}) exceeds available credit limit (₹${available.toLocaleString('en-IN')}).`
        };
      }
      const due = new Date();
      due.setDate(due.getDate() + 90);
      return {
        allowed: true,
        creditDays: 90,
        dueDate: due.toISOString().split('T')[0],
        terms: '90-Day Approved Dealer Credit Line'
      };
    }

    return { allowed: false, error: `Invalid payment method: ${paymentMethod}` };
  },

  /**
   * Apply credit utilization to dealer's ledger
   */
  utilizeCredit: (dealerId, amount) => {
    const store = getStore();
    const dealer = store.users.dealers.find((d) => d.id === dealerId);
    if (dealer) {
      dealer.creditUsed = (dealer.creditUsed || 0) + Number(amount);
      saveStore(store);
    }
    return dealer;
  },

  /**
   * Admin: Update dealer verification and credit permissions
   */
  updateDealerPermissions: (dealerId, updates) => {
    const store = getStore();
    const dealer = store.users.dealers.find((d) => d.id === dealerId);
    if (!dealer) return null;

    if (updates.zohoVerified !== undefined) dealer.zohoVerified = Boolean(updates.zohoVerified);
    if (updates.creditEligible !== undefined) dealer.creditEligible = Boolean(updates.creditEligible);
    if (updates.credit30DaysAllowed !== undefined) dealer.credit30DaysAllowed = Boolean(updates.credit30DaysAllowed);
    if (updates.credit90DaysAllowed !== undefined) dealer.credit90DaysAllowed = Boolean(updates.credit90DaysAllowed);
    if (updates.creditLimit !== undefined) dealer.creditLimit = Number(updates.creditLimit);

    // Update human-readable badge
    if (!dealer.zohoVerified) {
      dealer.tier = 'Pending Zoho Verification';
    } else if (dealer.credit90DaysAllowed) {
      dealer.tier = 'Platinum Approved Dealer (30 & 90 Days Credit)';
    } else if (dealer.credit30DaysAllowed) {
      dealer.tier = 'Gold Verified Dealer (Upfront & 30 Days Credit)';
    } else {
      dealer.tier = 'Verified Dealer (Upfront Payment Only)';
    }

    saveStore(store);
    return dealer;
  }
};

module.exports = zohoDealerService;
