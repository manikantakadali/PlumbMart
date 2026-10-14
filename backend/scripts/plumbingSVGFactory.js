const fs = require('fs');
const path = require('path');

const feDir = path.join(__dirname, '../../frontend/public/products');
const beDir = path.join(__dirname, '../public/products');

if (!fs.existsSync(feDir)) fs.mkdirSync(feDir, { recursive: true });
if (!fs.existsSync(beDir)) fs.mkdirSync(beDir, { recursive: true });

function getWaterTankSVG(name, sku) {
  const lower = name.toLowerCase();
  const isBlack = lower.includes('black');
  const isWhite = lower.includes('white');
  const isFourLayer = lower.includes('four layer') || lower.includes('4 layer') || lower.includes('triple layer');
  const isLoft = lower.includes('loft');
  const isLid = lower.includes('lid') || lower.includes('cover');
  const isStand = lower.includes('stand') || lower.includes('platform');
  const isValve = lower.includes('valve') || lower.includes('cock') || lower.includes('connector') || lower.includes('adapter');
  const isAlarm = lower.includes('alarm') || lower.includes('level') || lower.includes('indicator');
  const isAccessory = lower.includes('brush') || lower.includes('disinfectant') || lower.includes('patch') || lower.includes('insulation') || lower.includes('cleaning');
  const isRain = lower.includes('rainwater');

  const capacityMatch = name.match(/(\d+)\s*(litre|l)/i);
  const capacity = capacityMatch ? `${capacityMatch[1]}L` : '1000L';

  // 1. Steel Stand / Base Platform
  if (isStand) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#64748b"/><stop offset="50%" stop-color="#475569"/><stop offset="100%" stop-color="#334155"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="510" rx="190" ry="25" fill="#000" opacity="0.12"/>
  <ellipse cx="300" cy="220" rx="170" ry="40" fill="none" stroke="url(#steel)" stroke-width="22"/>
  <ellipse cx="300" cy="220" rx="130" ry="30" fill="none" stroke="#94a3b8" stroke-width="8"/>
  <line x1="170" y1="220" x2="430" y2="220" stroke="url(#steel)" stroke-width="14"/>
  <line x1="300" y1="180" x2="300" y2="260" stroke="url(#steel)" stroke-width="14"/>
  <rect x="150" y="220" width="22" height="260" rx="6" fill="url(#steel)"/>
  <rect x="428" y="220" width="22" height="260" rx="6" fill="url(#steel)"/>
  <rect x="235" y="240" width="20" height="240" rx="6" fill="#475569"/>
  <rect x="345" y="240" width="20" height="240" rx="6" fill="#475569"/>
  <line x1="160" y1="330" x2="440" y2="430" stroke="#64748b" stroke-width="10"/>
  <line x1="160" y1="430" x2="440" y2="330" stroke="#64748b" stroke-width="10"/>
  <ellipse cx="161" cy="480" rx="20" ry="8" fill="#1e293b"/>
  <ellipse cx="439" cy="480" rx="20" ry="8" fill="#1e293b"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">GALVANIZED STEEL</text>
  <text x="300" y="555" fill="#1e293b" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 2. Tank Lid / Cover
  if (isLid) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#f1f5f9"/></linearGradient>
    <radialGradient id="lidGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="70%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="400" rx="200" ry="60" fill="#000" opacity="0.15"/>
  <ellipse cx="300" cy="300" rx="200" ry="120" fill="url(#lidGrad)"/>
  <ellipse cx="300" cy="295" rx="175" ry="100" fill="#0f172a"/>
  <ellipse cx="300" cy="290" rx="140" ry="80" fill="none" stroke="#475569" stroke-width="12"/>
  <ellipse cx="300" cy="285" rx="90" ry="50" fill="none" stroke="#64748b" stroke-width="8"/>
  <rect x="250" y="260" width="100" height="35" rx="12" fill="#38bdf8"/>
  <rect x="265" y="270" width="70" height="15" rx="6" fill="#0369a1"/>
  <text x="300" y="540" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#059669"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">THREADED AIR-TIGHT</text>
</svg>`;
  }

  // 3. Tank Valves / Ball Cock / Float Valve / Connectors
  if (isValve) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="50%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#854d0e"/></linearGradient>
    <radialGradient id="floatBall" cx="40%" cy="40%" r="60%"><stop offset="0%" stop-color="#fdba74"/><stop offset="60%" stop-color="#ea580c"/><stop offset="100%" stop-color="#9a3412"/></radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="500" rx="160" ry="20" fill="#000" opacity="0.12"/>
  <rect x="140" y="270" width="150" height="65" rx="10" fill="url(#brass)"/>
  <rect x="115" y="260" width="35" height="85" rx="6" fill="#a16207"/>
  <rect x="280" y="280" width="50" height="45" rx="6" fill="#a16207"/>
  <line x1="280" y1="280" x2="420" y2="200" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
  <circle cx="430" cy="190" r="65" fill="url(#floatBall)"/>
  <text x="300" y="540" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#d97706"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SOLID BRASS FITTING</text>
</svg>`;
  }

  // 4. Digital Water Level Alarm / Indicator
  if (isAlarm) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="160" ry="24" fill="#000" opacity="0.14"/>
  <!-- Device Enclosure -->
  <rect x="160" y="140" width="280" height="330" rx="24" fill="url(#panel)" stroke="#38bdf8" stroke-width="5"/>
  <!-- LED Display Screen -->
  <rect x="200" y="180" width="200" height="110" rx="14" fill="#020617" stroke="#1e293b" stroke-width="3"/>
  <text x="300" y="235" fill="#22c55e" font-family="monospace" font-size="34" font-weight="900" text-anchor="middle">85% FULL</text>
  <text x="300" y="265" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">DIGITAL MONITOR</text>
  <!-- Indicator Lights -->
  <circle cx="230" cy="340" r="14" fill="#22c55e"/>
  <circle cx="300" cy="340" r="14" fill="#eab308"/>
  <circle cx="370" cy="340" r="14" fill="#ef4444"/>
  <!-- Buzzer Speaker Grille -->
  <circle cx="300" cy="410" r="28" fill="none" stroke="#64748b" stroke-width="4"/>
  <circle cx="300" cy="410" r="16" fill="none" stroke="#64748b" stroke-width="3"/>
  <circle cx="300" cy="410" r="5" fill="#38bdf8"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SMART SENSOR TECH</text>
  <text x="300" y="550" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 5. Cleaning & Maintenance Accessories
  if (isAccessory) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="bottle" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0284c7"/><stop offset="50%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0369a1"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="160" ry="24" fill="#000" opacity="0.14"/>
  <!-- Bottle or Kit Body -->
  <rect x="220" y="190" width="160" height="280" rx="24" fill="url(#bottle)"/>
  <rect x="260" y="120" width="80" height="70" rx="8" fill="#1e293b"/>
  <!-- Label -->
  <rect x="235" y="260" width="130" height="140" rx="10" fill="#ffffff"/>
  <text x="300" y="310" fill="#0284c7" font-family="sans-serif" font-size="16" font-weight="900" text-anchor="middle">AquaClean</text>
  <text x="300" y="340" fill="#334155" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">TANK FORMULA</text>
  <text x="300" y="370" fill="#059669" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ANTI-BACTERIAL</text>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#059669"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MAINTENANCE GRADE</text>
  <text x="300" y="550" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 6. Loft Water Tank
  if (isLoft) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="loftGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="460" rx="200" ry="25" fill="#000" opacity="0.14"/>
  <rect x="120" y="240" width="360" height="190" rx="24" fill="url(#loftGrad)" stroke="#64748b" stroke-width="6"/>
  <line x1="120" y1="290" x2="480" y2="290" stroke="#475569" stroke-width="4"/>
  <line x1="120" y1="340" x2="480" y2="340" stroke="#475569" stroke-width="4"/>
  <line x1="120" y1="390" x2="480" y2="390" stroke="#475569" stroke-width="4"/>
  <ellipse cx="300" cy="240" rx="65" ry="22" fill="#0284c7" stroke="#0369a1" stroke-width="6"/>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#0284c7"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LOFT COMPACT DESIGN</text>
  <text x="300" y="335" fill="#0f172a" font-family="sans-serif" font-size="28" font-weight="900" text-anchor="middle">${capacity}</text>
  <text x="300" y="540" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 7. Cylindrical Storage Tanks (Black, White, 4-Layer, Triple Layer, Rainwater, Virgin Plastic)
  let primaryColor1 = '#1e293b';
  let primaryColor2 = '#0f172a';
  let ribColor = '#334155';
  let badgeText = 'HEAVY DUTY 100% VIRGIN';
  let badgeBg = '#0284c7';

  if (isBlack) {
    primaryColor1 = '#1e293b';
    primaryColor2 = '#020617';
    ribColor = '#475569';
    badgeText = 'UV STABILIZED BLACK';
    badgeBg = '#0f172a';
  } else if (isWhite || isFourLayer) {
    primaryColor1 = '#f8fafc';
    primaryColor2 = '#cbd5e1';
    ribColor = '#94a3b8';
    badgeText = '4-LAYER THERMAL SHIELD';
    badgeBg = '#059669';
  } else if (isRain) {
    primaryColor1 = '#15803d';
    primaryColor2 = '#14532d';
    ribColor = '#166534';
    badgeText = 'RAINWATER HARVESTING';
    badgeBg = '#15803d';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="tankBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${primaryColor2}"/>
      <stop offset="25%" stop-color="${primaryColor1}"/>
      <stop offset="70%" stop-color="${primaryColor1}"/>
      <stop offset="100%" stop-color="${primaryColor2}"/>
    </linearGradient>
    <linearGradient id="tankDome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${primaryColor1}"/>
      <stop offset="100%" stop-color="${primaryColor2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  
  <ellipse cx="300" cy="510" rx="190" ry="30" fill="#000" opacity="0.18"/>

  <!-- Cylindrical Tank Body -->
  <path d="M 150 200 L 150 480 A 150 40 0 0 0 450 480 L 450 200 Z" fill="url(#tankBody)" stroke="${ribColor}" stroke-width="4"/>
  
  <!-- Tank Dome -->
  <ellipse cx="300" cy="200" rx="150" ry="40" fill="url(#tankDome)" stroke="${ribColor}" stroke-width="4"/>
  
  <!-- Horizontal Reinforcement Ribs -->
  <ellipse cx="300" cy="270" rx="150" ry="24" fill="none" stroke="${ribColor}" stroke-width="8"/>
  <ellipse cx="300" cy="340" rx="150" ry="24" fill="none" stroke="${ribColor}" stroke-width="8"/>
  <ellipse cx="300" cy="410" rx="150" ry="24" fill="none" stroke="${ribColor}" stroke-width="8"/>
  <ellipse cx="300" cy="480" rx="150" ry="24" fill="none" stroke="${ribColor}" stroke-width="8"/>

  <!-- Top Inspection Lid -->
  <ellipse cx="300" cy="180" rx="70" ry="20" fill="#0284c7" stroke="#0369a1" stroke-width="5"/>
  <ellipse cx="300" cy="177" rx="50" ry="14" fill="#38bdf8"/>

  <!-- Brass Inlet Fitting -->
  <rect x="135" y="240" width="20" height="24" rx="4" fill="#ca8a04"/>
  <!-- Brass Outlet Fitting -->
  <rect x="445" y="450" width="20" height="24" rx="4" fill="#ca8a04"/>

  <!-- Brand & Capacity Stamp -->
  <rect x="235" y="300" width="130" height="60" rx="12" fill="#000" opacity="0.25"/>
  <text x="300" y="325" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">AquaFlow</text>
  <text x="300" y="350" fill="#fff" font-family="sans-serif" font-size="22" font-weight="900" text-anchor="middle">${capacity}</text>

  <!-- Product Badge -->
  <rect x="30" y="30" width="190" height="32" rx="16" fill="${badgeBg}"/>
  <text x="125" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">${badgeText}</text>
  
  <text x="300" y="565" fill="#0f172a" font-family="sans-serif" font-size="17" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
}

function getDrainageSVG(name, sku) {
  const lower = name.toLowerCase();
  const isCockroach = lower.includes('cockroach') || lower.includes('floor trap') || lower.includes('jali') || lower.includes('odour trap');
  const isBottleTrap = lower.includes('bottle trap');
  const isLinear = lower.includes('linear') || lower.includes('drain channel');
  const isTrap = lower.includes('nahani') || lower.includes('p trap') || lower.includes('s trap') || lower.includes('gully');
  const isChamber = lower.includes('chamber') || lower.includes('manhole');
  const isCleanout = lower.includes('cleanout') || lower.includes('access cap') || lower.includes('plug');
  const isFitting = lower.includes('bend') || lower.includes('tee') || lower.includes('junction') || lower.includes('reducer');
  const isCowl = lower.includes('cowl') || lower.includes('shoe');
  const isClamp = lower.includes('clamp');
  const isGasket = lower.includes('gasket');
  const isHose = lower.includes('hose') || lower.includes('flexible waste pipe');
  const isGrating = lower.includes('grating') || lower.includes('floor drain');
  const isSinkCoupling = lower.includes('sink waste coupling') || lower.includes('coupling');
  const isPipe = lower.includes('pipe') || lower.includes('swr') || lower.includes('downpipe');

  // 1. Anti-Cockroach Floor Trap / Laser Floor Jali
  if (isCockroach) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#cbd5e1"/>
      <stop offset="65%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="190" ry="30" fill="#000" opacity="0.15"/>
  <rect x="140" y="150" width="320" height="320" rx="20" fill="url(#chrome)" stroke="#475569" stroke-width="6"/>
  <rect x="165" y="175" width="270" height="270" rx="12" fill="#1e293b"/>
  <circle cx="300" cy="310" r="120" fill="url(#chrome)"/>
  <circle cx="300" cy="310" r="105" fill="#334155"/>
  <circle cx="300" cy="310" r="85" fill="url(#chrome)"/>
  <circle cx="300" cy="310" r="65" fill="#1e293b"/>
  <circle cx="300" cy="310" r="40" fill="url(#chrome)"/>
  <circle cx="300" cy="310" r="18" fill="#0f172a"/>
  <rect x="294" y="210" width="12" height="40" rx="6" fill="#0f172a"/>
  <rect x="294" y="370" width="12" height="40" rx="6" fill="#0f172a"/>
  <rect x="200" y="304" width="40" height="12" rx="6" fill="#0f172a"/>
  <rect x="360" y="304" width="40" height="12" rx="6" fill="#0f172a"/>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#0284c7"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SS-304 GRADE</text>
  <rect x="430" y="30" width="140" height="32" rx="16" fill="#059669"/>
  <text x="500" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">ANTI-COCKROACH</text>
  <text x="300" y="550" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 2. Bottle Trap for Basin
  if (isBottleTrap) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="25%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="270" cy="510" rx="140" ry="22" fill="#000" opacity="0.12"/>
  <rect x="235" y="100" width="50" height="190" fill="url(#chrome)" stroke="#64748b" stroke-width="2"/>
  <ellipse cx="260" cy="100" rx="28" ry="8" fill="#cbd5e1"/>
  <rect x="210" y="270" width="100" height="170" rx="16" fill="url(#chrome)" stroke="#475569" stroke-width="3"/>
  <ellipse cx="260" cy="440" rx="50" ry="16" fill="url(#chrome)"/>
  <circle cx="260" cy="440" r="18" fill="#475569"/>
  <rect x="305" y="300" width="160" height="42" rx="4" fill="url(#chrome)" stroke="#64748b" stroke-width="2"/>
  <ellipse cx="465" cy="321" rx="14" ry="38" fill="url(#chrome)" stroke="#475569" stroke-width="2"/>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#0284c7"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SOLID BRASS</text>
  <rect x="430" y="30" width="140" height="32" rx="16" fill="#059669"/>
  <text x="500" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CHROME MIRROR</text>
  <text x="300" y="555" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 3. Linear Shower Drain / Channel
  if (isLinear) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="ss304" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="460" rx="220" ry="25" fill="#000" opacity="0.14"/>
  <rect x="80" y="240" width="440" height="120" rx="16" fill="url(#ss304)" stroke="#64748b" stroke-width="4"/>
  <rect x="95" y="255" width="410" height="90" rx="8" fill="#1e293b"/>
  <g fill="url(#ss304)">
    ${Array.from({length: 18}).map((_, i) => `<rect x="${110 + i * 21}" y="265" width="12" height="70" rx="4"/>`).join('')}
  </g>
  <rect x="275" y="360" width="50" height="60" rx="6" fill="#64748b"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LINEAR TRENCH DRAIN</text>
  <text x="300" y="540" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 4. Nahani Trap / P Trap / S Trap / Gully Trap
  if (isTrap) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="pvc" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#94a3b8"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="160" ry="24" fill="#000" opacity="0.14"/>
  <path d="M 170 180 L 170 330 C 170 420 280 420 280 330 L 280 270 C 280 220 370 220 370 270 L 370 380 C 370 410 440 410 440 380 L 440 240" fill="none" stroke="url(#pvc)" stroke-width="55" stroke-linecap="round"/>
  <circle cx="225" cy="385" r="22" fill="#0284c7"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">WATER SEAL TRAP</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 5. Inspection Chamber / Manhole Cover
  if (isChamber) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="ci" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#334155"/><stop offset="100%" stop-color="#0f172a"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="470" rx="190" ry="30" fill="#000" opacity="0.16"/>
  <circle cx="300" cy="300" r="170" fill="url(#ci)" stroke="#64748b" stroke-width="8"/>
  <circle cx="300" cy="300" r="140" fill="none" stroke="#64748b" stroke-width="6"/>
  <g stroke="#475569" stroke-width="3">
    ${Array.from({length: 8}).map((_, i) => `<line x1="${180 + i * 35}" y1="180" x2="${180 + i * 35}" y2="420"/>`).join('')}
    ${Array.from({length: 8}).map((_, i) => `<line x1="180" y1="${180 + i * 35}" x2="420" y2="${180 + i * 35}"/>`).join('')}
  </g>
  <circle cx="300" cy="300" r="30" fill="#0284c7"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">DRAINAGE CHAMBER</text>
  <text x="300" y="540" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 6. Floor Cleanout Plug / Access Cap
  if (isCleanout) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fef08a"/><stop offset="50%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#854d0e"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="480" rx="170" ry="24" fill="#000" opacity="0.14"/>
  <circle cx="300" cy="300" r="150" fill="url(#brass)" stroke="#713f12" stroke-width="6"/>
  <circle cx="300" cy="300" r="120" fill="#a16207"/>
  <!-- Threaded Hex Head -->
  <polygon points="300,210 380,255 380,345 300,390 220,345 220,255" fill="#eab308" stroke="#854d0e" stroke-width="4"/>
  <circle cx="300" cy="300" r="30" fill="#ca8a04"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#ca8a04"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CLEANOUT PLUG</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 7. SWR Fittings (Bend, Tee, Y Junction, Reducer)
  if (isFitting) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="fitting" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e2e8f0"/><stop offset="50%" stop-color="#94a3b8"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="160" ry="24" fill="#000" opacity="0.14"/>
  <!-- Tee / Bend Shape -->
  <path d="M 230 140 L 230 240 L 140 240 A 10 10 0 0 0 140 360 L 230 360 L 230 460 A 10 10 0 0 0 370 460 L 370 360 L 460 360 A 10 10 0 0 0 460 240 L 370 240 L 370 140 Z" fill="url(#fitting)" stroke="#475569" stroke-width="4"/>
  <!-- Socket Collar Rings -->
  <rect x="220" y="140" width="160" height="24" rx="6" fill="#334155"/>
  <rect x="130" y="240" width="24" height="120" rx="6" fill="#334155"/>
  <rect x="446" y="240" width="24" height="120" rx="6" fill="#334155"/>
  <rect x="220" y="440" width="160" height="24" rx="6" fill="#334155"/>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#0284c7"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SWR FITTING</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 8. PVC Vent Cowl / Downpipe Shoe
  if (isCowl) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="cowlGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="150" ry="22" fill="#000" opacity="0.14"/>
  <!-- Cowl Dome -->
  <ellipse cx="300" cy="220" rx="160" ry="80" fill="url(#cowlGrad)" stroke="#475569" stroke-width="4"/>
  <!-- Louvered Slots -->
  <g fill="#1e293b">
    <rect x="200" y="270" width="200" height="15" rx="6"/>
    <rect x="220" y="300" width="160" height="15" rx="6"/>
    <rect x="240" y="330" width="120" height="15" rx="6"/>
  </g>
  <!-- Base Pipe -->
  <rect x="250" y="360" width="100" height="110" rx="8" fill="url(#cowlGrad)" stroke="#475569" stroke-width="4"/>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#0284c7"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">PVC VENT COWL</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 9. Washing Machine Drain Hose / Flexible Waste Pipe
  if (isHose) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="hoseGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="160" ry="24" fill="#000" opacity="0.14"/>
  <!-- Corrugated Hose Coil -->
  <path d="M 150 180 Q 200 130 300 200 T 450 250 Q 480 340 380 400 T 200 420" fill="none" stroke="url(#hoseGrad)" stroke-width="48" stroke-linecap="round" stroke-dasharray="12 6"/>
  <rect x="120" y="150" width="50" height="60" rx="8" fill="#1e293b"/>
  <rect x="180" y="400" width="50" height="50" rx="8" fill="#1e293b"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CORRUGATED HOSE</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 10. Floor Grating / SS Floor Drain / Sink Coupling
  if (isGrating || isSinkCoupling) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="ssGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="480" rx="170" ry="24" fill="#000" opacity="0.14"/>
  <circle cx="300" cy="300" r="160" fill="url(#ssGrad)" stroke="#475569" stroke-width="6"/>
  <circle cx="300" cy="300" r="130" fill="#1e293b"/>
  <!-- Concentric Grate Perforations -->
  <g fill="url(#ssGrad)">
    ${Array.from({length: 12}).map((_, i) => {
      const angle = (i * 30) * Math.PI / 180;
      const x = 300 + 80 * Math.cos(angle);
      const y = 300 + 80 * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12"/>`;
    }).join('')}
    ${Array.from({length: 6}).map((_, i) => {
      const angle = (i * 60) * Math.PI / 180;
      const x = 300 + 40 * Math.cos(angle);
      const y = 300 + 40 * Math.sin(angle);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9"/>`;
    }).join('')}
    <circle cx="300" cy="300" r="10"/>
  </g>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">STAINLESS STEEL</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 11. PVC Pipe Clamp / Rubber Gasket
  if (isClamp || isGasket) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="480" rx="160" ry="24" fill="#000" opacity="0.14"/>
  <!-- Clamp Horseshoe Arc -->
  <path d="M 170 330 A 130 130 0 1 1 430 330" fill="none" stroke="#475569" stroke-width="32" stroke-linecap="round"/>
  <!-- Screw Mount Tabs -->
  <rect x="130" y="320" width="60" height="30" rx="8" fill="#334155"/>
  <circle cx="150" cy="335" r="7" fill="#fff"/>
  <rect x="410" y="320" width="60" height="30" rx="8" fill="#334155"/>
  <circle cx="450" cy="335" r="7" fill="#fff"/>
  <rect x="30" y="30" width="150" height="32" rx="16" fill="#0284c7"/>
  <text x="105" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">HEAVY PIPE CLAMP</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
  }

  // 12. PVC Drain / Soil / SWR Pipe
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient>
    <linearGradient id="swrPipe" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f1f5f9"/><stop offset="50%" stop-color="#cbd5e1"/><stop offset="100%" stop-color="#64748b"/></linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#bg)"/>
  <ellipse cx="300" cy="490" rx="180" ry="24" fill="#000" opacity="0.14"/>
  <!-- Pipe Length -->
  <rect x="130" y="240" width="340" height="110" rx="14" fill="url(#swrPipe)" stroke="#64748b" stroke-width="4"/>
  <!-- Socket End Collar -->
  <rect x="110" y="225" width="45" height="140" rx="8" fill="#475569"/>
  <!-- Rubber Ring Groove -->
  <rect x="140" y="235" width="10" height="120" rx="3" fill="#0f172a"/>
  <!-- Specification Stamp -->
  <text x="320" y="295" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold" opacity="0.6">SWR DRAINAGE PIPE • IS:13592 • RIGID PVC</text>
  <rect x="30" y="30" width="140" height="32" rx="16" fill="#0284c7"/>
  <text x="100" y="51" fill="#fff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SWR DRAIN PIPE</text>
  <text x="300" y="545" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">${name.toUpperCase()}</text>
</svg>`;
}

module.exports = {
  getWaterTankSVG,
  getDrainageSVG
};
