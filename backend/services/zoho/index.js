/**
 * Zoho Integration Service Layer
 * Central export of all Zoho Workbook, CRM, Inventory, and Credit services
 */

const zohoAuthService = require('./zohoAuthService');
const zohoProductService = require('./zohoProductService');
const zohoInventoryService = require('./zohoInventoryService');
const zohoDealerService = require('./zohoDealerService');

module.exports = {
  zohoAuthService,
  zohoProductService,
  zohoInventoryService,
  zohoDealerService
};
