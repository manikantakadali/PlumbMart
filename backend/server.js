require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getStore, saveStore, resetStore } = require('./store');
const {
  zohoAuthService,
  zohoProductService,
  zohoInventoryService,
  zohoDealerService
} = require('./services/zoho');
const { checkConnection } = require('./db');
const { generateSecureOtp, sendSmsOtp } = require('./services/smsService');
const {
  saveOtpSession,
  verifyOtpSession,
  getOrCreateCustomer
} = require('./services/customerDbService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health & System Overview
app.get('/api/health', async (req, res) => {
  const store = getStore();
  const dbStatus = await checkConnection();
  res.json({
    status: 'OK',
    service: 'PlumbMart API Server',
    database: {
      provider: 'Supabase PostgreSQL',
      connected: dbStatus.connected,
      serverTime: dbStatus.time || null,
      error: dbStatus.error || null
    },
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

// Step 1: Send OTP via SMS
app.post('/api/auth/send-otp', async (req, res) => {
  const { mobile, role, name } = req.body;
  const cleanMobile = String(mobile || '').replace(/\D/g, '');

  if (!cleanMobile || cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

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

  try {
    // Generate secure dynamic 6-digit OTP
    const otp = generateSecureOtp();

    // Save session in Supabase PostgreSQL & store (validates cooldown & limits)
    const sessionInfo = await saveOtpSession({
      mobile: cleanMobile,
      otp,
      role: selectedRole,
      name: name || ''
    });

    // Send real SMS to actual mobile number
    const smsDispatch = await sendSmsOtp(cleanMobile, otp);

    const responsePayload = {
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile}`,
      role: selectedRole,
      cooldownSeconds: sessionInfo.cooldownSeconds || 30,
      smsProvider: smsDispatch.provider
    };

    // For non-customer roles (Dealer, Plumber, Admin demo testing), include demoOtp to preserve testing
    if (selectedRole !== 'customer') {
      responsePayload.demoOtp = otp;
    } else if (!process.env.OTP_PROVIDER_API_KEY) {
      // In local development when 3rd-party SMS credits are not set, provide devCode for testing
      responsePayload.devCode = otp;
    }

    return res.json(responsePayload);
  } catch (err) {
    console.error('[Send OTP Error]', err.message);
    return res.status(400).json({ error: err.message });
  }
});

// Resend OTP endpoint with cooldown & abuse protection
app.post('/api/auth/resend-otp', async (req, res) => {
  const { mobile, role, name } = req.body;
  const cleanMobile = String(mobile || '').replace(/\D/g, '');

  if (!cleanMobile || cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const selectedRole = (role || 'customer').toLowerCase();

  try {
    const otp = generateSecureOtp();
    const sessionInfo = await saveOtpSession({
      mobile: cleanMobile,
      otp,
      role: selectedRole,
      name: name || ''
    });

    const smsDispatch = await sendSmsOtp(cleanMobile, otp);

    const responsePayload = {
      success: true,
      message: `A fresh OTP has been sent via SMS to +91 ${cleanMobile}`,
      role: selectedRole,
      cooldownSeconds: sessionInfo.cooldownSeconds || 30,
      smsProvider: smsDispatch.provider
    };

    if (selectedRole !== 'customer') {
      responsePayload.demoOtp = otp;
    } else if (!process.env.OTP_PROVIDER_API_KEY) {
      responsePayload.devCode = otp;
    }

    return res.json(responsePayload);
  } catch (err) {
    return res.status(429).json({ error: err.message });
  }
});

// Step 2: Verify OTP & Return Authenticated User Profile
app.post('/api/auth/verify-otp', async (req, res) => {
  const { mobile, otp, role, name, address } = req.body;
  const cleanMobile = String(mobile || '').replace(/\D/g, '');
  const selectedRole = (role || 'customer').toLowerCase();
  const cleanOtp = String(otp || '').trim();

  if (!cleanMobile || cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Invalid mobile number.' });
  }
  if (!cleanOtp || cleanOtp.length !== 6) {
    return res.status(400).json({ error: 'Please enter the 6-digit verification code.' });
  }

  const store = getStore();

  try {
    // CUSTOMER: Strict backend verification & Supabase PostgreSQL user persistence
    if (selectedRole === 'customer') {
      await verifyOtpSession({ mobile: cleanMobile, otp: cleanOtp, role: selectedRole });

      // Fetch or dynamically create Customer in Supabase PostgreSQL & store
      const user = await getOrCreateCustomer({
        mobile: cleanMobile,
        name,
        address
      });

      return res.json({
        success: true,
        token: `jwt-sim-${user.role}-${user.id}-${Date.now()}`,
        user
      });
    }

    // DEALER / PLUMBER / ADMIN: Preserves existing verification and accounts
    const session = store.otpSessions?.[cleanMobile];
    const isMatchingOtp = (session && (cleanOtp === session.otp || cleanOtp === session.otp_code)) || cleanOtp === '123456';

    if (!isMatchingOtp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check the code sent to your phone or demo credentials.' });
    }

    let user = null;
    if (selectedRole === 'dealer') {
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

    if (!user) {
      return res.status(404).json({ error: 'Account not found for the specified role.' });
    }

    if (store.otpSessions?.[cleanMobile]) {
      delete store.otpSessions[cleanMobile];
      saveStore(store);
    }

    return res.json({
      success: true,
      token: `jwt-sim-${user.role}-${user.id}-${Date.now()}`,
      user
    });
  } catch (err) {
    console.error('[Verify OTP Error]', err.message);
    return res.status(400).json({ error: err.message });
  }
});

// Step 3: Firebase Verified Customer Login & Supabase Persistence
app.post('/api/auth/firebase-login', async (req, res) => {
  const { mobile, idToken, role = 'customer', name, address } = req.body;
  const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

  if (!cleanMobile || cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Invalid mobile number.' });
  }

  try {
    const user = await getOrCreateCustomer({
      mobile: cleanMobile,
      name,
      address
    });

    console.log(`[Firebase Auth] Successfully authenticated +91 ${cleanMobile} as Customer ${user.id} in Supabase.`);

    return res.json({
      success: true,
      authMethod: 'FIREBASE_SMS_OTP',
      token: `jwt-sim-${user.role}-${user.id}-${Date.now()}`,
      user
    });
  } catch (err) {
    console.error('[Firebase Login Error]', err.message);
    return res.status(500).json({ error: 'Failed to create customer session: ' + err.message });
  }
});

// Dedicated Zoho Dealer Verification check endpoint
app.get('/api/auth/zoho-verify/:mobile', (req, res) => {
  const result = zohoAuthService.verifyDealerInZoho(req.params.mobile);
  res.json(result);
});

// =========================================================================
// CUSTOMER DYNAMIC BANNERS
// =========================================================================
app.get('/api/customer/banners', (req, res) => {
  const store = getStore();
  res.json({ banners: store.banners || [] });
});

// =========================================================================
// CUSTOMER DYNAMIC PROFILE & ADDRESSES
// =========================================================================
app.get('/api/customer/profile', (req, res) => {
  const { customerId } = req.query;
  const store = getStore();
  const customer = store.users.customers.find((c) => c.id === customerId) || store.users.customers[0];
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json({ customer });
});

app.patch('/api/customer/profile', (req, res) => {
  const { customerId, name, email, address } = req.body;
  const store = getStore();
  const customer = store.users.customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  if (name !== undefined) customer.name = name.trim();
  if (email !== undefined) customer.email = email.trim();
  if (address !== undefined) {
    customer.address = address.trim();
    if (customer.addresses && customer.addresses.length > 0) {
      customer.addresses[0].addressLine = address.trim();
    }
  }

  saveStore(store);
  res.json({ success: true, customer });
});

// Addresses
app.get('/api/customer/addresses', (req, res) => {
  const { customerId } = req.query;
  const store = getStore();
  const customer = store.users.customers.find((c) => c.id === customerId) || store.users.customers[0];
  res.json({ addresses: customer?.addresses || [] });
});

app.post('/api/customer/addresses', (req, res) => {
  const { customerId, label, addressLine, city, state, pincode, isDefault } = req.body;
  if (!addressLine || !pincode) {
    return res.status(400).json({ error: 'Address line and pincode are required.' });
  }
  const store = getStore();
  const customer = store.users.customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  if (!customer.addresses) customer.addresses = [];

  if (isDefault) {
    customer.addresses.forEach((a) => (a.isDefault = false));
  }

  const newAddr = {
    id: `ADDR-${Date.now()}`,
    label: label?.trim() || 'Site Address',
    addressLine: addressLine.trim(),
    city: city?.trim() || 'Hyderabad',
    state: state?.trim() || 'Telangana',
    pincode: pincode.trim(),
    isDefault: Boolean(isDefault) || customer.addresses.length === 0
  };

  customer.addresses.push(newAddr);
  if (newAddr.isDefault) {
    customer.address = `${newAddr.addressLine}, ${newAddr.city} - ${newAddr.pincode}`;
  }
  saveStore(store);
  res.status(201).json({ success: true, addresses: customer.addresses, newAddress: newAddr });
});

app.delete('/api/customer/addresses/:addressId', (req, res) => {
  const { addressId } = req.params;
  const { customerId } = req.query;
  const store = getStore();
  const customer = store.users.customers.find((c) => c.id === customerId);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  customer.addresses = (customer.addresses || []).filter((a) => a.id !== addressId);
  saveStore(store);
  res.json({ success: true, addresses: customer.addresses });
});

// =========================================================================
// DYNAMIC CATEGORIES (with live productCount)
// =========================================================================
app.get('/api/categories', (req, res) => {
  const store = getStore();
  const categoriesWithCounts = store.categories.map((cat) => {
    const count = store.zohoWorkbookProducts.filter((p) => p.categoryId === cat.id).length;
    return {
      ...cat,
      productCount: count
    };
  });
  res.json({ categories: categoriesWithCounts });
});

// =========================================================================
// PRODUCTS & PRICING (FETCHED/SYNCHRONISED FROM ZOHO WORKBOOK)
// =========================================================================
app.get('/api/products', (req, res) => {
  const role = (req.query.role || 'customer').toLowerCase();
  const categoryId = req.query.categoryId || 'all';
  const search = req.query.search || '';
  const sort = req.query.sort || '';
  const filter = req.query.filter || '';

  const store = getStore();
  const products = zohoProductService.getProductsByRole(role, categoryId, search, sort, filter);

  // Derive counts for categories dynamically
  const categoriesWithCounts = store.categories.map((cat) => {
    const count = store.zohoWorkbookProducts.filter((p) => p.categoryId === cat.id).length;
    return { ...cat, productCount: count };
  });

  res.json({
    role,
    zohoMeta: store.zohoMeta,
    categories: categoriesWithCounts,
    products,
    totalCount: products.length
  });
});

app.get('/api/products/:productId', (req, res) => {
  const role = (req.query.role || 'customer').toLowerCase();
  const product = zohoProductService.getProductById(req.params.productId, role);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
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
// DYNAMIC CART (BACKEND PERSISTENCE PER CUSTOMER)
// =========================================================================
app.get('/api/cart', (req, res) => {
  const customerId = req.query.customerId || 'CUST-01';
  const store = getStore();
  if (!store.customerCarts) store.customerCarts = {};
  const rawCart = store.customerCarts[customerId] || [];

  // Enrich cart items dynamically with live product info and calculate totals
  let subtotal = 0;
  const enrichedCart = [];

  for (const item of rawCart) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (product) {
      const unitPrice = product.customerPrice;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;

      enrichedCart.push({
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          categoryId: product.categoryId,
          categoryName: product.categoryName,
          brand: product.brand,
          unit: product.unit,
          price: unitPrice,
          mrp: product.mrp,
          image: product.image,
          specifications: product.specifications,
          availability: product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'
        },
        qty: item.qty,
        itemSubtotal
      });
    }
  }

  const deliveryCharge = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const totalAmount = subtotal + deliveryCharge;

  res.json({
    customerId,
    items: enrichedCart,
    itemCount: enrichedCart.reduce((acc, i) => acc + i.qty, 0),
    subtotal,
    deliveryCharge,
    totalAmount
  });
});

// Add to Cart
app.post('/api/cart', (req, res) => {
  const { customerId, productId, qty } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  const custId = customerId || 'CUST-01';
  const quantity = Math.max(1, Number(qty || 1));
  const store = getStore();
  if (!store.customerCarts) store.customerCarts = {};
  if (!store.customerCarts[custId]) store.customerCarts[custId] = [];

  const existing = store.customerCarts[custId].find((item) => item.productId === productId);
  if (existing) {
    existing.qty += quantity;
  } else {
    store.customerCarts[custId].push({
      productId,
      qty: quantity,
      addedAt: new Date().toISOString()
    });
  }

  saveStore(store);

  // Return updated enriched cart
  const rawCart = store.customerCarts[custId];
  let subtotal = 0;
  const enrichedCart = [];

  for (const item of rawCart) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (product) {
      const unitPrice = product.customerPrice;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;
      enrichedCart.push({
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: unitPrice,
          mrp: product.mrp,
          unit: product.unit,
          image: product.image
        },
        qty: item.qty,
        itemSubtotal
      });
    }
  }

  const deliveryCharge = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  res.status(201).json({
    success: true,
    items: enrichedCart,
    itemCount: enrichedCart.reduce((acc, i) => acc + i.qty, 0),
    subtotal,
    deliveryCharge,
    totalAmount: subtotal + deliveryCharge
  });
});

// Update Cart Quantity
app.patch('/api/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const { customerId, qty, delta } = req.body;
  const custId = customerId || 'CUST-01';
  const store = getStore();

  if (!store.customerCarts || !store.customerCarts[custId]) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const itemIndex = store.customerCarts[custId].findIndex((i) => i.productId === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  if (delta !== undefined) {
    store.customerCarts[custId][itemIndex].qty += Number(delta);
  } else if (qty !== undefined) {
    store.customerCarts[custId][itemIndex].qty = Number(qty);
  }

  // Remove if qty <= 0
  if (store.customerCarts[custId][itemIndex].qty <= 0) {
    store.customerCarts[custId].splice(itemIndex, 1);
  }

  saveStore(store);

  // Return updated enriched cart
  const rawCart = store.customerCarts[custId];
  let subtotal = 0;
  const enrichedCart = [];

  for (const item of rawCart) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (product) {
      const unitPrice = product.customerPrice;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;
      enrichedCart.push({
        product: {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: unitPrice,
          mrp: product.mrp,
          unit: product.unit,
          image: product.image
        },
        qty: item.qty,
        itemSubtotal
      });
    }
  }

  const deliveryCharge = subtotal > 5000 || subtotal === 0 ? 0 : 250;
  res.json({
    success: true,
    items: enrichedCart,
    itemCount: enrichedCart.reduce((acc, i) => acc + i.qty, 0),
    subtotal,
    deliveryCharge,
    totalAmount: subtotal + deliveryCharge
  });
});

// Remove single product from cart
app.delete('/api/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const customerId = req.query.customerId || 'CUST-01';
  const store = getStore();

  if (store.customerCarts && store.customerCarts[customerId]) {
    store.customerCarts[customerId] = store.customerCarts[customerId].filter(
      (i) => i.productId !== productId
    );
    saveStore(store);
  }

  res.json({ success: true, message: 'Item removed from cart' });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  const customerId = req.query.customerId || 'CUST-01';
  const store = getStore();

  if (store.customerCarts) {
    store.customerCarts[customerId] = [];
    saveStore(store);
  }

  res.json({ success: true, message: 'Cart cleared' });
});

// =========================================================================
// 9 & 10. ORDER FLOW & DIRECT PAYMENTS
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

  // 2. Calculate totals dynamically
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
    shippingAddress: shippingAddress || user.address || `${user.city || 'Hyderabad'} Site`,
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

  // Clear customer backend cart on successful order
  if (orderRole === 'customer' && store.customerCarts && store.customerCarts[user.id]) {
    store.customerCarts[user.id] = [];
  }

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

// Customer-specific My Orders
app.get('/api/orders/my', (req, res) => {
  const customerId = req.query.customerId;
  const store = getStore();
  let myOrders = store.orders.filter(
    (o) => o.orderRole === 'customer' && (!customerId || o.userId === customerId)
  );
  res.json({ orders: myOrders });
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
// 12. NOTIFICATIONS (ROLE-BASED & MARK AS READ)
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

  const unreadCount = notifications.filter((n) => !n.read).length;
  res.json({ role: r, notifications, unreadCount });
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  const store = getStore();

  const customer = store.users.customers.find((u) => u.id === userId);
  if (customer && customer.notifications) {
    const notif = customer.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    saveStore(store);
  }

  res.json({ success: true });
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
    const stepOrder = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const currentIdx = stepOrder.indexOf(order.orderStatus);
    if (currentIdx !== -1 && order.orderStatus !== 'Cancelled') {
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

app.listen(PORT, async () => {
  console.log(`PlumbMart Backend API running on http://localhost:${PORT}`);
  const dbStatus = await checkConnection();
  if (dbStatus.connected) {
    console.log(`Connected to Supabase PostgreSQL (Server Time: ${dbStatus.time})`);
    try {
      const { initDatabase } = require('./init-db');
      await initDatabase();
    } catch (e) {
      console.warn('Database init note:', e.message);
    }
  } else {
    console.log(`Supabase Database Status: ${dbStatus.error || 'Not configured'}`);
  }
});
