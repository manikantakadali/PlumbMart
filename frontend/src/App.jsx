import React, { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle2,
  FileSpreadsheet,
  X,
  ChevronDown
} from 'lucide-react';

// Services
import {
  zohoAuthService,
  zohoProductService,
  zohoDealerService
} from './services/zoho';
import { customerService } from './services/customerService';
import { apiRequest } from './services/api';

// Navigation Components
import MobileHeader from './components/navigation/MobileHeader';
import MobileBottomNav from './components/navigation/MobileBottomNav';

// Auth Screens
import SplashScreen from './components/auth/SplashScreen';
import LoginScreen from './components/auth/LoginScreen';
import OtpVerificationScreen from './components/auth/OtpVerificationScreen';
import ZohoVerificationScreen from './components/auth/ZohoVerificationScreen';

// Customer Screens (100% Dynamic)
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
import { sendFirebaseOtp, verifyFirebaseOtp } from './firebase';

export default function App() {
  const [mainView, setMainView] = useState('mobile'); // 'mobile' | 'admin' | 'blueprint'
  const [showPersonaDrawer, setShowPersonaDrawer] = useState(false);

  // Auth State
  const [authStep, setAuthStep] = useState('LOGIN'); // 'SPLASH' | 'LOGIN' | 'OTP' | 'ZOHO_VERIFY' | 'AUTHENTICATED'
  const [selectedRole, setSelectedRole] = useState('customer');
  const [mobileInput, setMobileInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [authError, setAuthError] = useState(null);
  const [smsNotice, setSmsNotice] = useState('');
  const [demoOtp, setDemoOtp] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingDealerVerification, setPendingDealerVerification] = useState(null);

  // Mobile Screen State
  const [mobileScreen, setMobileScreen] = useState('DASHBOARD');
  const [screenHistory, setScreenHistory] = useState(['DASHBOARD']);

  // Dynamic Customer Data
  const [customerBanners, setCustomerBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [activeFilter, setActiveFilter] = useState(''); // 'featured' | 'popular'

  const [activeProduct, setActiveProduct] = useState(null);

  // Dynamic Cart (Backend-persisted per customer)
  const [cartItems, setCartItems] = useState([]);
  const [cartSubtotal, setCartSubtotal] = useState(0);
  const [cartDeliveryCharge, setCartDeliveryCharge] = useState(0);
  const [cartTotalAmount, setCartTotalAmount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [cartError, setCartError] = useState(null);

  // Dynamic Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Dynamic Orders & Tracking
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);

  // Dynamic Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Checkout State
  const [customerPaymentMode, setCustomerPaymentMode] = useState('UPI (PhonePe / GPay)');
  const [dealerPaymentMethod, setDealerPaymentMethod] = useState('UPFRONT');
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Plumber Data & Admin Data
  const [plumberData, setPlumberData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [zohoMeta, setZohoMeta] = useState(null);

  // 1. Fetch Admin Overview
  const fetchOverview = useCallback(async () => {
    try {
      const data = await apiRequest('/api/admin/overview');
      setAdminData(data);
      setZohoMeta(data.zohoMeta);
    } catch (err) {
      console.error('Error fetching admin overview:', err);
    }
  }, []);

  // 2. Fetch Customer Banners
  const fetchBanners = useCallback(async () => {
    try {
      const res = await customerService.getBanners();
      setCustomerBanners(res.banners || []);
    } catch (err) {
      console.error('Error fetching banners:', err);
    }
  }, []);

  // 3. Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await customerService.getCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // 4. Fetch Products dynamically with role filtering
  const fetchDynamicProducts = useCallback(
    async (role = 'customer', catId = 'all', search = '', sort = '', filter = '') => {
      setIsProductsLoading(true);
      setProductsError(null);
      try {
        if (role === 'customer') {
          const res = await customerService.getProducts({
            categoryId: catId,
            search,
            sort,
            filter
          });
          setProducts(res.products || []);
          if (res.categories) setCategories(res.categories);
        } else {
          const res = await zohoProductService.getProductsByRole(role, catId, search);
          setProducts(res.products || []);
          if (res.categories) setCategories(res.categories);
        }
      } catch (err) {
        setProductsError('Failed to load products. Please check server.');
      } finally {
        setIsProductsLoading(false);
      }
    },
    []
  );

  // 5. Fetch Customer Cart from Backend
  const fetchCustomerCart = useCallback(async (customerId) => {
    if (!customerId) return;
    setIsCartLoading(true);
    setCartError(null);
    try {
      const res = await customerService.getCart(customerId);
      setCartItems(res.items || []);
      setCartSubtotal(res.subtotal || 0);
      setCartDeliveryCharge(res.deliveryCharge || 0);
      setCartTotalAmount(res.totalAmount || 0);
      setCartCount(res.itemCount || 0);
    } catch (err) {
      setCartError('Failed to sync shopping cart.');
    } finally {
      setIsCartLoading(false);
    }
  }, []);

  // 6. Fetch Customer Addresses
  const fetchCustomerAddresses = useCallback(async (customerId) => {
    if (!customerId) return;
    try {
      const res = await customerService.getAddresses(customerId);
      const addrList = res.addresses || [];
      setAddresses(addrList);
      const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setShippingAddress(`${defaultAddr.addressLine}, ${defaultAddr.city} - ${defaultAddr.pincode}`);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  }, []);

  // 7. Fetch Customer Orders
  const fetchCustomerOrders = useCallback(async (customerId) => {
    if (!customerId) return;
    setIsOrdersLoading(true);
    setOrdersError(null);
    try {
      const res = await customerService.getMyOrders(customerId);
      setOrders(res.orders || []);
    } catch (err) {
      setOrdersError('Failed to load order history.');
    } finally {
      setIsOrdersLoading(false);
    }
  }, []);

  // 8. Fetch Notifications
  const fetchCustomerNotifications = useCallback(async (customerId) => {
    if (!customerId) return;
    try {
      const res = await customerService.getNotifications(customerId);
      setNotifications(res.notifications || []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  // 9. Fetch Plumber Info
  const fetchPlumberInfo = useCallback(async (plumberId) => {
    try {
      const data = await apiRequest(`/api/plumber/${plumberId || 'PLB-01'}`);
      setPlumberData(data);
    } catch (err) {
      console.error('Error fetching plumber info:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchOverview();
    fetchBanners();
    fetchCategories();
    fetchDynamicProducts('customer');
  }, [fetchOverview, fetchBanners, fetchCategories, fetchDynamicProducts]);

  // Navigate Screen
  const navigateTo = (screen) => {
    setMobileScreen(screen);
    setScreenHistory((prev) => [...prev, screen]);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      const next = [...screenHistory];
      next.pop();
      const prevScreen = next[next.length - 1];
      setScreenHistory(next);
      setMobileScreen(prevScreen);
    } else {
      setMobileScreen('DASHBOARD');
    }
  };

  // Auth: Send OTP via SMS (Firebase Phone Auth with Backend Gateway Fallback)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setSmsNotice('');
    setOtpInput('');

    // If customer, try Firebase Phone Auth first for live Google SMS delivery
    if (selectedRole === 'customer') {
      try {
        console.log(`[Firebase Auth] Dispatching SMS to +91 ${mobileInput}...`);
        await sendFirebaseOtp(mobileInput, 'recaptcha-container');
        setSmsNotice(`Real SMS OTP sent via Firebase to +91 ${mobileInput}`);
        setDemoOtp(null);
        setOtpInput('');
        setAuthStep('OTP');
        return;
      } catch (fbErr) {
        console.warn('[Firebase Auth] Notice:', fbErr.message, 'Proceeding with backend SMS dispatch...');
      }
    }

    try {
      const res = await zohoAuthService.requestOtp(mobileInput, selectedRole, nameInput);
      setSmsNotice(res.message || `Verification code sent via SMS to +91 ${mobileInput}`);
      if (selectedRole !== 'customer' && res.demoOtp) {
        setDemoOtp(res.demoOtp);
        setOtpInput(res.demoOtp);
      } else {
        setDemoOtp(null);
        setOtpInput(''); // Customer enters real OTP received on phone
      }
      setAuthStep('OTP');
    } catch (err) {
      setAuthError(err.data ? err.data.error : err.message);
    }
  };

  // Auth: Resend OTP via SMS with cooldown
  const handleResendOtp = async () => {
    setAuthError(null);

    if (selectedRole === 'customer') {
      try {
        await sendFirebaseOtp(mobileInput, 'recaptcha-container');
        setSmsNotice(`Fresh SMS OTP sent via Firebase to +91 ${mobileInput}`);
        return;
      } catch (fbResendErr) {
        console.warn('Firebase resend notice:', fbResendErr.message);
      }
    }

    try {
      const res = await zohoAuthService.resendOtp(mobileInput, selectedRole, nameInput);
      setSmsNotice(res.message);
      if (selectedRole !== 'customer' && res.demoOtp) {
        setDemoOtp(res.demoOtp);
      }
      return res;
    } catch (err) {
      const errMsg = err.data ? err.data.error : err.message;
      setAuthError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Auth: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);
    try {
      // 1. If Firebase session is active, confirm with Firebase
      if (selectedRole === 'customer' && window.confirmationResult) {
        try {
          const fbResult = await verifyFirebaseOtp(otpInput);
          const res = await zohoAuthService.firebaseLogin({
            mobile: mobileInput,
            idToken: fbResult.idToken,
            role: 'customer',
            name: nameInput
          });
          window.confirmationResult = null;
          await loginSuccess(res.user);
          return;
        } catch (fbVerifyErr) {
          console.warn('[Firebase Verify] Confirmation notice:', fbVerifyErr.message, 'Falling back to backend verification...');
        }
      }

      // 2. Standard / Backend OTP verification
      const res = await zohoAuthService.verifyOtp(
        mobileInput,
        otpInput,
        selectedRole,
        nameInput
      );

      if (res.user.role === 'dealer') {
        setPendingDealerVerification(res.user);
        setAuthStep('ZOHO_VERIFY');
        return;
      }

      if (res.user.role === 'admin') {
        setCurrentUser(res.user);
        setMainView('admin');
        setAuthStep('AUTHENTICATED');
        return;
      }

      await loginSuccess(res.user);
    } catch (err) {
      setAuthError(err.data ? err.data.error : err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  // Successful Login handler
  const loginSuccess = async (user) => {
    setCurrentUser(user);
    setAuthStep('AUTHENTICATED');
    setMobileScreen('DASHBOARD');
    setScreenHistory(['DASHBOARD']);
    setCheckoutError('');
    setShowPersonaDrawer(false);

    if (user.role === 'customer') {
      await fetchCustomerCart(user.id);
      await fetchCustomerAddresses(user.id);
      await fetchCustomerOrders(user.id);
      await fetchCustomerNotifications(user.id);
      await fetchDynamicProducts('customer', 'all', '', '', '');
    } else if (user.role === 'dealer') {
      await fetchDynamicProducts('dealer', 'all', '');
      const dealerOrders = await apiRequest(`/api/orders?role=dealer&userId=${user.id}`);
      setOrders(dealerOrders.orders || []);
      const dNotifs = await apiRequest(`/api/notifications?role=dealer&userId=${user.id}`);
      setNotifications(dNotifs.notifications || []);
      setCartItems([]);
      setCartCount(0);
    } else if (user.role === 'plumber') {
      await fetchPlumberInfo(user.id);
      const pNotifs = await apiRequest(`/api/notifications?role=plumber&userId=${user.id}`);
      setNotifications(pNotifs.notifications || []);
    }

    await fetchOverview();
  };

  // 1-Click Persona Switcher for Interview Demo
  const quickSelectPersona = async (role, mobile, name = '') => {
    setSelectedRole(role);
    setMobileInput(mobile);
    setNameInput(name);
    setAuthError(null);
    setShowPersonaDrawer(false);

    if (role === 'admin') {
      const adminUser = adminData?.users?.admins[0] || { id: 'ADM-01', role: 'admin', name: 'Manikanta (Super Admin)' };
      setCurrentUser(adminUser);
      setMainView('admin');
      return;
    }

    if (role === 'customer') {
      setAuthStep('LOGIN');
      return;
    }

    try {
      await zohoAuthService.requestOtp(mobile, role, name);
      const res = await zohoAuthService.verifyOtp(mobile, '123456', role, name);

      if (res.user.role === 'dealer') {
        setPendingDealerVerification(res.user);
        setAuthStep('ZOHO_VERIFY');
      } else {
        await loginSuccess(res.user);
      }
    } catch (err) {
      if (role === 'dealer') {
        const unverified = adminData?.users?.dealers?.find((d) => d.mobile === mobile);
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
    setCartItems([]);
    setCartCount(0);
  };

  // Customer Dynamic Cart Actions
  const handleAddToCart = async (product, qty = 1) => {
    if (currentUser?.role === 'customer') {
      try {
        const res = await customerService.addToCart(currentUser.id, product.id, qty);
        setCartItems(res.items || []);
        setCartSubtotal(res.subtotal || 0);
        setCartDeliveryCharge(res.deliveryCharge || 0);
        setCartTotalAmount(res.totalAmount || 0);
        setCartCount(res.itemCount || 0);
      } catch (err) {
        console.error('Error adding to backend cart:', err);
      }
    } else {
      // Dealer local cart for bulk quotes
      const minQty = product.minDealerOrderQty || 1;
      const addQty = qty || minQty;
      setCartItems((prev) => {
        const exists = prev.find((i) => i.product.id === product.id);
        if (exists) {
          return prev.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + addQty } : i
          );
        }
        return [...prev, { product, qty: addQty }];
      });
      setCartCount((c) => c + addQty);
    }
  };

  const handleUpdateCartQty = async (productId, delta) => {
    if (currentUser?.role === 'customer') {
      try {
        const res = await customerService.updateCartQty(currentUser.id, productId, delta);
        setCartItems(res.items || []);
        setCartSubtotal(res.subtotal || 0);
        setCartDeliveryCharge(res.deliveryCharge || 0);
        setCartTotalAmount(res.totalAmount || 0);
        setCartCount(res.itemCount || 0);
      } catch (err) {
        console.error('Error updating cart qty:', err);
      }
    } else {
      setCartItems((prev) =>
        prev
          .map((item) => {
            if (item.product.id !== productId) return item;
            const next = item.qty + delta;
            return next > 0 ? { ...item, qty: next } : null;
          })
          .filter(Boolean)
      );
    }
  };

  const handleRemoveCartItem = async (productId) => {
    if (currentUser?.role === 'customer') {
      try {
        await customerService.removeFromCart(currentUser.id, productId);
        await fetchCustomerCart(currentUser.id);
      } catch (err) {
        console.error('Error removing cart item:', err);
      }
    } else {
      setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    }
  };

  const handleClearCart = async () => {
    if (currentUser?.role === 'customer') {
      try {
        await customerService.clearCart(currentUser.id);
        setCartItems([]);
        setCartSubtotal(0);
        setCartDeliveryCharge(0);
        setCartTotalAmount(0);
        setCartCount(0);
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    } else {
      setCartItems([]);
      setCartCount(0);
    }
  };

  // Customer Dynamic Address Actions
  const handleSelectAddress = (addressId) => {
    setSelectedAddressId(addressId);
    const addr = addresses.find((a) => a.id === addressId);
    if (addr) {
      setShippingAddress(`${addr.addressLine}, ${addr.city} - ${addr.pincode}`);
    }
  };

  const handleAddNewAddress = async (addrData) => {
    if (!currentUser) return;
    try {
      const res = await customerService.addAddress(currentUser.id, addrData);
      setAddresses(res.addresses || []);
      if (res.newAddress) {
        setSelectedAddressId(res.newAddress.id);
        setShippingAddress(`${res.newAddress.addressLine}, ${res.newAddress.city} - ${res.newAddress.pincode}`);
      }
    } catch (err) {
      console.error('Error adding address:', err);
    }
  };

  // Place Order (Customer Direct Payment or Dealer Credit)
  const handlePlaceOrder = async () => {
    setCheckoutError('');
    setIsSubmittingOrder(true);
    try {
      const payload = {
        userId: currentUser.id,
        role: currentUser.role,
        items: cartItems.map((i) => ({ productId: i.product.id, qty: i.qty })),
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

      const res = await customerService.createOrder(payload);

      // Refresh cart, orders, and products
      if (currentUser.role === 'customer') {
        await fetchCustomerCart(currentUser.id);
        await fetchCustomerOrders(currentUser.id);
        await fetchCustomerNotifications(currentUser.id);
      } else {
        setCartItems([]);
        const dealerOrders = await apiRequest(`/api/orders?role=dealer&userId=${currentUser.id}`);
        setOrders(dealerOrders.orders || []);
      }

      setActiveOrder(res.order);
      await fetchDynamicProducts(currentUser.role, selectedCategory, searchQuery);
      await fetchOverview();
      navigateTo('ORDER_CONFIRMATION');
    } catch (err) {
      setCheckoutError(err.data ? err.data.error : err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Customer Profile Update
  const handleUpdateCustomerProfile = async (profileData) => {
    if (!currentUser) return;
    const res = await customerService.updateProfile(currentUser.id, profileData);
    if (res.customer) {
      setCurrentUser(res.customer);
      if (profileData.address) setShippingAddress(profileData.address);
      await fetchCustomerAddresses(currentUser.id);
    }
  };

  // Notification Mark as Read
  const handleMarkNotificationRead = async (notifId) => {
    if (!currentUser) return;
    await customerService.markNotificationRead(currentUser.id, notifId);
    await fetchCustomerNotifications(currentUser.id);
  };

  // Plumber Actions
  const handlePlumberStatusUpdate = async (orderId, status) => {
    await apiRequest(`/api/plumber/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ plumberTaskStatus: status })
    });
    await fetchPlumberInfo(currentUser?.id);
    await fetchCustomerNotifications(currentUser?.id);
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
      await fetchDynamicProducts(currentUser.role, selectedCategory, searchQuery);
    }
  };

  const handleAdminUpdateOrder = async (orderId, updates) => {
    await apiRequest(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    await fetchOverview();
    if (currentUser) {
      if (currentUser.role === 'customer') {
        await fetchCustomerOrders(currentUser.id);
      } else {
        const dealerOrders = await apiRequest(`/api/orders?role=dealer&userId=${currentUser.id}`);
        setOrders(dealerOrders.orders || []);
      }
    }
  };

  const handleTriggerZohoSync = async () => {
    await zohoProductService.syncZohoWorkbook();
    await fetchOverview();
    if (currentUser) {
      await fetchDynamicProducts(currentUser.role, selectedCategory, searchQuery);
    }
  };

  const handleResetDemo = async () => {
    await apiRequest('/api/admin/reset-demo', { method: 'POST' });
    await fetchOverview();
    if (currentUser) {
      await loginSuccess(currentUser);
    }
  };

  const personasList = [
    {
      role: 'customer',
      mobile: '9876543210',
      name: 'Rahul Sharma',
      tag: '1. CUSTOMER A (Rahul)',
      color: 'blue',
      desc: 'Dynamic Profile • Own Cart & Addresses • Retail Price Only • Stock Hidden'
    },
    {
      role: 'customer',
      mobile: '9848011223',
      name: 'Priya Nair',
      tag: '1B. CUSTOMER B (Priya)',
      color: 'blue',
      desc: 'Separate Customer Account • Own Cart, Orders & Notifications'
    },
    {
      role: 'dealer',
      mobile: '9000011111',
      name: 'Sri Venkateswara Distributors',
      tag: '2A. DEALER (90D APPROVED)',
      color: 'amber',
      desc: 'Zoho Verified • Sees Exact Stock • Upfront, 30-Day & 90-Day Credit Approved'
    },
    {
      role: 'dealer',
      mobile: '9000022222',
      name: 'Metro Pipe Syndicate',
      tag: '2B. DEALER (30D ONLY)',
      color: 'amber',
      desc: 'Zoho Verified • Sees Stock • Upfront & 30-Day Credit (90-Day Credit Locked)'
    },
    {
      role: 'dealer',
      mobile: '9000033333',
      name: 'Coastal Builders Mart',
      tag: '2C. UNVERIFIED DEALER',
      color: 'rose',
      desc: 'Demonstrates Zoho CRM Gate: Login Blocked until Admin approves in Zoho'
    },
    {
      role: 'plumber',
      mobile: '9111122222',
      name: 'Ramesh Babu (Master Plumber)',
      tag: '3. MASTER PLUMBER',
      color: 'purple',
      desc: 'Trade Verified • Assigned jobs • Product technical specs & reward wallet'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Sleek Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-black text-white text-sm shadow-md shadow-blue-500/30">
              PM
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">PlumbMart</span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <FileSpreadsheet className="w-2.5 h-2.5" /> Zoho Live
              </span>
            </div>
          </div>

          {/* Persona Switcher Trigger */}
          <button
            onClick={() => setShowPersonaDrawer(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-900/60 to-purple-900/60 hover:from-blue-800/80 hover:to-purple-800/80 border border-blue-500/40 text-white text-[11px] font-bold shadow transition"
            title="Switch Demo Role"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span className="hidden sm:inline">User:</span>
            <span className="text-blue-300 truncate max-w-[120px]">
              {currentUser ? currentUser.name : selectedRole}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Navigation Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMainView('mobile')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                mainView === 'mobile'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span className="hidden xs:inline">App</span>
            </button>
            <button
              onClick={() => setMainView('admin')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                mainView === 'admin'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span className="hidden xs:inline">Admin</span>
            </button>
            <button
              onClick={() => setMainView('blueprint')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                mainView === 'blueprint'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Blueprint</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-start">
        {/* VIEW 1: BLUEPRINT */}
        {mainView === 'blueprint' && (
          <div className="p-4 sm:p-6 w-full">
            <BlueprintAndComparison
              zohoMeta={zohoMeta}
              products={adminData?.products || products}
              onTriggerZohoSync={handleTriggerZohoSync}
              onSwitchView={setMainView}
            />
          </div>
        )}

        {/* VIEW 2: ADMIN MANAGEMENT PORTAL */}
        {mainView === 'admin' && (
          <div className="p-4 sm:p-6 w-full">
            <AdminPortal
              adminData={adminData}
              onUpdateDealer={handleAdminUpdateDealer}
              onUpdatePlumber={handleAdminUpdatePlumber}
              onUpdateProductRow={handleAdminUpdateProductRow}
              onUpdateOrder={handleAdminUpdateOrder}
              onTriggerZohoSync={handleTriggerZohoSync}
              onResetDemo={handleResetDemo}
            />
          </div>
        )}

        {/* VIEW 3: MOBILE APP SIMULATOR */}
        {mainView === 'mobile' && (
          <div className="w-full flex-1 flex flex-col lg:py-6 lg:items-center justify-center">
            <div className="w-full lg:max-w-[440px] bg-slate-900 lg:border-[6px] lg:border-slate-800 lg:rounded-[44px] lg:shadow-2xl overflow-hidden flex flex-col flex-1 min-h-[calc(100vh-56px)] lg:min-h-[760px] lg:max-h-[840px]">
              {/* Phone Top Status Bar */}
              <div className="hidden lg:flex bg-slate-950 px-6 py-2.5 items-center justify-between border-b border-slate-800/80 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-200">PlumbMart Mobile</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Zoho Live
                  </span>
                  <span>5G • 100%</span>
                </div>
              </div>

              {/* Mobile Header (When Logged In) */}
              {authStep === 'AUTHENTICATED' && currentUser && (
                <MobileHeader
                  currentUser={currentUser}
                  currentScreen={mobileScreen}
                  cartCount={cartCount}
                  unreadNotificationsCount={unreadNotificationsCount}
                  onBack={handleBack}
                  onOpenCart={() => navigateTo('CART')}
                  onOpenNotifications={() => navigateTo('NOTIFICATIONS')}
                  onLogout={handleLogout}
                />
              )}

              {/* Scrollable Screen Body */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
                <div id="recaptcha-container"></div>

                {/* 1. Splash */}
                {authStep === 'SPLASH' && (
                  <SplashScreen onStart={() => setAuthStep('LOGIN')} />
                )}

                {/* 2. Login Screen */}
                {authStep === 'LOGIN' && (
                  <LoginScreen
                    selectedRole={selectedRole}
                    onSelectRole={(r) => {
                      setSelectedRole(r);
                      setAuthError(null);
                      if (r === 'customer') {
                        setMobileInput('');
                        setNameInput('');
                      }
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

                {/* 3. OTP Screen */}
                {authStep === 'OTP' && (
                  <OtpVerificationScreen
                    mobile={mobileInput}
                    role={selectedRole}
                    otpInput={otpInput}
                    onChangeOtp={setOtpInput}
                    demoOtp={selectedRole !== 'customer' ? demoOtp : null}
                    error={authError}
                    smsNotice={smsNotice}
                    isVerifying={isVerifying}
                    onBack={() => setAuthStep('LOGIN')}
                    onVerify={handleVerifyOtp}
                    onResendOtp={handleResendOtp}
                  />
                )}

                {/* 4. Zoho Dealer Verification Gate Screen */}
                {authStep === 'ZOHO_VERIFY' && (
                  <ZohoVerificationScreen
                    dealer={pendingDealerVerification}
                    onProceed={() => loginSuccess(pendingDealerVerification)}
                    onBackToLogin={() => setAuthStep('LOGIN')}
                    onOpenAdminToVerify={() => setMainView('admin')}
                  />
                )}

                {/* 5. Authenticated Dashboards */}
                {authStep === 'AUTHENTICATED' && currentUser && (
                  <>
                    {/* CUSTOMER SIDE (FULLY DYNAMIC) */}
                    {currentUser.role === 'customer' && (
                      <>
                        {mobileScreen === 'DASHBOARD' && (
                          <CustomerDashboard
                            customer={currentUser}
                            banners={customerBanners}
                            categories={categories}
                            products={products}
                            isLoading={isProductsLoading}
                            error={productsError}
                            searchQuery={searchQuery}
                            onSearchChange={(q) => {
                              setSearchQuery(q);
                              fetchDynamicProducts('customer', selectedCategory, q, sortOption, activeFilter);
                            }}
                            selectedCategory={selectedCategory}
                            onSelectCategory={(catId) => {
                              setSelectedCategory(catId);
                              fetchDynamicProducts('customer', catId, searchQuery, sortOption, activeFilter);
                            }}
                            sortOption={sortOption}
                            onSortChange={(s) => {
                              setSortOption(s);
                              fetchDynamicProducts('customer', selectedCategory, searchQuery, s, activeFilter);
                            }}
                            activeFilter={activeFilter}
                            onFilterChange={(f) => {
                              setActiveFilter(f);
                              fetchDynamicProducts('customer', selectedCategory, searchQuery, sortOption, f);
                            }}
                            onOpenProductDetails={(prod) => {
                              setActiveProduct(prod);
                              navigateTo('PRODUCT_DETAIL');
                            }}
                            onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                            onOpenCart={() => navigateTo('CART')}
                            onOpenCategories={() => navigateTo('CATEGORIES')}
                            onOpenOrders={() => navigateTo('ORDERS')}
                            onRetry={() => fetchDynamicProducts('customer', selectedCategory, searchQuery)}
                          />
                        )}

                        {mobileScreen === 'CATEGORIES' && (
                          <div className="space-y-3 py-2">
                            <h2 className="text-base font-extrabold text-white">Dynamic Categories</h2>
                            <div className="space-y-2.5">
                              <button
                                onClick={() => {
                                  setSelectedCategory('all');
                                  fetchDynamicProducts('customer', 'all', searchQuery, sortOption, activeFilter);
                                  navigateTo('PRODUCTS');
                                }}
                                className="w-full p-3.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-left flex items-center justify-between"
                              >
                                <span className="font-bold text-sm text-white">All Products ({products.length})</span>
                                <ArrowRight className="w-4 h-4 text-blue-400" />
                              </button>
                              {categories.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    setSelectedCategory(cat.id);
                                    fetchDynamicProducts('customer', cat.id, searchQuery, sortOption, activeFilter);
                                    navigateTo('PRODUCTS');
                                  }}
                                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left flex items-center justify-between transition"
                                >
                                  <div>
                                    <div className="font-bold text-sm text-white flex items-center gap-1.5">
                                      <span>{cat.name}</span>
                                      {cat.productCount !== undefined && (
                                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-blue-300 font-mono">
                                          {cat.productCount} items
                                        </span>
                                      )}
                                    </div>
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
                            banners={[]}
                            categories={categories}
                            products={products}
                            isLoading={isProductsLoading}
                            error={productsError}
                            searchQuery={searchQuery}
                            onSearchChange={(q) => {
                              setSearchQuery(q);
                              fetchDynamicProducts('customer', selectedCategory, q, sortOption, activeFilter);
                            }}
                            selectedCategory={selectedCategory}
                            onSelectCategory={(catId) => {
                              setSelectedCategory(catId);
                              fetchDynamicProducts('customer', catId, searchQuery, sortOption, activeFilter);
                            }}
                            sortOption={sortOption}
                            onSortChange={(s) => {
                              setSortOption(s);
                              fetchDynamicProducts('customer', selectedCategory, searchQuery, s, activeFilter);
                            }}
                            activeFilter={activeFilter}
                            onFilterChange={(f) => {
                              setActiveFilter(f);
                              fetchDynamicProducts('customer', selectedCategory, searchQuery, sortOption, f);
                            }}
                            onOpenProductDetails={(prod) => {
                              setActiveProduct(prod);
                              navigateTo('PRODUCT_DETAIL');
                            }}
                            onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                            onOpenCart={() => navigateTo('CART')}
                            onOpenCategories={() => navigateTo('CATEGORIES')}
                            onOpenOrders={() => navigateTo('ORDERS')}
                            onRetry={() => fetchDynamicProducts('customer', selectedCategory, searchQuery)}
                          />
                        )}

                        {mobileScreen === 'PRODUCT_DETAIL' && (
                          <CustomerProductDetails
                            product={activeProduct}
                            customerId={currentUser.id}
                            onBack={handleBack}
                            onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
                            onGoToCart={() => navigateTo('CART')}
                          />
                        )}

                        {mobileScreen === 'CART' && (
                          <CustomerCart
                            cart={cartItems}
                            subtotal={cartSubtotal}
                            deliveryCharge={cartDeliveryCharge}
                            totalAmount={cartTotalAmount}
                            isLoading={isCartLoading}
                            error={cartError}
                            onUpdateQty={handleUpdateCartQty}
                            onRemoveItem={handleRemoveCartItem}
                            onClearCart={handleClearCart}
                            onProceedToCheckout={() => navigateTo('CHECKOUT')}
                            onContinueShopping={() => navigateTo('DASHBOARD')}
                            onRetry={() => fetchCustomerCart(currentUser.id)}
                          />
                        )}

                        {mobileScreen === 'CHECKOUT' && (
                          <CustomerCheckout
                            cart={cartItems}
                            customer={currentUser}
                            addresses={addresses}
                            selectedAddressId={selectedAddressId}
                            onSelectAddress={handleSelectAddress}
                            onAddNewAddress={handleAddNewAddress}
                            paymentMode={customerPaymentMode}
                            onChangePaymentMode={setCustomerPaymentMode}
                            subtotal={cartSubtotal}
                            deliveryCharge={cartDeliveryCharge}
                            totalAmount={cartTotalAmount}
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
                            isLoading={isOrdersLoading}
                            error={ordersError}
                            onRetry={() => fetchCustomerOrders(currentUser.id)}
                            onBrowseProducts={() => navigateTo('DASHBOARD')}
                          />
                        )}

                        {mobileScreen === 'PROFILE' && (
                          <CustomerProfile
                            customer={currentUser}
                            onUpdateProfile={handleUpdateCustomerProfile}
                            onLogout={handleLogout}
                          />
                        )}

                        {mobileScreen === 'NOTIFICATIONS' && (
                          <CustomerNotifications
                            notifications={notifications}
                            onMarkAsRead={handleMarkNotificationRead}
                          />
                        )}
                      </>
                    )}

                    {/* DEALER SIDE */}
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
                              fetchDynamicProducts('dealer', selectedCategory, q);
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
                            cart={cartItems}
                            onUpdateQty={handleUpdateCartQty}
                            onClearCart={handleClearCart}
                            onProceedToCheckout={() => navigateTo('CHECKOUT')}
                            onContinueShopping={() => navigateTo('PRODUCTS')}
                          />
                        )}

                        {mobileScreen === 'CHECKOUT' && (
                          <DealerCheckout
                            cart={cartItems}
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

                    {/* PLUMBER SIDE */}
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

              {/* Dynamic Bottom Navigation */}
              {authStep === 'AUTHENTICATED' && currentUser && (
                <MobileBottomNav
                  role={currentUser.role}
                  activeTab={mobileScreen}
                  onSelectTab={(tabId) => navigateTo(tabId)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Slide-Up Persona Drawer */}
      {showPersonaDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  1-Click Interview Role Switcher
                </h3>
              </div>
              <button
                onClick={() => setShowPersonaDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select any persona to immediately log in and demonstrate their exact flow, pricing tier, and permission rules (Demo OTP: <strong className="text-emerald-400 font-mono">123456</strong>):
            </p>

            <div className="space-y-2.5">
              {personasList.map((p) => (
                <button
                  key={p.tag}
                  onClick={() => quickSelectPersona(p.role, p.mobile, p.name)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between gap-3 ${
                    currentUser?.mobile === p.mobile
                      ? 'bg-blue-950/80 border-blue-500 text-white shadow'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.color === 'amber'
                            ? 'bg-amber-500/20 text-amber-300'
                            : p.color === 'purple'
                            ? 'bg-purple-500/20 text-purple-300'
                            : p.color === 'rose'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {p.tag}
                      </span>
                      <span className="font-bold text-xs text-white truncate max-w-[200px]">
                        {p.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">+91 {p.mobile}</div>
                    <p className="text-[11px] text-slate-400 pt-0.5 leading-snug">{p.desc}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-1" />
                </button>
              ))}

              {/* Admin Portal Shortcut */}
              <button
                onClick={() => {
                  quickSelectPersona('admin', '9999999999');
                  setShowPersonaDrawer(false);
                }}
                className="w-full p-3.5 rounded-2xl border border-rose-500/40 bg-rose-950/40 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                    4. SUPER ADMIN
                  </span>
                  <div className="text-xs font-bold text-white mt-1">Open 11-Module Admin Panel</div>
                  <div className="text-[10px] text-slate-400">Manage Dealers, 30/90D Credit, Zoho Workbook Rows</div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
