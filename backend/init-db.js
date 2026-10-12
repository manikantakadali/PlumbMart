require('dotenv').config();
const { query, pool } = require('./db');
const { getStore } = require('./store');

async function initDatabase() {
  console.log('[Supabase Init] Starting database schema initialization...');

  try {
    // 1. Create customers table
    await query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(255),
        avatar TEXT,
        address TEXT,
        addresses JSONB DEFAULT '[]'::jsonb,
        notifications JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Supabase Init] Table "customers" verified/created.');

    // 2. Create otp_sessions table for backend OTP verification & rate limiting
    await query(`
      CREATE TABLE IF NOT EXISTS otp_sessions (
        mobile VARCHAR(15) PRIMARY KEY,
        otp_code VARCHAR(6) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'customer',
        name VARCHAR(255),
        attempts INT NOT NULL DEFAULT 0,
        resend_count INT NOT NULL DEFAULT 0,
        expires_at TIMESTAMPTZ NOT NULL,
        last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // 3. Create plumbers table
    await query(`
      CREATE TABLE IF NOT EXISTS plumbers (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        email VARCHAR(255),
        avatar TEXT,
        license_no VARCHAR(100),
        verification_status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
        status VARCHAR(20) DEFAULT 'ACTIVE',
        experience_years INT DEFAULT 0,
        specialization TEXT,
        skills JSONB DEFAULT '[]'::jsonb,
        service_area TEXT,
        address TEXT,
        rating NUMERIC(2,1) DEFAULT 5.0,
        completed_jobs INT DEFAULT 0,
        reward_points INT DEFAULT 0,
        wallet_balance INT DEFAULT 0,
        city VARCHAR(100),
        settings JSONB DEFAULT '{}'::jsonb,
        notifications JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Supabase Init] Table "plumbers" verified/created.');

    // 4. Create plumber_activities table
    await query(`
      CREATE TABLE IF NOT EXISTS plumber_activities (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50),
        assigned_plumber_id VARCHAR(50) NOT NULL,
        customer_name VARCHAR(255),
        customer_mobile VARCHAR(15),
        location TEXT,
        required_work TEXT,
        required_products JSONB DEFAULT '[]'::jsonb,
        scheduled_date VARCHAR(50),
        scheduled_time VARCHAR(50),
        instructions TEXT,
        status VARCHAR(50) DEFAULT 'ASSIGNED',
        remarks TEXT,
        completed_date TIMESTAMPTZ,
        reward_points_earned INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Supabase Init] Table "plumber_activities" verified/created.');

    // 5. Create plumber_product_requests table
    await query(`
      CREATE TABLE IF NOT EXISTS plumber_product_requests (
        id VARCHAR(50) PRIMARY KEY,
        plumber_id VARCHAR(50) NOT NULL,
        product_id VARCHAR(50) NOT NULL,
        product_name VARCHAR(255),
        sku VARCHAR(100),
        category_name VARCHAR(100),
        quantity INT NOT NULL,
        reason TEXT NOT NULL,
        activity_id VARCHAR(50),
        remarks TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        admin_notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('[Supabase Init] Table "plumber_product_requests" verified/created.');

    // 6. Populate existing demo customers from store if customers table is empty
    const { rows } = await query('SELECT COUNT(*) as count FROM customers;');
    if (parseInt(rows[0].count, 10) === 0) {
      const store = getStore();
      const existingCustomers = store.users?.customers || [];
      for (const cust of existingCustomers) {
        await query(
          `INSERT INTO customers (id, name, mobile, email, avatar, address, addresses, notifications)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (mobile) DO NOTHING;`,
          [
            cust.id,
            cust.name,
            cust.mobile,
            cust.email,
            cust.avatar,
            cust.address,
            JSON.stringify(cust.addresses || []),
            JSON.stringify(cust.notifications || [])
          ]
        );
      }
      console.log(`[Supabase Init] Seeded ${existingCustomers.length} initial customers into Supabase.`);
    } else {
      console.log(`[Supabase Init] "customers" table already has ${rows[0].count} records.`);
    }

    console.log('[Supabase Init] Database schema initialization completed successfully.');
  } catch (err) {
    console.error('[Supabase Init] Schema initialization error:', err.message);
    throw err;
  }
}

if (require.main === module) {
  initDatabase().then(() => pool.end()).catch(() => process.exit(1));
}

module.exports = { initDatabase };
