const fs = require('fs');
const path = require('path');
const { getWaterTankSVG, getDrainageSVG } = require('./plumbingSVGFactory');
const zoho = require('../zohoService');

const feProductsDir = path.join(__dirname, '../../frontend/public/products');
const beProductsDir = path.join(__dirname, '../public/products');

if (!fs.existsSync(feProductsDir)) fs.mkdirSync(feProductsDir, { recursive: true });
if (!fs.existsSync(beProductsDir)) fs.mkdirSync(beProductsDir, { recursive: true });

async function run() {
  console.log('Fetching synced products...');
  const products = await zoho.getSyncedZohoProducts();

  const tanks = products.filter(p => p.sku.startsWith('PLB-WS-'));
  const drains = products.filter(p => p.sku.startsWith('PLB-DS-'));

  console.log(`Found ${tanks.length} Water Tank items and ${drains.length} Drainage items.`);

  let tanksWritten = 0;
  for (const item of tanks) {
    const svg = getWaterTankSVG(item.name, item.sku);
    const filename = `${item.sku}.svg`;
    fs.writeFileSync(path.join(feProductsDir, filename), svg, 'utf8');
    fs.writeFileSync(path.join(beProductsDir, filename), svg, 'utf8');
    tanksWritten++;
  }

  let drainsWritten = 0;
  for (const item of drains) {
    const svg = getDrainageSVG(item.name, item.sku);
    const filename = `${item.sku}.svg`;
    fs.writeFileSync(path.join(feProductsDir, filename), svg, 'utf8');
    fs.writeFileSync(path.join(beProductsDir, filename), svg, 'utf8');
    drainsWritten++;
  }

  console.log(`Successfully generated and saved ${tanksWritten} tank SVGs and ${drainsWritten} drain SVGs to:`);
  console.log('  -', feProductsDir);
  console.log('  -', beProductsDir);
}

run().catch(err => {
  console.error('Error generating SVGs:', err);
  process.exit(1);
});
