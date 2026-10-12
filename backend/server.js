const express = require('express');
const cors = require('cors');
const { getStore, saveStore, resetStore } = require('./store');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health & Overview
app.get('/api/health', (req, res) => {
  const store = getStore();
  res.json({
    status: 'OK',
    service: 'PlumbMart API Server',
    zohoSync: store.zohoMeta
  });
});

// Demo accounts helper endpoint for quick interview testing
app.get('/api/auth/demo-accounts', (req, res) => {
  const store = getStore();
  res.json({
    customers: store.users.customers,
    dealers: store.users.dealers,
    plumbers: store.users.plumbers,
    admins: store.users.admins
  });
});

// 1. LOGIN & REGISTRATION (OTP ONLY)
app.post('/api/auth/send-otp', (req, res) => {
  const { mobile, role, name } = req.body;
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const cleanMobile = String(mobile).trim();
  const selectedRole = (role || 'customer').toLowerCase();
  const store = getStore();

  // Role-specific pre-checks before sending OTP
  if (selectedRole === 'dealer') {
    const dealer = store.users.dealers.find((d) => d.mobile === cleanMobile);
    if (!dealer) {
      return res.status(403).json({
        code: 'ZOHO_NOT_REGISTERED',
        error: 'Dealer mobile number not found in Zoho CRM / Workbook registry. Dealers can login ONLY if registered in Zoho.'
      });
    }
    if (!dealer.zohoVerified) {
      return res.status(403).json({
        code: 'ZOHO_NOT_VERIFIED',
        dealerName: dealer.name,
        zohoContactId: dealer.zohoContactId,
        error: `Dealer "${dealer.name}" is registered (${dealer.zohoContactId}) but NOT YET VERIFIED in Zoho. Please ask Admin to approve Zoho Verification.`
      });
    }
  }

  if (selectedRole === 'plumber') {
    const plumber = store.users.plumbers.find((p) => p.mobile === cleanMobile);
    if (!plumber) {
      return res.status(403).json({
        code: 'PLUMBER_NOT_FOUND',
        error: 'Plumber mobile number is not registered in the Plumber Verification Portal.'
      });
    }
  }

  if (selectedRole === 'admin') {
    const admin = store.users.admins.find((a) => a.mobile === cleanMobile);
    if (!admin) {
      return res.status(403).json({
        code: 'ADMIN_NOT_FOUND',
        error: 'Unauthorized admin mobile number.'
      });
    }
  }

  // Generate 6-digit OTP (default 123456 for smooth interview testing)
  const otp = '123456';
  store.otpSessions[cleanMobile] = {
    mobile: cleanMobile,
    role: selectedRole,
    name: name || '',
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  };
  saveStore(store);

  res.json({
    success: true,
    message: `OTP sent successfully to +91 ${cleanMobile}`,
    demoOtp: otp,
    role: selectedRole
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp, role, name, address } = req.body;
  const cleanMobile = String(mobile || '').trim();
  const selectedRole = (role || 'customer').toLowerCase();
  const store = getStore();

  const session = store.otpSessions[cleanMobile];
  if (!session || (otp !== '123456' && otp !== session.otp)) {
    return res.status(400).json({ error: 'Invalid OTP. Use demo OTP 123456.' });
  }

  let user = null;

  if (selectedRole === 'customer') {
    user = store.users.customers.find((c) => c.mobile === cleanMobile);
    if (!user) {
      // Auto-register new Customer via mobile OTP
      user = {
        id: `CUST-0${store.users.customers.length + 1}`,
        role: 'customer',
        name: name?.trim() || `Customer (${cleanMobile.slice(-4)})`,
        mobile: cleanMobile,
        email: `user${cleanMobile.slice(-4)}@example.com`,
        address: address?.trim() || 'Plot 12, Jubilee Hills, Hyderabad - 500033',
        createdAt: new Date().toISOString()
      };
      store.users.customers.push(user);
    }
  } else if (selectedRole === 'dealer') {
    user = store.users.dealers.find((d) => d.mobile === cleanMobile);
    if (!user || !user.zohoVerified) {
      return res.status(403).json({
        code: 'ZOHO_VERIFICATION_FAILED',
        error: 'Dealer login blocked: Mobile number must be registered and verified in Zoho.'
      });
    }
  } else if (selectedRole === 'plumber') {
    user = store.users.plumbers.find((p) => p.mobile === cleanMobile);
    if (!user) {
      return res.status(403).json({ error: 'Plumber account not found.' });
    }
  } else if (selectedRole === 'admin') {
    user = store.users.admins.find((a) => a.mobile === cleanMobile);
    if (!user) {
      return res.status(403).json({ error: 'Admin account not found.' });
    }
  }

  delete store.otpSessions[cleanMobile];
  saveStore(store);

  res.json({
    success: true,
    token: `jwt-sim-${user.role}-${user.id}-${Date.now()}`,
    user
  });
});

// 2. PRODUCTS & PRICING (SYNCHRONISED FROM ZOHO WORKBOOK)
// Role-aware endpoint:
// - Customers see customerPrice and availability status, NEVER stockQuantity!
// - Dealers see dealerPrice, customerPrice, and exact stockQuantity!
app.get('/api/products', (req, res) => {
  const role = (req.query.role || 'customer').toLowerCase();
  const categoryId = req.query.categoryId;
  const search = (req.query.search || '').toLowerCase().trim();

  const store = getStore();
  let list = [...store.zohoWorkbookProducts];

  if (categoryId && categoryId !== 'all') {
    list = list.filter((p) => p.categoryId === categoryId);
  }
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search) ||
        p.categoryName.toLowerCase().includes(search)
    );
  }

  const transformed = list.map((p) => {
    if (role === 'customer') {
      // STRICT REQUIREMENT: Customers can view products and prices but CANNOT see stock quantity
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        brand: p.brand,
        unit: p.unit,
        price: p.customerPrice,
        mrp: p.mrp,
        inStock: p.stockQuantity > 0,
        stockVisibility: 'HIDDEN_FOR_CUSTOMER',
        specifications: p.specifications,
        image: p.image
      };
    }

    if (role === 'dealer') {
      // STRICT REQUIREMENT: Dealers can view available stock quantity & wholesale pricing
      return {
        id: p.id,
        sku: p.sku,
        zohoRowId: p.zohoRowId,
        name: p.name,
        categoryId: p.categoryId,
        categoryName: p.categoryName,
        brand: p.brand,
        unit: p.unit,
        price: p.dealerPrice,
        dealerPrice: p.dealerPrice,
        customerPrice: p.customerPrice,
        mrp: p.mrp,
        stockQuantity: p.stockQuantity,
        inStock: p.stockQuantity > 0,
        minDealerOrderQty: p.minDealerOrderQty,
        stockVisibility: 'VISIBLE_FOR_DEALER',
        specifications: p.specifications,
        image: p.image
      };
    }

    // Plumber or Admin
    return {
      ...p,
      price: role === 'plumber' ? p.customerPrice : p.dealerPrice,
      inStock: p.stockQuantity > 0
    };
  });

  res.json({
    role,
    zohoMeta: store.zohoMeta,
    categories: store.categories,
    products: transformed
  });
});

// Zoho Workbook Sync & Live Row Update (for Admin & Zoho Integration showcase)
app.post('/api/zoho/sync', (req, res) => {
  const store = getStore();
  store.zohoMeta.lastSyncedAt = new Date().toISOString();
  store.zohoMeta.totalSyncedRows = store.zohoWorkbookProducts.length;
  store.zohoMeta.syncStatus = 'SYNCED_OK';
  saveStore(store);

  res.json({
    success: true,
    message: 'Synchronised products, pricing, and stock quantities from Zoho Workbook.',
    zohoMeta: store.zohoMeta,
    products: store.zohoWorkbookProducts
  });
});

app.put('/api/zoho/workbook/:productId', (req, res) => {
  const { productId } = req.params;
  const { customerPrice, dealerPrice, stockQuantity, minDealerOrderQty, name } = req.body;
  const store = getStore();

  const product = store.zohoWorkbookProducts.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product row not found in Zoho Workbook.' });
  }

  if (customerPrice !== undefined) product.customerPrice = Number(customerPrice);
  if (dealerPrice !== undefined) product.dealerPrice = Number(dealerPrice);
  if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
  if (minDealerOrderQty !== undefined) product.minDealerOrderQty = Number(minDealerOrderQty);
  if (name !== undefined) product.name = name;

  store.zohoMeta.lastSyncedAt = new Date().toISOString();
  saveStore(store);

  res.json({
    success: true,
    message: `Zoho Workbook Row (${product.zohoRowId}) updated & synced live.`,
    product,
    zohoMeta: store.zohoMeta
  });
});

// 3 & 4. CUSTOMER & DEALER ORDER CHECKOUT FLOW
app.post('/api/orders', (req, res) => {
  const { userId, role, items, paymentMethod, paymentSubType, shippingAddress } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const store = getStore();
  const orderRole = (role || 'customer').toLowerCase();

  let user = null;
  if (orderRole === 'customer') {
    user = store.users.customers.find((c) => c.id === userId) || store.users.customers[0];
  } else if (orderRole === 'dealer') {
    user = store.users.dealers.find((d) => d.id === userId);
    if (!user || !user.zohoVerified) {
      return res.status(403).json({ error: 'Unverified dealer cannot place orders.' });
    }
  }

  // Calculate totals & validate stock
  let totalAmount = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.productId} not found.` });
    }
    const qty = Number(item.qty || 1);
    if (product.stockQuantity < qty) {
      return res.status(400).json({
        error: `Insufficient stock in Zoho Workbook for ${product.name}. Available: ${product.stockQuantity}`
      });
    }
    const unitPrice = orderRole === 'dealer' ? product.dealerPrice : product.customerPrice;
    const lineTotal = unitPrice * qty;
    totalAmount += lineTotal;
    enrichedItems.push({
      productId: product.id,
      name: product.name,
      qty,
      unitPrice,
      total: lineTotal
    });
  }

  // Validate Dealer Payment & Credit Rules
  let paymentStatus = 'PAID';
  let creditDays = 0;
  let dueDate = 'Immediate';

  if (orderRole === 'dealer') {
    if (paymentMethod === 'CREDIT_30_DAYS') {
      if (!user.creditEligible || !user.credit30DaysAllowed) {
        return res.status(403).json({
          error: '30-Day Credit Payment is not enabled for your dealer account. Contact Admin.'
        });
      }
      creditDays = 30;
      const d = new Date();
      d.setDate(d.getDate() + 30);
      dueDate = d.toISOString().split('T')[0];
      paymentStatus = 'CREDIT_ACTIVE (Due in 30 Days)';
    } else if (paymentMethod === 'CREDIT_90_DAYS') {
      if (!user.creditEligible || !user.credit90DaysAllowed) {
        return res.status(403).json({
          error: '90-Day Credit Payment is restricted to selected/approved dealers only.'
        });
      }
      creditDays = 90;
      const d = new Date();
      d.setDate(d.getDate() + 90);
      dueDate = d.toISOString().split('T')[0];
      paymentStatus = 'CREDIT_ACTIVE (Due in 90 Days)';
    } else {
      paymentStatus = 'PAID (Upfront Dealer Settlement)';
    }

    if (creditDays > 0) {
      const availableCredit = user.creditLimit - user.creditUsed;
      if (totalAmount > availableCredit) {
        return res.status(400).json({
          error: `Order exceeds available Zoho Credit Limit (Available: ₹${availableCredit.toLocaleString('en-IN')}).`
        });
      }
      user.creditUsed += totalAmount;
    }
  }

  // Deduct stock in Zoho Workbook
  for (const item of enrichedItems) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (product) {
      product.stockQuantity = Math.max(0, product.stockQuantity - item.qty);
    }
  }

  const newOrderId = `ORD-2026-${100 + store.orders.length + 1}`;
  const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const newOrder = {
    id: newOrderId,
    orderRole,
    userId: user.id,
    userName: user.name,
    userMobile: user.mobile,
    items: enrichedItems,
    totalAmount,
    paymentMethod: paymentMethod || (orderRole === 'customer' ? 'DIRECT_PAYMENT' : 'UPFRONT'),
    paymentSubType: paymentSubType || (orderRole === 'customer' ? 'UPI / Online Direct Payment' : 'Dealer Checkout'),
    paymentStatus,
    creditDays,
    dueDate,
    orderStatus: 'CONFIRMED',
    assignedPlumberId: orderRole === 'customer' ? 'PLB-01' : null,
    assignedPlumberName: orderRole === 'customer' ? 'Ramesh Babu (Master Plumber)' : null,
    plumberTaskStatus: orderRole === 'customer' ? 'ASSIGNED' : null,
    plumberNotes: orderRole === 'customer' ? 'Auto-assigned verified plumber for installation support.' : null,
    shippingAddress: shippingAddress || user.address || `${user.city || 'Hyderabad'} Warehouse`,
    createdAt: new Date().toISOString(),
    trackingTimeline:
      orderRole === 'customer'
        ? [
            { step: 'Order Confirmed & Direct Payment Received', time: `Today, ${nowStr}`, done: true },
            { step: 'Synced with Zoho Workbook Inventory', time: `Today, ${nowStr}`, done: true },
            { step: 'Plumber Assigned (Ramesh Babu)', time: `Today, ${nowStr}`, done: true },
            { step: 'Out for Delivery', time: 'Estimated 4 hrs', done: false },
            { step: 'Delivered & Installed', time: 'Pending', done: false }
          ]
        : [
            {
              step: `Dealer Order Placed (${
                creditDays ? `${creditDays}-Day Credit` : 'Upfront Payment'
              })`,
              time: `Today, ${nowStr}`,
              done: true
            },
            { step: 'Zoho Workbook Stock Deducted & Invoice Logged', time: `Today, ${nowStr}`, done: true },
            { step: 'Warehouse Bulk Dispatch', time: 'In Queue', done: false },
            { step: 'Delivered to Dealer Premise', time: 'Pending', done: false }
          ]
  };

  store.orders.unshift(newOrder);

  // Record payment entry
  store.payments.unshift({
    id: `PAY-${9000 + store.payments.length + 1}`,
    orderId: newOrderId,
    partyName: user.name,
    role: orderRole,
    amount: totalAmount,
    mode:
      paymentMethod === 'CREDIT_90_DAYS'
        ? 'Credit Payment – 90 Days'
        : paymentMethod === 'CREDIT_30_DAYS'
        ? 'Credit Payment – 30 Days'
        : orderRole === 'customer'
        ? `Direct Payment (${paymentSubType || 'UPI'})`
        : 'Upfront Dealer Payment',
    status: creditDays > 0 ? `PENDING_CREDIT_${creditDays}D` : 'SETTLED',
    dueDate,
    date: new Date().toISOString().split('T')[0]
  });

  saveStore(store);
  res.status(201).json({
    success: true,
    order: newOrder,
    updatedUser: user
  });
});

app.get('/api/orders', (req, res) => {
  const { userId, role } = req.query;
  const store = getStore();
  let orders = [...store.orders];

  if (role && role !== 'admin') {
    orders = orders.filter((o) => o.orderRole === role.toLowerCase());
  }
  if (userId) {
    orders = orders.filter((o) => o.userId === userId);
  }

  res.json({ orders });
});

// 5. PLUMBER FLOW ENDPOINTS
app.get('/api/plumber/:plumberId', (req, res) => {
  const { plumberId } = req.params;
  const store = getStore();
  const plumber = store.users.plumbers.find((p) => p.id === plumberId) || store.users.plumbers[0];
  const assignedOrders = store.orders.filter((o) => o.assignedPlumberId === plumber.id);

  res.json({
    plumber,
    assignedOrders,
    technicalCatalog: store.zohoWorkbookProducts
  });
});

app.patch('/api/plumber/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { plumberTaskStatus, plumberNotes } = req.body;
  const store = getStore();

  const order = store.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (plumberTaskStatus) {
    order.plumberTaskStatus = plumberTaskStatus;
    if (plumberTaskStatus === 'COMPLETED') {
      order.orderStatus = 'DELIVERED';
      order.trackingTimeline.forEach((t) => (t.done = true));
      // Credit reward points to plumber
      const plumber = store.users.plumbers.find((p) => p.id === order.assignedPlumberId);
      if (plumber) {
        plumber.completedJobs += 1;
        plumber.rewardPoints += 150;
        plumber.walletBalance += 500;
      }
    }
  }
  if (plumberNotes !== undefined) {
    order.plumberNotes = plumberNotes;
  }

  saveStore(store);
  res.json({ success: true, order });
});

// 6. ADMIN REQUIREMENTS ENDPOINTS
app.get('/api/admin/overview', (req, res) => {
  const store = getStore();
  const totalRevenue = store.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeCreditExposure = store.users.dealers.reduce((sum, d) => sum + d.creditUsed, 0);

  res.json({
    zohoMeta: store.zohoMeta,
    users: store.users,
    products: store.zohoWorkbookProducts,
    orders: store.orders,
    payments: store.payments,
    metrics: {
      totalCustomers: store.users.customers.length,
      totalDealers: store.users.dealers.length,
      verifiedDealers: store.users.dealers.filter((d) => d.zohoVerified).length,
      approved90DayDealers: store.users.dealers.filter((d) => d.credit90DaysAllowed).length,
      totalPlumbers: store.users.plumbers.length,
      totalProducts: store.zohoWorkbookProducts.length,
      totalOrders: store.orders.length,
      totalRevenue,
      activeCreditExposure
    }
  });
});

// Admin: Manage Dealer Zoho Verification & 30/90-Day Credit Eligibility
app.patch('/api/admin/dealers/:dealerId', (req, res) => {
  const { dealerId } = req.params;
  const { zohoVerified, creditEligible, credit30DaysAllowed, credit90DaysAllowed, creditLimit } = req.body;
  const store = getStore();

  const dealer = store.users.dealers.find((d) => d.id === dealerId);
  if (!dealer) {
    return res.status(404).json({ error: 'Dealer not found.' });
  }

  if (zohoVerified !== undefined) dealer.zohoVerified = Boolean(zohoVerified);
  if (creditEligible !== undefined) dealer.creditEligible = Boolean(creditEligible);
  if (credit30DaysAllowed !== undefined) dealer.credit30DaysAllowed = Boolean(credit30DaysAllowed);
  if (credit90DaysAllowed !== undefined) dealer.credit90DaysAllowed = Boolean(credit90DaysAllowed);
  if (creditLimit !== undefined) dealer.creditLimit = Number(creditLimit);

  // Update human-readable tier badge
  if (!dealer.zohoVerified) {
    dealer.tier = 'Pending Zoho Verification';
  } else if (dealer.credit90DaysAllowed) {
    dealer.tier = 'Platinum Approved Dealer (30 & 90 Days Credit)';
  } else if (dealer.credit30DaysAllowed) {
    dealer.tier = 'Gold Verified Dealer (Upfront & 30 Days Credit)';
  } else {
    dealer.tier = 'Verified Dealer (Upfront Payment Only)';
  }

  saveStore(store);
  res.json({ success: true, dealer });
});

// Admin: Manage Plumber Verification
app.patch('/api/admin/plumbers/:plumberId', (req, res) => {
  const { plumberId } = req.params;
  const { verificationStatus } = req.body;
  const store = getStore();

  const plumber = store.users.plumbers.find((p) => p.id === plumberId);
  if (!plumber) {
    return res.status(404).json({ error: 'Plumber not found.' });
  }

  if (verificationStatus) {
    plumber.verificationStatus = verificationStatus;
  }

  saveStore(store);
  res.json({ success: true, plumber });
});

// Admin: Update Order Status or Assign Plumber
app.patch('/api/admin/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { orderStatus, assignedPlumberId } = req.body;
  const store = getStore();

  const order = store.orders.find((o) => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    if (orderStatus === 'DELIVERED') {
      order.trackingTimeline.forEach((step) => (step.done = true));
    }
  }
  if (assignedPlumberId !== undefined) {
    const plumber = store.users.plumbers.find((p) => p.id === assignedPlumberId);
    order.assignedPlumberId = plumber ? plumber.id : null;
    order.assignedPlumberName = plumber ? plumber.name : null;
    order.plumberTaskStatus = plumber ? 'ASSIGNED' : null;
  }

  saveStore(store);
  res.json({ success: true, order });
});

// Reset demo store to initial state
app.post('/api/admin/reset-demo', (req, res) => {
  const fresh = resetStore();
  res.json({ success: true, message: 'Demo data reset to initial state.', store: fresh });
});

app.listen(PORT, () => {
  console.log(`PlumbMart Backend API running on http://localhost:${PORT}`);
});
