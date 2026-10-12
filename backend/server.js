const express = require('express');
const cors = require('cors');
const { getStore, saveStore, resetStore } = require('./store');
const {
  zohoAuthService,
  zohoProductService,
  zohoInventoryService,
  zohoDealerService
} = require('./services/zoho');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health & System Overview
app.get('/api/health', (req, res) => {
  const store = getStore();
  res.json({
    status: 'OK',
    service: 'PlumbMart API Server',
    zohoSync: store.zohoMeta
  });
});

// Demo accounts endpoint for quick testing
app.get('/api/auth/demo-accounts', (req, res) => {
  const store = getStore();
  res.json({
    customers: store.users.customers,
    dealers: store.users.dealers,
    plumbers: store.users.plumbers,
    admins: store.users.admins
  });
});

// =========================================================================
// 1 & 2. AUTHENTICATION & REGISTRATION (OTP ONLY + ZOHO / KYC VERIFICATION)
// =========================================================================

// Step 1: Send OTP
app.post('/api/auth/send-otp', (req, res) => {
  const { mobile, role, name } = req.body;
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const cleanMobile = String(mobile).trim();
  const selectedRole = (role || 'customer').toLowerCase();
  const store = getStore();

  // DEALER: Check Zoho CRM Verification before issuing OTP
  if (selectedRole === 'dealer') {
    const verification = zohoAuthService.verifyDealerInZoho(cleanMobile);
    if (!verification.isRegistered) {
      return res.status(403).json({
        code: 'ZOHO_NOT_REGISTERED',
        error: 'Dealer mobile number not registered in Zoho CRM. Dealers can login ONLY if pre-registered in Zoho.'
      });
    }
    if (!verification.isVerified) {
      return res.status(403).json({
        code: 'ZOHO_NOT_VERIFIED',
        dealerName: verification.dealerName,
        zohoContactId: verification.zohoContactId,
        error: verification.message
      });
    }
  }

  // PLUMBER: Check trade registration
  if (selectedRole === 'plumber') {
    const plumber = store.users.plumbers.find((p) => p.mobile === cleanMobile);
    if (!plumber) {
      return res.status(403).json({
        code: 'PLUMBER_NOT_FOUND',
        error: 'Plumber mobile number is not registered in the Plumber Verification Registry.'
      });
    }
  }

  // ADMIN: Check admin registry
  if (selectedRole === 'admin') {
    const admin = store.users.admins.find((a) => a.mobile === cleanMobile);
    if (!admin) {
      return res.status(403).json({
        code: 'ADMIN_NOT_FOUND',
        error: 'Unauthorized mobile number for Admin access.'
      });
    }
  }

  // Generate OTP (123456 for interview demo convenience)
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

// Step 2: Verify OTP & Return User Profile
app.post('/api/auth/verify-otp', (req, res) => {
  const { mobile, otp, role, name, address } = req.body;
  const cleanMobile = String(mobile || '').trim();
  const selectedRole = (role || 'customer').toLowerCase();
  const store = getStore();

  const session = store.otpSessions[cleanMobile];
  if (!session || (otp !== '123456' && otp !== session.otp)) {
    return res.status(400).json({ error: 'Invalid OTP. Please enter demo OTP 123456.' });
  }

  let user = null;

  if (selectedRole === 'customer') {
    user = store.users.customers.find((c) => c.mobile === cleanMobile);
    if (!user) {
      // Auto-register new customer via mobile OTP
      user = {
        id: `CUST-0${store.users.customers.length + 1}`,
        role: 'customer',
        name: name?.trim() || `Customer (${cleanMobile.slice(-4)})`,
        mobile: cleanMobile,
        email: `user${cleanMobile.slice(-4)}@example.com`,
        address: address?.trim() || 'Flat 402, Green Valley Residency, Madhapur, Hyderabad',
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
      store.users.customers.push(user);
    }
  } else if (selectedRole === 'dealer') {
    const verification = zohoAuthService.verifyDealerInZoho(cleanMobile);
    if (!verification.isVerified) {
      return res.status(403).json({
        code: 'ZOHO_VERIFICATION_FAILED',
        error: 'Dealer access denied: Must be registered and verified in Zoho CRM.'
      });
    }
    user = store.users.dealers.find((d) => d.mobile === cleanMobile);
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

// Dedicated Zoho Dealer Verification check endpoint (showcasing Zoho integration)
app.get('/api/auth/zoho-verify/:mobile', (req, res) => {
  const result = zohoAuthService.verifyDealerInZoho(req.params.mobile);
  res.json(result);
});

// =========================================================================
// 6. PRODUCTS & PRICING (FETCHED/SYNCHRONISED FROM ZOHO WORKBOOK)
// =========================================================================
// STRICT ROLE-BASED VISIBILITY:
// CUSTOMER: Product YES, Price YES, Stock Quantity NO (stripped at API level)
// DEALER: Product YES, Price YES, Stock Quantity YES
// PLUMBER: Show technical installation requirements
// ADMIN: Full visibility
app.get('/api/products', (req, res) => {
  const role = (req.query.role || 'customer').toLowerCase();
  const categoryId = req.query.categoryId || 'all';
  const search = req.query.search || '';

  const store = getStore();
  const products = zohoProductService.getProductsByRole(role, categoryId, search);

  res.json({
    role,
    zohoMeta: store.zohoMeta,
    categories: store.categories,
    products
  });
});

// Zoho Workbook Sync trigger
app.post('/api/zoho/sync', (req, res) => {
  const result = zohoProductService.synchroniseWorkbook();
  res.json({
    success: true,
    message: 'Synchronised products, pricing, and stock from Zoho Workbook.',
    ...result
  });
});

// Edit Zoho Workbook Product Row
app.put('/api/zoho/workbook/:productId', (req, res) => {
  const updated = zohoProductService.updateProductInWorkbook(req.params.productId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found in Zoho Workbook.' });
  }
  const store = getStore();
  res.json({
    success: true,
    message: `Updated Zoho Workbook Row (${updated.zohoRowId}). Synced live.`,
    product: updated,
    zohoMeta: store.zohoMeta
  });
});

// =========================================================================
// 9 & 10. ORDER FLOW & PAYMENTS (CUSTOMER & DEALER CHECKOUT)
// =========================================================================
app.post('/api/orders', (req, res) => {
  const { userId, role, items, paymentMethod, paymentSubType, shippingAddress } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Please add products.' });
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

  // 1. Check Zoho Workbook stock availability
  const stockCheck = zohoInventoryService.checkStockAvailability(items);
  if (!stockCheck.available) {
    return res.status(400).json({ error: stockCheck.error });
  }

  // 2. Calculate totals
  let totalAmount = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    const qty = Number(item.qty || 1);
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

  // 3. Validate Dealer Payment and Credit Permissions
  let paymentStatus = 'Successful';
  let creditDays = 0;
  let dueDate = 'Immediate';

  if (orderRole === 'dealer') {
    const eligibility = zohoDealerService.validatePaymentEligibility(user.id, paymentMethod, totalAmount);
    if (!eligibility.allowed) {
      return res.status(403).json({ error: eligibility.error });
    }
    if (eligibility.creditDays) {
      creditDays = eligibility.creditDays;
      dueDate = eligibility.dueDate;
      paymentStatus = 'Credit / Outstanding';
      // Deduct available credit in Zoho Books ledger
      zohoDealerService.utilizeCredit(user.id, totalAmount);
    } else {
      paymentStatus = 'Successful';
    }
  }

  // 4. Deduct stock in Zoho Workbook
  zohoInventoryService.deductStock(enrichedItems);

  // 5. Create Order with Placed -> Confirmed -> Processing -> Shipped -> Delivered timeline
  const newOrderId = `ORD-2026-${100 + store.orders.length + 1}`;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const newOrder = {
    id: newOrderId,
    orderRole,
    userId: user.id,
    userName: user.name,
    userMobile: user.mobile,
    items: enrichedItems,
    totalAmount,
    paymentMethod: paymentMethod || (orderRole === 'customer' ? 'DIRECT_PAYMENT' : 'UPFRONT'),
    paymentSubType: paymentSubType || (orderRole === 'customer' ? 'UPI Direct Payment' : 'Dealer Order'),
    paymentStatus, // Pending | Successful | Failed | Credit / Outstanding
    orderStatus: 'Confirmed', // Placed -> Confirmed -> Processing -> Shipped -> Delivered
    creditDays,
    dueDate,
    assignedPlumberId: orderRole === 'customer' ? 'PLB-01' : null,
    assignedPlumberName: orderRole === 'customer' ? 'Ramesh Babu (Master Plumber)' : null,
    plumberTaskStatus: orderRole === 'customer' ? 'ASSIGNED' : null,
    plumberNotes: orderRole === 'customer' ? 'Auto-assigned verified plumber for installation inspection.' : null,
    shippingAddress: shippingAddress || user.address || `${user.city || 'Hyderabad'} Warehouse`,
    orderDate: now.toISOString(),
    createdAt: now.toISOString(),
    trackingTimeline: [
      { step: 'Placed', detail: 'Order placed by user via mobile app', time: `${dateStr}, ${timeStr}`, done: true },
      {
        step: 'Confirmed',
        detail:
          orderRole === 'customer'
            ? `Direct Payment of ₹${totalAmount.toLocaleString('en-IN')} verified (${paymentSubType || 'UPI'})`
            : creditDays > 0
            ? `${creditDays}-Day Approved Credit recorded in Zoho Books (Due: ${dueDate})`
            : 'Upfront payment confirmed via Corporate Settlement',
        time: `${dateStr}, ${timeStr}`,
        done: true
      },
      { step: 'Processing', detail: 'Stock reserved in Zoho Workbook & packed for dispatch', time: 'In Queue', done: false },
      {
        step: 'Shipped',
        detail: orderRole === 'customer' ? 'Out for delivery • Assigned Plumber: Ramesh Babu' : 'Bulk freight transport in transit',
        time: 'Pending',
        done: false
      },
      { step: 'Delivered', detail: 'Delivered to designated premise', time: 'Pending', done: false }
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
    status: paymentStatus,
    dueDate,
    date: now.toISOString().split('T')[0]
  });

  // Add notification to user
  if (user.notifications) {
    user.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      type: 'ORDER_UPDATE',
      title: `Order Placed (${newOrderId})`,
      message: `Your order for ₹${totalAmount.toLocaleString('en-IN')} has been confirmed.`,
      time: 'Just now',
      read: false
    });
  }

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

// Single Order Tracking details
app.get('/api/orders/:orderId', (req, res) => {
  const store = getStore();
  const order = store.orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json({ order });
});

// =========================================================================
// 12. NOTIFICATIONS (ROLE-BASED)
// =========================================================================
app.get('/api/notifications', (req, res) => {
  const { role, userId } = req.query;
  const store = getStore();
  const r = (role || 'customer').toLowerCase();

  let notifications = [];
  if (r === 'customer') {
    const c = store.users.customers.find((u) => u.id === userId) || store.users.customers[0];
    notifications = c?.notifications || [];
  } else if (r === 'dealer') {
    const d = store.users.dealers.find((u) => u.id === userId) || store.users.dealers[0];
    notifications = d?.notifications || [];
  } else if (r === 'plumber') {
    const p = store.users.plumbers.find((u) => u.id === userId) || store.users.plumbers[0];
    notifications = p?.notifications || [];
  } else if (r === 'admin') {
    notifications = store.users.admins[0]?.notifications || [];
  }

  res.json({ role: r, notifications });
});

// =========================================================================
// 5. PLUMBER DASHBOARD & ASSIGNED ACTIVITIES
// =========================================================================
app.get('/api/plumber/:plumberId', (req, res) => {
  const store = getStore();
  const plumber = store.users.plumbers.find((p) => p.id === req.params.plumberId) || store.users.plumbers[0];
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
      order.orderStatus = 'Delivered';
      order.trackingTimeline.forEach((t) => (t.done = true));
      const plumber = store.users.plumbers.find((p) => p.id === order.assignedPlumberId);
      if (plumber) {
        plumber.completedJobs += 1;
        plumber.rewardPoints += 150;
        plumber.walletBalance += 500;
        plumber.notifications.unshift({
          id: `NOTIF-PLB-${Date.now()}`,
          type: 'REWARD_UPDATE',
          title: '+150 Reward Points Credited',
          message: `Job ${orderId} marked completed. Wallet balance updated to ₹${plumber.walletBalance}.`,
          time: 'Just now',
          read: false
        });
      }
    }
  }
  if (plumberNotes !== undefined) {
    order.plumberNotes = plumberNotes;
  }

  saveStore(store);
  res.json({ success: true, order });
});

// =========================================================================
// 7. ADMIN DASHBOARD & SYSTEM GOVERNANCE
// =========================================================================
app.get('/api/admin/overview', (req, res) => {
  const store = getStore();
  const totalRevenue = store.orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const activeCreditExposure = store.users.dealers.reduce((sum, d) => sum + (d.creditUsed || 0), 0);

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

// Admin: Manage Dealer Verification and 30/90-Day Credit Permissions
app.patch('/api/admin/dealers/:dealerId', (req, res) => {
  const updated = zohoDealerService.updateDealerPermissions(req.params.dealerId, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Dealer not found.' });
  }
  res.json({ success: true, dealer: updated });
});

// Admin: Manage Plumber KYC Verification
app.patch('/api/admin/plumbers/:plumberId', (req, res) => {
  const store = getStore();
  const plumber = store.users.plumbers.find((p) => p.id === req.params.plumberId);
  if (!plumber) {
    return res.status(404).json({ error: 'Plumber not found.' });
  }
  if (req.body.verificationStatus) {
    plumber.verificationStatus = req.body.verificationStatus;
  }
  saveStore(store);
  res.json({ success: true, plumber });
});

// Admin: Manage Order Status & Assign Plumber
app.patch('/api/admin/orders/:orderId', (req, res) => {
  const store = getStore();
  const order = store.orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (req.body.orderStatus) {
    order.orderStatus = req.body.orderStatus;
    // Update tracking timeline step
    const stepOrder = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];
    const currentIdx = stepOrder.indexOf(order.orderStatus);
    if (currentIdx !== -1) {
      order.trackingTimeline.forEach((st) => {
        const stepIdx = stepOrder.indexOf(st.step);
        if (stepIdx <= currentIdx) st.done = true;
      });
    }
  }

  if (req.body.assignedPlumberId !== undefined) {
    const plumber = store.users.plumbers.find((p) => p.id === req.body.assignedPlumberId);
    order.assignedPlumberId = plumber ? plumber.id : null;
    order.assignedPlumberName = plumber ? plumber.name : null;
    order.plumberTaskStatus = plumber ? 'ASSIGNED' : null;
  }

  saveStore(store);
  res.json({ success: true, order });
});

// Reset Demo Data
app.post('/api/admin/reset-demo', (req, res) => {
  const fresh = resetStore();
  res.json({ success: true, message: 'Demo store reset to initial state.', store: fresh });
});

app.listen(PORT, () => {
  console.log(`PlumbMart Backend API running on http://localhost:${PORT}`);
});
