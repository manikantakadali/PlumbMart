import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

// Services
import {
  zohoAuthService,
  zohoProductService,
  zohoDealerService
} from './services/zoho';
import { apiRequest } from './services/api';

// Navigation Components
import MobileHeader from './components/navigation/MobileHeader';
import MobileBottomNav from './components/navigation/MobileBottomNav';

// Auth Screens
import SplashScreen from './components/auth/SplashScreen';
import LoginScreen from './components/auth/LoginScreen';
import OtpVerificationScreen from './components/auth/OtpVerificationScreen';
import ZohoVerificationScreen from './components/auth/ZohoVerificationScreen';

// Customer Screens
import CustomerDashboard from './components/customer/CustomerDashboard';
import CustomerProductDetails from './components/customer/CustomerProductDetails';
import CustomerCart from './components/customer/CustomerCart';
import CustomerCheckout from './components/customer/CustomerCheckout';
import CustomerOrderConfirmation from './components/customer/CustomerOrderConfirmation';
import CustomerOrderTracking from './components/customer/CustomerOrderTracking';
import CustomerProfile from './components/customer/CustomerProfile';
import CustomerNotifications from './components/customer/CustomerNotifications';

// Dealer Screens
import DealerDashboard from './components/dealer/DealerDashboard';
import DealerProductList from './components/dealer/DealerProductList';
import DealerCart from './components/dealer/DealerCart';
import DealerCheckout from './components/dealer/DealerCheckout';
import DealerOrderConfirmation from './components/dealer/DealerOrderConfirmation';
import DealerOrders from './components/dealer/DealerOrders';
import DealerProfile from './components/dealer/DealerProfile';
import DealerNotifications from './components/dealer/DealerNotifications';

// Plumber Screens
import PlumberDashboard from './components/plumber/PlumberDashboard';
import PlumberAssignedActivities from './components/plumber/PlumberAssignedActivities';
import PlumberProductRequirements from './components/plumber/PlumberProductRequirements';
import PlumberProfile from './components/plumber/PlumberProfile';
import PlumberNotifications from './components/plumber/PlumberNotifications';

// Admin Portal & Blueprint
import AdminPortal from './components/AdminPortal';
import BlueprintAndComparison from './components/BlueprintAndComparison';

export default function App() {
  const [mainView, setMainView] = useState('mobile'); // 'mobile' | 'admin' | 'blueprint'

  // Auth State
  // authStep: 'SPLASH' | 'LOGIN' | 'OTP' | 'ZOHO_VERIFY' | 'AUTHENTICATED'
  const [authStep, setAuthStep] = useState('LOGIN');
  const [selectedRole, setSelectedRole] = useState('customer'); // 'customer' | 'dealer' | 'plumber' | 'admin'
  const [mobileInput, setMobileInput] = useState('9876543210');
  const [nameInput, setNameInput] = useState('Rahul Sharma');
  const [otpInput, setOtpInput] = useState('123456');
  const [authError, setAuthError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingDealerVerification, setPendingDealerVerification] = useState(null);

  // Mobile Screen State
  // Customer & Dealer screens: 'DASHBOARD' | 'CATEGORIES' | 'PRODUCTS' | 'PRODUCT_DETAIL' | 'CART' | 'CHECKOUT' | 'ORDER_CONFIRMATION' | 'ORDERS' | 'PROFILE' | 'NOTIFICATIONS'
  // Plumber tabs: 'DASHBOARD' | 'ASSIGNED_JOBS' | 'PRODUCT_GUIDE' | 'PROFILE' | 'NOTIFICATIONS'
  const [mobileScreen, setMobileScreen] = useState('DASHBOARD');
  const [screenHistory, setScreenHistory] = useState(['DASHBOARD']);

  // Data Store State
  const [zohoMeta, setZohoMeta] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProduct, setActiveProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Checkout State
  const [customerPaymentMode, setCustomerPaymentMode] = useState('UPI (PhonePe / GPay)');
  const [dealerPaymentMethod, setDealerPaymentMethod] = useState('UPFRONT');
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Plumber Data
  const [plumberData, setPlumberData] = useState(null);

  // Admin Data
  const [adminData, setAdminData] = useState(null);

  // 1. Fetch System & Admin Overview
  const fetchOverview = useCallback(async () => {
    try {
      const data = await apiRequest('/api/admin/overview');
      setAdminData(data);
      setZohoMeta(data.zohoMeta);
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    }
  }, []);

  // 2. Fetch Role-Filtered Products from Zoho Service
  const fetchProducts = useCallback(async (role, catId = 'all', search = '') => {
    try {
      const data = await zohoProductService.getProductsByRole(role, catId, search);
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setZohoMeta(data.zohoMeta || null);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, []);

  // 3. Fetch Orders
  const fetchUserOrders = useCallback(async (user) => {
    if (!user) return;
    try {
      const data = await apiRequest(`/api/orders?role=${user.role}&userId=${user.id}`);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }, []);

  // 4. Fetch Notifications
  const fetchNotifications = useCallback(async (user) => {
    if (!user) return;
    try {
      const data = await apiRequest(`/api/notifications?role=${user.role}&userId=${user.id}`);
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  // 5. Fetch Plumber Dashboard
  const fetchPlumberInfo = useCallback(async (plumberId) => {
    try {
      const data = await apiRequest(`/api/plumber/${plumberId || 'PLB-01'}`);
      setPlumberData(data);
    } catch (err) {
      console.error('Error fetching plumber info:', err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchProducts('customer');
  }, [fetchOverview, fetchProducts]);

  // Navigate Mobile Screens with History
  const navigateTo = (screen) => {
    setMobileScreen(screen);
    setScreenHistory((prev) => [...prev, screen]);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setMobileScreen(prevScreen);
    } else {
      setMobileScreen('DASHBOARD');
    }
  };

  // Auth: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);

    // If Admin role is selected, directly open Admin panel or OTP
    if (selectedRole === 'admin') {
      try {
        const res = await zohoAuthService.requestOtp(mobileInput, 'admin');
        setOtpInput(res.demoOtp || '123456');
        setAuthStep('OTP');
      } catch (err) {
        setAuthError(err.data || { error: err.message });
      }
      return;
    }

    try {
      const res = await zohoAuthService.requestOtp(mobileInput, selectedRole, nameInput);
      setOtpInput(res.demoOtp || '123456');
      setAuthStep('OTP');
    } catch (err) {
      setAuthError(err.data || { error: err.message });
    }
  };

  // Auth: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    try {
      const res = await zohoAuthService.verifyOtp(
        mobileInput,
        otpInput,
        selectedRole,
        nameInput
      );

      // Section 4: If role is Dealer, perform Zoho Verification Screen transition!
      if (res.user.role === 'dealer') {
        setPendingDealerVerification(res.user);
        setAuthStep('ZOHO_VERIFY');
        return;
      }

      // If Admin
      if (res.user.role === 'admin') {
        setCurrentUser(res.user);
        setMainView('admin');
        setAuthStep('AUTHENTICATED');
        return;
      }

      // Customer or Plumber
      await loginSuccess(res.user);
    } catch (err) {
      setAuthError(err.data ? err.data.error : err.message);
    }
  };

  // Complete Login
  const loginSuccess = async (user) => {
    setCurrentUser(user);
    setAuthStep('AUTHENTICATED');
    setMobileScreen('DASHBOARD');
    setScreenHistory(['DASHBOARD']);
    setCart([]);
    setCheckoutError('');
    setShippingAddress(user.address || `${user.city || 'Hyderabad'} Warehouse`);

    await fetchProducts(user.role, 'all', '');
    await fetchUserOrders(user);
    await fetchNotifications(user);
    if (user.role === 'plumber') {
      await fetchPlumberInfo(user.id);
    }
    await fetchOverview();
  };

  // 1-Click Persona Switcher for Interview Demo
  const quickSelectPersona = async (role, mobile, name = '') => {
    setSelectedRole(role);
    setMobileInput(mobile);
    setNameInput(name);
    setAuthError(null);

    // If Admin
    if (role === 'admin') {
      const adminUser = adminData?.users?.admins[0] || { id: 'ADM-01', role: 'admin', name: 'Manikanta (Super Admin)' };
      setCurrentUser(adminUser);
      setMainView('admin');
      return;
    }

    try {
      // Step 1: Send OTP
      await zohoAuthService.requestOtp(mobile, role, name);
      // Step 2: Verify OTP
      const res = await zohoAuthService.verifyOtp(mobile, '123456', role, name);

      if (res.user.role === 'dealer') {
        setPendingDealerVerification(res.user);
        setAuthStep('ZOHO_VERIFY');
      } else {
        await loginSuccess(res.user);
      }
    } catch (err) {
      // e.g. Unverified dealer 9000033333
      if (role === 'dealer') {
        const unverified = adminData?.users?.dealers.find((d) => d.mobile === mobile);
        if (unverified) {
          setPendingDealerVerification(unverified);
          setAuthStep('ZOHO_VERIFY');
          return;
        }
      }
      setAuthStep('LOGIN');
      setAuthError(err.data || { error: err.message });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthStep('LOGIN');
    setAuthError(null);
    setMobileScreen('DASHBOARD');
  };

  // Cart Operations
  const handleAddToCart = (product, customQty) => {
    const minQty = currentUser?.role === 'dealer' ? product.minDealerOrderQty || 1 : 1;
    const addCount = customQty || minQty;

    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + addCount } : item
        );
      }
      return [...prev, { product, qty: addCount }];
    });
  };

  const handleUpdateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const next = item.qty + delta;
          return next > 0 ? { ...item, qty: next } : null;
        })
        .filter(Boolean)
    );
  };

  // Place Order (Customer Direct Payment OR Dealer Upfront / 30D / 90D Credit)
  const handlePlaceOrder = async () => {
    setCheckoutError('');
    setIsSubmittingOrder(true);
    try {
      const payload = {
        userId: currentUser.id,
        role: currentUser.role,
        items: cart.map((i) => ({ productId: i.product.id, qty: i.qty })),
        paymentMethod: currentUser.role === 'customer' ? 'DIRECT_PAYMENT' : dealerPaymentMethod,
        paymentSubType:
          currentUser.role === 'customer'
            ? customerPaymentMode
            : dealerPaymentMethod === 'CREDIT_90_DAYS'
            ? 'Zoho Approved 90-Day Credit'
            : dealerPaymentMethod === 'CREDIT_30_DAYS'
            ? 'Zoho 30-Day Dealer Credit'
            : 'Upfront Corporate Payment',
        shippingAddress
      };

      const res = await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setCart([]);
      setActiveOrder(res.order);
      if (res.updatedUser) {
        setCurrentUser(res.updatedUser);
      }
      await fetchProducts(currentUser.role, selectedCategory, searchQuery);
      await fetchUserOrders(currentUser);
      await fetchNotifications(currentUser);
      await fetchOverview();
      navigateTo('ORDER_CONFIRMATION');
    } catch (err) {
      setCheckoutError(err.data ? err.data.error : err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Plumber Status Update
  const handlePlumberStatusUpdate = async (orderId, status) => {
    await apiRequest(`/api/plumber/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ plumberTaskStatus: status })
    });
    await fetchPlumberInfo(currentUser?.id);
    await fetchNotifications(currentUser);
    await fetchOverview();
  };

  // Admin Actions
  const handleAdminUpdateDealer = async (dealerId, updates) => {
    const res = await apiRequest(`/api/admin/dealers/${dealerId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    await fetchOverview();
    if (currentUser?.id === dealerId && res.dealer) {
      setCurrentUser(res.dealer);
    }
  };

  const handleAdminUpdatePlumber = async (plumberId, updates) => {
    await apiRequest(`/api/admin/plumbers/${plumberId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    await fetchOverview();
    if (currentUser?.id === plumberId) {
      await fetchPlumberInfo(plumberId);
    }
  };

  const handleAdminUpdateProductRow = async (productId, updates) => {
    await zohoProductService.updateProductInWorkbook(productId, updates);
    await fetchOverview();
    if (currentUser) {
      await fetchProducts(currentUser.role, selectedCategory, searchQuery);
    }
  };

  const handleAdminUpdateOrder = async (orderId, updates) => {
    await apiRequest(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    await fetchOverview();
    if (currentUser) {
      await fetchUserOrders(currentUser);
    }
  };

  const handleTriggerZohoSync = async () => {
    await zohoProductService.syncZohoWorkbook();
    await fetchOverview();
    if (currentUser) {
      await fetchProducts(currentUser.role, selectedCategory, searchQuery);
    }
  };

  const handleResetDemo = async () => {
    await apiRequest('/api/admin/reset-demo', { method: 'POST' });
    await fetchOverview();
    if (currentUser) {
      await fetchProducts(currentUser.role, 'all', '');
      await fetchUserOrders(currentUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Top Global Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-600/30 font-black text-white text-lg">
              PM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">PlumbMart</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <FileSpreadsheet className="w-3 h-3" /> Zoho Workbook Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Waytowebs Interview Task • 4 Roles (Customer, Dealer, Plumber, Admin)
              </p>
            </div>
          </div>

          {/* Primary View Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setMainView('mobile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                mainView === 'mobile'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Simulator</span>
            </button>
            <button
              onClick={() => setMainView('admin')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                mainView === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Panel (11)</span>
            </button>
            <button
              onClick={() => setMainView('blueprint')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                mainView === 'blueprint'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Zoho Blueprint</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* VIEW 1: ARCHITECTURE & BLUEPRINT */}
        {mainView === 'blueprint' && (
          <BlueprintAndComparison
            zohoMeta={zohoMeta}
            products={adminData?.products || products}
            onTriggerZohoSync={handleTriggerZohoSync}
            onSwitchView={setMainView}
          />
        )}

        {/* VIEW 2: ADMIN MANAGEMENT PORTAL (11 Sections) */}
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

        {/* VIEW 3: MOBILE APP SIMULATOR (Customer, Dealer, Plumber Flows) */}
        {mainView === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12 items-start">
            {/* LEFT COLUMN: Interview Persona Switcher + Live Flow Tracker */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    1-Click Interview Role Switcher
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                    OTP: 123456
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Switch instantly between personas to demonstrate each required flow to the interviewer:
                </p>

                <div className="space-y-2">
                  {/* Persona 1: Customer */}
                  <button
                    onClick={() => quickSelectPersona('customer', '9876543210', 'Rahul Sharma')}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9876543210' && authStep === 'AUTHENTICATED'
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                          1. CUSTOMER
                        </span>
                        <span className="text-xs font-bold text-white">Rahul Sharma (+91 9876543210)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Retail Price Only • <strong className="text-rose-300">Stock Qty Hidden</strong> • Direct Payment (UPI/Card) • Order Tracking
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 2: Dealer (90D Credit Approved) */}
                  <button
                    onClick={() => quickSelectPersona('dealer', '9000011111')}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9000011111' && authStep === 'AUTHENTICATED'
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          2A. DEALER (90D APPROVED)
                        </span>
                        <span className="text-xs font-bold text-white">Sri Venkateswara (+91 9000011111)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Zoho Verified • <strong className="text-emerald-300">Sees Stock Qty</strong> • Upfront, 30-Day &amp; <strong className="text-purple-300">90-Day Credit Approved</strong>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 3: Dealer (30D Credit Only, 90D Locked) */}
                  <button
                    onClick={() => quickSelectPersona('dealer', '9000022222')}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9000022222' && authStep === 'AUTHENTICATED'
                        ? 'bg-amber-950/60 border-amber-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          2B. DEALER (30D ONLY)
                        </span>
                        <span className="text-xs font-bold text-white">Metro Pipe Syndicate (+91 9000022222)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Zoho Verified • Sees Stock Qty • Upfront &amp; 30-Day Credit (<strong className="text-rose-300">90-Day Credit Locked</strong>)
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 4: Unverified Dealer (Access Blocked) */}
                  <button
                    onClick={() => quickSelectPersona('dealer', '9000033333')}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                      authStep === 'ZOHO_VERIFY' && pendingDealerVerification?.mobile === '9000033333'
                        ? 'bg-rose-950/60 border-rose-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                          2C. UNVERIFIED DEALER
                        </span>
                        <span className="text-xs font-bold text-white">Coastal Builders (+91 9000033333)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Demonstrates Zoho CRM Gate: <strong className="text-rose-300">Login Blocked until Admin approves</strong>
                      </p>
                    </div>
                    <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-1" />
                  </button>

                  {/* Persona 5: Plumber */}
                  <button
                    onClick={() => quickSelectPersona('plumber', '9111122222')}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                      currentUser?.mobile === '9111122222' && authStep === 'AUTHENTICATED'
                        ? 'bg-purple-950/60 border-purple-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300">
                          3. MASTER PLUMBER
                        </span>
                        <span className="text-xs font-bold text-white">Ramesh Babu (+91 9111122222)</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        • Verified Trade License • Assigned customer activities • Product technical guide &amp; reward wallet
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-400 shrink-0 mt-1" />
                  </button>
                </div>
              </div>

              {/* End-to-End Application Flow Tracker */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Application Flow Stepper
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-blue-300 uppercase">
                    Role: {currentUser?.role || selectedRole}
                  </span>
                </div>

                {(!currentUser || currentUser.role === 'customer') && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { id: 'LOGIN', label: '1. OTP Login' },
                      { id: 'DASHBOARD', label: '2. Dashboard' },
                      { id: 'CATEGORIES', label: '3. Categories' },
                      { id: 'PRODUCTS', label: '4. Products (No Stock)' },
                      { id: 'PRODUCT_DETAIL', label: '5. Product Details' },
                      { id: 'CART', label: '6. Cart' },
                      { id: 'CHECKOUT', label: '7. Direct Payment' },
                      { id: 'ORDER_CONFIRMATION', label: '8. Confirmation' },
                      { id: 'ORDERS', label: '9. Order Tracking' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          if (st.id === 'LOGIN') {
                            setAuthStep('LOGIN');
                            setCurrentUser(null);
                          } else if (authStep === 'AUTHENTICATED') {
                            navigateTo(st.id);
                          }
                        }}
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          mobileScreen === st.id && authStep === 'AUTHENTICATED'
                            ? 'bg-blue-600 text-white shadow'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentUser?.role === 'dealer' && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { id: 'LOGIN', label: '1. OTP Login' },
                      { id: 'ZOHO_VERIFY', label: '2. Zoho Verification' },
                      { id: 'DASHBOARD', label: '3. Dealer Dashboard' },
                      { id: 'PRODUCTS', label: '4. Products (Stock Visible)' },
                      { id: 'CART', label: '5. Bulk Cart' },
                      { id: 'CHECKOUT', label: '6. Payment (30/90D Credit)' },
                      { id: 'ORDERS', label: '7. Invoices & Orders' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          if (st.id === 'LOGIN') {
                            setAuthStep('LOGIN');
                            setCurrentUser(null);
                          } else if (st.id === 'ZOHO_VERIFY') {
                            setPendingDealerVerification(currentUser);
                            setAuthStep('ZOHO_VERIFY');
                          } else {
                            navigateTo(st.id);
                          }
                        }}
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          mobileScreen === st.id && authStep === 'AUTHENTICATED'
                            ? 'bg-amber-500 text-slate-950 font-bold shadow'
                            : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                )}

                {currentUser?.role === 'plumber' && (
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {[
                      { id: 'DASHBOARD', label: '1. Plumber Overview' },
                      { id: 'ASSIGNED_JOBS', label: '2. Assigned Activities' },
                      { id: 'PRODUCT_GUIDE', label: '3. Product Specs' },
                      { id: 'PROFILE', label: '4. Wallet & KYC' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => navigateTo(st.id)}
                        className={`px-2 py-1 rounded-lg font-medium transition ${
                          mobileScreen === st.id
                            ? 'bg-purple-600 text-white shadow'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Mobile Device Simulator Frame */}
            <div className="lg:col-span-7 flex justify-center">
              <div className="w-full max-w-[440px] bg-slate-900 border-[6px] border-slate-800 rounded-[44px] shadow-2xl overflow-hidden flex flex-col min-h-[740px] max-h-[820px]">
                {/* Phone Status Bar */}
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

                {/* Mobile Header (When Authenticated) */}
                {authStep === 'AUTHENTICATED' && currentUser && (
                  <MobileHeader
                    currentUser={currentUser}
                    currentScreen={mobileScreen}
                    cartCount={cart.length}
                    unreadNotificationsCount={notifications.filter((n) => !n.read).length}
                    onBack={handleBack}
                    onOpenCart={() => navigateTo('CART')}
                    onOpenNotifications={() => navigateTo('NOTIFICATIONS')}
                    onLogout={handleLogout}
                  />
                )}

                {/* SCROLLABLE PHONE SCREEN BODY */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* AUTH STATE 1: SPLASH */}
                  {authStep === 'SPLASH' && (
                    <SplashScreen onStart={() => setAuthStep('LOGIN')} />
                  )}

                  {/* AUTH STATE 2: LOGIN */}
                  {authStep === 'LOGIN' && (
                    <LoginScreen
                      selectedRole={selectedRole}
                      onSelectRole={(r) => {
                        setSelectedRole(r);
                        setAuthError(null);
                        if (r === 'customer') setMobileInput('9876543210');
                        if (r === 'dealer') setMobileInput('9000011111');
                        if (r === 'plumber') setMobileInput('9111122222');
                        if (r === 'admin') setMobileInput('9999999999');
                      }}
                      mobileInput={mobileInput}
                      onChangeMobile={setMobileInput}
                      nameInput={nameInput}
                      onChangeName={setNameInput}
                      authError={authError}
                      onSubmit={handleSendOtp}
                      onQuickSelectPersona={quickSelectPersona}
                    />
                  )}

                  {/* AUTH STATE 3: OTP VERIFICATION */}
                  {authStep === 'OTP' && (
                    <OtpVerificationScreen
                      mobile={mobileInput}
                      role={selectedRole}
                      otpInput={otpInput}
                      onChangeOtp={setOtpInput}
                      demoOtp="123456"
                      error={authError}
                      onBack={() => setAuthStep('LOGIN')}
                      onVerify={handleVerifyOtp}
                    />
                  )}

                  {/* AUTH STATE 4: ZOHO DEALER VERIFICATION GATE */}
                  {authStep === 'ZOHO_VERIFY' && (
                    <ZohoVerificationScreen
                      dealer={pendingDealerVerification}
                      onProceed={() => loginSuccess(pendingDealerVerification)}
                      onBackToLogin={() => setAuthStep('LOGIN')}
                      onOpenAdminToVerify={() => setMainView('admin')}
                    />
                  )}

                  {/* ========================================================= */}
                  {/* AUTH STATE 5: AUTHENTICATED ROLE SCREENS                  */}
                  {/* ========================================================= */}
                  {authStep === 'AUTHENTICATED' && currentUser && (
                    <>
                      {/* ----------------------------------------------------- */}
                      {/* A. CUSTOMER SCREENS                                  */}
                      {/* ----------------------------------------------------- */}
                      {currentUser.role === 'customer' && (
                        <>
                          {mobileScreen === 'DASHBOARD' && (
                            <CustomerDashboard
                              customer={currentUser}
                              categories={categories}
                              products={products}
                              searchQuery={searchQuery}
                              onSearchChange={(q) => {
                                setSearchQuery(q);
                                fetchProducts('customer', selectedCategory, q);
                              }}
                              selectedCategory={selectedCategory}
                              onSelectCategory={(catId) => {
                                setSelectedCategory(catId);
                                fetchProducts('customer', catId, searchQuery);
                              }}
                              onOpenProductDetails={(prod) => {
                                setActiveProduct(prod);
                                navigateTo('PRODUCT_DETAIL');
                              }}
                              onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                              onOpenCart={() => navigateTo('CART')}
                              onOpenCategories={() => navigateTo('CATEGORIES')}
                              onOpenOrders={() => navigateTo('ORDERS')}
                            />
                          )}

                          {mobileScreen === 'CATEGORIES' && (
                            <div className="space-y-3 py-2">
                              <h2 className="text-base font-extrabold text-white">Select Product Category</h2>
                              <div className="space-y-2.5">
                                <button
                                  onClick={() => {
                                    setSelectedCategory('all');
                                    fetchProducts('customer', 'all', '');
                                    navigateTo('PRODUCTS');
                                  }}
                                  className="w-full p-3.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-left flex items-center justify-between"
                                >
                                  <span className="font-bold text-sm text-white">All Zoho Products</span>
                                  <ArrowRight className="w-4 h-4 text-blue-400" />
                                </button>
                                {categories.map((cat) => (
                                  <button
                                    key={cat.id}
                                    onClick={() => {
                                      setSelectedCategory(cat.id);
                                      fetchProducts('customer', cat.id, '');
                                      navigateTo('PRODUCTS');
                                    }}
                                    className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left flex items-center justify-between transition"
                                  >
                                    <div>
                                      <div className="font-bold text-sm text-white">{cat.name}</div>
                                      <div className="text-xs text-slate-400 mt-0.5">{cat.description}</div>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-slate-400" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {mobileScreen === 'PRODUCTS' && (
                            <CustomerDashboard
                              customer={currentUser}
                              categories={categories}
                              products={products}
                              searchQuery={searchQuery}
                              onSearchChange={(q) => {
                                setSearchQuery(q);
                                fetchProducts('customer', selectedCategory, q);
                              }}
                              selectedCategory={selectedCategory}
                              onSelectCategory={(catId) => {
                                setSelectedCategory(catId);
                                fetchProducts('customer', catId, searchQuery);
                              }}
                              onOpenProductDetails={(prod) => {
                                setActiveProduct(prod);
                                navigateTo('PRODUCT_DETAIL');
                              }}
                              onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                              onOpenCart={() => navigateTo('CART')}
                              onOpenCategories={() => navigateTo('CATEGORIES')}
                              onOpenOrders={() => navigateTo('ORDERS')}
                            />
                          )}

                          {mobileScreen === 'PRODUCT_DETAIL' && (
                            <CustomerProductDetails
                              product={activeProduct}
                              onBack={handleBack}
                              onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                              onGoToCart={() => navigateTo('CART')}
                            />
                          )}

                          {mobileScreen === 'CART' && (
                            <CustomerCart
                              cart={cart}
                              onUpdateQty={handleUpdateCartQty}
                              onClearCart={() => setCart([])}
                              onProceedToCheckout={() => navigateTo('CHECKOUT')}
                              onContinueShopping={() => navigateTo('DASHBOARD')}
                            />
                          )}

                          {mobileScreen === 'CHECKOUT' && (
                            <CustomerCheckout
                              cart={cart}
                              customer={currentUser}
                              paymentMode={customerPaymentMode}
                              onChangePaymentMode={setCustomerPaymentMode}
                              shippingAddress={shippingAddress}
                              onChangeShippingAddress={setShippingAddress}
                              error={checkoutError}
                              isSubmitting={isSubmittingOrder}
                              onPlaceOrder={handlePlaceOrder}
                              onBackToCart={() => navigateTo('CART')}
                            />
                          )}

                          {mobileScreen === 'ORDER_CONFIRMATION' && (
                            <CustomerOrderConfirmation
                              order={activeOrder}
                              onTrackOrder={() => navigateTo('ORDERS')}
                              onContinueShopping={() => navigateTo('DASHBOARD')}
                            />
                          )}

                          {mobileScreen === 'ORDERS' && (
                            <CustomerOrderTracking
                              orders={orders}
                              activeOrder={activeOrder}
                              onSelectOrder={(ord) => setActiveOrder(ord)}
                            />
                          )}

                          {mobileScreen === 'PROFILE' && (
                            <CustomerProfile
                              customer={currentUser}
                              onLogout={handleLogout}
                            />
                          )}

                          {mobileScreen === 'NOTIFICATIONS' && (
                            <CustomerNotifications notifications={notifications} />
                          )}
                        </>
                      )}

                      {/* ----------------------------------------------------- */}
                      {/* B. DEALER SCREENS                                    */}
                      {/* ----------------------------------------------------- */}
                      {currentUser.role === 'dealer' && (
                        <>
                          {mobileScreen === 'DASHBOARD' && (
                            <DealerDashboard
                              dealer={currentUser}
                              products={products}
                              orders={orders}
                              onNavigate={navigateTo}
                            />
                          )}

                          {mobileScreen === 'PRODUCTS' && (
                            <DealerProductList
                              products={products}
                              searchQuery={searchQuery}
                              onSearchChange={(q) => {
                                setSearchQuery(q);
                                fetchProducts('dealer', selectedCategory, q);
                              }}
                              onAddToCart={(prod, qty) => {
                                handleAddToCart(prod, qty);
                                navigateTo('CART');
                              }}
                              onOpenCart={() => navigateTo('CART')}
                            />
                          )}

                          {mobileScreen === 'CART' && (
                            <DealerCart
                              cart={cart}
                              onUpdateQty={handleUpdateCartQty}
                              onClearCart={() => setCart([])}
                              onProceedToCheckout={() => navigateTo('CHECKOUT')}
                              onContinueShopping={() => navigateTo('PRODUCTS')}
                            />
                          )}

                          {mobileScreen === 'CHECKOUT' && (
                            <DealerCheckout
                              cart={cart}
                              dealer={currentUser}
                              paymentMethod={dealerPaymentMethod}
                              onChangePaymentMethod={setDealerPaymentMethod}
                              shippingAddress={shippingAddress}
                              onChangeShippingAddress={setShippingAddress}
                              error={checkoutError}
                              isSubmitting={isSubmittingOrder}
                              onPlaceOrder={handlePlaceOrder}
                              onBackToCart={() => navigateTo('CART')}
                            />
                          )}

                          {mobileScreen === 'ORDER_CONFIRMATION' && (
                            <DealerOrderConfirmation
                              order={activeOrder}
                              onViewOrders={() => navigateTo('ORDERS')}
                              onContinueWholesale={() => navigateTo('PRODUCTS')}
                            />
                          )}

                          {mobileScreen === 'ORDERS' && (
                            <DealerOrders orders={orders} />
                          )}

                          {mobileScreen === 'PROFILE' && (
                            <DealerProfile
                              dealer={currentUser}
                              onLogout={handleLogout}
                            />
                          )}

                          {mobileScreen === 'NOTIFICATIONS' && (
                            <DealerNotifications notifications={notifications} />
                          )}
                        </>
                      )}

                      {/* ----------------------------------------------------- */}
                      {/* C. PLUMBER SCREENS                                   */}
                      {/* ----------------------------------------------------- */}
                      {currentUser.role === 'plumber' && plumberData && (
                        <>
                          {mobileScreen === 'DASHBOARD' && (
                            <PlumberDashboard
                              plumber={plumberData.plumber}
                              assignedOrders={plumberData.assignedOrders}
                              onNavigateTab={navigateTo}
                            />
                          )}

                          {mobileScreen === 'ASSIGNED_JOBS' && (
                            <PlumberAssignedActivities
                              assignedOrders={plumberData.assignedOrders}
                              onUpdateStatus={handlePlumberStatusUpdate}
                            />
                          )}

                          {mobileScreen === 'PRODUCT_GUIDE' && (
                            <PlumberProductRequirements
                              technicalCatalog={plumberData.technicalCatalog}
                            />
                          )}

                          {mobileScreen === 'PROFILE' && (
                            <PlumberProfile
                              plumber={plumberData.plumber}
                              onLogout={handleLogout}
                            />
                          )}

                          {mobileScreen === 'NOTIFICATIONS' && (
                            <PlumberNotifications notifications={notifications} />
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Role-Specific Mobile Bottom Navigation */}
                {authStep === 'AUTHENTICATED' && currentUser && (
                  <MobileBottomNav
                    role={currentUser.role}
                    activeTab={mobileScreen}
                    onSelectTab={(tabId) => navigateTo(tabId)}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
