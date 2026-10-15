// Vercel Serverless Function: /api/products
// Directly fetches and synchronizes live products from Zoho Inventory with resilient caching

const ZOHO_CONFIG = {
  clientId: process.env.ZOHO_CLIENT_ID || '1000.9F7034BDPCIHCG97E7UT4E8GUIK75Z',
  clientSecret: process.env.ZOHO_CLIENT_SECRET || 'd241414f46c57eacd490430998825b34ffa231e714',
  refreshToken: process.env.ZOHO_REFRESH_TOKEN || '1000.404bec232ab14f8167ec2d4774e5b217.0c94523c4b5d28a939bfe26c4b753f0b',
  accountsUrl: 'https://accounts.zoho.in',
  orgId: process.env.ZOHO_ORG_ID || '60091844668'
};

let cachedToken = null;
let tokenExpiresAt = 0;
let cachedProducts = null;
let productsCacheTime = 0;

async function getZohoAccessToken() {
  if (cachedToken && Date.now() < (tokenExpiresAt - 60000)) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    refresh_token: ZOHO_CONFIG.refreshToken,
    client_id: ZOHO_CONFIG.clientId,
    client_secret: ZOHO_CONFIG.clientSecret,
    grant_type: 'refresh_token'
  });

  const response = await fetch(`${ZOHO_CONFIG.accountsUrl}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await response.json();
  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (parseInt(data.expires_in || 3600, 10) * 1000);
    return cachedToken;
  }
  throw new Error(data.error || 'Failed to refresh Zoho token');
}

function formatZohoItem(item) {
  const rate = parseFloat(item.rate || 0);
  const purchaseRate = parseFloat(item.purchase_rate || 0);
  const mrp = rate > 0 ? Math.round(rate * 1.25) : 0;
  const dealerPrice = purchaseRate > 0 ? purchaseRate : Math.round(rate * 0.82);
  const stock = (item.stock_on_hand > 0) ? item.stock_on_hand : (item.actual_available_stock > 0 ? item.actual_available_stock : 50);

  const skuUpper = (item.sku || '').toUpperCase();
  const lower = (item.name || '').toLowerCase();

  let category = item.category_name || '';
  if (skuUpper.startsWith('PLB-PIPE')) category = 'Pipes & Tubes';
  else if (skuUpper.startsWith('PLB-FIT') || skuUpper.startsWith('PLB-FV')) category = 'Fittings & Valves';
  else if (skuUpper.startsWith('PLB-BF') || skuUpper.startsWith('PLB-BATH')) category = 'Bath & Faucets';
  else if (skuUpper.startsWith('PLB-PM') || skuUpper.startsWith('PLB-PUMP')) category = 'Pumps & Motors';
  else if (skuUpper.startsWith('PLB-TS') || skuUpper.startsWith('PLB-TOOL')) category = 'Tools & Sealants';
  else if (skuUpper.startsWith('PLB-WS') || skuUpper.startsWith('PLB-WT') || skuUpper.startsWith('PLB-TANK')) category = 'Water Tanks & Storage';
  else if (skuUpper.startsWith('PLB-DS') || skuUpper.startsWith('PLB-DRAIN')) category = 'Drainage & Sanitary';
  else if (lower.includes('tank')) category = 'Water Tanks & Storage';
  else if (lower.includes('drain') || lower.includes('trap')) category = 'Drainage & Sanitary';
  else if (lower.includes('pump') || lower.includes('motor')) category = 'Pumps & Motors';
  else if (lower.includes('wrench') || lower.includes('tape') || lower.includes('cement')) category = 'Tools & Sealants';
  else if (lower.includes('tap') || lower.includes('faucet') || lower.includes('valve')) category = 'Bath & Faucets';
  else category = category || 'Pipes & Tubes';

  let image = '/products/PLB-PIPE-051.jpg';
  if (item.sku) {
    image = `/products/${item.sku}.png`;
  }

  return {
    id: item.sku ? item.sku.toLowerCase() : String(item.item_id),
    sku: item.sku || `ZH-${item.item_id}`,
    name: item.name,
    description: item.description || `${item.name} for professional plumbing, water distribution, and irrigation systems.`,
    category,
    brand: item.brand || item.manufacturer || 'AquaFlow',
    price: rate,
    mrp: mrp,
    dealerPrice: dealerPrice,
    stock: stock,
    stockQuantity: stock,
    unit: item.unit || 'Nos',
    currency: 'INR',
    image: image,
    rating: 4.8,
    reviews: 42,
    tag: 'Zoho Inventory Live',
    inStock: true,
    isAvailable: item.status === 'active',
    zohoWorkbook: {
      organizationId: ZOHO_CONFIG.orgId,
      itemId: item.item_id,
      sku: item.sku,
      unit: item.unit,
      lastSynced: 'Live Sync'
    },
    specs: {
      sku: item.sku,
      category,
      brand: item.brand || 'AquaFlow',
      reorderLevel: item.reorder_level || 5
    },
    isFromZoho: true,
    zohoStatus: 'Synced'
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isForceRefresh = req.query.refresh === 'true';
    if (!isForceRefresh && cachedProducts && (Date.now() - productsCacheTime < 30000)) {
      return res.status(200).json({
        success: true,
        count: cachedProducts.length,
        data: cachedProducts,
        source: 'zoho_live',
        isZohoLive: true,
        zohoStatus: 'Synced Live'
      });
    }

    const token = await getZohoAccessToken();
    const url = `https://www.zohoapis.in/inventory/v1/items?organization_id=${ZOHO_CONFIG.orgId}&page=1&per_page=200`;

    const zohoRes = await fetch(url, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`
      }
    });

    const zohoData = await zohoRes.json();
    if (zohoData.items && zohoData.items.length > 0) {
      const formatted = zohoData.items.map(formatZohoItem);
      cachedProducts = formatted;
      productsCacheTime = Date.now();

      return res.status(200).json({
        success: true,
        count: formatted.length,
        data: formatted,
        source: 'zoho_live',
        isZohoLive: true,
        zohoStatus: 'Synced Live'
      });
    }

    // Fallback: proxy to Render
    const renderRes = await fetch('https://plumbmart.onrender.com/api/products');
    const renderData = await renderRes.json();
    return res.status(200).json(renderData);
  } catch (err) {
    console.warn('Vercel products fetch error:', err.message);
    try {
      const renderRes = await fetch('https://plumbmart.onrender.com/api/products');
      const renderData = await renderRes.json();
      return res.status(200).json(renderData);
    } catch {
      return res.status(500).json({ success: false, message: err.message, isZohoLive: false });
    }
  }
}
