/**
 * Zoho CRM Authentication & Dealer Verification Service
 * Handles dealer verification against Zoho CRM contacts/accounts.
 */

const { getStore } = require('../../store');

const zohoAuthService = {
  /**
   * Verify if a mobile number is registered and verified in Zoho CRM
   * @param {string} mobile 10-digit mobile number
   * @returns {Object} verification result
   */
  verifyDealerInZoho: (mobile) => {
    const store = getStore();
    const cleanMobile = String(mobile).trim();
    const dealer = store.users.dealers.find((d) => d.mobile === cleanMobile);

    if (!dealer) {
      return {
        isRegistered: false,
        isVerified: false,
        status: 'NOT_FOUND_IN_ZOHO',
        message: 'Dealer mobile number is not registered in Zoho CRM. Dealers must be pre-registered by the company in Zoho.'
      };
    }

    if (!dealer.zohoVerified) {
      return {
        isRegistered: true,
        isVerified: false,
        dealerId: dealer.id,
        dealerName: dealer.name,
        zohoContactId: dealer.zohoContactId,
        status: 'PENDING_ZOHO_VERIFICATION',
        message: `Dealer account (${dealer.zohoContactId}) is pending Zoho CRM verification. Access is restricted until approved by Admin.`
      };
    }

    return {
      isRegistered: true,
      isVerified: true,
      dealerId: dealer.id,
      dealerName: dealer.name,
      zohoContactId: dealer.zohoContactId,
      tier: dealer.tier,
      creditLimit: dealer.creditLimit,
      credit30DaysAllowed: dealer.credit30DaysAllowed,
      credit90DaysAllowed: dealer.credit90DaysAllowed,
      status: 'VERIFIED_IN_ZOHO',
      message: 'Dealer verified in Zoho CRM. Access granted.'
    };
  }
};

module.exports = zohoAuthService;
