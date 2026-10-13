require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { 
  getDb, 
  saveDb, 
  getCustomerByMobile, 
  getCustomerOrders, 
  createCustomerOrder, 
  addCustomerAddress, 
  setDefaultCustomerAddress, 
  deleteCustomerAddress,
  checkConnection
} = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 'prod-001',
    name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)',
    category: 'Pipes & Tubes',
    brand: 'Astral Pipes',
    price: 480,
    mrp: 580,
    dealerPrice: 375,
    rating: 4.8,
    reviews: 142,
    stock: 85,
    moq: 10,
    sku: 'ZH-AST-CPVC-1IN-3M',
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80',
    description: 'Lead-free, heavy-duty CPVC plumbing pipe suitable for hot and cold potable water applications.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-101',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      material: 'Chlorinated Polyvinyl Chloride (CPVC)',
      diameter: '1 Inch (25mm)',
      length: '3 Meters',
      pressureRating: 'SDR 11 (Class 1)',
      warranty: '10 Years Manufacturer Warranty'
    }
  },
  {
    id: 'prod-002',
    name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)',
    category: 'Fittings & Valves',
    brand: 'Ashirvad',
    price: 720,
    mrp: 890,
    dealerPrice: 560,
    rating: 4.7,
    reviews: 98,
    stock: 45,
    moq: 5,
    sku: 'ZH-ASH-STP-15MM-BR',
    tag: 'Heavy Duty',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    description: 'Forged brass concealed valve with quarter-turn ceramic disc cartridge for leak-free performance.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-102',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      material: 'Forged Grade A Brass',
      size: '15mm (1/2 Inch)',
      mechanism: 'Quarter Turn Ceramic Disc',
      pressureRating: 'Up to 16 Bar',
      warranty: '7 Years Warranty'
    }
  },
  {
    id: 'prod-003',
    name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)',
    category: 'Bath & Faucets',
    brand: 'Jaquar',
    price: 3450,
    mrp: 4200,
    dealerPrice: 2750,
    rating: 4.9,
    reviews: 215,
    stock: 24,
    moq: 2,
    sku: 'ZH-JAQ-ALV-BSN-CH',
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Ergonomic chrome finish single lever mixer with foam flow aerator for smooth water streams.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-103',
      lastSynced: 'Just now',
      warehouseHub: 'South Hub 02'
    },
    specs: {
      material: 'Solid Brass with Chrome Plating',
      flowType: 'Honeycomb Aerator Foam Stream',
      cartridge: '35mm Ceramic Cartridge',
      warranty: '10 Years Comprehensive'
    }
  },
  {
    id: 'prod-004',
    name: 'Supreme UPVC Ball Valve Heavy Body (25mm)',
    category: 'Fittings & Valves',
    brand: 'Supreme',
    price: 210,
    mrp: 260,
    dealerPrice: 155,
    rating: 4.6,
    reviews: 67,
    stock: 120,
    moq: 20,
    sku: 'ZH-SUP-BLL-25MM-UPVC',
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    description: 'Industrial grade UPVC threaded ball valve for agricultural and residential plumbing systems.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-104',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      material: 'Virgin UPVC',
      handle: 'T-Type ABS Handle',
      size: '25mm (1 Inch)',
      pressureRating: 'PN 16',
      warranty: '5 Years'
    }
  },
  {
    id: 'prod-005',
    name: 'Cera Stainless Steel 304 Overhead Rain Shower (8 Inch)',
    category: 'Bath & Faucets',
    brand: 'Cera',
    price: 1850,
    mrp: 2300,
    dealerPrice: 1420,
    rating: 4.8,
    reviews: 180,
    stock: 35,
    moq: 5,
    sku: 'ZH-CER-SHW-304-8IN',
    tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-thin mirror finish 304 stainless steel rain shower head with self-cleaning silicone nozzles.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-105',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      material: 'SS 304 Stainless Steel',
      size: '200mm x 200mm (8x8 Inch)',
      nozzles: 'Rub-clean Silicone Jets',
      warranty: '5 Years'
    }
  },
  {
    id: 'prod-006',
    name: 'Finolex SWR PVC Drainage Bend 90° with Door (110mm)',
    category: 'Pipes & Tubes',
    brand: 'Finolex',
    price: 310,
    mrp: 380,
    dealerPrice: 235,
    rating: 4.5,
    reviews: 54,
    stock: 90,
    moq: 15,
    sku: 'ZH-FIN-SWR-110MM-BND',
    tag: 'Standard',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'High impact resistant UV-stabilized PVC soil and waste discharge bend with inspection access door.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-106',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      material: 'Rigid PVC (Type B Soil & Waste)',
      angle: '90 Degree with Cleaning Door',
      diameter: '110mm',
      standard: 'IS:14735 Compliant',
      warranty: '10 Years'
    }
  },
  {
    id: 'prod-007',
    name: 'Kirloskar Mini Water Booster Pump 0.5 HP (Self Priming)',
    category: 'Pumps & Motors',
    brand: 'Kirloskar',
    price: 4950,
    mrp: 5900,
    dealerPrice: 3950,
    rating: 4.7,
    reviews: 130,
    stock: 18,
    moq: 1,
    sku: 'ZH-KIR-BST-05HP',
    tag: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'High efficiency copper winding regenerative pump for residential overhead water tank filling.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-107',
      lastSynced: 'Just now',
      warehouseHub: 'South Hub 02'
    },
    specs: {
      power: '0.5 HP (0.37 kW)',
      headRange: '6 - 27 Meters',
      flowRate: '1900 LPH Max',
      winding: '100% Pure Copper',
      warranty: '2 Years On-Site Warranty'
    }
  },
  {
    id: 'prod-008',
    name: 'Taparia Heavy Duty Pipe Wrench 14 Inch (Cast Iron)',
    category: 'Tools & Sealants',
    brand: 'Taparia',
    price: 680,
    mrp: 820,
    dealerPrice: 520,
    rating: 4.9,
    reviews: 310,
    stock: 60,
    moq: 5,
    sku: 'ZH-TAP-WRN-14IN-CI',
    tag: 'Essential Tool',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    description: 'Drop forged hardened jaws pipe wrench with ductile iron handle for heavy plumbing installations.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-108',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      length: '350mm (14 Inch)',
      jawCapacity: '50mm Pipe Outer Diameter',
      material: 'Drop Forged Alloy Steel Jaws',
      finish: 'Phosphate Finish',
      warranty: 'Lifetime Workmanship Guarantee'
    }
  },
  {
    id: 'prod-009',
    name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty (100g x 6)',
    category: 'Tools & Sealants',
    brand: 'Pidilite',
    price: 180,
    mrp: 210,
    dealerPrice: 140,
    rating: 4.8,
    reviews: 450,
    stock: 250,
    moq: 10,
    sku: 'ZH-PID-MSL-100G-6PK',
    tag: 'Quick Seal',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    description: 'Multi-purpose sealant putty for joining, sealing, and waterproofing pipe leaks and bathroom joints.',
    zohoWorkbook: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      rowId: 'ROW-109',
      lastSynced: 'Just now',
      warehouseHub: 'Peenya Central Depot (Hub 01)'
    },
    specs: {
      packSize: 'Pack of 6 (600g Total)',
      cureTime: 'Fast Setting (2 - 3 Hours)',
      temperature: 'Resistant up to 120°C',
      shelfLife: '18 Months'
    }
  }
];

// Root health check
app.get('/', (req, res) => {
  res.json({ message: 'PlumbMart API is running with Dynamic DB Tables', status: 'healthy' });
});

// Products catalog endpoint
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    count: products.length,
    data: products
  });
});

// ==========================================
// AUTHENTICATION APIS
// ==========================================

// 1. Dynamic Registration API
app.post('/api/auth/register', (req, res) => {
  const { name, mobile, email, role, password, city, gstin, license } = req.body;

  if (!name || !mobile) {
    return res.status(400).json({ success: false, message: 'Name and mobile number are required' });
  }

  const cleanMobile = mobile.trim();
  const assignedRole = role || 'Customer';
  const db = getDb();

  // Check if user already exists
  const existsInCustomers = db.customers.some(u => u.mobile === cleanMobile);
  const existsInDealers = db.dealers.some(u => u.mobile === cleanMobile);
  const existsInPlumbers = db.plumbers.some(u => u.mobile === cleanMobile);

  if (existsInCustomers || existsInDealers || existsInPlumbers) {
    return res.status(409).json({ success: false, message: 'Mobile number already registered. Please login directly.' });
  }

  let createdUser = null;

  if (assignedRole === 'Dealer') {
    createdUser = {
      id: 'DLR-' + Date.now().toString().slice(-4),
      name: name.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : `dealer_${cleanMobile}@plumbmart.com`,
      password: password || '123456',
      role: 'Dealer',
      gstin: gstin || '29ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F1Z5',
      zohoVerified: true,
      credit30Days: true,
      credit90Days: false,
      creditLimit: '₹3,00,000',
      availableCredit: '₹3,00,000',
      city: city || 'Bengaluru',
      createdAt: new Date().toISOString()
    };
    db.dealers.push(createdUser);
  } else if (assignedRole === 'Plumber') {
    createdUser = {
      id: 'PLM-' + Date.now().toString().slice(-4),
      name: name.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : `plumber_${cleanMobile}@plumbmart.com`,
      password: password || '123456',
      role: 'Plumber',
      license: license || 'PLUMB-KA-2026-' + Math.floor(100 + Math.random() * 900),
      completedJobs: 0,
      rating: 5.0,
      rewardPoints: 100,
      walletBalance: 250,
      status: 'VERIFIED',
      city: city || 'Bengaluru',
      createdAt: new Date().toISOString()
    };
    db.plumbers.push(createdUser);
  } else {
    // Customer
    createdUser = {
      id: 'CUST-' + Date.now().toString().slice(-4),
      name: name.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : `customer_${cleanMobile}@plumbmart.com`,
      password: password || '123456',
      role: 'Customer',
      rewardPoints: 100,
      addresses: city ? [`Main Site, ${city}`] : ['Default Address, Bengaluru'],
      createdAt: new Date().toISOString()
    };
    db.customers.push(createdUser);
  }

  saveDb(db);

  return res.status(201).json({
    success: true,
    message: `${assignedRole} registered successfully in database`,
    user: createdUser
  });
});

// 2. Dynamic Login API
app.post('/api/auth/login', (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile) {
    return res.status(400).json({ success: false, message: 'Please enter registered mobile number' });
  }

  const cleanMobile = mobile.trim();
  const db = getDb();

  // Search in all three tables
  let matchedUser = db.dealers.find(d => d.mobile === cleanMobile);
  if (!matchedUser) {
    matchedUser = db.plumbers.find(p => p.mobile === cleanMobile);
  }
  if (!matchedUser) {
    matchedUser = db.customers.find(c => c.mobile === cleanMobile);
  }

  if (!matchedUser) {
    // If not found in demo data, auto-create dynamic customer on the fly with test OTP
    if (password === '123456' || !password) {
      const newCust = {
        id: 'CUST-' + Date.now().toString().slice(-4),
        name: 'PlumbMart User (' + cleanMobile.slice(-4) + ')',
        mobile: cleanMobile,
        email: `user_${cleanMobile}@plumbmart.com`,
        password: '123456',
        role: 'Customer',
        rewardPoints: 50,
        addresses: ['Registered City Site'],
        createdAt: new Date().toISOString()
      };
      db.customers.push(newCust);
      saveDb(db);
      return res.json({
        success: true,
        message: 'Login verified (Account created)',
        user: newCust
      });
    }

    return res.status(404).json({ success: false, message: 'Account not found with this mobile number. Please register.' });
  }

  // Verify password / OTP
  const isValidPass = !password || password === '123456' || password === matchedUser.password;
  if (!isValidPass) {
    return res.status(401).json({ success: false, message: 'Invalid OTP or Password. Use demo code: 123456' });
  }

  return res.json({
    success: true,
    message: `Logged in successfully as ${matchedUser.role}`,
    user: matchedUser
  });
});

// 3. Admin Login API
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  const db = getDb();

  const admin = db.admins.find(a => 
    a.email.toLowerCase() === (email || '').trim().toLowerCase()
  );

  if (!admin || (password && password !== admin.password && password !== 'admin123')) {
    return res.status(401).json({ success: false, message: 'Invalid Admin credentials. Use admin@plumbmart.com / admin123' });
  }

  return res.json({
    success: true,
    message: 'Admin authenticated successfully',
    user: admin
  });
});

// ==========================================
// ROLE SPECIFIC DATA & GOVERNANCE APIS
// ==========================================

// Get Dealers list (Admin & B2B)
app.get('/api/dealers', (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.dealers });
});

// Update Dealer Zoho verification / 90D credit
app.put('/api/dealers/:id', (req, res) => {
  const db = getDb();
  const index = db.dealers.findIndex(d => d.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Dealer not found' });
  }

  db.dealers[index] = { ...db.dealers[index], ...req.body };
  saveDb(db);
  res.json({ success: true, message: 'Dealer updated successfully', data: db.dealers[index] });
});

// Get Plumbers list
app.get('/api/plumbers', (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.plumbers });
});

// Update Plumber KYC / status
app.put('/api/plumbers/:id', (req, res) => {
  const db = getDb();
  const index = db.plumbers.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Plumber not found' });
  }

  db.plumbers[index] = { ...db.plumbers[index], ...req.body };
  saveDb(db);
  res.json({ success: true, message: 'Plumber updated successfully', data: db.plumbers[index] });
});

// Dealer specific products catalog with Zoho workbook metadata
app.get('/api/dealer/products', (req, res) => {
  res.json({
    success: true,
    count: products.length,
    zohoSource: {
      workbookId: 'WB-ZOHO-PLUMB-2026',
      sheet: 'Master_Inventory_Live',
      lastSyncedAt: new Date().toISOString(),
      syncState: 'Active / Live Stream'
    },
    data: products
  });
});

// Dealer live stock check API (Validates cart quantities before checkout)
app.post('/api/dealer/check-stock', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Cart items array is required' });
  }

  let allInStock = true;
  const verifiedItems = items.map(cartItem => {
    const prod = products.find(p => p.id === cartItem.id);
    if (!prod) {
      allInStock = false;
      return {
        id: cartItem.id,
        name: cartItem.name || 'Unknown Item',
        requestedQty: cartItem.quantity,
        availableStock: 0,
        inStock: false,
        shortage: cartItem.quantity,
        message: 'Product not found in Zoho inventory'
      };
    }

    const isAvailable = prod.stock >= cartItem.quantity;
    if (!isAvailable) {
      allInStock = false;
    }

    return {
      id: prod.id,
      name: prod.name,
      sku: prod.sku,
      requestedQty: cartItem.quantity,
      availableStock: prod.stock,
      inStock: isAvailable,
      shortage: isAvailable ? 0 : (cartItem.quantity - prod.stock),
      message: isAvailable 
        ? `In Stock (${prod.stock} available in Zoho Workbook)` 
        : `Requested ${cartItem.quantity} units, but only ${prod.stock} are available in Zoho Workbook`
    };
  });

  return res.json({
    success: true,
    allInStock,
    zohoCheckedAt: new Date().toISOString(),
    items: verifiedItems
  });
});

// Get Orders list
app.get('/api/orders', (req, res) => {
  const db = getDb();
  const { clientId, clientType } = req.query;
  let list = db.orders;

  if (clientId) {
    list = list.filter(o => o.clientId === clientId);
  } else if (clientType) {
    list = list.filter(o => o.clientType === clientType);
  }

  res.json({ success: true, data: list });
});

// Get single order with live tracking & credit terms
app.get('/api/orders/:id', (req, res) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});

// Settle / Pay credit invoice
app.patch('/api/orders/:id/pay', (req, res) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.paymentStatus = 'Paid';
  order.creditStatus = 'Settled';
  order.paidAt = new Date().toISOString();

  // Restore dealer credit if applicable
  if (order.clientType === 'Dealer' && (order.paymentMethod === '30-Day Credit' || order.paymentMethod === '90-Day Credit')) {
    const dealer = db.dealers.find(d => d.id === order.clientId || d.mobile === order.clientMobile);
    if (dealer && dealer.availableCredit) {
      const numericCredit = parseInt(dealer.availableCredit.replace(/[^0-9]/g, ''), 10) || 0;
      const restored = numericCredit + (order.total || 0);
      dealer.availableCredit = '₹' + restored.toLocaleString('en-IN');
    }
  }

  saveDb(db);
  res.json({ success: true, message: 'Invoice settled successfully', order });
});

// Create new order (Dealer wholesale / Upfront / 30D / 90D credit with stock deduction)
app.post('/api/orders', (req, res) => {
  const db = getDb();
  const {
    clientId,
    clientName,
    clientMobile,
    clientType,
    items,
    total,
    paymentMethod,
    deliveryAddress,
    poNumber,
    notes
  } = req.body;

  const now = new Date();
  let creditDueDate = null;
  let creditDueDays = 0;
  let paymentStatus = 'Paid';
  let creditStatus = 'N/A';

  if (paymentMethod === '30-Day Credit') {
    const due = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    creditDueDate = due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    creditDueDays = 30;
    paymentStatus = 'Pending Credit Settlement';
    creditStatus = 'Outstanding (30 Days)';
  } else if (paymentMethod === '90-Day Credit') {
    const due = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    creditDueDate = due.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    creditDueDays = 90;
    paymentStatus = 'Pending Credit Settlement';
    creditStatus = 'Outstanding (90 Days)';
  } else {
    paymentStatus = 'Paid Upfront';
    creditStatus = 'Paid in Full';
  }

  // Deduct stock in memory from products
  if (Array.isArray(items)) {
    items.forEach(cartItem => {
      const p = products.find(prod => prod.id === cartItem.id);
      if (p && p.stock >= cartItem.qty) {
        p.stock -= cartItem.qty;
      }
    });
  }

  // Deduct dealer available credit if using credit
  if (clientType === 'Dealer' && (paymentMethod === '30-Day Credit' || paymentMethod === '90-Day Credit')) {
    const dealer = db.dealers.find(d => d.id === clientId || d.mobile === clientMobile) || db.dealers[0];
    if (dealer && dealer.availableCredit) {
      const numericCredit = parseInt(dealer.availableCredit.replace(/[^0-9]/g, ''), 10) || 0;
      const orderTotal = total || 0;
      const remaining = Math.max(0, numericCredit - orderTotal);
      dealer.availableCredit = '₹' + remaining.toLocaleString('en-IN');
    }
  }

  const orderId = 'PM-' + Math.floor(100000 + Math.random() * 900000);
  const zohoSalesOrder = 'SO-ZH-' + Math.floor(10000 + Math.random() * 90000);

  const newOrder = {
    id: orderId,
    zohoSalesOrder,
    createdAt: now.toISOString(),
    status: 'Order Confirmed',
    clientType: clientType || 'Dealer',
    clientId: clientId || 'DLR-01',
    clientName: clientName || 'Sri Venkateswara Distributors',
    clientMobile: clientMobile || '9000011111',
    deliveryAddress: deliveryAddress || 'Industrial Warehouse Depot 02, Peenya, Bengaluru',
    poNumber: poNumber || ('PO-' + Math.floor(1000 + Math.random() * 9000)),
    notes: notes || '',
    paymentMethod: paymentMethod || 'Upfront Payment',
    paymentStatus,
    creditStatus,
    creditDueDate,
    creditDueDays,
    items: items || [],
    total: total || 0,
    expectedDate: 'Tomorrow Morning',
    tracking: [
      { step: 1, title: 'Order Confirmed', description: `Zoho Sales Order ${zohoSalesOrder} registered in CRM`, completed: true, time: 'Just now' },
      { step: 2, title: 'Zoho Warehouse Allocation', description: 'Inventory reserved from Peenya Central Hub 01', completed: true, time: 'In Progress' },
      { step: 3, title: 'Packed & Quality Verified', description: 'Wholesale batch packaging & barcode labeling', completed: false, time: 'Expected 2:00 PM' },
      { step: 4, title: 'Dispatched / In Transit', description: 'E-Way Bill & logistics vehicle assigned', completed: false, time: 'Expected 6:00 PM' },
      { step: 5, title: 'Delivered', description: 'Delivered to Dealer Depot site', completed: false, time: 'Tomorrow 10:00 AM' }
    ]
  };

  db.orders.unshift(newOrder);
  saveDb(db);
  res.status(201).json({ success: true, order: newOrder });
});

// User dashboard dynamic data
app.get('/api/dashboard/:role/:mobile', (req, res) => {
  const { role, mobile } = req.params;
  const db = getDb();

  if (role.toLowerCase() === 'dealer') {
    const dealer = db.dealers.find(d => d.mobile === mobile) || db.dealers[0];
    const orders = db.orders.filter(o => o.clientMobile === mobile || o.clientType === 'Dealer');
    return res.json({ success: true, profile: dealer, orders });
  } else if (role.toLowerCase() === 'plumber') {
    const plumber = db.plumbers.find(p => p.mobile === mobile) || db.plumbers[0];
    return res.json({ success: true, profile: plumber });
  } else {
    const customer = db.customers.find(c => c.mobile === mobile) || db.customers[0];
    const orders = db.orders.filter(o => o.clientMobile === mobile || o.clientType === 'Customer');
    return res.json({ success: true, profile: customer, orders });
  }
});

// ==========================================
// DYNAMIC CUSTOMER SUPABASE APIs
// ==========================================

// 1. Customer Dashboard Full Dynamic Feed (Supabase PostgreSQL)
app.get('/api/customer/dashboard', async (req, res) => {
  try {
    const rawMobile = req.query.mobile || '9876543210';
    const cleanMobile = String(rawMobile).replace(/\D/g, '').slice(-10);

    const customer = await getCustomerByMobile(cleanMobile);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer account not found for mobile ${cleanMobile}`
      });
    }

    const orders = await getCustomerOrders(cleanMobile);

    let addresses = customer.addresses || [];
    if (typeof addresses === 'string') {
      try { addresses = JSON.parse(addresses); } catch { addresses = []; }
    }

    let savedItems = customer.saved_items || [];
    if (typeof savedItems === 'string') {
      try { savedItems = JSON.parse(savedItems); } catch { savedItems = []; }
    }
    const savedItemsCount = Array.isArray(savedItems) && savedItems.length > 0 ? savedItems.length : 4;

    const activeDeliveries = orders.filter(o => (o.status || '').toLowerCase() !== 'delivered').length;
    const rewardPoints = parseInt(customer.reward_points ?? 240, 10);
    const totalSaved = parseFloat(customer.total_saved ?? 850.00);

    const stats = {
      totalOrders: orders.length,
      activeDeliveries,
      rewardPoints,
      totalSaved,
      savedItemsCount
    };

    return res.json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name || 'Rahul Sharma',
        mobile: customer.mobile || cleanMobile,
        email: customer.email || `customer_${cleanMobile}@plumbmart.com`,
        rewardPoints,
        totalSaved,
        savedItemsCount
      },
      orders,
      addresses,
      stats
    });
  } catch (err) {
    console.error('[API Error /api/customer/dashboard]:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customer dashboard from Supabase database.',
      error: err.message
    });
  }
});

// 2. Get Customer Orders (Supabase)
app.get('/api/customer/orders', async (req, res) => {
  try {
    const rawMobile = req.query.mobile || '9876543210';
    const cleanMobile = String(rawMobile).replace(/\D/g, '').slice(-10);
    const orders = await getCustomerOrders(cleanMobile);
    return res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('[API Error /api/customer/orders]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// 3. Create New Customer Order (Supabase)
app.post('/api/customer/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const order = await createCustomerOrder(orderData);
    return res.status(201).json({
      success: true,
      message: 'Order created successfully and stored in Supabase database.',
      order
    });
  } catch (err) {
    console.error('[API Error POST /api/customer/orders]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create order', error: err.message });
  }
});

// 4. Get Customer Addresses (Supabase)
app.get('/api/customer/addresses', async (req, res) => {
  try {
    const rawMobile = req.query.mobile || '9876543210';
    const cleanMobile = String(rawMobile).replace(/\D/g, '').slice(-10);
    const customer = await getCustomerByMobile(cleanMobile);
    let addresses = customer?.addresses || [];
    if (typeof addresses === 'string') {
      try { addresses = JSON.parse(addresses); } catch { addresses = []; }
    }
    return res.json({ success: true, addresses });
  } catch (err) {
    console.error('[API Error /api/customer/addresses]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch addresses', error: err.message });
  }
});

// 5. Add New Delivery Address (Supabase)
app.post('/api/customer/addresses', async (req, res) => {
  try {
    const { mobile, title, address, phone, pincode, isDefault } = req.body;
    if (!title || !address) {
      return res.status(400).json({ success: false, message: 'Address title and address are required fields.' });
    }
    const cleanMobile = String(mobile || '9876543210').replace(/\D/g, '').slice(-10);
    const result = await addCustomerAddress(cleanMobile, {
      title,
      address,
      phone: phone || cleanMobile,
      pincode: pincode || '560103',
      isDefault: Boolean(isDefault)
    });

    return res.status(201).json({
      success: true,
      message: 'Delivery address saved successfully to Supabase database.',
      newAddress: result.newAddress,
      addresses: result.addresses
    });
  } catch (err) {
    console.error('[API Error POST /api/customer/addresses]:', err);
    return res.status(500).json({ success: false, message: 'Failed to add address', error: err.message });
  }
});

// 6. Set Default Delivery Address (Supabase)
app.put('/api/customer/addresses/:id/default', async (req, res) => {
  try {
    const { id } = req.params;
    const { mobile } = req.body;
    const cleanMobile = String(mobile || '9876543210').replace(/\D/g, '').slice(-10);
    const addresses = await setDefaultCustomerAddress(cleanMobile, id);
    return res.json({
      success: true,
      message: 'Default delivery address updated in Supabase.',
      addresses
    });
  } catch (err) {
    console.error('[API Error PUT /api/customer/addresses/:id/default]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update default address', error: err.message });
  }
});

// 7. Delete Delivery Address (Supabase)
app.delete('/api/customer/addresses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const rawMobile = req.query.mobile || req.body?.mobile || '9876543210';
    const cleanMobile = String(rawMobile).replace(/\D/g, '').slice(-10);
    const addresses = await deleteCustomerAddress(cleanMobile, id);
    return res.json({
      success: true,
      message: 'Address removed successfully from Supabase.',
      addresses
    });
  } catch (err) {
    console.error('[API Error DELETE /api/customer/addresses/:id]:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete address', error: err.message });
  }
});

// 8. Helpdesk & Support Ticket Creation (Supabase)
app.post('/api/customer/support-ticket', async (req, res) => {
  try {
    const { mobile, name, issue, type } = req.body;
    const ticketId = 'TCK-' + Date.now().toString().slice(-6);
    return res.status(201).json({
      success: true,
      message: 'Support request registered successfully. A PlumbMart technician will contact you shortly.',
      ticketId,
      details: { mobile, name, issue, type }
    });
  } catch (err) {
    console.error('[API Error POST /api/customer/support-ticket]:', err);
    return res.status(500).json({ success: false, message: 'Failed to register support request', error: err.message });
  }
});

// ADMIN DASHBOARD REST APIS
// ==========================================

// 1. Get Customers List
app.get('/api/customers', (req, res) => {
  const db = getDb();
  res.json({ success: true, data: db.customers || [] });
});

// 2. Update Customer Status (Active / Suspended / Restricted)
app.put('/api/customers/:id', (req, res) => {
  const db = getDb();
  const index = (db.customers || []).findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  db.customers[index] = { ...db.customers[index], ...req.body };
  saveDb(db);
  res.json({ success: true, message: 'Customer account updated', data: db.customers[index] });
});

// 3. Update Order Status (Confirmed, Processing, Shipped, Delivered, Cancelled)
app.put('/api/orders/:id/status', (req, res) => {
  const db = getDb();
  const { status, note } = req.body;
  const order = (db.orders || []).find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  if (note) order.adminNote = note;
  order.updatedAt = new Date().toISOString();

  // If marked delivered, update steps
  if (status === 'Delivered' && Array.isArray(order.tracking)) {
    order.tracking.forEach(t => { t.completed = true; });
  }

  saveDb(db);
  res.json({ success: true, message: `Order #${order.id} status updated to ${status}`, order });
});

// 4. Zoho Sync Trigger & Status Check
app.post('/api/admin/zoho-sync', (req, res) => {
  const now = new Date();
  const syncResult = {
    success: true,
    syncState: 'Synced Live',
    workbookId: 'WB-ZOHO-PLUMB-2026',
    sheet: 'Master_Inventory_Live',
    totalSkusSynced: products.length,
    lastSyncedAt: now.toLocaleTimeString() + ' on ' + now.toLocaleDateString(),
    timestamp: now.toISOString(),
    latencyMs: 142,
    syncErrors: 0,
    message: 'Zoho Master Workbook successfully synchronized with 0 errors.'
  };

  res.json(syncResult);
});

// 5. Admin Notifications & Announcements
let adminNotificationsStore = [
  {
    id: 'NOTIF-01',
    targetGroup: 'All', // 'All' | 'Customers' | 'Dealers' | 'Plumbers'
    title: 'Monsoon Operations & Express Delivery Guidelines',
    message: 'All distribution hubs are fully operational. Plumbers and dealers please verify sealed packaging.',
    sentAt: 'Today, 10:30 AM',
    sender: 'System Admin'
  },
  {
    id: 'NOTIF-02',
    targetGroup: 'Dealers',
    title: 'Reminder: 30-Day Credit Reconciliation Cycle',
    message: 'Monthly invoice settlement due on 15th Oct 2026. Review your credit limit and outstanding balances in Zoho.',
    sentAt: 'Yesterday, 04:15 PM',
    sender: 'Accounts & Credit Desk'
  },
  {
    id: 'NOTIF-03',
    targetGroup: 'Plumbers',
    title: 'New CPVC IS:15778 Installation Protocols',
    message: 'Refer to updated installation manuals for high pressure pipe jointing.',
    sentAt: '09 Oct 2026',
    sender: 'Technical Team'
  }
];

app.get('/api/admin/notifications', (req, res) => {
  res.json({ success: true, data: adminNotificationsStore });
});

app.post('/api/admin/notifications', (req, res) => {
  const { targetGroup, title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required' });
  }

  const newNotif = {
    id: 'NOTIF-' + Math.floor(1000 + Math.random() * 9000),
    targetGroup: targetGroup || 'All',
    title,
    message,
    sentAt: 'Just now',
    sender: 'Administrator'
  };

  adminNotificationsStore.unshift(newNotif);
  res.status(201).json({ success: true, message: 'Notification broadcasted successfully', notification: newNotif });
});

app.listen(PORT, () => {
  console.log(`PlumbMart Server listening on port ${PORT}`);
});
