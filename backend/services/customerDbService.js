/**
 * Customer & OTP PostgreSQL Database Service
 * Integrates directly with Supabase PostgreSQL for customer records and secure OTP sessions.
 */

const { query } = require('../db');
const { getStore, saveStore } = require('../store');

const OTP_EXPIRY_MS = parseInt(process.env.OTP_EXPIRY_SECONDS || '300', 10) * 1000; // 5 mins
const RESEND_COOLDOWN_MS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '30', 10) * 1000; // 30s
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '3', 10);
const MAX_HOURLY_REQUESTS = 5;

/**
 * Save OTP session to Supabase PostgreSQL (and backup to store)
 */
async function saveOtpSession({ mobile, otp, role = 'customer', name = '' }) {
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  const now = new Date();

  // Rate limiting check
  let existingSession = null;
  try {
    const res = await query('SELECT * FROM otp_sessions WHERE mobile = $1;', [mobile]);
    if (res.rows.length > 0) {
      existingSession = res.rows[0];
    }
  } catch (err) {
    console.warn('[customerDbService] Could not query otp_sessions for rate limit:', err.message);
  }

  if (!existingSession) {
    const store = getStore();
    existingSession = store.otpSessions?.[mobile];
  }

  if (existingSession) {
    const lastSent = new Date(existingSession.last_sent_at || existingSession.lastSentAt || 0).getTime();
    const timeSinceLast = Date.now() - lastSent;

    if (timeSinceLast < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLast) / 1000);
      throw new Error(`Please wait ${waitSec} second(s) before requesting another OTP.`);
    }

    const resendCount = (existingSession.resend_count || existingSession.resendCount || 0);
    if (resendCount >= MAX_HOURLY_REQUESTS) {
      throw new Error('Too many OTP requests for this mobile number. Please try again after 1 hour.');
    }
  }

  // Insert or update in Supabase PostgreSQL
  try {
    await query(
      `INSERT INTO otp_sessions (mobile, otp_code, role, name, attempts, resend_count, expires_at, last_sent_at)
       VALUES ($1, $2, $3, $4, 0, 1, $5, $6)
       ON CONFLICT (mobile) DO UPDATE SET
         otp_code = EXCLUDED.otp_code,
         role = EXCLUDED.role,
         name = CASE WHEN EXCLUDED.name != '' THEN EXCLUDED.name ELSE otp_sessions.name END,
         attempts = 0,
         resend_count = otp_sessions.resend_count + 1,
         expires_at = EXCLUDED.expires_at,
         last_sent_at = EXCLUDED.last_sent_at;`,
      [mobile, otp, role, name, expiresAt, now]
    );
  } catch (dbErr) {
    console.warn('[customerDbService] Supabase write failed, falling back to local memory store:', dbErr.message);
  }

  // Always keep in sync with in-memory store for instant zero-latency lookup
  const store = getStore();
  if (!store.otpSessions) store.otpSessions = {};
  store.otpSessions[mobile] = {
    mobile,
    role,
    name: name || store.otpSessions[mobile]?.name || '',
    otp,
    attempts: 0,
    resendCount: (store.otpSessions[mobile]?.resendCount || 0) + 1,
    lastSentAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
  saveStore(store);

  return { expiresAt, cooldownSeconds: RESEND_COOLDOWN_MS / 1000 };
}

/**
 * Verify OTP from Supabase PostgreSQL (and backup store)
 */
async function verifyOtpSession({ mobile, otp, role = 'customer' }) {
  let session = null;

  try {
    const res = await query('SELECT * FROM otp_sessions WHERE mobile = $1;', [mobile]);
    if (res.rows.length > 0) {
      session = res.rows[0];
    }
  } catch (err) {
    console.warn('[customerDbService] Could not query otp_sessions table:', err.message);
  }

  if (!session) {
    const store = getStore();
    session = store.otpSessions?.[mobile];
  }

  if (!session) {
    throw new Error('No active OTP request found for this mobile number. Please click "Send OTP".');
  }

  const attempts = session.attempts || 0;
  if (attempts >= MAX_ATTEMPTS) {
    // Delete session on max attempts
    try {
      await query('DELETE FROM otp_sessions WHERE mobile = $1;', [mobile]);
    } catch (e) {}
    const store = getStore();
    delete store.otpSessions[mobile];
    saveStore(store);
    throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
  }

  const expiresAt = new Date(session.expires_at || session.expiresAt).getTime();
  if (Date.now() > expiresAt) {
    try {
      await query('DELETE FROM otp_sessions WHERE mobile = $1;', [mobile]);
    } catch (e) {}
    const store = getStore();
    delete store.otpSessions[mobile];
    saveStore(store);
    throw new Error('OTP has expired. Please click "Resend OTP" to receive a new code.');
  }

  const storedOtp = session.otp_code || session.otp;
  if (storedOtp !== String(otp).trim()) {
    const remaining = MAX_ATTEMPTS - (attempts + 1);
    // Increment attempts
    try {
      await query('UPDATE otp_sessions SET attempts = attempts + 1 WHERE mobile = $1;', [mobile]);
    } catch (e) {}
    const store = getStore();
    if (store.otpSessions[mobile]) {
      store.otpSessions[mobile].attempts = (store.otpSessions[mobile].attempts || 0) + 1;
      saveStore(store);
    }

    if (remaining <= 0) {
      throw new Error('Incorrect OTP. Maximum attempts reached. Please request a new OTP.');
    }
    throw new Error(`Incorrect OTP. ${remaining} attempt(s) remaining.`);
  }

  // Verified! Delete the OTP session
  try {
    await query('DELETE FROM otp_sessions WHERE mobile = $1;', [mobile]);
  } catch (e) {}
  const store = getStore();
  delete store.otpSessions[mobile];
  saveStore(store);

  return { verified: true, session };
}

/**
 * Fetch or auto-create customer in Supabase PostgreSQL & store
 */
async function getOrCreateCustomer({ mobile, name, address }) {
  const cleanMobile = String(mobile).trim();
  let customer = null;

  // 1. Try Supabase PostgreSQL first
  try {
    const res = await query('SELECT * FROM customers WHERE mobile = $1;', [cleanMobile]);
    if (res.rows.length > 0) {
      const row = res.rows[0];
      customer = {
        id: row.id,
        role: 'customer',
        name: row.name,
        mobile: row.mobile,
        email: row.email,
        avatar: row.avatar,
        address: row.address,
        addresses: Array.isArray(row.addresses) ? row.addresses : (typeof row.addresses === 'string' ? JSON.parse(row.addresses) : []),
        notifications: Array.isArray(row.notifications) ? row.notifications : (typeof row.notifications === 'string' ? JSON.parse(row.notifications) : []),
        createdAt: row.created_at
      };
    }
  } catch (dbErr) {
    console.warn('[customerDbService] Error reading customer from Supabase:', dbErr.message);
  }

  // Check store if not found in db
  const store = getStore();
  if (!customer) {
    customer = store.users.customers.find((c) => c.mobile === cleanMobile);
  }

  // If customer doesn't exist, create dynamically
  if (!customer) {
    const newCustId = `CUST-${cleanMobile.slice(-4)}-${Date.now().toString().slice(-4)}`;
    const custName = name?.trim() || `Customer (${cleanMobile.slice(-4)})`;
    const defaultAddr = address?.trim() || 'Flat 402, Green Valley Residency, Madhapur, Hyderabad';

    customer = {
      id: newCustId,
      role: 'customer',
      name: custName,
      mobile: cleanMobile,
      email: `customer.${cleanMobile.slice(-4)}@plumbmart.in`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
      address: defaultAddr,
      addresses: [
        {
          id: `ADDR-${Date.now()}`,
          label: 'Primary Delivery Address',
          addressLine: defaultAddr,
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500081',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString(),
      notifications: [
        {
          id: `NOTIF-CUST-${Date.now()}`,
          type: 'GENERAL',
          title: 'Welcome to PlumbMart!',
          message: 'Your account is ready. Browse high quality CPVC pipes & plumbing fittings.',
          time: 'Just now',
          read: false
        }
      ]
    };

    // Save to Supabase
    try {
      await query(
        `INSERT INTO customers (id, name, mobile, email, avatar, address, addresses, notifications)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (mobile) DO UPDATE SET
           name = EXCLUDED.name,
           updated_at = NOW();`,
        [
          customer.id,
          customer.name,
          customer.mobile,
          customer.email,
          customer.avatar,
          customer.address,
          JSON.stringify(customer.addresses),
          JSON.stringify(customer.notifications)
        ]
      );
      console.log(`[customerDbService] Saved new customer ${customer.id} (+91 ${cleanMobile}) to Supabase PostgreSQL.`);
    } catch (saveDbErr) {
      console.warn('[customerDbService] Failed writing customer to Supabase:', saveDbErr.message);
    }
  }

  // Sync to store customers array
  const existingIdx = store.users.customers.findIndex((c) => c.mobile === cleanMobile);
  if (existingIdx >= 0) {
    store.users.customers[existingIdx] = customer;
  } else {
    store.users.customers.push(customer);
  }
  if (!store.customerCarts) store.customerCarts = {};
  if (!store.customerCarts[customer.id]) store.customerCarts[customer.id] = [];
  saveStore(store);

  return customer;
}

module.exports = {
  saveOtpSession,
  verifyOtpSession,
  getOrCreateCustomer
};
