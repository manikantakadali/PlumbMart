const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Supabase PostgreSQL Connection Pool
let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });

  pool.on('error', (err) => {
    console.error('[Supabase PostgreSQL Pool Error]', err.message);
  });
}

// Direct query wrapper for Supabase
async function query(text, params) {
  if (!pool) {
    throw new Error('Supabase database connection pool not initialized.');
  }
  return pool.query(text, params);
}

// Health check function
async function checkConnection() {
  if (!pool) return { connected: false, error: 'DATABASE_URL not set' };
  try {
    const res = await pool.query('SELECT NOW() as current_time, version() as version;');
    return {
      connected: true,
      time: res.rows[0].current_time,
      version: res.rows[0].version
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
}

// Local Database File Cache (Fallback)
function getDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { admins: [], customers: [], dealers: [], plumbers: [], orders: [] };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local database file:', err);
    return { admins: [], customers: [], dealers: [], plumbers: [], orders: [] };
  }
}

function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving local database file:', err);
    return false;
  }
}

// ========================================================
// DYNAMIC SUPABASE CUSTOMER CRUD METHODS
// ========================================================

/**
 * Fetch or auto-create customer in Supabase
 */
async function getCustomerByMobile(mobile) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile) return null;

  try {
    const res = await query('SELECT * FROM customers WHERE mobile = $1', [cleanMobile]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }

    // Auto-create customer in Supabase if not found
    const newId = 'CUST-' + Date.now().toString().slice(-6);
    const insertRes = await query(`
      INSERT INTO customers (id, name, mobile, email, addresses, reward_points, total_saved)
      VALUES ($1, $2, $3, $4, $5, 240, 850.00)
      RETURNING *;
    `, [
      newId,
      `User ${cleanMobile.slice(-4)}`,
      cleanMobile,
      `customer_${cleanMobile}@plumbmart.com`,
      JSON.stringify([
        {
          id: 'ADDR-' + Date.now(),
          title: 'Primary Delivery Address',
          address: 'Main Site Address, Bengaluru, Karnataka, 560103',
          phone: cleanMobile,
          pincode: '560103',
          isDefault: true
        }
      ])
    ]);
    return insertRes.rows[0];
  } catch (err) {
    console.warn('[Supabase Fallback] getCustomerByMobile error:', err.message);
    const local = getDb();
    return (local.customers || []).find(c => c.mobile === cleanMobile) || null;
  }
}

/**
 * Get dynamic Customer Orders from Supabase
 */
async function getCustomerOrders(mobile) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  try {
    const res = await query(
      'SELECT * FROM orders WHERE client_mobile = $1 ORDER BY created_at DESC',
      [cleanMobile]
    );
    return res.rows.map(o => ({
      id: o.id,
      date: new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      items: o.items || [],
      total: parseFloat(o.total || 0),
      status: o.status || 'Order Placed',
      expectedDate: o.expected_date || 'Standard Delivery',
      deliveryAddress: o.delivery_address || 'Delivery Address on File',
      trackingSteps: o.tracking_steps || [],
      createdAt: o.created_at
    }));
  } catch (err) {
    console.warn('[Supabase Fallback] getCustomerOrders error:', err.message);
    const local = getDb();
    return (local.orders || [])
      .filter(o => o.clientMobile === cleanMobile || o.clientId === 'CUST-01')
      .map(o => ({
        id: o.id,
        date: o.date || 'Recent Order',
        items: o.items || [],
        total: o.total || 0,
        status: o.status || 'Processing',
        expectedDate: o.expectedDate || '2-3 Business Days',
        deliveryAddress: o.deliveryAddress || 'On File',
        trackingSteps: o.trackingSteps || []
      }));
  }
}

/**
 * Create a new Customer Order in Supabase
 */
async function createCustomerOrder(orderData) {
  const orderId = orderData.id || ('PM-' + Math.floor(100000 + Math.random() * 900000));
  const cleanMobile = String(orderData.clientMobile || orderData.customerMobile || '').replace(/\D/g, '').slice(-10);
  const items = Array.isArray(orderData.items) ? orderData.items : [];
  const total = parseFloat(orderData.total || 0);
  const status = orderData.status || 'Order Placed';
  const expectedDate = orderData.expectedDate || 'Today by 04:00 PM';
  const deliveryAddress = orderData.deliveryAddress || 'Standard Delivery Address';

  const trackingSteps = [
    { step: 'Order Placed', done: true, time: 'Just now' },
    { step: 'Packed at Hub', done: false, time: 'Pending' },
    { step: 'Out for Delivery', done: false, time: 'Pending' },
    { step: 'Delivered', done: false, time: 'Pending' }
  ];

  try {
    const res = await query(`
      INSERT INTO orders (id, client_id, client_name, client_mobile, client_type, items, total, status, expected_date, delivery_address, tracking_steps, created_at)
      VALUES ($1, $2, $3, $4, 'Customer', $5, $6, $7, $8, $9, $10, NOW())
      RETURNING *;
    `, [
      orderId,
      orderData.clientId || 'CUST-01',
      orderData.clientName || 'Valued Customer',
      cleanMobile,
      JSON.stringify(items),
      total,
      status,
      expectedDate,
      deliveryAddress,
      JSON.stringify(trackingSteps)
    ]);

    // Also sync to local DB cache
    const local = getDb();
    if (!local.orders) local.orders = [];
    local.orders.unshift({
      id: orderId,
      clientId: orderData.clientId || 'CUST-01',
      clientName: orderData.clientName || 'Valued Customer',
      clientMobile: cleanMobile,
      clientType: 'Customer',
      items,
      total,
      status,
      expectedDate,
      deliveryAddress,
      trackingSteps,
      createdAt: new Date().toISOString()
    });
    saveDb(local);

    return res.rows[0];
  } catch (err) {
    console.warn('[Supabase Fallback] createCustomerOrder error:', err.message);
    const local = getDb();
    if (!local.orders) local.orders = [];
    const newOrder = {
      id: orderId,
      clientId: orderData.clientId || 'CUST-01',
      clientName: orderData.clientName || 'Valued Customer',
      clientMobile: cleanMobile,
      clientType: 'Customer',
      items,
      total,
      status,
      expectedDate,
      deliveryAddress,
      trackingSteps,
      createdAt: new Date().toISOString()
    };
    local.orders.unshift(newOrder);
    saveDb(local);
    return newOrder;
  }
}

/**
 * Add a new delivery address to Supabase
 */
async function addCustomerAddress(mobile, addressPayload) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  const cust = await getCustomerByMobile(cleanMobile);
  if (!cust) throw new Error('Customer account not found in database.');

  let addresses = Array.isArray(cust.addresses) ? cust.addresses : [];
  if (typeof addresses === 'string') {
    try { addresses = JSON.parse(addresses); } catch { addresses = []; }
  }

  const isDefault = Boolean(addressPayload.isDefault || addresses.length === 0);
  if (isDefault) {
    addresses = addresses.map(a => ({ ...a, isDefault: false }));
  }

  const newAddress = {
    id: 'ADDR-' + Date.now(),
    title: String(addressPayload.title || 'Site Address').trim(),
    address: String(addressPayload.address || '').trim(),
    phone: String(addressPayload.phone || cleanMobile).trim(),
    pincode: String(addressPayload.pincode || '560103').trim(),
    isDefault
  };

  addresses.push(newAddress);

  try {
    await query('UPDATE customers SET addresses = $1::jsonb, updated_at = NOW() WHERE mobile = $2', [
      JSON.stringify(addresses),
      cleanMobile
    ]);
  } catch (err) {
    console.warn('[Supabase Update Warning]', err.message);
  }

  // Update local cache
  const local = getDb();
  const localCust = (local.customers || []).find(c => c.mobile === cleanMobile);
  if (localCust) {
    localCust.addresses = addresses;
    saveDb(local);
  }

  return { newAddress, addresses };
}

/**
 * Set an existing address as default
 */
async function setDefaultCustomerAddress(mobile, addressId) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  const cust = await getCustomerByMobile(cleanMobile);
  if (!cust) throw new Error('Customer account not found in database.');

  let addresses = Array.isArray(cust.addresses) ? cust.addresses : [];
  if (typeof addresses === 'string') {
    try { addresses = JSON.parse(addresses); } catch { addresses = []; }
  }

  addresses = addresses.map(a => ({
    ...a,
    isDefault: String(a.id) === String(addressId)
  }));

  try {
    await query('UPDATE customers SET addresses = $1::jsonb, updated_at = NOW() WHERE mobile = $2', [
      JSON.stringify(addresses),
      cleanMobile
    ]);
  } catch (err) {
    console.warn('[Supabase Update Warning]', err.message);
  }

  const local = getDb();
  const localCust = (local.customers || []).find(c => c.mobile === cleanMobile);
  if (localCust) {
    localCust.addresses = addresses;
    saveDb(local);
  }

  return addresses;
}

/**
 * Delete a customer address from Supabase
 */
async function deleteCustomerAddress(mobile, addressId) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  const cust = await getCustomerByMobile(cleanMobile);
  if (!cust) throw new Error('Customer account not found in database.');

  let addresses = Array.isArray(cust.addresses) ? cust.addresses : [];
  if (typeof addresses === 'string') {
    try { addresses = JSON.parse(addresses); } catch { addresses = []; }
  }

  addresses = addresses.filter(a => String(a.id) !== String(addressId));

  // If we deleted default and there are remaining addresses, make the first one default
  if (addresses.length > 0 && !addresses.some(a => a.isDefault)) {
    addresses[0].isDefault = true;
  }

  try {
    await query('UPDATE customers SET addresses = $1::jsonb, updated_at = NOW() WHERE mobile = $2', [
      JSON.stringify(addresses),
      cleanMobile
    ]);
  } catch (err) {
    console.warn('[Supabase Update Warning]', err.message);
  }

  const local = getDb();
  const localCust = (local.customers || []).find(c => c.mobile === cleanMobile);
  if (localCust) {
    localCust.addresses = addresses;
    saveDb(local);
  }

  return addresses;
}

module.exports = {
  pool,
  query,
  checkConnection,
  getDb,
  saveDb,
  getCustomerByMobile,
  getCustomerOrders,
  createCustomerOrder,
  addCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress
};
