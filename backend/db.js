const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DB_FILE = path.join(__dirname, 'data', 'database.json');

// Supabase PostgreSQL Connection Pool
const defaultDbUrl = 'postgresql://postgres:manikanta2003@db.llcsnbixfqbjboricsqs.supabase.co:5432/postgres';
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || defaultDbUrl;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000
});

pool.on('error', (err) => {
  console.error('[Supabase PostgreSQL Pool Error]', err.message);
});

// Direct query wrapper for Supabase with 15s timeout guarantee
async function query(text, params) {
  if (!pool) {
    throw new Error('Supabase database connection pool not initialized.');
  }
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Supabase query timed out')), 15000)
  );
  return Promise.race([pool.query(text, params), timeoutPromise]);
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
  let data = { admins: [], customers: [], dealers: [], plumbers: [], orders: [] };
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      data = JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading local database file:', err);
  }

  // Ensure default super admin always exists
  if (!Array.isArray(data.admins) || data.admins.length === 0) {
    data.admins = [
      {
        id: "ADM-01",
        name: "Super Administrator",
        email: "kadalimanikanta2003@gmail.com",
        password: "mani@2003",
        pin: "507172",
        passkey: "507172",
        role: "Admin",
        accessLevel: "SuperAdmin"
      }
    ];
    saveDb(data);
  }

  // Ensure default dealer exists
  if (!Array.isArray(data.dealers) || data.dealers.length === 0) {
    data.dealers = [
      {
        id: "DLR-7598",
        name: "Ravi Kumar",
        contactPerson: "Ravi Kumar",
        mobile: "9347486117",
        email: "manikantakadali47@gmail.com",
        role: "Dealer",
        gstin: "29ABCDE3923F1Z5",
        status: "ACTIVE",
        zohoVerified: true,
        city: "Bengaluru"
      }
    ];
    saveDb(data);
  }

  // Ensure default plumber exists
  if (!Array.isArray(data.plumbers) || data.plumbers.length === 0) {
    data.plumbers = [
      {
        id: "PLB-01",
        name: "plumber",
        contactPerson: "plumber",
        mobile: "9347486117",
        email: "manikantakadali6117@gmail.com",
        role: "Plumber",
        status: "VERIFIED",
        city: "Bengaluru"
      }
    ];
    saveDb(data);
  }

  return data;
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
 * Find customer strictly without auto-creation (used for auth check)
 */
async function findCustomerByMobile(mobile) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile) return null;

  // Fast local lookup
  const local = getDb();
  const cached = (local.customers || []).find(c => c.mobile === cleanMobile);
  if (cached) return cached;

  try {
    const res = await query('SELECT * FROM customers WHERE mobile = $1', [cleanMobile]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn('[Supabase Fallback] findCustomerByMobile error:', err.message);
  }

  return null;
}

/**
 * Find customer by email in Supabase or local cache
 */
async function findCustomerByEmail(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) return null;

  // Fast local lookup
  const local = getDb();
  const cached = (local.customers || []).find(c => (c.email || '').toLowerCase() === cleanEmail);
  if (cached) return cached;

  try {
    const res = await query('SELECT * FROM customers WHERE LOWER(email) = $1', [cleanEmail]);
    if (res.rows.length > 0) {
      return res.rows[0];
    }
  } catch (err) {
    console.warn('[Supabase Fallback] findCustomerByEmail error:', err.message);
  }

  return null;
}


/**
 * Register and persist new customer in Supabase and local cache
 */
async function createCustomerRecord(data) {
  const cleanMobile = String(data.mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile || cleanMobile.length !== 10) {
    throw new Error('Valid 10-digit mobile number is required');
  }

  const name = String(data.name || '').trim();
  const email = data.email ? String(data.email).trim() : `customer_${cleanMobile}@plumbmart.com`;
  const city = data.city ? String(data.city).trim() : 'Bengaluru';
  const newId = 'CUST-' + Date.now().toString().slice(-4);
  const addresses = [
    {
      id: 'ADDR-' + Date.now(),
      title: 'Primary Delivery Address',
      address: city ? `Main Site Address, ${city}` : 'Main Site Address, Bengaluru',
      phone: cleanMobile,
      pincode: '560103',
      isDefault: true
    }
  ];

  let customer = null;
  try {
    const insertRes = await query(`
      INSERT INTO customers (id, name, mobile, email, addresses, reward_points, total_saved, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5::jsonb, 100, 0.00, NOW(), NOW())
      ON CONFLICT (mobile) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        updated_at = NOW()
      RETURNING *;
    `, [
      newId,
      name,
      cleanMobile,
      email,
      JSON.stringify(addresses)
    ]);
    customer = insertRes.rows[0];
  } catch (err) {
    console.warn('[Supabase Insert Error in createCustomerRecord]:', err.message);
  }

  // Also sync to local database cache
  const local = getDb();
  if (!local.customers) local.customers = [];
  const existingIdx = local.customers.findIndex(c => c.mobile === cleanMobile);
  const localRecord = {
    id: customer ? customer.id : newId,
    name,
    mobile: cleanMobile,
    email,
    password: data.password || '123456',
    role: 'Customer',
    rewardPoints: 100,
    addresses,
    city,
    createdAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    local.customers[existingIdx] = { ...local.customers[existingIdx], ...localRecord };
  } else {
    local.customers.push(localRecord);
  }
  saveDb(local);

  return customer || localRecord;
}

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

/**
 * Update Customer Profile (name, email, address, etc.) dynamically
 */
async function updateCustomerProfile(mobile, updates) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile) throw new Error('Valid 10-digit mobile number is required.');

  const local = getDb();
  if (!local.customers) local.customers = [];
  
  let custIndex = local.customers.findIndex(c => c.mobile === cleanMobile);
  if (custIndex === -1) {
    const newCust = {
      id: 'CUST-' + Date.now().toString().slice(-6),
      name: updates.name || 'Valued Customer',
      mobile: cleanMobile,
      email: updates.email || `customer_${cleanMobile}@plumbmart.com`,
      role: 'Customer',
      addresses: updates.address ? [{
        id: 'ADDR-' + Date.now(),
        title: 'Delivery Address',
        address: updates.address,
        phone: cleanMobile,
        isDefault: true
      }] : [],
      createdAt: new Date().toISOString()
    };
    local.customers.push(newCust);
    custIndex = local.customers.length - 1;
  }

  const current = local.customers[custIndex];
  const updatedName = updates.name !== undefined ? String(updates.name).trim() : current.name;
  const updatedEmail = updates.email !== undefined ? String(updates.email).trim() : current.email;
  const updatedAddress = updates.address !== undefined ? String(updates.address).trim() : (current.address || (current.addresses?.[0]?.address || ''));

  let addresses = current.addresses || [];
  if (updates.address) {
    if (addresses.length > 0) {
      addresses[0] = { ...addresses[0], address: updatedAddress };
    } else {
      addresses = [{
        id: 'ADDR-' + Date.now(),
        title: 'Delivery Address',
        address: updatedAddress,
        phone: cleanMobile,
        isDefault: true
      }];
    }
  }

  local.customers[custIndex] = {
    ...current,
    name: updatedName,
    email: updatedEmail,
    address: updatedAddress,
    addresses: addresses,
    updatedAt: new Date().toISOString()
  };

  saveDb(local);

  try {
    await query(`
      UPDATE customers 
      SET name = $1, email = $2, addresses = $3::jsonb, updated_at = NOW()
      WHERE mobile = $4
    `, [updatedName, updatedEmail, JSON.stringify(addresses), cleanMobile]);
  } catch (err) {
    console.warn('[Supabase Fallback] updateCustomerProfile error:', err.message);
  }

  return local.customers[custIndex];
}

// ========================================================
// DYNAMIC SUPABASE PLUMBER PROFILE CRUD METHODS
// ========================================================

function formatPlumberRow(r) {
  if (!r) return null;
  let skills = r.skills || [];
  if (typeof skills === 'string') {
    try { skills = JSON.parse(skills); } catch { skills = []; }
  }
  return {
    id: r.id,
    name: r.name || 'Ramesh Kumar',
    mobile: r.mobile,
    email: r.email || `plumber_${r.mobile}@plumbmart.com`,
    avatar: r.avatar,
    license: r.license_no || 'PLUMB-KA-2024-884',
    status: r.status || r.verification_status || 'VERIFIED',
    verificationStatus: r.verification_status || 'VERIFIED',
    experience: parseInt(r.experience_years ?? 8, 10),
    specialization: r.specialization || 'CPVC/UPVC Piping, Concealed Valves & Pump Automation',
    skills: Array.isArray(skills) ? skills : [
      'CPVC High Pressure Solvent Welding',
      'UPVC Ball Valve Installation',
      'Basin & Shower Mixer Cartridges',
      'Kirloskar Pump Servicing',
      'Sanitary Hydrostatic Leak Testing'
    ],
    serviceArea: r.service_area || 'Bengaluru East & South Zones',
    address: r.address || '#42, 5th Main, 7th Cross, HSR Layout Sector 2, Bengaluru, Karnataka, 560102',
    rating: parseFloat(r.rating ?? 4.9),
    completedJobs: parseInt(r.completed_jobs ?? 48, 10),
    rewardPoints: parseInt(r.reward_points ?? 650, 10),
    walletBalance: parseInt(r.wallet_balance ?? 4850, 10),
    city: r.city || 'Bengaluru (East & South Zones)',
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

/**
 * Fetch or auto-create plumber in Supabase
 */
async function getPlumberByMobile(mobile) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile) return null;

  // Check local database first for instant admin updates
  const local = getDb();
  const localMatch = (local.plumbers || []).find(p => p.mobile === cleanMobile || p.id === mobile);

  try {
    const res = await query('SELECT * FROM plumbers WHERE mobile = $1', [cleanMobile]);
    if (res.rows.length > 0) {
      const row = formatPlumberRow(res.rows[0]);
      if (localMatch && localMatch.status) {
        row.status = localMatch.status;
        row.verificationStatus = localMatch.status;
      }
      return row;
    }

    // Auto-create plumber profile in Supabase if not found
    const newId = 'PLM-' + Date.now().toString().slice(-4);
    const insertRes = await query(`
      INSERT INTO plumbers (
        id, name, mobile, email, license_no, verification_status, status,
        experience_years, specialization, skills, service_area, address,
        rating, completed_jobs, reward_points, wallet_balance, city,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, 'VERIFIED', 'VERIFIED',
        8, 'CPVC/UPVC Piping, Concealed Valves & Pump Automation',
        $6::jsonb, 'Bengaluru East & South Zones',
        '#42, 5th Main, 7th Cross, HSR Layout Sector 2, Bengaluru, Karnataka, 560102',
        4.9, 48, 650, 4850, 'Bengaluru (East & South Zones)',
        NOW(), NOW()
      )
      RETURNING *;
    `, [
      newId,
      'Ramesh Kumar',
      cleanMobile,
      `plumber_${cleanMobile}@plumbmart-demo.com`,
      `PLUMB-KA-2024-${cleanMobile.slice(-3)}`,
      JSON.stringify([
        'CPVC High Pressure Solvent Welding',
        'UPVC Ball Valve Installation',
        'Basin & Shower Mixer Cartridges',
        'Kirloskar Pump Servicing',
        'Sanitary Hydrostatic Leak Testing'
      ])
    ]);
    const createdRow = formatPlumberRow(insertRes.rows[0]);
    if (localMatch && localMatch.status) {
      createdRow.status = localMatch.status;
      createdRow.verificationStatus = localMatch.status;
    }
    return createdRow;
  } catch (err) {
    console.warn('[Supabase Fallback] getPlumberByMobile error:', err.message);
    const local = getDb();
    const match = (local.plumbers || []).find(p => p.mobile === cleanMobile);
    return formatPlumberRow(match || (local.plumbers ? local.plumbers[0] : null));
  }
}

/**
 * Update Plumber Profile in Supabase
 */
async function updatePlumberProfile(mobile, updateData) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile) throw new Error('Valid mobile number is required');

  try {
    const res = await query(`
      UPDATE plumbers SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        license_no = COALESCE($3, license_no),
        specialization = COALESCE($4, specialization),
        skills = COALESCE($5::jsonb, skills),
        service_area = COALESCE($6, service_area),
        address = COALESCE($7, address),
        city = COALESCE($8, city),
        experience_years = COALESCE($9, experience_years),
        status = COALESCE($10, status),
        verification_status = COALESCE($10, verification_status),
        updated_at = NOW()
      WHERE mobile = $11
      RETURNING *;
    `, [
      updateData.name || null,
      updateData.email || null,
      updateData.license || updateData.license_no || null,
      updateData.specialization || null,
      updateData.skills ? JSON.stringify(updateData.skills) : null,
      updateData.serviceArea || updateData.service_area || null,
      updateData.address || null,
      updateData.city || null,
      updateData.experience ? parseInt(updateData.experience, 10) : null,
      updateData.status || updateData.verificationStatus || null,
      cleanMobile
    ]);

    if (res.rows.length === 0) {
      // If row did not exist yet, create it
      return await getPlumberByMobile(cleanMobile);
    }

    const updated = formatPlumberRow(res.rows[0]);

    // Sync to local json cache
    const local = getDb();
    if (!local.plumbers) local.plumbers = [];
    const idx = local.plumbers.findIndex(p => p.mobile === cleanMobile);
    if (idx !== -1) {
      local.plumbers[idx] = { ...local.plumbers[idx], ...updated };
    } else {
      local.plumbers.push(updated);
    }
    saveDb(local);

    return updated;
  } catch (err) {
    console.warn('[Supabase Fallback] updatePlumberProfile error:', err.message);
    const local = getDb();
    if (!local.plumbers) local.plumbers = [];
    let idx = local.plumbers.findIndex(p => p.mobile === cleanMobile);
    if (idx !== -1) {
      local.plumbers[idx] = { ...local.plumbers[idx], ...updateData };
    } else {
      local.plumbers.push({ mobile: cleanMobile, ...updateData });
      idx = local.plumbers.length - 1;
    }
    saveDb(local);
    return formatPlumberRow(local.plumbers[idx]);
  }
}

/**
 * Create Plumber Profile in Supabase
 */
async function createPlumberProfile(payload) {
  const cleanMobile = String(payload.mobile || '').replace(/\D/g, '').slice(-10);
  const newId = payload.id || ('PLM-' + Date.now().toString().slice(-4));
  const skills = Array.isArray(payload.skills) ? payload.skills : [
    'CPVC High Pressure Solvent Welding',
    'UPVC Ball Valve Installation',
    'Basin & Shower Mixer Cartridges'
  ];

  try {
    const res = await query(`
      INSERT INTO plumbers (
        id, name, mobile, email, license_no, verification_status, status,
        experience_years, specialization, skills, service_area, address,
        rating, completed_jobs, reward_points, wallet_balance, city,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10::jsonb, $11, $12,
        $13, $14, $15, $16, $17,
        NOW(), NOW()
      )
      ON CONFLICT (mobile) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        specialization = EXCLUDED.specialization,
        updated_at = NOW()
      RETURNING *;
    `, [
      newId,
      payload.name || 'Ramesh Kumar',
      cleanMobile,
      payload.email || `plumber_${cleanMobile}@plumbmart.com`,
      payload.license || payload.license_no || 'PLUMB-KA-2024-884',
      payload.verificationStatus || 'VERIFIED',
      payload.status || 'VERIFIED',
      parseInt(payload.experience || 8, 10),
      payload.specialization || 'CPVC/UPVC Piping & Valves',
      JSON.stringify(skills),
      payload.serviceArea || 'Bengaluru East & South Zones',
      payload.address || 'Registered Address, Bengaluru',
      parseFloat(payload.rating || 4.9),
      parseInt(payload.completedJobs || 48, 10),
      parseInt(payload.rewardPoints || 650, 10),
      parseInt(payload.walletBalance || 4850, 10),
      payload.city || 'Bengaluru'
    ]);

    return formatPlumberRow(res.rows[0]);
  } catch (err) {
    console.warn('[Supabase Fallback] createPlumberProfile error:', err.message);
    const local = getDb();
    if (!local.plumbers) local.plumbers = [];
    const item = { id: newId, mobile: cleanMobile, ...payload };
    local.plumbers.push(item);
    saveDb(local);
    return formatPlumberRow(item);
  }
}

// ========================================================
// DYNAMIC PRODUCTS CRUD METHODS
// ========================================================

function formatProductRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    sku: r.sku,
    name: r.name,
    description: r.description,
    category: r.category,
    brand: r.brand,
    price: parseFloat(r.price || 0),
    mrp: parseFloat(r.mrp || 0),
    dealerPrice: parseFloat(r.dealer_price || 0),
    stock: parseInt(r.stock ?? r.stock_quantity ?? 0, 10),
    stockQuantity: parseInt(r.stock_quantity ?? r.stock ?? 0, 10),
    unit: r.unit || 'piece',
    currency: r.currency || 'INR',
    image: r.image,
    rating: parseFloat(r.rating || 4.7),
    reviews: parseInt(r.reviews || 50, 10),
    tag: r.tag,
    inStock: (parseInt(r.stock ?? r.stock_quantity ?? 0, 10)) > 0,
    isAvailable: r.is_available !== false,
    zohoWorkbook: typeof r.zoho_workbook === 'string' ? JSON.parse(r.zoho_workbook) : (r.zoho_workbook || {}),
    specs: typeof r.specs === 'string' ? JSON.parse(r.specs) : (r.specs || {})
  };
}

async function getProductsList() {
  const local = getDb();
  if (local.products && local.products.length > 0) {
    return local.products.map(formatProductRow);
  }
  try {
    const res = await query('SELECT * FROM products ORDER BY id ASC');
    if (res.rows && res.rows.length > 0) {
      return res.rows.map(formatProductRow);
    }
  } catch (err) {
    console.warn('[Supabase Fallback] getProductsList error:', err.message);
  }
  return [];
}

/**
 * Update Plumber Status directly in Supabase
 */
async function updatePlumberStatusInDb(mobile, status) {
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);
  if (!cleanMobile) return null;
  try {
    const res = await query(`
      UPDATE plumbers SET 
        status = $1, 
        verification_status = $1, 
        updated_at = NOW() 
      WHERE mobile = $2
      RETURNING *;
    `, [status, cleanMobile]);
    return res.rows[0] ? formatPlumberRow(res.rows[0]) : null;
  } catch (err) {
    console.warn('[Supabase Fallback] updatePlumberStatusInDb warning:', err.message);
    return null;
  }
}

module.exports = {
  pool,
  query,
  checkConnection,
  getDb,
  saveDb,
  findCustomerByMobile,
  findCustomerByEmail,
  createCustomerRecord,
  getCustomerByMobile,
  getCustomerOrders,
  createCustomerOrder,
  addCustomerAddress,
  setDefaultCustomerAddress,
  deleteCustomerAddress,
  updateCustomerProfile,
  getPlumberByMobile,
  updatePlumberProfile,
  updatePlumberStatusInDb,
  createPlumberProfile,
  getProductsList,
  formatProductRow
};


