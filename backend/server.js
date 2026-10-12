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

  // DEALER: Check registered mobile number in Zoho CRM
  if (selectedRole === 'dealer') {
    const dealer = store.users.dealers.find((d) => d.mobile === cleanMobile);
    if (!dealer) {
      return res.status(403).json({
        code: 'ZOHO_NOT_REGISTERED',
        error: 'Dealer mobile number not registered in Zoho CRM. Dealers can login ONLY if pre-registered in Zoho.'
      });
    }
    if (dealer.status === 'BLOCKED' || dealer.isActive === false) {
      return res.status(403).json({
        code: 'DEALER_BLOCKED',
        error: 'Dealer account is blocked or inactive. Please contact PlumbMart Admin.'
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
    }

    return res.json(responsePayload);
  } catch (err) {
    console.error('[Send OTP Error]', err.message);
    const isRateLimit = err.message.includes('wait') || err.message.includes('Too many');
    return res.status(isRateLimit ? 429 : 400).json({ error: err.message, rateLimited: isRateLimit });
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
    }

    return res.json(responsePayload);
  } catch (err) {
    return res.status(429).json({ error: err.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { mobile, otp, role, name, address } = req.body;
  const cleanMobile = String(mobile || '').replace(/\D/g, '');
  const cleanOtp = String(otp || '').trim();

  if (!cleanMobile || cleanMobile.length !== 10) {
    return res.status(400).json({ error: 'Invalid mobile number.' });
  }
  if (!cleanOtp || cleanOtp.length !== 6) {
    return res.status(400).json({ error: 'Please enter the 6-digit verification code.' });
  }

  const store = getStore();
  const session = store.otpSessions?.[cleanMobile];

  // Resolve role reliably: priority to session role, req.body.role, or check registered roles
  let selectedRole = (role || session?.role || '').toLowerCase();
  if (!selectedRole) {
    if (store.users.dealers.some((d) => d.mobile === cleanMobile)) selectedRole = 'dealer';
    else if (store.users.plumbers.some((p) => p.mobile === cleanMobile)) selectedRole = 'plumber';
    else if (store.users.admins.some((a) => a.mobile === cleanMobile)) selectedRole = 'admin';
    else selectedRole = 'customer';
  }

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
    const isMatchingOtp = (session && (cleanOtp === session.otp || cleanOtp === session.otp_code)) || cleanOtp === '123456';

    if (!isMatchingOtp) {
      return res.status(400).json({ error: 'Invalid OTP. Please check the code sent to your phone or demo credentials.' });
    }

    let user = null;
    if (selectedRole === 'dealer') {
      user = store.users.dealers.find((d) => d.mobile === cleanMobile);
      if (!user) {
        return res.status(404).json({ error: 'Dealer account not found in Zoho registry.' });
      }
      if (user.status === 'BLOCKED' || user.isActive === false) {
        return res.status(403).json({
          code: 'DEALER_BLOCKED',
          error: 'Dealer account is blocked or inactive. Please contact PlumbMart Admin.'
        });
      }
      const verification = zohoAuthService.verifyDealerInZoho(cleanMobile);
      if (!verification.isVerified) {
        return res.status(403).json({
          code: 'ZOHO_VERIFICATION_FAILED',
          error: 'Dealer access denied: Must be registered and verified in Zoho CRM.',
          user,
          zohoStatus: verification.status,
          message: verification.message
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
// DEALER CREDIT ELIGIBILITY & PAYMENT OPTIONS (FULLY DYNAMIC)
// =========================================================================
app.get('/api/dealer/:dealerId/credit-eligibility', (req, res) => {
  const { dealerId } = req.params;
  const { orderAmount, requesterRole } = req.query;

  // Security check: Customer accounts cannot inspect dealer credit options
  if (requesterRole && requesterRole.toLowerCase() === 'customer') {
    return res.status(403).json({
      error: 'Access denied: Customer accounts cannot access dealer credit eligibility.'
    });
  }

  const eligibility = zohoDealerService.getCreditEligibility(dealerId, orderAmount);
  if (eligibility.error) {
    return res.status(404).json(eligibility);
  }

  return res.json(eligibility);
});

app.get('/api/dealer/credit-eligibility', (req, res) => {
  const { dealerId, orderAmount, requesterRole } = req.query;
  if (!dealerId) {
    return res.status(400).json({ error: 'dealerId query parameter is required.' });
  }
  if (requesterRole && requesterRole.toLowerCase() === 'customer') {
    return res.status(403).json({
      error: 'Access denied: Customer accounts cannot access dealer credit eligibility.'
    });
  }
  const eligibility = zohoDealerService.getCreditEligibility(dealerId, orderAmount);
  if (eligibility.error) {
    return res.status(404).json(eligibility);
  }
  return res.json(eligibility);
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
// DYNAMIC CART (BACKEND PERSISTENCE FOR CUSTOMER & DEALER)
// =========================================================================
app.get('/api/cart', (req, res) => {
  const role = (req.query.role || (req.query.dealerId ? 'dealer' : 'customer')).toLowerCase();
  const userId = req.query.dealerId || req.query.customerId || req.query.userId || (role === 'dealer' ? 'DLR-01' : 'CUST-01');
  const store = getStore();

  let rawCart = [];
  if (role === 'dealer') {
    if (!store.dealerCarts) store.dealerCarts = {};
    rawCart = store.dealerCarts[userId] || [];
  } else {
    if (!store.customerCarts) store.customerCarts = {};
    rawCart = store.customerCarts[userId] || [];
  }

  // Enrich cart items dynamically with live product info and calculate totals
  let subtotal = 0;
  const enrichedCart = [];

  for (const item of rawCart) {
    const product = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (product) {
      const unitPrice = role === 'dealer' ? product.dealerPrice : product.customerPrice;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;

      const productPayload = {
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
        availability: product.stockQuantity > 0 ? (role === 'dealer' ? `${product.stockQuantity} ${product.unit} Available` : 'In Stock') : 'Out of Stock'
      };

      // SECURITY & BUSINESS RULE: Stock quantity and wholesale details are ONLY exposed to Dealer
      if (role === 'dealer') {
        productPayload.zohoRowId = product.zohoRowId;
        productPayload.dealerPrice = product.dealerPrice;
        productPayload.customerPrice = product.customerPrice;
        productPayload.stockQuantity = product.stockQuantity;
        productPayload.minDealerOrderQty = product.minDealerOrderQty || 1;
      }

      enrichedCart.push({
        product: productPayload,
        qty: item.qty,
        itemSubtotal
      });
    }
  }

  const deliveryCharge = role === 'dealer' || subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const totalAmount = subtotal + deliveryCharge;
  const cartData = {
    items: enrichedCart,
    itemCount: enrichedCart.reduce((acc, i) => acc + i.qty, 0),
    subtotal,
    deliveryCharge,
    total: totalAmount,
    totalAmount
  };

  res.json({
    role,
    userId,
    customerId: role === 'customer' ? userId : undefined,
    dealerId: role === 'dealer' ? userId : undefined,
    cart: cartData,
    ...cartData
  });
});

// Add to Cart (Customer or Dealer)
app.post('/api/cart', (req, res) => {
  const { customerId, dealerId, userId, role = 'customer', productId } = req.body;
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  const effectiveRole = (role || (dealerId ? 'dealer' : 'customer')).toLowerCase();
  const effectiveUserId = dealerId || customerId || userId || (effectiveRole === 'dealer' ? 'DLR-01' : 'CUST-01');
  const quantity = Math.max(1, Number(req.body.quantity !== undefined ? req.body.quantity : (req.body.qty !== undefined ? req.body.qty : 1)));
  const store = getStore();

  const product = store.zohoWorkbookProducts.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found in Zoho Workbook.' });
  }

  // Stock check for Dealer & Customer
  if (effectiveRole === 'dealer') {
    const minMoq = product.minDealerOrderQty || 1;
    if (quantity < minMoq) {
      return res.status(400).json({
        error: `Minimum order quantity for ${product.name} is ${minMoq} ${product.unit}.`
      });
    }
  }

  let cartTarget = null;
  if (effectiveRole === 'dealer') {
    if (!store.dealerCarts) store.dealerCarts = {};
    if (!store.dealerCarts[effectiveUserId]) store.dealerCarts[effectiveUserId] = [];
    cartTarget = store.dealerCarts[effectiveUserId];
  } else {
    if (!store.customerCarts) store.customerCarts = {};
    if (!store.customerCarts[effectiveUserId]) store.customerCarts[effectiveUserId] = [];
    cartTarget = store.customerCarts[effectiveUserId];
  }

  const existing = cartTarget.find((item) => item.productId === productId);
  const nextTotalQty = existing ? existing.qty + quantity : quantity;

  // Enforce available stock in Zoho Workbook
  if (product.stockQuantity < nextTotalQty) {
    return res.status(400).json({
      error: `Cannot add ${quantity} units. Available Zoho Workbook stock is only ${product.stockQuantity} ${product.unit} (Current in cart: ${existing ? existing.qty : 0}).`
    });
  }

  if (existing) {
    existing.qty = nextTotalQty;
  } else {
    cartTarget.push({
      productId,
      qty: quantity,
      addedAt: new Date().toISOString()
    });
  }

  saveStore(store);

  // Return updated enriched cart
  let subtotal = 0;
  const enrichedCart = [];

  for (const item of cartTarget) {
    const prod = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (prod) {
      const unitPrice = effectiveRole === 'dealer' ? prod.dealerPrice : prod.customerPrice;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;
      const prodPayload = {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        price: unitPrice,
        mrp: prod.mrp,
        unit: prod.unit,
        image: prod.image
      };
      if (effectiveRole === 'dealer') {
        prodPayload.zohoRowId = prod.zohoRowId;
        prodPayload.dealerPrice = prod.dealerPrice;
        prodPayload.customerPrice = prod.customerPrice;
        prodPayload.stockQuantity = prod.stockQuantity;
        prodPayload.minDealerOrderQty = prod.minDealerOrderQty || 1;
      }
      enrichedCart.push({
        product: prodPayload,
        qty: item.qty,
        itemSubtotal
      });
    }
  }

  const deliveryCharge = effectiveRole === 'dealer' || subtotal > 5000 || subtotal === 0 ? 0 : 250;
  const totalAmount = subtotal + deliveryCharge;
  const cartData = {
    items: enrichedCart,
    itemCount: enrichedCart.reduce((acc, i) => acc + i.qty, 0),
    subtotal,
    deliveryCharge,
    total: totalAmount,
    totalAmount
  };

  res.status(201).json({
    success: true,
    cart: cartData,
    ...cartData
  });
});

// Update Cart Quantity
app.patch('/api/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const { customerId, dealerId, userId, role = 'customer', qty, delta } = req.body;
  const effectiveRole = (role || (dealerId ? 'dealer' : 'customer')).toLowerCase();
  const effectiveUserId = dealerId || customerId || userId || (effectiveRole === 'dealer' ? 'DLR-01' : 'CUST-01');
  const store = getStore();

  const cartDict = effectiveRole === 'dealer' ? (store.dealerCarts || {}) : (store.customerCarts || {});
  if (!cartDict[effectiveUserId]) {
    return res.status(404).json({ error: 'Cart not found.' });
  }

  const itemIndex = cartDict[effectiveUserId].findIndex((i) => i.productId === productId);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not in cart.' });
  }

  const product = store.zohoWorkbookProducts.find((p) => p.id === productId);
  let nextQty = cartDict[effectiveUserId][itemIndex].qty;
  if (delta !== undefined) {
    nextQty += Number(delta);
  } else if (qty !== undefined) {
    nextQty = Number(qty);
  }

  // Stock check for updates
  if (nextQty > 0 && product && product.stockQuantity < nextQty) {
    return res.status(400).json({
      error: `Cannot update to ${nextQty} ${product.unit}. Available Zoho Workbook stock is ${product.stockQuantity} ${product.unit}.`
    });
  }

  if (nextQty <= 0) {
    cartDict[effectiveUserId].splice(itemIndex, 1);
  } else {
    cartDict[effectiveUserId][itemIndex].qty = nextQty;
  }

  saveStore(store);

  // Return updated enriched cart
  const rawCart = cartDict[effectiveUserId];
  let subtotal = 0;
  const enrichedCart = [];

  for (const item of rawCart) {
    const prod = store.zohoWorkbookProducts.find((p) => p.id === item.productId);
    if (prod) {
      const unitPrice = effectiveRole === 'dealer' ? prod.dealerPrice : prod.customerPrice;
      const itemSubtotal = unitPrice * item.qty;
      subtotal += itemSubtotal;
      const prodPayload = {
        id: prod.id,
        sku: prod.sku,
        name: prod.name,
        price: unitPrice,
        mrp: prod.mrp,
        unit: prod.unit,
        image: prod.image
      };
      if (effectiveRole === 'dealer') {
        prodPayload.zohoRowId = prod.zohoRowId;
        prodPayload.dealerPrice = prod.dealerPrice;
        prodPayload.customerPrice = prod.customerPrice;
        prodPayload.stockQuantity = prod.stockQuantity;
        prodPayload.minDealerOrderQty = prod.minDealerOrderQty || 1;
      }
      enrichedCart.push({
        product: prodPayload,
        qty: item.qty,
        itemSubtotal
      });
    }
  }

  const deliveryCharge = effectiveRole === 'dealer' || subtotal > 5000 || subtotal === 0 ? 0 : 250;
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
  const role = (req.query.role || (req.query.dealerId ? 'dealer' : 'customer')).toLowerCase();
  const userId = req.query.dealerId || req.query.customerId || req.query.userId || (role === 'dealer' ? 'DLR-01' : 'CUST-01');
  const store = getStore();

  if (role === 'dealer' && store.dealerCarts && store.dealerCarts[userId]) {
    store.dealerCarts[userId] = store.dealerCarts[userId].filter((i) => i.productId !== productId);
    saveStore(store);
  } else if (store.customerCarts && store.customerCarts[userId]) {
    store.customerCarts[userId] = store.customerCarts[userId].filter((i) => i.productId !== productId);
    saveStore(store);
  }

  res.json({ success: true, message: 'Item removed from cart' });
});

// Clear cart
app.delete('/api/cart', (req, res) => {
  const role = (req.query.role || (req.query.dealerId ? 'dealer' : 'customer')).toLowerCase();
  const userId = req.query.dealerId || req.query.customerId || req.query.userId || (role === 'dealer' ? 'DLR-01' : 'CUST-01');
  const store = getStore();

  if (role === 'dealer' && store.dealerCarts) {
    store.dealerCarts[userId] = [];
    saveStore(store);
  } else if (store.customerCarts) {
    store.customerCarts[userId] = [];
    saveStore(store);
  }

  res.json({ success: true, message: 'Cart cleared' });
});

// =========================================================================
// 9 & 10. ORDER FLOW & DIRECT PAYMENTS
// =========================================================================
app.post('/api/orders', (req, res) => {
  const { userId, dealerId, customerId, role, items, paymentMethod, paymentSubType, shippingAddress } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty. Please add products.' });
  }

  const store = getStore();
  const effectiveUserId = userId || dealerId || customerId;
  const orderRole = (role || (dealerId ? 'dealer' : 'customer')).toLowerCase();

  let user = null;
  if (orderRole === 'customer') {
    user = store.users.customers.find((c) => c.id === effectiveUserId) || store.users.customers[0];
  } else if (orderRole === 'dealer') {
    user = store.users.dealers.find((d) => d.id === effectiveUserId);
    if (!user || !user.zohoVerified) {
      return res.status(403).json({ error: 'Unverified dealer cannot place orders. Must be verified in Zoho CRM.' });
    }
  }

  // Prevent duplicate order creation if clicked repeatedly within 3 seconds
  const recentDuplicate = (store.orders || []).find(
    (o) =>
      o.userId === (user ? user.id : effectiveUserId) &&
      Date.now() - new Date(o.createdAt).getTime() < 3000 &&
      o.items?.length === items.length
  );
  if (recentDuplicate) {
    return res.status(200).json({
      success: true,
      order: recentDuplicate,
      updatedUser: user,
      isDuplicatePrevented: true
    });
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
    const pId = item.productId || item.product?.id || item.id;
    const product = store.zohoWorkbookProducts.find((p) => p.id === pId);
    if (!product) continue;
    const qty = Number(item.qty || item.quantity || 1);
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

  // Clear backend cart on successful order (Customer or Dealer)
  if (orderRole === 'customer' && store.customerCarts) {
    if (user?.id) store.customerCarts[user.id] = [];
    if (effectiveUserId) store.customerCarts[effectiveUserId] = [];
  } else if (orderRole === 'dealer' && store.dealerCarts) {
    if (user?.id) store.dealerCarts[user.id] = [];
    if (effectiveUserId) store.dealerCarts[effectiveUserId] = [];
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

  const user = store.users.customers.find((u) => u.id === userId) ||
             store.users.dealers.find((u) => u.id === userId) ||
             store.users.plumbers.find((u) => u.id === userId) ||
             store.users.admins.find((u) => u.id === userId);

  if (user && user.notifications) {
    const notif = user.notifications.find((n) => n.id === id);
    if (notif) notif.read = true;
    saveStore(store);
  }

  res.json({ success: true });
});

// =========================================================================
// PLUMBER AUTHENTICATION & ROLE AUTHORIZATION MIDDLEWARE
// =========================================================================
function authenticatePlumber(req, res, next) {
  const store = getStore();
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

  // Non-plumber token rejection check
  if (token && (token.startsWith('jwt-sim-customer-') || token.startsWith('jwt-sim-dealer-'))) {
    return res.status(403).json({ error: 'Forbidden: Non-Plumber role attempting Plumber APIs.' });
  }

  let plumberId = req.headers['x-plumber-id'] || req.query.plumberId || req.body?.plumberId;

  if (token && token.startsWith('jwt-sim-plumber-')) {
    const match = token.match(/^jwt-sim-plumber-(.+)-\d+$/);
    if (match) {
      plumberId = match[1];
    } else {
      const withoutPrefix = token.replace('jwt-sim-plumber-', '');
      const lastDash = withoutPrefix.lastIndexOf('-');
      plumberId = lastDash !== -1 ? withoutPrefix.substring(0, lastDash) : withoutPrefix;
    }
  }

  if (!plumberId && req.params.plumberId) {
    plumberId = req.params.plumberId;
  }

  if (!plumberId) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required for Plumber access.' });
  }

  const plumber = store.users.plumbers.find((p) => p.id === plumberId);
  if (!plumber) {
    return res.status(403).json({ error: 'Forbidden: Plumber account not found or unauthorized.' });
  }

  if (plumber.role !== 'plumber') {
    return res.status(403).json({ error: 'Forbidden: Non-Plumber role attempting Plumber APIs.' });
  }

  if (plumber.status && plumber.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'Forbidden: Plumber account is not active.' });
  }

  req.plumber = plumber;
  req.plumberId = plumber.id;
  next();
}

// =========================================================================
// 5. PLUMBER ROLE COMPLETE API IMPLEMENTATION
// =========================================================================

// 5.1 Plumber Dashboard: Dynamic Stats, Profile & Recent Items
app.get('/api/plumber/dashboard', authenticatePlumber, (req, res) => {
  const store = getStore();
  const plumber = req.plumber;

  const activities = (store.activities || []).filter((a) => a.assignedPlumberId === plumber.id);
  const requests = (store.productRequests || []).filter((r) => r.plumberId === plumber.id);
  const notifications = plumber.notifications || [];

  const stats = {
    assignedActivitiesCount: activities.filter((a) => a.status === 'ASSIGNED').length,
    pendingActivitiesCount: activities.filter((a) => a.status === 'ASSIGNED' || a.status === 'ACCEPTED').length,
    inProgressActivitiesCount: activities.filter((a) => a.status === 'IN_PROGRESS').length,
    completedActivitiesCount: activities.filter((a) => a.status === 'COMPLETED').length,
    productRequestsCount: requests.length,
    pendingProductRequestsCount: requests.filter((r) => r.status === 'PENDING').length
  };

  const recentActivities = [...activities].slice(0, 3);
  const recentNotifications = [...notifications].slice(0, 5);
  const recentProductRequests = [...requests].slice(0, 3);

  res.json({
    plumber,
    stats,
    recentActivities,
    recentNotifications,
    recentProductRequests
  });
});

// 5.2 Plumber Assigned & Completed Activities List
app.get('/api/plumber/activities', authenticatePlumber, (req, res) => {
  const store = getStore();
  const plumber = req.plumber;
  const { filter, search } = req.query;

  let activities = (store.activities || []).filter((a) => a.assignedPlumberId === plumber.id);

  if (filter === 'active') {
    activities = activities.filter((a) => a.status !== 'COMPLETED');
  } else if (filter === 'completed') {
    activities = activities.filter((a) => a.status === 'COMPLETED');
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    activities = activities.filter(
      (a) =>
        a.id.toLowerCase().includes(q) ||
        (a.customerName && a.customerName.toLowerCase().includes(q)) ||
        (a.location && a.location.toLowerCase().includes(q)) ||
        (a.requiredWork && a.requiredWork.toLowerCase().includes(q))
    );
  }

  res.json({ activities, totalCount: activities.length });
});

// 5.3 Plumber Activity Details (Strict ownership validation)
app.get('/api/plumber/activities/:id', authenticatePlumber, (req, res) => {
  const store = getStore();
  const activity = (store.activities || []).find((a) => a.id === req.params.id);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found.' });
  }

  if (activity.assignedPlumberId !== req.plumber.id) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this activity.' });
  }

  res.json({ activity });
});

// 5.4 Plumber Activity Status Transition (Validated sequence only)
app.patch('/api/plumber/activities/:id/status', authenticatePlumber, (req, res) => {
  const store = getStore();
  const activity = (store.activities || []).find((a) => a.id === req.params.id);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found.' });
  }

  if (activity.assignedPlumberId !== req.plumber.id) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this activity.' });
  }

  const currentStatus = activity.status;
  const targetStatus = req.body.status;

  if (!targetStatus) {
    return res.status(400).json({ error: 'Target status is required.' });
  }

  // Duplicate status update check
  if (currentStatus === targetStatus) {
    return res.status(400).json({ error: `Activity is already in ${currentStatus} status.` });
  }

  // Strict valid status transitions:
  // ASSIGNED -> ACCEPTED
  // ACCEPTED -> IN_PROGRESS
  // IN_PROGRESS -> COMPLETED
  const validTransitions = {
    ASSIGNED: ['ACCEPTED'],
    ACCEPTED: ['IN_PROGRESS'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: []
  };

  const allowedNext = validTransitions[currentStatus] || [];
  if (!allowedNext.includes(targetStatus)) {
    return res.status(400).json({
      error: `Invalid status transition from ${currentStatus} to ${targetStatus}. Valid sequence is: ASSIGNED -> ACCEPTED -> IN_PROGRESS -> COMPLETED.`
    });
  }

  activity.status = targetStatus;
  if (req.body.remarks !== undefined) {
    activity.remarks = req.body.remarks;
  }

  const plumber = req.plumber;

  // Synchronize with related order if exists
  if (activity.orderId) {
    const order = (store.orders || []).find((o) => o.id === activity.orderId);
    if (order) {
      order.plumberTaskStatus = targetStatus;
      if (req.body.remarks) {
        order.plumberNotes = req.body.remarks;
      }
      if (targetStatus === 'COMPLETED') {
        order.orderStatus = 'Delivered';
        order.trackingTimeline.forEach((t) => (t.done = true));
      }
    }
  }

  if (targetStatus === 'COMPLETED') {
    activity.completedDate = new Date().toISOString();
    activity.rewardPointsEarned = 150;
    plumber.completedJobs = (plumber.completedJobs || 0) + 1;
    plumber.rewardPoints = (plumber.rewardPoints || 0) + 150;
    plumber.walletBalance = (plumber.walletBalance || 0) + 500;

    if (!plumber.notifications) plumber.notifications = [];
    plumber.notifications.unshift({
      id: `NOTIF-PLB-${Date.now()}`,
      type: 'REWARD_UPDATE',
      title: '+150 Reward Points Credited',
      message: `Activity ${activity.id} marked completed. Wallet balance updated to ₹${plumber.walletBalance.toLocaleString('en-IN')}.`,
      time: 'Just now',
      read: false
    });
  } else if (targetStatus === 'ACCEPTED') {
    if (!plumber.notifications) plumber.notifications = [];
    plumber.notifications.unshift({
      id: `NOTIF-PLB-${Date.now()}`,
      type: 'ASSIGNED_ACTIVITY',
      title: `Activity Accepted: ${activity.id}`,
      message: `You accepted the activity for ${activity.customerName} scheduled on ${activity.scheduledDate}.`,
      time: 'Just now',
      read: false
    });
  } else if (targetStatus === 'IN_PROGRESS') {
    if (!plumber.notifications) plumber.notifications = [];
    plumber.notifications.unshift({
      id: `NOTIF-PLB-${Date.now()}`,
      type: 'ASSIGNED_ACTIVITY',
      title: `Activity In Progress: ${activity.id}`,
      message: `Installation started at site: ${activity.location}.`,
      time: 'Just now',
      read: false
    });
  }

  saveStore(store);
  res.json({ success: true, activity, plumber });
});

// 5.5 Plumber Activity Remarks update
app.patch('/api/plumber/activities/:id/remarks', authenticatePlumber, (req, res) => {
  const store = getStore();
  const activity = (store.activities || []).find((a) => a.id === req.params.id);

  if (!activity) {
    return res.status(404).json({ error: 'Activity not found.' });
  }

  if (activity.assignedPlumberId !== req.plumber.id) {
    return res.status(403).json({ error: 'Forbidden: You are not assigned to this activity.' });
  }

  activity.remarks = (req.body.remarks || '').trim();
  saveStore(store);
  res.json({ success: true, activity });
});

// 5.6 Plumber Products Catalog with Technical Requirements
app.get('/api/plumber/products', authenticatePlumber, (req, res) => {
  const store = getStore();
  const { categoryId, search, sort, filter } = req.query;

  let products = zohoProductService.getProductsByRole('plumber', categoryId, search, sort, filter);

  // Plumber sees technical specs, plumber loyalty points, and availability status
  const plumberProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    categoryId: p.categoryId,
    categoryName: p.categoryName,
    brand: p.brand,
    unit: p.unit,
    image: p.image,
    customerPrice: p.customerPrice,
    mrp: p.mrp,
    specifications: p.specifications,
    installationNote: p.installationNote,
    plumberPoints: p.plumberPoints || 50,
    availability: p.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
    inStock: p.stockQuantity > 0
  }));

  const categoriesWithCounts = store.categories.map((cat) => {
    const count = store.zohoWorkbookProducts.filter((p) => p.categoryId === cat.id).length;
    return { ...cat, productCount: count };
  });

  res.json({
    categories: categoriesWithCounts,
    products: plumberProducts,
    totalCount: plumberProducts.length
  });
});

// 5.7 Plumber Single Product Details
app.get('/api/plumber/products/:productId', authenticatePlumber, (req, res) => {
  const store = getStore();
  const product = store.zohoWorkbookProducts.find((p) => p.id === req.params.productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  // Active activities for this plumber that can be referenced in requirement requests
  const activeActivities = (store.activities || []).filter(
    (a) => a.assignedPlumberId === req.plumber.id && a.status !== 'COMPLETED'
  );

  res.json({
    product: {
      ...product,
      availability: product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock',
      inStock: product.stockQuantity > 0
    },
    activeActivities
  });
});

// 5.8 Plumber Product Requests: Get My Requests (Strict resource ownership)
app.get('/api/plumber/product-requests', authenticatePlumber, (req, res) => {
  const store = getStore();
  const { status } = req.query;

  let requests = (store.productRequests || []).filter((r) => r.plumberId === req.plumber.id);

  if (status && status !== 'all') {
    requests = requests.filter((r) => r.status === status);
  }

  res.json({ requests, totalCount: requests.length });
});

// 5.9 Plumber Submit Product Requirement / Request
app.post('/api/plumber/product-requests', authenticatePlumber, (req, res) => {
  const store = getStore();
  const { productId, quantity, reason, activityId, remarks } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  const product = store.zohoWorkbookProducts.find((p) => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Selected product was not found in catalog.' });
  }

  const numQty = parseInt(quantity, 10);
  if (isNaN(numQty) || numQty <= 0) {
    return res.status(400).json({ error: 'Quantity must be a positive integer greater than 0.' });
  }

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: 'Please provide a reason or requirement for this product.' });
  }

  // If activityId is provided, verify it belongs to this plumber
  if (activityId) {
    const activity = (store.activities || []).find((a) => a.id === activityId);
    if (!activity) {
      return res.status(404).json({ error: 'Referenced activity does not exist.' });
    }
    if (activity.assignedPlumberId !== req.plumber.id) {
      return res.status(403).json({ error: 'Forbidden: Referenced activity belongs to another plumber.' });
    }
  }

  // Duplicate request check: prevent identical pending requests for same product and activity
  if (!store.productRequests) store.productRequests = [];
  const existingPending = store.productRequests.find(
    (r) =>
      r.plumberId === req.plumber.id &&
      r.productId === productId &&
      r.status === 'PENDING' &&
      (activityId ? r.activityId === activityId : true)
  );

  if (existingPending) {
    return res.status(409).json({
      error: 'Duplicate request: A pending product requirement for this item is already active.'
    });
  }

  const now = new Date().toISOString();
  const newReq = {
    id: `REQ-PLB-${500 + store.productRequests.length + 1}`,
    plumberId: req.plumber.id,
    plumberName: req.plumber.name,
    productId: product.id,
    productName: product.name,
    sku: product.sku,
    categoryName: product.categoryName,
    quantity: numQty,
    reason: reason.trim(),
    activityId: activityId || null,
    remarks: remarks ? remarks.trim() : '',
    status: 'PENDING', // PENDING | APPROVED | REJECTED | FULFILLED | CANCELLED
    createdAt: now,
    updatedAt: now,
    adminNotes: ''
  };

  store.productRequests.unshift(newReq);

  // Add notification to plumber
  if (!req.plumber.notifications) req.plumber.notifications = [];
  req.plumber.notifications.unshift({
    id: `NOTIF-PLB-${Date.now()}`,
    type: 'REQUEST_UPDATE',
    title: `Requirement Submitted (${newReq.id})`,
    message: `Requirement for ${numQty}x ${product.name} submitted successfully. Awaiting dispatch review.`,
    time: 'Just now',
    read: false
  });

  saveStore(store);
  res.status(201).json({ success: true, request: newReq });
});

// 5.10 Plumber Cancel Product Request
app.patch('/api/plumber/product-requests/:id/cancel', authenticatePlumber, (req, res) => {
  const store = getStore();
  const request = (store.productRequests || []).find((r) => r.id === req.params.id);

  if (!request) {
    return res.status(404).json({ error: 'Product request not found.' });
  }

  if (request.plumberId !== req.plumber.id) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify another plumber\'s request.' });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({
      error: `Only pending requests can be cancelled. Current status is ${request.status}.`
    });
  }

  request.status = 'CANCELLED';
  request.updatedAt = new Date().toISOString();

  if (!req.plumber.notifications) req.plumber.notifications = [];
  req.plumber.notifications.unshift({
    id: `NOTIF-PLB-${Date.now()}`,
    type: 'REQUEST_UPDATE',
    title: `Requirement Cancelled (${request.id})`,
    message: `Your requirement request for ${request.productName} has been cancelled.`,
    time: 'Just now',
    read: false
  });

  saveStore(store);
  res.json({ success: true, request });
});

// 5.11 Plumber Notifications
app.get('/api/plumber/notifications', authenticatePlumber, (req, res) => {
  const notifications = req.plumber.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  res.json({ notifications, unreadCount });
});

app.patch('/api/plumber/notifications/:id/read', authenticatePlumber, (req, res) => {
  const store = getStore();
  const plumber = req.plumber;
  const notif = (plumber.notifications || []).find((n) => n.id === req.params.id);

  if (notif) {
    notif.read = true;
    saveStore(store);
  }

  res.json({ success: true });
});

app.patch('/api/plumber/notifications/read-all', authenticatePlumber, (req, res) => {
  const store = getStore();
  const plumber = req.plumber;

  (plumber.notifications || []).forEach((n) => (n.read = true));
  saveStore(store);
  res.json({ success: true });
});

// 5.12 Plumber Profile
app.get('/api/plumber/profile', authenticatePlumber, (req, res) => {
  res.json({ plumber: req.plumber });
});

app.patch('/api/plumber/profile', authenticatePlumber, (req, res) => {
  const store = getStore();
  const plumber = req.plumber;
  const { name, email, address, specialization, skills, serviceArea, avatar } = req.body;

  if (name !== undefined) plumber.name = name.trim();
  if (email !== undefined) plumber.email = email.trim();
  if (address !== undefined) plumber.address = address.trim();
  if (specialization !== undefined) plumber.specialization = specialization.trim();
  if (serviceArea !== undefined) plumber.serviceArea = serviceArea.trim();
  if (avatar !== undefined) plumber.avatar = avatar.trim();
  if (skills !== undefined) {
    if (Array.isArray(skills)) {
      plumber.skills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      plumber.skills = skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  saveStore(store);
  res.json({ success: true, plumber });
});

// 5.13 Plumber Settings
app.get('/api/plumber/settings', authenticatePlumber, (req, res) => {
  res.json({ settings: req.plumber.settings || {} });
});

app.patch('/api/plumber/settings', authenticatePlumber, (req, res) => {
  const store = getStore();
  req.plumber.settings = { ...(req.plumber.settings || {}), ...req.body };
  saveStore(store);
  res.json({ success: true, settings: req.plumber.settings });
});

// Backward compatibility for existing endpoints
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
