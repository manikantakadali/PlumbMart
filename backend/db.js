const { Pool } = require('pg');

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  pool.on('error', (err) => {
    console.error('Unexpected Supabase PostgreSQL client error:', err.message);
  });
}

const query = async (text, params) => {
  if (!pool) {
    throw new Error('Database connection pool is not configured.');
  }
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  return res;
};

const checkConnection = async () => {
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
};

module.exports = {
  pool,
  query,
  checkConnection
};
