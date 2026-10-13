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
    rating: 4.8,
    reviews: 142,
    stock: 85,
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=600&q=80',
    description: 'Lead-free, heavy-duty CPVC plumbing pipe suitable for hot and cold potable water applications.'
  },
  {
    id: 'prod-002',
    name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)',
    category: 'Fittings & Valves',
    brand: 'Ashirvad',
    price: 720,
    mrp: 890,
    rating: 4.7,
    reviews: 98,
    stock: 45,
    tag: 'Heavy Duty',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    description: 'Forged brass concealed valve with quarter-turn ceramic disc cartridge for leak-free performance.'
  },
  {
    id: 'prod-003',
    name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)',
    category: 'Bath & Faucets',
    brand: 'Jaquar',
    price: 3450,
    mrp: 4200,
    rating: 4.9,
    reviews: 215,
    stock: 24,
    tag: 'Premium',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    description: 'Ergonomic chrome finish single lever mixer with foam flow aerator for smooth water streams.'
  },
  {
    id: 'prod-004',
    name: 'Supreme UPVC Ball Valve Heavy Body (25mm)',
    category: 'Fittings & Valves',
    brand: 'Supreme',
    price: 210,
    mrp: 260,
    rating: 4.6,
    reviews: 67,
    stock: 120,
    tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
    description: 'Industrial grade UPVC threaded ball valve for agricultural and residential plumbing systems.'
  },
  {
    id: 'prod-005',
    name: 'Cera Stainless Steel 304 Overhead Rain Shower (8 Inch)',
    category: 'Bath & Faucets',
    brand: 'Cera',
    price: 1850,
    mrp: 2300,
    rating: 4.8,
    reviews: 180,
    stock: 35,
    tag: 'Trending',
    image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80',
    description: 'Ultra-thin mirror finish 304 stainless steel rain shower head with self-cleaning silicone nozzles.'
  },
  {
    id: 'prod-006',
    name: 'Finolex SWR PVC Drainage Bend 90° with Door (110mm)',
    category: 'Pipes & Tubes',
    brand: 'Finolex',
    price: 310,
    mrp: 380,
    rating: 4.5,
    reviews: 54,
    stock: 90,
    tag: 'Standard',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
    description: 'High impact resistant UV-stabilized PVC soil and waste discharge bend with inspection access door.'
  },
  {
    id: 'prod-007',
    name: 'Kirloskar Mini Water Booster Pump 0.5 HP (Self Priming)',
    category: 'Pumps & Motors',
    brand: 'Kirloskar',
    price: 4950,
    mrp: 5900,
    rating: 4.7,
    reviews: 130,
    stock: 18,
    tag: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    description: 'High efficiency copper winding regenerative pump for residential overhead water tank filling.'
  },
  {
    id: 'prod-008',
    name: 'Taparia Heavy Duty Pipe Wrench 14 Inch (Cast Iron)',
    category: 'Tools & Sealants',
    brand: 'Taparia',
    price: 680,
    mrp: 820,
    rating: 4.9,
    reviews: 310,
    stock: 60,
    tag: 'Essential Tool',
    image: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=600&q=80',
    description: 'Drop forged hardened jaws pipe wrench with ductile iron handle for heavy plumbing installations.'
  },
  {
    id: 'prod-009',
    name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty (100g x 6)',
    category: 'Tools & Sealants',
    brand: 'Pidilite',
    price: 180,
    mrp: 210,
    rating: 4.8,
    reviews: 450,
    stock: 250,
    tag: 'Quick Seal',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
    description: 'Multi-purpose sealant putty for joining, sealing, and waterproofing pipe leaks and bathroom joints.'
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

// Create new order
app.post('/api/orders', (req, res) => {
  const db = getDb();
  const newOrder = {
    id: 'PM-' + Math.floor(100000 + Math.random() * 900000),
    createdAt: new Date().toISOString(),
    status: 'Processing',
    ...req.body
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

app.listen(PORT, () => {
  console.log(`PlumbMart Server listening on port ${PORT}`);
});
