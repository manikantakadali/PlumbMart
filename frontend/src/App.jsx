import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Layers,
  ShoppingCart,
  User,
  Building2,
  Wrench,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  CreditCard,
  Bell,
  Search,
  EyeOff,
  Eye,
  LogOut,
  FileSpreadsheet,
  Sparkles,
  Phone,
  KeyRound,
  Award,
  ClipboardList,
  MapPin,
  Plus,
  Minus
} from 'lucide-react';
import BlueprintAndComparison from './components/BlueprintAndComparison';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const [mainView, setMainView] = useState('mobile'); // 'mobile' | 'admin' | 'blueprint'

  // Auth & Role state inside Mobile App
  const [authStep, setAuthStep] = useState('LOGIN'); // 'LOGIN' | 'OTP' | 'AUTHENTICATED'
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'dealer' | 'plumber'
  const [mobileInput, setMobileInput] = useState('9876543210');
  const [nameInput, setNameInput] = useState('Rahul Sharma');
  const [otpInput, setOtpInput] = useState('123456');
  const [authError, setAuthError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Mobile Screen Navigation State
  // Customer/Dealer screens: 'DASHBOARD' | 'CATEGORIES' | 'PRODUCTS' | 'PRODUCT_DETAIL' | 'CART' | 'CHECKOUT' | 'ORDER_CONFIRMATION' | 'ORDER_TRACKING'
  const [mobileScreen, setMobileScreen] = useState('DASHBOARD');
  const [plumberTab, setPlumberTab] = useState('ORDERS'); // 'ORDERS' | 'PRODUCTS' | 'PROFILE'

  // Data from Backend API
  const [zohoMeta, setZohoMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  // Checkout Payment State
  const [customerPaymentType, setCustomerPaymentType] = useState('UPI (GPay / PhonePe)');
  const [dealerPaymentMethod, setDealerPaymentMethod] = useState('UPFRONT'); // 'UPFRONT' | 'CREDIT_30_DAYS' | 'CREDIT_90_DAYS'
  const [checkoutError, setCheckoutError] = useState('');

  // Plumber Data
  const [plumberData, setPlumberData] = useState(null);

  // Admin Data
  const [adminData, setAdminData] = useState(null);

  // Fetch Admin Overview (also used for blueprint & demo persona cards)
  const fetchAdminOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/overview');
      const data = await res.json();
      setAdminData(data);
      setZohoMeta(data.zohoMeta);
    } catch (err) {
      console.error('Failed to load overview:', err);
    }
  }, []);

  // Fetch Role-Filtered Products from Zoho Workbook endpoint
  const fetchProductsForRole = useCallback(async (role, categoryId = 'all', search = '') => {
    try {
      const params = new URLSearchParams({ role, categoryId, search });
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setZohoMeta(data.zohoMeta || null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  // Fetch Orders for current user
  const fetchOrders = useCallback(async (user) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders?role=${user.role}&userId=${user.id}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, []);

  // Fetch Plumber Dashboard
  const fetchPlumberDashboard = useCallback(async (plumberId) => {
    try {
      const res = await fetch(`/api/plumber/${plumberId || 'PLB-01'}`);
      const data = await res.json();
      setPlumberData(data);
    } catch (err) {
      console.error('Failed to fetch plumber dashboard:', err);
    }
  }, []);

  useEffect(() => {
    fetchAdminOverview();
    fetchProductsForRole('customer');
  }, [fetchAdminOverview, fetchProductsForRole]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobileInput,
          role: selectedRole,
          name: nameInput
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data);
        return;
      }
      setOtpInput(data.demoOtp || '123456');
      setAuthStep('OTP');
    } catch (err) {
      setAuthError({ error: 'Network error connecting to backend server.' });
    }
  };

  // Step 2: Verify OTP & Login
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobileInput,
          otp: otpInput,
          role: selectedRole,
          name: nameInput
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data);
        return;
      }
       completeLogin(data.user);
    } catch (err) {
      setAuthError({ error: 'Failed to verify OTP.' });
    }
  };

  const completeLogin = async (user) => {
    setCurrentUser(user);
    setAuthStep('AUTHENTICATED');
    setMobileScreen('DASHBOARD');
    setCart([]);
    setCheckoutError('');
    await fetchProductsForRole(user.role, 'all', '');
    await fetchOrders(user);
    if (user.role === 'plumber') {
      await fetchPlumberDashboard(user.id);
    }
    await fetchAdminOverview();
  };

  // Instant 1-Click Persona Switcher for Smooth Interview Demonstration
  const quickSwitchPersona = async (role, mobile, name = '') => {
    setSelectedRole(role);
    setMobileInput(mobile);
    setNameInput(name);
    setAuthError(null);

    const otpRes = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, role, name })
    });
    const otpData = await otpRes.json();
    if (!otpRes.ok) {
      // e.g., Unverified Zoho Dealer — show Login screen with Zoho Verification Error Banner!
      setCurrentUser(null);
      setAuthStep('LOGIN');
      setAuthError(otpData);
      return;
    }

    const verifyRes = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, otp: '123456', role, name })
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.ok) {
      await completeLogin(verifyData.user);
    }
  };

  // Cart Operations
  const addToCart = (product, customQty) => {
    const defaultMin = currentUser?.role === 'dealer' ? product.minDealerOrderQty || 1 : 1;
    const qtyToAdd = customQty || defaultMin;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + qtyToAdd } : item
        );
      }
      return [...prev, { product, qty: qtyToAdd }];
    });
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const nextQty = item.qty + delta;
          return nextQty > 0 ? { ...item, qty: nextQty } : null;
        })
        .filter(Boolean)
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  // Place Order (Customer Direct Payment OR Dealer Upfront / 30D / 90D Credit)
  const handlePlaceOrder = async () => {
    setCheckoutError('');
    try {
      const payload = {
        userId: currentUser.id,
        role: currentUser.role,
        items: cart.map((i) => ({ productId: i.product.id, qty: i.qty })),
        paymentMethod: currentUser.role === 'customer' ? 'DIRECT_PAYMENT' : dealerPaymentMethod,
        paymentSubType:
          currentUser.role === 'customer'
            ? customerPaymentType
            : dealerPaymentMethod === 'CREDIT_90_DAYS'
            ? 'Zoho Approved 90-Day Credit'
            : dealerPaymentMethod === 'CREDIT_30_DAYS'
            ? 'Zoho 30-Day Dealer Credit'
            : 'Upfront Online Dealer Payment'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error || 'Checkout failed.');
        return;
      }

      setCart([]);
      setActiveOrder(data.order);
      if (data.updatedUser) {
        setCurrentUser(data.updatedUser);
      }
      await fetchProductsForRole(currentUser.role, selectedCategory, searchQuery);
      await fetchOrders(currentUser);
      await fetchAdminOverview();
      setMobileScreen('ORDER_CONFIRMATION');
    } catch (err) {
      setCheckoutError('Network error while placing order.');
    }
  };

  // Plumber Job Status Update
  const handlePlumberStatusUpdate = async (orderId, plumberTaskStatus, plumberNotes) => {
    await fetch(`/api/plumber/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plumberTaskStatus, plumberNotes })
    });
    await fetchPlumberDashboard(currentUser?.id);
    await fetchAdminOverview();
  };

  // Admin Handlers
  const handleAdminUpdateDealer = async (dealerId, updates) => {
    const res = await fetch(`/api/admin/dealers/${dealerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    await fetchAdminOverview();
    if (currentUser?.id === dealerId && data.dealer) {
      setCurrentUser(data.dealer);
    }
  };

  const handleAdminUpdatePlumber = async (plumberId, updates) => {
    await fetch(`/api/admin/plumbers/${plumberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    await fetchAdminOverview();
    if (currentUser?.id === plumberId) {
      await fetchPlumberDashboard(plumberId);
    }
  };

  const handleAdminUpdateProductRow = async (productId, updates) => {
    await fetch(`/api/zoho/workbook/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    await fetchAdminOverview();
    if (currentUser) {
      await fetchProductsForRole(currentUser.role, selectedCategory, searchQuery);
    }
  };

  const handleAdminUpdateOrder = async (orderId, updates) => {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    await fetchAdminOverview();
    if (currentUser) {
      await fetchOrders(currentUser);
    }
  };

  const handleTriggerZohoSync = async () => {
    await fetch('/api/zoho/sync', { method: 'POST' });
    await fetchAdminOverview();
    if (currentUser) {
      await fetchProductsForRole(currentUser.role, selectedCategory, searchQuery);
    }
  };

  const handleResetDemo = async () => {
    await fetch('/api/admin/reset-demo', { method: 'POST' });
    await fetchAdminOverview();
    if (currentUser) {
      await fetchProductsForRole(currentUser.role, 'all', '');
      await fetchOrders(currentUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 font-black text-white text-lg">
              PM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">PlumbMart</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <FileSpreadsheet className="w-3 h-3" /> Zoho Workbook Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Customer • Zoho-Verified Dealer (30/90D Credit) • Plumber • Admin
              </p>
            </div>
          </div>

          {/* Main View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMainView('mobile')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mainView === 'mobile'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App (3 Roles)</span>
            </button>
            <button
              onClick={() => setMainView('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mainView === 'admin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
            <button
              onClick={() => setMainView('blueprint')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                mainView === 'blueprint'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>App Flow &amp; Zoho Blueprint</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {mainView === 'blueprint' && (
          <BlueprintAndComparison
            zohoMeta={zohoMeta}
            products={adminData?.products || products}
            onTriggerZohoSync={handleTriggerZohoSync}
            onSwitchView={setMainView}
          />
        )}

        {mainView === 'admin' && (
          <AdminPortal
            adminData={adminData}
            onUpdateDealer={handleAdminUpdateDealer}
            onUpdatePlumber={handleAdminUpdatePlumber}
            onUpdateProductRow={handleAdminUpdateProductRow}
            onUpdateOrder={handleAdminUpdateOrder}
            onTriggerZohoSync={handleTriggerZohoSync}
            onResetDemo={handleResetDemo}
          />
        )}

        {mainView === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 items-start">
            {/* LEFT PANEL: Instant Role & Persona Switcher + Requirement Checklist */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    1-Click Interview Role Simulator
                  </h2>
                  <span className="text-[11px] text-slate-400">OTP: 123456</span>
                </div>
                <p className="text-xs text-slate-400">
                  Click any persona below to test their exact OTP Login, Zoho Verification, Stock Visibility, and Payment/Credit flow:
                </p>

                <div className="space-y-2.5">
                  {/* Persona 1: Customer */}
                  <button
                    onClick={() => quickSwitchPersona('customer', '9876543210', 'Rahul Sharma')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9876543210' && authStep === 'AUTHENTICATED'
                        ? 'bg-blue-950/60 border-blue-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                          1. CUSTOMER
                        </span>
                        <span className="font-bold text-xs text-white">Rahul Sharma (+91 9876543210)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Sees Retail Price ONLY • <strong className="text-rose-300">Stock Quantity Hidden</strong> • Direct Payment &amp; Order Tracking
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 2: Platinum Dealer (30 & 90 Days Credit Approved) */}
                  <button
                    onClick={() => quickSwitchPersona('dealer', '9000011111')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9000011111' && authStep === 'AUTHENTICATED'
                        ? 'bg-amber-950/50 border-amber-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          2A. APPROVED DEALER
                        </span>
                        <span className="font-bold text-xs text-white">Sri Venkateswara Dist. (9000011111)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Zoho Verified • <strong className="text-emerald-300">Sees Exact Stock Qty</strong> • Upfront, 30-Day &amp; <strong className="text-purple-300">90-Day Credit Unlocked</strong>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 3: Standard Verified Dealer (30-Day Only, 90-Day Locked) */}
                  <button
                    onClick={() => quickSwitchPersona('dealer', '9000022222')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9000022222' && authStep === 'AUTHENTICATED'
                        ? 'bg-amber-950/50 border-amber-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          2B. STANDARD DEALER
                        </span>
                        <span className="font-bold text-xs text-white">Metro Pipe Syndicate (9000022222)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Zoho Verified • Sees Stock Qty • Upfront &amp; 30-Day Credit (<strong className="text-rose-300">90-Day Credit Locked</strong>)
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 4: Unverified Dealer in Zoho (Login Blocked Test) */}
                  <button
                    onClick={() => quickSwitchPersona('dealer', '9000033333')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                      authError?.code === 'ZOHO_NOT_VERIFIED'
                        ? 'bg-rose-950/60 border-rose-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          2C. UNVERIFIED DEALER
                        </span>
                        <span className="font-bold text-xs text-white">Coastal Builders Mart (9000033333)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Tests Zoho Verification Gate: <strong className="text-rose-300">Login Blocked until Admin Verifies in Zoho</strong>
                      </p>
                    </div>
                    <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 5: Plumber */}
                  <button
                    onClick={() => quickSwitchPersona('plumber', '9111122222')}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9111122222' && authStep === 'AUTHENTICATED'
                        ? 'bg-purple-950/60 border-purple-500 text-white'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          3. PLUMBER
                        </span>
                        <span className="font-bold text-xs text-white">Ramesh Babu (9111122222)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Verified Master Plumber • Assigned Installations, Product Specs &amp; Notifications
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
                  </button>
                </div>
              </div>

              {/* Active Flow Breadcrumb Tracker */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Application Flow Tracker
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-blue-300 uppercase">
                    Role: {currentUser?.role || selectedRole}
                  </span>
                </div>

                {(!currentUser || currentUser.role === 'customer') && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { id: 'LOGIN', label: '1. OTP Login' },
                      { id: 'DASHBOARD', label: '2. Dashboard' },
                      { id: 'CATEGORIES', label: '3. Categories' },
                      { id: 'PRODUCTS', label: '4. Products (No Stock Qty)' },
                      { id: 'PRODUCT_DETAIL', label: '5. Product Details' },
                      { id: 'CART', label: '6. Cart' },
                      { id: 'CHECKOUT', label: '7. Direct Payment' },
                      { id: 'ORDER_CONFIRMATION', label: '8. Confirmation' },
                      { id: 'ORDER_TRACKING', label: '9. Order Tracking' }
                    ].map((s) => {
                      const active =
                        (authStep !== 'AUTHENTICATED' && s.id === 'LOGIN') ||
                        (authStep === 'AUTHENTICATED' && mobileScreen === s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (s.id === 'LOGIN') {
                              setAuthStep('LOGIN');
                              setCurrentUser(null);
                            } else if (authStep === 'AUTHENTICATED') {
                              setMobileScreen(s.id);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            active
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentUser?.role === 'dealer' && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { id: 'LOGIN', label: '1. OTP + Zoho Verification' },
                      { id: 'DASHBOARD', label: '2. Dealer Dashboard' },
                      { id: 'PRODUCTS', label: '3. Products (Price & Stock Qty)' },
                      { id: 'CART', label: '4. Bulk Cart' },
                      { id: 'CHECKOUT', label: '5. Checkout (Upfront / 30D / 90D)' },
                      { id: 'ORDER_TRACKING', label: '6. Dealer Orders' }
                    ].map((s) => {
                      const active = mobileScreen === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            if (s.id === 'LOGIN') {
                              setAuthStep('LOGIN');
                              setCurrentUser(null);
                            } else {
                              setMobileScreen(s.id);
                            }
                          }}
                          className={`px-2.5 py-1 rounded-lg font-medium transition ${
                            active
                              ? 'bg-amber-500 text-slate-950 font-bold shadow'
                              : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentUser?.role === 'plumber' && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { id: 'ORDERS', label: '1. Assigned Orders & Activities' },
                      { id: 'PRODUCTS', label: '2. Product Specs & Reward Points' },
                      { id: 'PROFILE', label: '3. Plumber Profile & Notifications' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setPlumberTab(s.id)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition ${
                          plumberTab === s.id
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL: Interactive Mobile Device Viewport */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[460px] bg-slate-900 border-[6px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden flex flex-col min-h-[760px] max-h-[840px]">
                {/* Mobile Status Bar */}
                <div className="bg-slate-950 px-6 py-2.5 flex items-center justify-between border-b border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-200">PlumbMart Mobile</span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Zoho Live
                    </span>
                    <span>5G • 100%</span>
                  </div>
                </div>

                {/* App Top Header inside Phone */}
                {authStep === 'AUTHENTICATED' && currentUser && (
                  <div className="bg-slate-900/95 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {mobileScreen !== 'DASHBOARD' && currentUser.role !== 'plumber' && (
                        <button
                          onClick={() => setMobileScreen('DASHBOARD')}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              currentUser.role === 'dealer'
                                ? 'bg-amber-500/20 text-amber-300'
                                : currentUser.role === 'plumber'
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {currentUser.role}
                          </span>
                          <span className="text-xs font-bold text-white truncate max-w-[170px]">
                            {currentUser.name}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          +91 {currentUser.mobile}
                          {currentUser.zohoContactId ? ` • ${currentUser.zohoContactId}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentUser.role !== 'plumber' && (
                        <button
                          onClick={() => setMobileScreen('CART')}
                          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          {cart.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                              {cart.length}
                            </span>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setAuthStep('LOGIN');
                          setCurrentUser(null);
                          setAuthError(null);
                        }}
                        title="Logout"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* SCROLLABLE PHONE BODY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* ========================================================= */}
                  {/* SCREEN A: OTP LOGIN & REGISTRATION                        */}
                  {/* ========================================================= */}
                  {authStep !== 'AUTHENTICATED' && (
                    <div className="space-y-5 py-2">
                      <div className="text-center space-y-1.5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-blue-600/30 font-black text-white text-2xl">
                          PM
                        </div>
                        <h3 className="text-xl font-bold text-white">Welcome to PlumbMart</h3>
                        <p className="text-xs text-slate-400">
                          Passwordless Mobile OTP Login &amp; Zoho Verification
                        </p>
                      </div>

                      {/* Role Tabs */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                        {[
                          { id: 'customer', label: 'Customer', icon: User },
                          { id: 'dealer', label: 'Dealer', icon: Building2 },
                          { id: 'plumber', label: 'Plumber', icon: Wrench }
                        ].map((r) => {
                          const Icon = r.icon;
                          const active = selectedRole === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                setSelectedRole(r.id);
                                setAuthStep('LOGIN');
                                setAuthError(null);
                                if (r.id === 'customer') setMobileInput('9876543210');
                                if (r.id === 'dealer') setMobileInput('9000011111');
                                if (r.id === 'plumber') setMobileInput('9111122222');
                              }}
                              className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition ${
                                active
                                  ? 'bg-blue-600 text-white shadow'
                                  : 'text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {r.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* Role-Specific Verification Rule Callout */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                        {selectedRole === 'customer' && (
                          <>
                            <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Customer OTP Registration &amp; Login
                            </div>
                            <p className="text-slate-400 text-[11px]">
                              Enter any 10-digit mobile number to login or auto-register via OTP.
                            </p>
                          </>
                        )}
                        {selectedRole === 'dealer' && (
                          <>
                            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                              <Lock className="w-4 h-4" /> Zoho CRM Dealer Verification Required
                            </div>
                            <p className="text-slate-400 text-[11px]">
                              Dealers can login <strong>ONLY if their mobile number is registered and verified in Zoho</strong>.
                            </p>
                          </>
                        )}
                        {selectedRole === 'plumber' && (
                          <>
                            <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                              <Award className="w-4 h-4" /> Certified Plumber Verification Flow
                            </div>
                            <p className="text-slate-400 text-[11px]">
                              Plumbers login via OTP with trade license &amp; KYC status verification.
                            </p>
                          </>
                        )}
                      </div>

                      {/* Error / Zoho Verification Rejection Box */}
                      {authError && (
                        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            {authError.code === 'ZOHO_NOT_VERIFIED'
                              ? 'Zoho Verification Pending — Login Blocked'
                              : 'Login Restricted'}
                          </div>
                          <p className="leading-relaxed">{authError.error}</p>
                          {authError.code === 'ZOHO_NOT_VERIFIED' && (
                            <div className="pt-1 flex items-center justify-between border-t border-rose-800/60">
                              <span className="text-[11px] font-mono text-rose-300">
                                Zoho ID: {authError.zohoContactId}
                              </span>
                              <button
                                type="button"
                                onClick={() => setMainView('admin')}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px]"
                              >
                                Approve in Admin Panel →
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {authStep === 'LOGIN' ? (
                        <form onSubmit={handleSendOtp} className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Mobile Number (10 digits)
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                              <input
                                type="text"
                                maxLength={10}
                                value={mobileInput}
                                onChange={(e) => setMobileInput(e.target.value)}
                                placeholder="Enter 10-digit mobile number"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          {selectedRole === 'customer' && (
                            <div>
                              <label className="block text-xs font-medium text-slate-300 mb-1">
                                Full Name (for new Customer registration)
                              </label>
                              <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="Your Name"
                                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-blue-500 focus:outline-none"
                              />
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition"
                          >
                            Request Login OTP
                          </button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-3">
                          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
                            OTP sent to <strong>+91 {mobileInput}</strong>. Use demo OTP:{' '}
                            <strong className="font-mono underline">123456</strong>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Enter 6-Digit OTP
                            </label>
                            <div className="relative">
                              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                              <input
                                type="text"
                                maxLength={6}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-blue-500 text-white text-base font-mono tracking-widest focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setAuthStep('LOGIN')}
                              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                            >
                              Back
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
                            >
                              Verify OTP &amp; Login
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* SCREEN B: CUSTOMER & DEALER DASHBOARDS + PURCHASE FLOW    */}
                  {/* ========================================================= */}
                  {authStep === 'AUTHENTICATED' &&
                    currentUser &&
                    (currentUser.role === 'customer' || currentUser.role === 'dealer') && (
                      <>
                        {/* 1. DASHBOARD HOME */}
                        {mobileScreen === 'DASHBOARD' && (
                          <div className="space-y-4">
                            {/* Role Banner */}
                            {currentUser.role === 'customer' ? (
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600/30 via-slate-900 to-slate-950 border border-blue-500/40 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
                                    CUSTOMER DASHBOARD
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-rose-300 font-medium">
                                    <EyeOff className="w-3.5 h-3.5" /> Stock Qty Hidden
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-white">
                                  Hello, {currentUser.name}
                                </h3>
                                <p className="text-xs text-slate-300">
                                  Browse Zoho-synced plumbing products at retail prices with instant Direct Payment &amp; Plumber installation support.
                                </p>
                                <div className="pt-1 flex gap-2">
                                  <button
                                    onClick={() => setMobileScreen('CATEGORIES')}
                                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                                  >
                                    Browse Categories →
                                  </button>
                                  <button
                                    onClick={() => setMobileScreen('ORDER_TRACKING')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                                  >
                                    Track Orders ({orders.length})
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* DEALER DASHBOARD BANNER WITH ZOHO CREDIT LEDGER */
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Zoho Verified ({currentUser.zohoContactId})
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                                    <Eye className="w-3.5 h-3.5" /> Live Stock Visible
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
                                  <p className="text-[11px] text-amber-300 font-medium">{currentUser.tier}</p>
                                </div>

                                {/* Dealer Credit Limit Box */}
                                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <div className="text-[10px] text-slate-400">Credit Limit</div>
                                    <div className="text-xs font-bold text-white">
                                      ₹{(currentUser.creditLimit || 0).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-slate-400">Used</div>
                                    <div className="text-xs font-bold text-amber-400">
                                      ₹{(currentUser.creditUsed || 0).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] text-slate-400">Available</div>
                                    <div className="text-xs font-bold text-emerald-400">
                                      ₹
                                      {Math.max(
                                        0,
                                        (currentUser.creditLimit || 0) - (currentUser.creditUsed || 0)
                                      ).toLocaleString('en-IN')}
                                    </div>
                                  </div>
                                </div>

                                {/* Dealer Payment Permissions Pills */}
                                <div className="flex flex-wrap gap-1.5 text-[10px]">
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                                    ✓ Upfront Payment
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded font-semibold ${
                                      currentUser.credit30DaysAllowed
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : 'bg-slate-800 text-slate-500'
                                    }`}
                                  >
                                    {currentUser.credit30DaysAllowed ? '✓ 30-Day Credit Active' : '✗ 30-Day Credit Locked'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded font-semibold ${
                                      currentUser.credit90DaysAllowed
                                        ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                                        : 'bg-rose-500/15 text-rose-300'
                                    }`}
                                  >
                                    {currentUser.credit90DaysAllowed
                                      ? '★ 90-Day Credit Approved'
                                      : '🔒 90-Day Credit (Not Approved)'}
                                  </span>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setMobileScreen('PRODUCTS')}
                                    className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                                  >
                                    View Wholesale Price &amp; Stock →
                                  </button>
                                  <button
                                    onClick={() => setMobileScreen('ORDER_TRACKING')}
                                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
                                  >
                                    Orders ({orders.length})
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Categories Quick Grid */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Product Categories
                                </h4>
                                <button
                                  onClick={() => setMobileScreen('CATEGORIES')}
                                  className="text-xs text-blue-400 hover:underline"
                                >
                                  See All
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {categories.slice(0, 4).map((cat) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      setSelectedCategory(cat.id);
                                      fetchProductsForRole(currentUser.role, cat.id, searchQuery);
                                      setMobileScreen('PRODUCTS');
                                    }}
                                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left transition"
                                  >
                                    <div className="font-bold text-xs text-white">{cat.name}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                      {cat.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Featured Products Preview */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Zoho Synced Catalog ({products.length})
                                </h4>
                                <button
                                  onClick={() => {
                                    setSelectedCategory('all');
                                    fetchProductsForRole(currentUser.role, 'all', '');
                                    setMobileScreen('PRODUCTS');
                                  }}
                                  className="text-xs text-blue-400 hover:underline"
                                >
                                  Full Catalog →
                                </button>
                              </div>

                              <div className="space-y-2.5">
                                {products.slice(0, 3).map((prod) => (
                                  <div
                                    key={prod.id}
                                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                                  >
                                    <div
                                      onClick={() => {
                                        setActiveProduct(prod);
                                        setMobileScreen('PRODUCT_DETAIL');
                                      }}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="text-xs font-bold text-white">{prod.name}</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-sm font-extrabold text-emerald-400">
                                          ₹{prod.price.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[10px] text-slate-500 line-through">
                                          ₹{prod.mrp.toLocaleString('en-IN')}
                                        </span>
                                      </div>
                                      {/* Key Requirement #2 Difference Highlight */}
                                      {currentUser.role === 'dealer' ? (
                                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-semibold">
                                          Zoho Stock: {prod.stockQuantity} {prod.unit} | MOQ: {prod.minDealerOrderQty}
                                        </div>
                                      ) : (
                                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                          {prod.inStock ? '✓ Available' : 'Out of Stock'} •{' '}
                                          <span className="text-rose-300">Stock Qty Hidden</span>
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => addToCart(prod)}
                                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0"
                                    >
                                      + Add
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. CATEGORIES SCREEN */}
                        {mobileScreen === 'CATEGORIES' && (
                          <div className="space-y-3">
                            <h3 className="text-base font-bold text-white">Select Product Category</h3>
                            <div className="space-y-2.5">
                              <button
                                onClick={() => {
                                  setSelectedCategory('all');
                                  fetchProductsForRole(currentUser.role, 'all', '');
                                  setMobileScreen('PRODUCTS');
                                }}
                                className="w-full p-3.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-left flex items-center justify-between"
                              >
                                <span className="font-bold text-sm text-white">All Zoho Synced Products</span>
                                <ArrowRight className="w-4 h-4 text-blue-400" />
                              </button>
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    setSelectedCategory(cat.id);
                                    fetchProductsForRole(currentUser.role, cat.id, '');
                                    setMobileScreen('PRODUCTS');
                                  }}
                                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left flex items-center justify-between"
                                >
                                  <div>
                                    <div className="font-bold text-sm text-white">{cat.name}</div>
                                    <div className="text-xs text-slate-400">{cat.description}</div>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-slate-400" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 3. PRODUCTS LIST SCREEN (Role-Filtered Price & Stock) */}
                        {mobileScreen === 'PRODUCTS' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-white">
                                {currentUser.role === 'dealer'
                                  ? 'Dealer Wholesale Catalog & Stock'
                                  : 'Customer Products Catalog'}
                              </h3>
                              <span className="text-[11px] text-emerald-400 font-mono">
                                Synced w/ Zoho Workbook
                              </span>
                            </div>

                            {/* Search Bar */}
                            <div className="relative">
                              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                  setSearchQuery(e.target.value);
                                  fetchProductsForRole(currentUser.role, selectedCategory, e.target.value);
                                }}
                                placeholder="Search pipes, faucets, valves, SKU..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none"
                              />
                            </div>

                            {/* Role Visibility Banner */}
                            {currentUser.role === 'customer' ? (
                              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-200 flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>
                                  <strong>Customer View:</strong> Retail prices shown. Exact warehouse stock quantity is hidden by API security policy.
                                </span>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center gap-2">
                                <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>
                                  <strong>Verified Dealer View:</strong> Showing Wholesale Price + Live Zoho Workbook Stock Quantity.
                                </span>
                              </div>
                            )}

                            {/* Product Cards */}
                            <div className="space-y-3">
                              {products.map((prod) => (
                                <div
                                  key={prod.id}
                                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div
                                      onClick={() => {
                                        setActiveProduct(prod);
                                        setMobileScreen('PRODUCT_DETAIL');
                                      }}
                                      className="cursor-pointer"
                                    >
                                      <span className="text-[10px] font-mono text-slate-400">
                                        {prod.sku} • {prod.brand}
                                      </span>
                                      <h4 className="text-xs font-bold text-white hover:text-blue-400">
                                        {prod.name}
                                      </h4>
                                    </div>
                                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px]">
                                      {prod.unit}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-400">{prod.specifications}</p>

                                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                                    <div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="text-base font-extrabold text-emerald-400">
                                          ₹{prod.price.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-[11px] text-slate-500 line-through">
                                          MRP ₹{prod.mrp.toLocaleString('en-IN')}
                                        </span>
                                      </div>

                                      {currentUser.role === 'dealer' ? (
                                        <div className="text-[11px] text-amber-300 font-mono">
                                          Available Stock: <strong>{prod.stockQuantity} units</strong> | Retail: ₹
                                          {prod.customerPrice}
                                        </div>
                                      ) : (
                                        <div className="text-[11px] text-slate-400">
                                          Status:{' '}
                                          <strong className="text-emerald-400">
                                            {prod.inStock ? 'Available for Order' : 'Out of Stock'}
                                          </strong>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => {
                                          setActiveProduct(prod);
                                          setMobileScreen('PRODUCT_DETAIL');
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium"
                                      >
                                        Details
                                      </button>
                                      <button
                                        onClick={() => addToCart(prod)}
                                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                                      >
                                        + Cart
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 4. PRODUCT DETAILS SCREEN */}
                        {mobileScreen === 'PRODUCT_DETAIL' && activeProduct && (
                          <div className="space-y-4">
                            <button
                              onClick={() => setMobileScreen('PRODUCTS')}
                              className="text-xs text-blue-400 flex items-center gap-1"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
                            </button>

                            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                                  SKU: {activeProduct.sku}
                                </span>
                                <span className="text-xs text-slate-400">{activeProduct.categoryName}</span>
                              </div>

                              <h3 className="text-base font-bold text-white">{activeProduct.name}</h3>
                              <p className="text-xs text-slate-300">{activeProduct.specifications}</p>

                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] text-slate-400">
                                    {currentUser.role === 'dealer'
                                      ? 'Zoho Dealer Wholesale Price'
                                      : 'Customer Retail Price'}
                                  </div>
                                  <div className="text-xl font-black text-emerald-400">
                                    ₹{activeProduct.price.toLocaleString('en-IN')}
                                    <span className="text-xs text-slate-400 font-normal">
                                      {' '}
                                      / {activeProduct.unit}
                                    </span>
                                  </div>
                                </div>

                                {currentUser.role === 'dealer' ? (
                                  <div className="text-right">
                                    <div className="text-[10px] text-slate-400">Zoho Warehouse Stock</div>
                                    <div className="text-sm font-bold text-amber-300 font-mono">
                                      {activeProduct.stockQuantity} Units
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-right">
                                    <div className="text-[10px] text-rose-300">Stock Quantity</div>
                                    <div className="text-xs font-semibold text-slate-300">
                                      Hidden for Customer
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button
                                onClick={() => {
                                  addToCart(activeProduct);
                                  setMobileScreen('CART');
                                }}
                                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm"
                              >
                                Add to Cart &amp; View Cart
                              </button>
                            </div>
                          </div>
                        )}

                        {/* 5. CART SCREEN */}
                        {mobileScreen === 'CART' && (
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">Your Shopping Cart</h3>
                            {cart.length === 0 ? (
                              <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
                                <ShoppingCart className="w-8 h-8 text-slate-600 mx-auto" />
                                <p className="text-xs text-slate-400">Your cart is empty.</p>
                                <button
                                  onClick={() => setMobileScreen('PRODUCTS')}
                                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                                >
                                  Browse Products
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-2.5">
                                  {cart.map((item) => (
                                    <div
                                      key={item.product.id}
                                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                                    >
                                      <div>
                                        <div className="text-xs font-bold text-white">{item.product.name}</div>
                                        <div className="text-[11px] text-emerald-400 font-semibold">
                                          ₹{item.product.price.toLocaleString('en-IN')} × {item.qty} = ₹
                                          {(item.product.price * item.qty).toLocaleString('en-IN')}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                                        <button
                                          onClick={() => updateCartQty(item.product.id, -1)}
                                          className="p-1 text-slate-300 hover:text-white"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-mono font-bold px-1.5">{item.qty}</span>
                                        <button
                                          onClick={() => updateCartQty(item.product.id, 1)}
                                          className="p-1 text-slate-300 hover:text-white"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                                  <div className="flex justify-between text-sm font-bold text-white">
                                    <span>Total Payable</span>
                                    <span className="text-emerald-400">
                                      ₹{cartTotal.toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => setMobileScreen('CHECKOUT')}
                                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm"
                                  >
                                    Proceed to Checkout →
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {/* 6. CHECKOUT & PAYMENT SCREEN (Direct Payment for Customer vs Upfront/30D/90D for Dealer) */}
                        {mobileScreen === 'CHECKOUT' && (
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">
                              {currentUser.role === 'dealer'
                                ? 'Dealer Checkout & Credit Payment Options'
                                : 'Customer Checkout — Direct Payment'}
                            </h3>

                            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                              <div className="text-slate-400">Order Total ({cart.length} items)</div>
                              <div className="text-xl font-black text-emerald-400">
                                ₹{cartTotal.toLocaleString('en-IN')}
                              </div>
                            </div>

                            {checkoutError && (
                              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs">
                                {checkoutError}
                              </div>
                            )}

                            {currentUser.role === 'customer' ? (
                              /* CUSTOMER DIRECT PAYMENT OPTIONS */
                              <div className="space-y-2.5">
                                <label className="block text-xs font-bold uppercase text-slate-400">
                                  Select Direct Payment Mode
                                </label>
                                {[
                                  'UPI (GPay / PhonePe / Paytm)',
                                  'Credit / Debit Card (Visa / MasterCard / RuPay)',
                                  'NetBanking (HDFC / ICICI / SBI)'
                                ].map((mode) => (
                                  <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setCustomerPaymentType(mode)}
                                    className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between ${
                                      customerPaymentType === mode
                                        ? 'bg-blue-600/20 border-blue-500 text-white'
                                        : 'bg-slate-950 border-slate-800 text-slate-300'
                                    }`}
                                  >
                                    <span>{mode}</span>
                                    <CheckCircle2
                                      className={`w-4 h-4 ${
                                        customerPaymentType === mode ? 'text-blue-400' : 'text-slate-600'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            ) : (
                              /* DEALER PAYMENT OPTIONS: UPFRONT, CREDIT 30 DAYS, CREDIT 90 DAYS */
                              <div className="space-y-2.5">
                                <label className="block text-xs font-bold uppercase text-slate-400">
                                  Dealer Payment Options (Zoho Governed)
                                </label>

                                {/* Option 1: Upfront Payment */}
                                <button
                                  type="button"
                                  onClick={() => setDealerPaymentMethod('UPFRONT')}
                                  className={`w-full p-3.5 rounded-xl border text-left transition ${
                                    dealerPaymentMethod === 'UPFRONT'
                                      ? 'bg-emerald-950/60 border-emerald-500 text-white'
                                      : 'bg-slate-950 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs">1. Upfront Payment</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                                      Always Available
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-1">
                                    Immediate RTGS / NEFT / Corporate UPI settlement
                                  </div>
                                </button>

                                {/* Option 2: Credit Payment - 30 Days */}
                                <button
                                  type="button"
                                  disabled={!currentUser.creditEligible || !currentUser.credit30DaysAllowed}
                                  onClick={() => setDealerPaymentMethod('CREDIT_30_DAYS')}
                                  className={`w-full p-3.5 rounded-xl border text-left transition ${
                                    !currentUser.creditEligible || !currentUser.credit30DaysAllowed
                                      ? 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed'
                                      : dealerPaymentMethod === 'CREDIT_30_DAYS'
                                      ? 'bg-amber-950/60 border-amber-500 text-white'
                                      : 'bg-slate-950 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs">2. Credit Payment – 30 Days</span>
                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                                      {currentUser.credit30DaysAllowed ? 'Eligible' : 'Not Permitted'}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-1">
                                    Zoho Books 30-Day net credit line • Interest-free for 30 days
                                  </div>
                                </button>

                                {/* Option 3: Credit Payment - 90 Days (ONLY FOR SELECTED/APPROVED DEALERS) */}
                                <button
                                  type="button"
                                  disabled={!currentUser.creditEligible || !currentUser.credit90DaysAllowed}
                                  onClick={() => setDealerPaymentMethod('CREDIT_90_DAYS')}
                                  className={`w-full p-3.5 rounded-xl border text-left transition ${
                                    !currentUser.creditEligible || !currentUser.credit90DaysAllowed
                                      ? 'bg-slate-950/40 border-rose-500/30 opacity-75 cursor-not-allowed'
                                      : dealerPaymentMethod === 'CREDIT_90_DAYS'
                                      ? 'bg-purple-950/60 border-purple-500 text-white'
                                      : 'bg-slate-950 border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-xs flex items-center gap-1.5">
                                      3. Credit Payment – 90 Days
                                    </span>
                                    {currentUser.credit90DaysAllowed ? (
                                      <span className="px-2 py-0.5 rounded bg-purple-500/25 text-purple-300 text-[10px] font-bold">
                                        ★ Selected / Approved Dealer
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Restricted (Requires Admin Approval)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 mt-1">
                                    Available ONLY for selected/approved dealers in Admin Portal.
                                  </div>
                                </button>
                              </div>
                            )}

                            <button
                              onClick={handlePlaceOrder}
                              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
                            >
                              {currentUser.role === 'customer'
                                ? `Pay ₹${cartTotal.toLocaleString('en-IN')} & Confirm Order`
                                : `Confirm Dealer Order (${dealerPaymentMethod.replace(/_/g, ' ')})`}
                            </button>
                          </div>
                        )}

                        {/* 7. ORDER CONFIRMATION SCREEN */}
                        {mobileScreen === 'ORDER_CONFIRMATION' && activeOrder && (
                          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <div>
                              <span className="text-[11px] font-mono text-emerald-400">{activeOrder.id}</span>
                              <h3 className="text-lg font-bold text-white">Order Confirmed!</h3>
                              <p className="text-xs text-slate-400 mt-1">
                                Payment Status: <strong className="text-emerald-300">{activeOrder.paymentStatus}</strong>
                              </p>
                              {activeOrder.dueDate && activeOrder.dueDate !== 'Immediate' && (
                                <p className="text-xs text-amber-300 mt-0.5">
                                  Credit Due Date: <strong>{activeOrder.dueDate}</strong>
                                </p>
                              )}
                            </div>

                            <div className="p-3 rounded-xl bg-slate-900 text-left text-xs space-y-1">
                              <div className="text-slate-400">Zoho Workbook Sync:</div>
                              <div className="text-slate-200">
                                Stock automatically deducted in Zoho Workbook &amp; invoice generated.
                              </div>
                              {activeOrder.assignedPlumberName && (
                                <div className="text-purple-300 pt-1">
                                  Assigned Plumber: <strong>{activeOrder.assignedPlumberName}</strong>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => setMobileScreen('ORDER_TRACKING')}
                              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                            >
                              Track Live Order Status →
                            </button>
                          </div>
                        )}

                        {/* 8. LIVE ORDER TRACKING SCREEN */}
                        {mobileScreen === 'ORDER_TRACKING' && (
                          <div className="space-y-4">
                            <h3 className="text-base font-bold text-white">
                              Live Order Tracking &amp; History ({orders.length})
                            </h3>
                            {orders.map((ord) => (
                              <div
                                key={ord.id}
                                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold text-xs text-blue-400">{ord.id}</span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                    {ord.orderStatus}
                                  </span>
                                </div>

                                <div className="text-xs text-slate-300">
                                  Total: <strong className="text-white">₹{ord.totalAmount.toLocaleString('en-IN')}</strong>{' '}
                                  • {ord.paymentStatus}
                                </div>

                                {/* Step-by-Step Timeline */}
                                <div className="space-y-2 pt-2 border-t border-slate-900">
                                  {(ord.trackingTimeline || []).map((step, i) => (
                                    <div key={i} className="flex items-start gap-2.5 text-xs">
                                      <div
                                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                                          step.done
                                            ? 'bg-emerald-500 text-slate-950'
                                            : 'bg-slate-800 text-slate-500'
                                        }`}
                                      >
                                        ✓
                                      </div>
                                      <div className="flex-1">
                                        <div className={step.done ? 'text-slate-200 font-medium' : 'text-slate-500'}>
                                          {step.step}
                                        </div>
                                        <div className="text-[10px] text-slate-500">{step.time}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                  {/* ========================================================= */}
                  {/* SCREEN C: PLUMBER DASHBOARD (5. Plumber Flow)             */}
                  {/* ========================================================= */}
                  {authStep === 'AUTHENTICATED' && currentUser?.role === 'plumber' && plumberData && (
                    <div className="space-y-4">
                      {/* Plumber Verification Header */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-950 border border-purple-500/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                            PLUMBER DASHBOARD
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            ✓ {plumberData.plumber.verificationStatus}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{plumberData.plumber.name}</h3>
                        <p className="text-[11px] text-slate-300">
                          License: <span className="font-mono">{plumberData.plumber.licenseNo}</span> •{' '}
                          {plumberData.plumber.specialization}
                        </p>
                        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Completed</div>
                            <div className="text-xs font-bold text-white">
                              {plumberData.plumber.completedJobs} Jobs
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Reward Pts</div>
                            <div className="text-xs font-bold text-amber-400">
                              {plumberData.plumber.rewardPoints} pts
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                            <div className="text-[10px] text-slate-400">Wallet</div>
                            <div className="text-xs font-bold text-emerald-400">
                              ₹{plumberData.plumber.walletBalance}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Plumber 3 Requirement Tabs */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                        <button
                          onClick={() => setPlumberTab('ORDERS')}
                          className={`py-2 rounded-lg font-semibold ${
                            plumberTab === 'ORDERS' ? 'bg-purple-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Assigned Jobs
                        </button>
                        <button
                          onClick={() => setPlumberTab('PRODUCTS')}
                          className={`py-2 rounded-lg font-semibold ${
                            plumberTab === 'PRODUCTS' ? 'bg-purple-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Product Guide
                        </button>
                        <button
                          onClick={() => setPlumberTab('PROFILE')}
                          className={`py-2 rounded-lg font-semibold ${
                            plumberTab === 'PROFILE' ? 'bg-purple-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          Notifications
                        </button>
                      </div>

                      {/* Plumber Tab 1: Orders or Assigned Activities */}
                      {plumberTab === 'ORDERS' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase text-slate-400">
                            Assigned Installation &amp; Service Orders ({plumberData.assignedOrders.length})
                          </h4>
                          {plumberData.assignedOrders.map((job) => (
                            <div
                              key={job.id}
                              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-xs text-purple-300">{job.id}</span>
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                                  {job.plumberTaskStatus || 'ASSIGNED'}
                                </span>
                              </div>
                              <div className="text-xs font-bold text-white">Customer: {job.userName}</div>
                              <div className="text-[11px] text-slate-400 flex items-start gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                                {job.shippingAddress}
                              </div>
                              <div className="text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg">
                                Items to Install: {job.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => handlePlumberStatusUpdate(job.id, 'IN_PROGRESS')}
                                  className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                                >
                                  Mark In Progress
                                </button>
                                <button
                                  onClick={() => handlePlumberStatusUpdate(job.id, 'COMPLETED')}
                                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                                >
                                  ✓ Complete (+150 pts)
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Plumber Tab 2: Product / Required Functionality (Technical Specs & Points) */}
                      {plumberTab === 'PRODUCTS' && (
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase text-slate-400">
                            Technical Installation Guide &amp; Plumber Points
                          </h4>
                          {plumberData.technicalCatalog.map((prod) => (
                            <div
                              key={prod.id}
                              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{prod.name}</span>
                                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                                  +{prod.plumberPoints} Pts
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400">{prod.specifications}</div>
                              <div className="p-2 rounded-lg bg-slate-900 text-[11px] text-amber-200">
                                <strong>Installation Note:</strong> {prod.installationNote}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Plumber Tab 3: Profile & Notifications */}
                      {plumberTab === 'PROFILE' && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase text-slate-400">
                            Instant Job &amp; Reward Notifications
                          </h4>
                          {(plumberData.plumber.notifications || []).map((n) => (
                            <div
                              key={n.id}
                              className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white">{n.title}</span>
                                <span className="text-[10px] text-slate-500">{n.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-300">{n.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Phone Navigation Bar */}
                {authStep === 'AUTHENTICATED' && currentUser && currentUser.role !== 'plumber' && (
                  <div className="bg-slate-950 border-t border-slate-800 px-4 py-2 grid grid-cols-4 gap-1 text-[10px]">
                    {[
                      { id: 'DASHBOARD', label: 'Dashboard', icon: Smartphone },
                      { id: 'PRODUCTS', label: 'Products', icon: Package },
                      { id: 'CART', label: `Cart (${cart.length})`, icon: ShoppingCart },
                      { id: 'ORDER_TRACKING', label: 'Orders', icon: Truck }
                    ].map((nav) => {
                      const Icon = nav.icon;
                      const active = mobileScreen === nav.id;
                      return (
                        <button
                          key={nav.id}
                          onClick={() => setMobileScreen(nav.id)}
                          className={`py-1.5 rounded-xl flex flex-col items-center gap-1 font-semibold ${
                            active ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {nav.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
