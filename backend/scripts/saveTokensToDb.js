const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    const tokensPath = path.join(__dirname, '..', 'data', 'zoho_tokens.json');
    if (fs.existsSync(tokensPath)) {
      const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf-8'));
      await pool.query(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES ('zoho_tokens', $1, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `, [JSON.stringify(tokens)]);
      console.log('Successfully saved Zoho tokens to Supabase system_settings!');
    } else {
      console.log('No local zoho_tokens.json found.');
    }
  } catch (err) {
    console.error('Error saving tokens to DB:', err);
  } finally {
    await pool.end();
  }
}

run();
