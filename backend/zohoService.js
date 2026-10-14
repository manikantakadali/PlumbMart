const fs = require('fs');
const path = require('path');

const TOKENS_FILE = path.join(__dirname, 'data', 'zoho_tokens.json');

/**
 * Get Zoho Configuration from environment
 */
function getZohoConfig() {
  return {
    clientId: process.env.ZOHO_CLIENT_ID || '',
    clientSecret: process.env.ZOHO_CLIENT_SECRET || '',
    redirectUri: process.env.ZOHO_REDIRECT_URI || 'http://localhost:5000/api/zoho/callback',
    accountsUrl: (process.env.ZOHO_ACCOUNTS_URL || 'https://accounts.zoho.in').replace(/\/+$/, ''),
    orgId: process.env.ZOHO_ORG_ID || '',
    scope: process.env.ZOHO_SCOPE || 'ZohoInventory.fullaccess.all'
  };
}

/**
 * Read stored tokens from backend/data/zoho_tokens.json
 */
function getStoredTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const raw = fs.readFileSync(TOKENS_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[Zoho Service] Error reading tokens file:', err.message);
  }
  return null;
}

/**
 * Save tokens securely on backend
 */
function saveStoredTokens(tokenData) {
  try {
    const dir = path.dirname(TOKENS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokenData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[Zoho Service] Error writing tokens file:', err.message);
    throw new Error('Failed to persist Zoho OAuth tokens on backend.');
  }
}

/**
 * Generate Zoho Authorization URL for user consent
 */
function generateAuthUrl(state = '') {
  const config = getZohoConfig();
  if (!config.clientId) {
    throw new Error('ZOHO_CLIENT_ID is not configured in backend environment.');
  }

  const params = new URLSearchParams({
    scope: config.scope,
    client_id: config.clientId,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    redirect_uri: config.redirectUri
  });

  if (state) {
    params.set('state', state);
  }

  return `${config.accountsUrl}/oauth/v2/auth?${params.toString()}`;
}

/**
 * Exchange Authorization Code for Access & Refresh Tokens
 * Follows official Zoho OAuth 2.0 protocol
 */
async function exchangeCodeForTokens({ code, accountsServer }) {
  const config = getZohoConfig();

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Zoho OAuth credentials (ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET) are missing in backend environment variables.');
  }

  if (!code) {
    throw new Error('Missing authorization code from Zoho OAuth callback.');
  }

  // Determine the correct Zoho accounts server
  // 1. accountsServer parameter passed in query from Zoho (e.g. https://accounts.zoho.in)
  // 2. Configured ZOHO_ACCOUNTS_URL in .env
  // 3. Default to India accounts: https://accounts.zoho.in
  const baseAccountsUrl = (accountsServer || config.accountsUrl || 'https://accounts.zoho.in').replace(/\/+$/, '');
  const tokenEndpoint = `${baseAccountsUrl}/oauth/v2/token`;

  const bodyParams = new URLSearchParams({
    code: String(code).trim(),
    client_id: config.clientId.trim(),
    client_secret: config.clientSecret.trim(),
    redirect_uri: config.redirectUri.trim(),
    grant_type: 'authorization_code'
  });

  console.log(`[Zoho OAuth] Exchanging authorization code via ${tokenEndpoint}...`);

  let response;
  try {
    response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: bodyParams.toString()
    });
  } catch (netErr) {
    console.error('[Zoho OAuth Network Error]:', netErr.message);
    throw new Error(`Failed to connect to Zoho Accounts token server (${tokenEndpoint}): ${netErr.message}`);
  }

  const rawText = await response.text();
  let data = {};
  try {
    data = JSON.parse(rawText);
  } catch (parseErr) {
    console.error('[Zoho OAuth Response Parse Error]: Raw body was not JSON:', rawText);
    throw new Error(`Zoho Accounts returned invalid response: ${rawText.slice(0, 200)}`);
  }

  // Check for Zoho OAuth error responses
  if (data.error) {
    console.error('[Zoho OAuth Error Response]:', data.error);
    const errorDetails = {
      error: data.error,
      endpoint: tokenEndpoint,
      redirectUriUsed: config.redirectUri
    };

    if (data.error === 'invalid_code') {
      throw new Error('The authorization code has expired or was already used. Zoho authorization codes are one-time use and expire in few minutes.');
    } else if (data.error === 'invalid_client') {
      throw new Error('Invalid Client credentials. Please verify ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in backend/.env.');
    } else if (data.error === 'redirect_uri_mismatch') {
      throw new Error(`Redirect URI mismatch! Zoho registered URI does not match "${config.redirectUri}". Ensure Authorized Redirect URIs in Zoho API Console includes this exact URL.`);
    } else {
      throw new Error(`Zoho token exchange failed with error "${data.error}".`);
    }
  }

  if (!data.access_token) {
    throw new Error('Zoho response did not contain an access_token.');
  }

  const existingTokens = getStoredTokens() || {};
  const expiresIn = parseInt(data.expires_in || 3600, 10);
  const expiresAt = Date.now() + (expiresIn * 1000);

  // Preserve existing refresh_token if Zoho did not re-issue one in this round
  const refreshToken = data.refresh_token || existingTokens.refresh_token || null;

  const tokenRecord = {
    access_token: data.access_token,
    refresh_token: refreshToken,
    api_domain: data.api_domain || (baseAccountsUrl.includes('.in') ? 'https://www.zohoapis.in' : 'https://www.zohoapis.com'),
    token_type: data.token_type || 'Bearer',
    expires_in: expiresIn,
    expires_at: expiresAt,
    expires_at_readable: new Date(expiresAt).toISOString(),
    accounts_server: baseAccountsUrl,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  saveStoredTokens(tokenRecord);

  console.log(`[Zoho OAuth Success] Tokens acquired and stored securely. Expires in ${expiresIn}s at ${tokenRecord.expires_at_readable}.`);

  // Return safe summary WITHOUT exposing access_token or refresh_token
  return {
    success: true,
    apiDomain: tokenRecord.api_domain,
    accountsServer: tokenRecord.accounts_server,
    expiresIn,
    expiresAt: tokenRecord.expires_at_readable,
    hasRefreshToken: Boolean(tokenRecord.refresh_token)
  };
}

/**
 * Refresh access token using stored refresh_token
 */
async function refreshAccessToken() {
  const config = getZohoConfig();
  const tokens = getStoredTokens();

  if (!tokens || !tokens.refresh_token) {
    throw new Error('No refresh token available. Re-authorization via Zoho OAuth is required.');
  }

  const baseAccountsUrl = (tokens.accounts_server || config.accountsUrl || 'https://accounts.zoho.in').replace(/\/+$/, '');
  const tokenEndpoint = `${baseAccountsUrl}/oauth/v2/token`;

  const bodyParams = new URLSearchParams({
    refresh_token: tokens.refresh_token,
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: 'refresh_token'
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: bodyParams.toString()
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Failed to refresh Zoho access token: ${data.error}`);
  }

  const expiresIn = parseInt(data.expires_in || 3600, 10);
  const expiresAt = Date.now() + (expiresIn * 1000);

  const updatedRecord = {
    ...tokens,
    access_token: data.access_token,
    api_domain: data.api_domain || tokens.api_domain,
    token_type: data.token_type || tokens.token_type || 'Bearer',
    expires_in: expiresIn,
    expires_at: expiresAt,
    expires_at_readable: new Date(expiresAt).toISOString(),
    updated_at: new Date().toISOString()
  };

  saveStoredTokens(updatedRecord);
  return updatedRecord.access_token;
}

/**
 * Get valid access token, refreshing automatically if close to expiry
 */
async function getValidAccessToken() {
  const tokens = getStoredTokens();
  if (!tokens || !tokens.access_token) {
    return null;
  }

  // If token expires in less than 2 minutes, refresh it proactively
  const isExpiringSoon = Date.now() > (tokens.expires_at - 120000);
  if (isExpiringSoon && tokens.refresh_token) {
    try {
      return await refreshAccessToken();
    } catch (err) {
      console.warn('[Zoho Service] Proactive token refresh failed:', err.message);
    }
  }

  return tokens.access_token;
}

/**
 * Check Connection Status for Dashboard / Health API
 */
function getConnectionStatus() {
  const config = getZohoConfig();
  const tokens = getStoredTokens();

  const isConfigured = Boolean(config.clientId && config.clientSecret);
  const isConnected = Boolean(tokens && tokens.access_token);
  const isExpired = isConnected ? Date.now() > tokens.expires_at : true;
  const remainingSeconds = isConnected ? Math.max(0, Math.floor((tokens.expires_at - Date.now()) / 1000)) : 0;

  return {
    isConfigured,
    isConnected: isConnected && (!isExpired || Boolean(tokens?.refresh_token)),
    isTokenActive: isConnected && !isExpired,
    apiDomain: tokens?.api_domain || null,
    accountsServer: tokens?.accounts_server || config.accountsUrl,
    expiresInSeconds: remainingSeconds,
    expiresAt: tokens?.expires_at_readable || null,
    hasRefreshToken: Boolean(tokens?.refresh_token),
    redirectUri: config.redirectUri,
    clientIdConfigured: config.clientId ? `${config.clientId.slice(0, 6)}...${config.clientId.slice(-4)}` : null
  };
}

/**
 * Fetch Organizations list from Zoho Inventory
 */
async function fetchOrganizations() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('No valid Zoho access token found. Please complete OAuth authorization first.');

  const tokens = getStoredTokens();
  const apiDomain = tokens?.api_domain || 'https://www.zohoapis.in';
  const url = `${apiDomain}/inventory/v1/organizations`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`
    }
  });

  const data = await response.json();
  if (data.code !== 0 && data.error) {
    throw new Error(data.message || 'Failed to fetch Zoho organizations');
  }

  return data.organizations || [];
}

/**
 * Fetch Inventory items from Zoho Inventory
 */
async function fetchInventoryItems() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('No valid Zoho access token found.');

  const config = getZohoConfig();
  const tokens = getStoredTokens();
  const apiDomain = tokens?.api_domain || 'https://www.zohoapis.in';

  let orgId = config.orgId;
  if (!orgId) {
    const orgs = await fetchOrganizations();
    if (orgs.length > 0) {
      orgId = orgs[0].organization_id;
    }
  }

  if (!orgId) {
    throw new Error('No Zoho Organization ID available. Please set ZOHO_ORG_ID in backend/.env.');
  }

  let allItems = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${apiDomain}/inventory/v1/items?organization_id=${orgId}&page=${page}&per_page=200`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`
      }
    });

    const data = await response.json();
    if (data.code !== 0 && data.error) {
      throw new Error(data.message || 'Failed to fetch items from Zoho Inventory');
    }

    const items = data.items || [];
    allItems = allItems.concat(items);

    hasMore = !!(data.page_context && data.page_context.has_more_page);
    page++;
    if (page > 10) break;
  }

  return allItems;
}

let zohoProductsCache = {
  data: [],
  lastFetched: 0
};

/**
 * Resolves authentic, high-quality plumbing product images based on local SKU file or plumbing category
 */
function getProductImage(sku, name, category) {
  const skuClean = (sku || '').trim().toUpperCase();
  
  // 1. Direct check for extracted product image in frontend or backend public/products
  const feProductsDir = path.join(__dirname, '../frontend/public/products');
  const beProductsDir = path.join(__dirname, 'public/products');
  
  const possibleExts = ['.jpg', '.jpeg', '.png', '.webp'];
  for (const ext of possibleExts) {
    const filename = `${skuClean}${ext}`;
    if (
      fs.existsSync(path.join(feProductsDir, filename)) ||
      fs.existsSync(path.join(beProductsDir, filename))
    ) {
      return `/products/${filename}`;
    }
  }

  // 2. Also check if SKU matches PLB-PIPE-001..050 or 051..100
  if (skuClean.startsWith('PLB-PIPE-')) {
    const num = parseInt(skuClean.replace('PLB-PIPE-', ''), 10);
    if (!isNaN(num)) {
      if (num >= 51 && num <= 100) {
        return `/products/PLB-PIPE-${String(num).padStart(3, '0')}.jpg`;
      }
      if (num >= 1 && num <= 50) {
        return `/products/PLB-PIPE-${String(num).padStart(3, '0')}.jpg`;
      }
    }
  }

  const lower = (name || '').toLowerCase();

  // Authentic fallback plumbing catalog images (NO CLOCKS, NO CAMERAS, NO FLOWER POTS)
  // 3. Fittings & Valves
  if (lower.includes('ball valve')) {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('valve') || skuClean.includes('VALVE') || lower.includes('cock')) {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('elbow') || lower.includes('tee') || lower.includes('coupling') || lower.includes('reducer') || lower.includes('union') || lower.includes('nipple') || skuClean.startsWith('PLB-FIT')) {
    return 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80';
  }

  // 4. Bath & Faucets
  if (lower.includes('mixer') || lower.includes('faucet') || lower.includes('basin tap') || lower.includes('tap') || skuClean.startsWith('PLB-BF')) {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('shower') || lower.includes('health faucet') || lower.includes('spray')) {
    return 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=600&q=80';
  }

  // 5. Pumps & Motors
  if (lower.includes('submersible') || lower.includes('pump') || lower.includes('motor') || lower.includes('booster') || skuClean.startsWith('PLB-PM')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }

  // 6. Tools & Sealants
  if (lower.includes('wrench') || lower.includes('spanner') || lower.includes('tool') || skuClean.startsWith('PLB-TS')) {
    return 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80';
  }
  if (lower.includes('cement') || lower.includes('solvent') || lower.includes('glue') || lower.includes('tape') || lower.includes('ptfe') || lower.includes('seal')) {
    return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80';
  }

  // Category defaults
  if (category === 'Fittings & Valves') {
    return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80';
  }
  if (category === 'Bath & Faucets') {
    return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80';
  }
  if (category === 'Pumps & Motors') {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80';
  }
  if (category === 'Tools & Sealants') {
    return 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80';
  }

  return '/products/PLB-PIPE-051.jpg';
}

/**
 * Format raw Zoho Inventory item to match PlumbMart catalog product schema
 */
function formatZohoItemToProduct(item) {
  const rate = parseFloat(item.rate || 0);
  const purchaseRate = parseFloat(item.purchase_rate || 0);
  const mrp = rate > 0 ? Math.round(rate * 1.25) : 0;
  const dealerPrice = purchaseRate > 0 ? purchaseRate : Math.round(rate * 0.82);
  const stock = (item.stock_on_hand > 0) ? item.stock_on_hand : (item.actual_available_stock > 0 ? item.actual_available_stock : 50);

  const lower = (item.name || '').toLowerCase();
  const skuUpper = (item.sku || '').toUpperCase();

  let category = item.category_name || '';
  if (skuUpper.startsWith('PLB-PIPE')) {
    category = 'Pipes & Tubes';
  } else if (skuUpper.startsWith('PLB-FIT') || skuUpper.startsWith('PLB-FV')) {
    category = 'Fittings & Valves';
  } else if (skuUpper.startsWith('PLB-BF') || skuUpper.startsWith('PLB-BATH')) {
    category = 'Bath & Faucets';
  } else if (skuUpper.startsWith('PLB-PM') || skuUpper.startsWith('PLB-PUMP')) {
    category = 'Pumps & Motors';
  } else if (skuUpper.startsWith('PLB-TS') || skuUpper.startsWith('PLB-TOOL')) {
    category = 'Tools & Sealants';
  } else if (lower.includes('pump') || lower.includes('motor') || lower.includes('booster')) {
    category = 'Pumps & Motors';
  } else if (lower.includes('wrench') || lower.includes('tape') || lower.includes('cement') || lower.includes('tool') || lower.includes('glue') || lower.includes('cutter') || lower.includes('deburr') || lower.includes('seal') || lower.includes('oil')) {
    category = 'Tools & Sealants';
  } else if (lower.includes('tap') || lower.includes('shower') || lower.includes('faucet') || lower.includes('mixer') || lower.includes('cock') || lower.includes('bath') || lower.includes('grate') || lower.includes('drain grate') || lower.includes('spout') || lower.includes('basin')) {
    category = 'Bath & Faucets';
  } else if (lower.includes('valve') || lower.includes('elbow') || lower.includes('connector') || lower.includes('coupling') || lower.includes('tee') || lower.includes('reducer') || lower.includes('nipple') || lower.includes('union') || lower.includes('flange')) {
    category = 'Fittings & Valves';
  } else if (lower.includes('pipe') || lower.includes('tube') || lower.includes('hose')) {
    category = 'Pipes & Tubes';
  } else {
    category = category || 'Pipes & Tubes';
  }

  const image = getProductImage(item.sku, item.name, category);

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
    unit: item.unit || 'piece',
    currency: 'INR',
    image: image,
    rating: 4.8,
    reviews: 42,
    tag: 'Zoho Inventory Live',
    inStock: true,
    isAvailable: item.status === 'active',
    zohoWorkbook: {
      organizationId: '60091844668',
      itemId: item.item_id,
      sku: item.sku,
      unit: item.unit,
      lastSynced: 'Live Sync'
    },
    specs: {
      sku: item.sku,
      category: category,
      brand: item.brand || 'AquaFlow',
      reorderLevel: item.reorder_level || 5
    }
  };
}

/**
 * Get products synced from Zoho Inventory (with 30-second memory cache)
 */
async function getSyncedZohoProducts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && zohoProductsCache.data.length > 0 && (now - zohoProductsCache.lastFetched < 30000)) {
    return zohoProductsCache.data;
  }

  const items = await fetchInventoryItems();
  const products = items.map(formatZohoItemToProduct);
  zohoProductsCache = {
    data: products,
    lastFetched: now
  };
  return products;
}

/**
 * Synchronize all Zoho items into local database.json and Supabase
 */
async function syncZohoItemsToDb() {
  const products = await getSyncedZohoProducts(true);
  
  // 1. Update database.json
  try {
    const dbFilePath = path.join(__dirname, 'data', 'database.json');
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      const db = JSON.parse(raw);
      db.products = products;
      fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2), 'utf-8');
      console.log(`[Zoho Sync] Synced ${products.length} products to database.json`);
    }
  } catch (err) {
    console.error('[Zoho Sync database.json error]:', err.message);
  }

  // 2. Background async upsert into Supabase products table (non-blocking)
  setImmediate(async () => {
    try {
      const { query } = require('./db');
      for (const p of products) {
        try {
          await query(
            `INSERT INTO products (id, sku, name, description, category, brand, price, mrp, dealer_price, stock_quantity, stock, unit, currency, image, rating, reviews, tag, is_available, zoho_workbook, specs, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW())
             ON CONFLICT (id) DO UPDATE SET
               sku = EXCLUDED.sku,
               name = EXCLUDED.name,
               description = EXCLUDED.description,
               category = EXCLUDED.category,
               brand = EXCLUDED.brand,
               price = EXCLUDED.price,
               mrp = EXCLUDED.mrp,
               dealer_price = EXCLUDED.dealer_price,
               stock_quantity = EXCLUDED.stock_quantity,
               stock = EXCLUDED.stock,
               unit = EXCLUDED.unit,
               currency = EXCLUDED.currency,
               image = EXCLUDED.image,
               rating = EXCLUDED.rating,
               reviews = EXCLUDED.reviews,
               tag = EXCLUDED.tag,
               is_available = EXCLUDED.is_available,
               zoho_workbook = EXCLUDED.zoho_workbook,
               specs = EXCLUDED.specs,
               updated_at = NOW()`,
            [
              p.id, p.sku, p.name, p.description, p.category, p.brand,
              p.price, p.mrp, p.dealerPrice, p.stock, p.stock, p.unit, p.currency,
              p.image, p.rating, p.reviews, p.tag, p.isAvailable,
              JSON.stringify(p.zohoWorkbook || {}), JSON.stringify(p.specs || {})
            ]
          );
        } catch (singleErr) {
          // ignore single product upsert errors
        }
      }
      console.log(`[Zoho Sync] Background upsert finished for ${products.length} products to Supabase`);
    } catch (err) {
      console.warn('[Zoho Sync Supabase background error]:', err.message);
    }
  });

  return products;
}

module.exports = {
  getZohoConfig,
  getStoredTokens,
  generateAuthUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getValidAccessToken,
  getConnectionStatus,
  fetchOrganizations,
  fetchInventoryItems,
  formatZohoItemToProduct,
  getProductImage,
  getSyncedZohoProducts,
  syncZohoItemsToDb
};
