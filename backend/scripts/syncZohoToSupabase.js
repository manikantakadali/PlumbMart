const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getSyncedZohoProducts } = require('../zohoService');
const { query } = require('../db');

async function sync() {
  console.log('Fetching live items from Zoho Inventory...');
  const products = await getSyncedZohoProducts(true);
  console.log(`Fetched ${products.length} products from Zoho. Upserting into Supabase...`);

  let successCount = 0;
  for (const p of products) {
    try {
      await query(
        `INSERT INTO products (
          id, sku, name, description, category, brand, price, mrp, dealer_price,
          stock_quantity, stock, unit, currency, image, rating, reviews, tag,
          is_available, zoho_workbook, specs, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
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
      successCount++;
    } catch (err) {
      console.warn(`Error upserting ${p.sku || p.id}:`, err.message);
    }
  }

  console.log(`Successfully upserted ${successCount}/${products.length} products to Supabase.`);
  const res = await query('SELECT count(*) FROM products');
  console.log('Total products currently in Supabase:', res.rows[0].count);
}

sync().then(() => process.exit(0)).catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
