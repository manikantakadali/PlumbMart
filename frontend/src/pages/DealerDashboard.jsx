import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DealerLayout from '../components/DealerLayout';
import { 
  Box, 
  Package, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  ShieldCheck, 
  ExternalLink, 
  Plus, 
  Minus, 
  Check, 
  FileText, 
  Download, 
  Sparkles, 
  Filter, 
  ArrowRight,
  Eye,
  MapPin,
  Calendar,
  Layers,
  Info,
  Lock,
  Unlock,
  Mail,
  PartyPopper,
  X
} from 'lucide-react';
import { addToDealerCart, getDealerCart } from '../utils/dealerCart';
import { getDealerHub } from '../utils/hubResolver';
import DealerSuspendedModal from '../components/DealerSuspendedModal';
import DealerSupportModal from '../components/DealerSupportModal';

const CATEGORIES = [
  'All Categories',
  'Pipes & Tubes',
  'Fittings & Valves',
  'Bath & Faucets',
  'Pumps & Motors',
  'Tools & Sealants',
  'Water Tanks & Storage',
  'Drainage & Sanitary'
];

export default function DealerDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();

  // Active Main Tab: 'stock' | 'tracking' | 'credit'
  const [activeMainTab, setActiveMainTab] = useState('stock');

  // Dynamic Dealer Profile from Admin Credit Governance
  const [dealerProfile, setDealerProfile] = useState(() => {
    let saved = null;
    try {
      const item = localStorage.getItem('plumbmart_user');
      saved = item ? JSON.parse(item) : null;
    } catch (e) {}

    return {
      id: saved?.id || currentUser?.id || 'DLR-01',
      name: saved?.name || currentUser?.name || 'Sri Venkateswara Distributors',
      contactPerson: saved?.contactPerson || 'Srinivas Rao',
      mobile: saved?.mobile || currentUser?.mobile || '9000011111',
      email: saved?.email || 'dealer@plumbmart-demo.com',
      gstin: saved?.gstin || currentUser?.gstin || '29ABCDE1234F1Z5',
      zohoVerified: true,
      status: saved?.status || 'Approved',
      credit30Days: saved?.credit30Days !== undefined ? saved.credit30Days : true,
      credit90Days: saved?.credit90Days !== undefined ? saved.credit90Days : true,
      creditLimit: saved?.creditLimit || 500000,
      availableCredit: saved?.availableCredit || 500000,
      outstandingDue: saved?.outstandingDue || 0,
      nextDueDate: saved?.nextDueDate || 'None'
    };
  });

  // State for Live Products / Stock
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [stockStatusFilter, setStockStatusFilter] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'high_margin'
  const [quantities, setQuantities] = useState({});
  const [isSyncingStock, setIsSyncingStock] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState(new Date().toLocaleTimeString());
  const [addedToast, setAddedToast] = useState(null);

  // State for Live Orders & Tracking
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all'); // 'all' | 'active' | 'delivered' | 'credit_due'
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [statusNotification, setStatusNotification] = useState(null);
  const [settledNotice, setSettledNotice] = useState(null);
  const [governanceNotice, setGovernanceNotice] = useState(null);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isWelcomeBackActive, setIsWelcomeBackActive] = useState(() => {
    try {
      return localStorage.getItem('plumbmart_show_welcome_back') === 'true' ||
             Boolean(localStorage.getItem('plumbmart_dealer_welcome_back'));
    } catch {
      return false;
    }
  });

  // Resilient API Helper
  const resilientFetch = async (endpoint, options = {}) => {
    try {
      const res = await fetch(endpoint, options);
      if (res.ok) return await res.json();
    } catch (e) {}
    try {
      const res = await fetch('http://localhost:5000' + endpoint, options);
      if (res.ok) return await res.json();
    } catch (e) {}
    try {
      const res = await fetch('http://localhost:4000' + endpoint, options);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  };

  // Fetch Dealer Profile from Admin API
  const fetchDealerProfile = async () => {
    try {
      const targetId = currentUser?.id || currentUser?.mobile || dealerProfile.id || 'DLR-01';
      const res = await resilientFetch(`/api/dealers/${targetId}`);
      if (res && res.success && res.data) {
        const d = res.data;
        const limit = typeof d.creditLimit === 'number' 
          ? d.creditLimit 
          : (parseInt((d.creditLimit || '500000').toString().replace(/[^0-9]/g, ''), 10) || 500000);
        const due = typeof d.outstandingDue === 'number' 
          ? d.outstandingDue 
          : (parseInt((d.outstandingDue || '0').toString().replace(/[^0-9]/g, ''), 10) || 0);
        const avail = typeof d.availableCredit === 'number' 
          ? d.availableCredit 
          : Math.max(0, limit - due);

        setDealerProfile(prev => {
          // Detect status change from Admin
          if (prev.status && d.status && prev.status !== d.status) {
            if (d.status === 'Suspended') {
              setIsWelcomeBackActive(false);
              try {
                localStorage.removeItem('plumbmart_show_welcome_back');
                localStorage.removeItem('plumbmart_dealer_welcome_back');
              } catch (e) {}
              setGovernanceNotice({
                title: 'Account Suspended by Super Admin',
                message: 'Your wholesale account access and credit lines have been suspended.',
                time: new Date().toLocaleTimeString(),
                isSuspended: true
              });
            } else if (d.status === 'Approved' || d.status === 'Active' || d.status === 'ACTIVE') {
              setIsSuspendedModalOpen(false);
              setIsWelcomeBackActive(true);
              try {
                localStorage.setItem('plumbmart_show_welcome_back', 'true');
              } catch (e) {}
              window.dispatchEvent(new CustomEvent('open_dealer_welcome_modal'));
              setGovernanceNotice({
                title: '🎉 Welcome Back! Account Approved & Re-activated',
                message: 'Your wholesale account has been approved and unlocked by corporate administration.',
                time: new Date().toLocaleTimeString(),
                isApproved: true
              });
            } else if (d.status === 'PENDING' || d.status === 'Pending') {
              navigate('/login?role=Dealer', { replace: true });
            }
          }
          return {
            ...prev,
            ...d,
            status: d.status || prev.status,
            creditLimit: limit,
            outstandingDue: due,
            availableCredit: avail
          };
        });
      }
    } catch (err) {
      console.warn('Failed to load dealer profile:', err);
    }
  };

  // Fetch Live Stock & Products
  const fetchProducts = async (showSyncSpinner = false) => {
    if (showSyncSpinner) setIsSyncingStock(true);
    try {
      const res = await resilientFetch('/api/dealer/products');
      if (res && res.success && Array.isArray(res.data)) {
        setProducts(res.data);
        setLastSyncedTime(new Date().toLocaleTimeString());
        
        // Initialize quantities with MOQ if not set
        setQuantities(prev => {
          const next = { ...prev };
          res.data.forEach(p => {
            if (!next[p.id]) {
              next[p.id] = p.moq || 1;
            }
          });
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to load dealer products:', err);
    } finally {
      setLoadingProducts(false);
      if (showSyncSpinner) {
        setTimeout(() => setIsSyncingStock(false), 500);
      }
    }
  };

  // Fetch Live Orders
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoadingOrders(true);
    else setIsRefreshingOrders(true);

    try {
      const res = await resilientFetch('/api/orders?clientType=Dealer');
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
        if (!expandedOrderId && res.data.length > 0) {
          setExpandedOrderId(res.data[0].id);
        }
      } else {
        // Fallback default demo orders
        setOrders(getFallbackOrders());
        if (!expandedOrderId) {
          setExpandedOrderId('PM-881902');
        }
      }
    } catch (err) {
      console.error('Failed to load dealer orders:', err);
    } finally {
      setLoadingOrders(false);
      setIsRefreshingOrders(false);
    }
  };

  // Default Fallback Orders for demonstration
  const getFallbackOrders = () => [
    {
      id: 'PM-881902',
      zohoSalesOrder: 'SO-ZH-49821',
      clientType: 'Dealer',
      clientName: dealerProfile.name,
      clientMobile: dealerProfile.mobile,
      total: 68400,
      paymentMethod: '30-Day Credit',
      paymentStatus: 'Pending Credit Settlement',
      creditStatus: 'Outstanding (30 Days)',
      creditDueDate: '02 Nov 2026',
      status: 'Dispatched / In Transit',
      expectedDate: 'Tomorrow Morning',
      deliveryAddress: 'Industrial Warehouse Depot 02, Peenya, Bengaluru',
      poNumber: 'PO-2026-8812',
      createdAt: new Date().toISOString(),
      items: [
        { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 100, price: 375, sku: 'ZH-AST-CPVC-1IN-3M' },
        { name: 'Supreme UPVC Ball Valve Heavy Body (25mm)', qty: 50, price: 155, sku: 'ZH-SUP-BLL-25MM-UPVC' }
      ],
      tracking: [
        { step: 1, title: 'Order Confirmed', description: 'Zoho Sales Order SO-ZH-49821 generated', completed: true, time: '02 Oct 10:30 AM' },
        { step: 2, title: 'Zoho Warehouse Allocation', description: 'Inventory reserved at Peenya Depot Hub', completed: true, time: '02 Oct 12:45 PM' },
        { step: 3, title: 'Packed & Quality Verified', description: 'Wholesale batch inspection complete', completed: true, time: '02 Oct 04:15 PM' },
        { step: 4, title: 'Dispatched / In Transit', description: 'Vehicle KA-04-E-8812 en route to depot', completed: true, time: 'Today 08:00 AM' },
        { step: 5, title: 'Delivered', description: 'Depot delivery confirmation', completed: false, time: 'Tomorrow 11:00 AM' }
      ]
    },
    {
      id: 'PM-742109',
      zohoSalesOrder: 'SO-ZH-38102',
      clientType: 'Dealer',
      clientName: dealerProfile.name,
      clientMobile: dealerProfile.mobile,
      total: 91600,
      paymentMethod: '90-Day Credit',
      paymentStatus: 'Pending Credit Settlement',
      creditStatus: 'Outstanding (90 Days)',
      creditDueDate: '15 Dec 2026',
      status: 'Delivered',
      expectedDate: 'Delivered',
      deliveryAddress: 'Industrial Warehouse Depot 02, Peenya, Bengaluru',
      poNumber: 'PO-2026-7421',
      createdAt: '2026-09-15T10:00:00.000Z',
      items: [
        { name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)', qty: 25, price: 2750, sku: 'ZH-JAQ-ALV-BSN-CH' },
        { name: 'Cera Stainless Steel 304 Overhead Rain Shower', qty: 15, price: 1420, sku: 'ZH-CER-SHW-304-8IN' }
      ],
      tracking: [
        { step: 1, title: 'Order Confirmed', description: 'Zoho Sales Order created', completed: true, time: '15 Sep' },
        { step: 2, title: 'Zoho Warehouse Allocation', description: 'Dispatched from South Hub 02', completed: true, time: '15 Sep' },
        { step: 3, title: 'Packed & Quality Verified', description: 'Sealed wholesale cartons', completed: true, time: '16 Sep' },
        { step: 4, title: 'Dispatched / In Transit', description: 'Transport vehicle KA-05-F-9122', completed: true, time: '16 Sep' },
        { step: 5, title: 'Delivered', description: 'Delivered & signed by store keeper', completed: true, time: '17 Sep 03:30 PM' }
      ]
    },
    {
      id: 'PM-519204',
      zohoSalesOrder: 'SO-ZH-27619',
      clientType: 'Dealer',
      clientName: dealerProfile.name,
      clientMobile: dealerProfile.mobile,
      total: 124500,
      paymentMethod: 'Upfront (NEFT)',
      paymentStatus: 'Paid Upfront',
      creditStatus: 'Settled',
      creditDueDate: null,
      status: 'Delivered',
      expectedDate: 'Delivered',
      deliveryAddress: 'Industrial Warehouse Depot 02, Peenya, Bengaluru',
      poNumber: 'PO-2026-5192',
      createdAt: '2026-08-10T11:20:00.000Z',
      items: [
        { name: 'Kirloskar Mini Water Booster Pump 0.5 HP', qty: 20, price: 3950, sku: 'ZH-KIR-BST-05HP' },
        { name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)', qty: 80, price: 560, sku: 'ZH-ASH-STP-15MM-BR' }
      ],
      tracking: [
        { step: 1, title: 'Order Confirmed', description: 'NEFT verified & SO generated', completed: true, time: '10 Aug' },
        { step: 2, title: 'Zoho Warehouse Allocation', description: 'Peenya Hub 01', completed: true, time: '10 Aug' },
        { step: 3, title: 'Packed & Quality Verified', description: 'Barcoded', completed: true, time: '11 Aug' },
        { step: 4, title: 'Dispatched / In Transit', description: 'Delivered via Express Transport', completed: true, time: '11 Aug' },
        { step: 5, title: 'Delivered', description: 'Received in full', completed: true, time: '12 Aug 11:00 AM' }
      ]
    }
  ];

  // Auth guard: Ensure PENDING dealers cannot access dashboard
  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('plumbmart_user') || 'null');
    } catch (e) {}
    const user = saved || currentUser;
    if (user && (user.role === 'Dealer' || user.companyName)) {
      if (user.status === 'PENDING' || user.status === 'Pending' || user.zohoVerified === false) {
        navigate('/login?role=Dealer', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  // Setup Real-time Polling & Cross-tab Events
  useEffect(() => {
    fetchDealerProfile();
    fetchProducts();
    fetchOrders(false);

    // 1. Live high-frequency polling for real-time dealer status & order sync (every 1.5 seconds)
    const pollingInterval = setInterval(() => {
      fetchOrders(true);
      fetchDealerProfile();
    }, 1500);

    const handleGovernanceUpdate = (payload) => {
      if (!payload) return;
      const updates = payload.updates || (payload.status ? { status: payload.status } : {});
      setDealerProfile(prev => {
        const newLimit = updates.creditLimit !== undefined ? updates.creditLimit : prev.creditLimit;
        const due = typeof updates.outstandingDue === 'number' ? updates.outstandingDue : prev.outstandingDue;
        const newAvail = updates.availableCredit !== undefined ? updates.availableCredit : Math.max(0, newLimit - due);
        return {
          ...prev,
          ...updates,
          status: updates.status !== undefined ? updates.status : prev.status,
          creditLimit: newLimit,
          availableCredit: newAvail,
          outstandingDue: due
        };
      });

      if (updates.status === 'Suspended') {
        setIsWelcomeBackActive(false);
        try {
          localStorage.removeItem('plumbmart_show_welcome_back');
          localStorage.removeItem('plumbmart_dealer_welcome_back');
        } catch (e) {}
        setIsSuspendedModalOpen(true);
        setGovernanceNotice({
          title: 'Account Suspended by Super Admin',
          message: 'Your wholesale account access and credit lines have been suspended. Purchasing is locked.',
          time: new Date().toLocaleTimeString(),
          isSuspended: true
        });
      } else if (updates.status === 'Approved' || payload.isApproved || payload.isWelcomeBack) {
        setIsSuspendedModalOpen(false);
        setIsWelcomeBackActive(true);
        try {
          localStorage.setItem('plumbmart_show_welcome_back', 'true');
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('open_dealer_welcome_modal'));
        setGovernanceNotice({
          title: '🎉 Welcome Back! Account Approved & Re-activated',
          message: 'Your wholesale account has been approved and unlocked by corporate administration.',
          time: new Date().toLocaleTimeString(),
          isApproved: true
        });
      }
      setTimeout(() => setGovernanceNotice(null), 6000);
      fetchDealerProfile();
    };

    // Check if dealer was recently approved
    try {
      const wb = localStorage.getItem('plumbmart_dealer_welcome_back');
      const showWb = localStorage.getItem('plumbmart_show_welcome_back');
      if (wb || showWb === 'true') {
        setIsSuspendedModalOpen(false);
        setIsWelcomeBackActive(true);
      }
    } catch (e) {}

    // 2. BroadcastChannel listeners for immediate Admin-to-Dealer sync
    let dealersChannel;
    let orderChannel;
    try {
      dealersChannel = new BroadcastChannel('plumbmart_dealers');
      dealersChannel.onmessage = (event) => {
        if (!event.data) return;
        if (event.data.type === 'DEALER_GOVERNANCE_UPDATED') {
          handleGovernanceUpdate(event.data);
        }
      };
    } catch (e) {}

    try {
      orderChannel = new BroadcastChannel('plumbmart_orders');
      orderChannel.onmessage = (event) => {
        if (!event.data) return;

        if (event.data.type === 'DEALER_GOVERNANCE_UPDATED') {
          handleGovernanceUpdate(event.data);
        } 
        else if (event.data.type === 'STATUS_UPDATED') {
          setOrders(prev => prev.map(o => 
            o.id === event.data.orderId ? { ...o, status: event.data.status } : o
          ));
          setStatusNotification({
            orderId: event.data.orderId,
            status: event.data.status,
            time: new Date().toLocaleTimeString()
          });
          setTimeout(() => setStatusNotification(null), 5000);
          fetchOrders(true);
        } 
        else if (event.data.type === 'NEW_ORDER' || event.data.type === 'ORDER_PLACED') {
          fetchOrders(true);
          fetchProducts();
          fetchDealerProfile();
        }
      };
    } catch (e) {}

    // 3. Storage event listener fallback for cross-tab sync
    const handleStorage = (e) => {
      if (e.key === 'plumbmart_dealer_governance_broadcast' || e.key === 'plumbmart_dealer_status_broadcast') {
        try {
          const payload = JSON.parse(e.newValue);
          handleGovernanceUpdate(payload);
        } catch (err) {}
      }
      if (e.key === 'plumbmart_dealer_welcome_back' || (e.key === 'plumbmart_show_welcome_back' && e.newValue === 'true')) {
        setIsSuspendedModalOpen(false);
        setIsWelcomeBackActive(true);
        window.dispatchEvent(new CustomEvent('open_dealer_welcome_modal'));
      }
      if (e.key === 'plumbmart_user') {
        fetchDealerProfile();
      }
      if (e.key === 'plumbmart_status_broadcast') {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload && payload.orderId) {
            setOrders(prev => prev.map(o => 
              o.id === payload.orderId ? { ...o, status: payload.status } : o
            ));
            setStatusNotification({
              orderId: payload.orderId,
              status: payload.status,
              time: new Date().toLocaleTimeString()
            });
            setTimeout(() => setStatusNotification(null), 5000);
            fetchOrders(true);
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 4. In-window custom event listener
    const handleCustomEvent = (e) => {
      handleGovernanceUpdate(e.detail);
    };
    window.addEventListener('plumbmart_dealer_updated', handleCustomEvent);

    return () => {
      clearInterval(pollingInterval);
      if (dealersChannel) dealersChannel.close();
      if (orderChannel) orderChannel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plumbmart_dealer_updated', handleCustomEvent);
    };
  }, []);

  // Handle Settle Invoice Action
  const handleSettleInvoice = async (orderId) => {
    try {
      const res = await resilientFetch(`/api/orders/${orderId}/pay`, { method: 'PATCH' });
      const settledOrder = orders.find(o => o.id === orderId);
      const amount = settledOrder ? settledOrder.total : 0;

      // Update local profile & restore available credit
      setDealerProfile(prev => {
        const newDue = Math.max(0, prev.outstandingDue - amount);
        const newAvail = Math.min(prev.creditLimit, prev.availableCredit + amount);
        return {
          ...prev,
          outstandingDue: newDue,
          availableCredit: newAvail
        };
      });

      // Broadcast to Admin
      try {
        const ch = new BroadcastChannel('plumbmart_orders');
        ch.postMessage({
          type: 'DEALER_GOVERNANCE_UPDATED',
          dealerId: dealerProfile.id,
          updates: {
            availableCredit: dealerProfile.availableCredit + amount,
            outstandingDue: Math.max(0, dealerProfile.outstandingDue - amount)
          }
        });
        ch.close();
      } catch (e) {}

      if (res && res.success) {
        setSettledNotice(`Invoice for ${orderId} has been successfully settled! Available credit restored.`);
        fetchOrders(true);
        fetchDealerProfile();
        setTimeout(() => setSettledNotice(null), 4000);
      } else {
        // Local fallback update
        setOrders(prev => prev.map(o => o.id === orderId ? {
          ...o,
          paymentStatus: 'Paid',
          creditStatus: 'Settled',
          paidAt: new Date().toISOString()
        } : o));
        setSettledNotice(`Invoice for ${orderId} marked as settled! Available credit restored.`);
        setTimeout(() => setSettledNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to settle invoice:', err);
    }
  };

  // Quantity Management
  const handleQuantityChange = (productId, delta, maxStock, moq = 1) => {
    setQuantities(prev => {
      const current = prev[productId] || moq;
      const next = current + delta;
      if (next < moq) return prev;
      if (maxStock && next > maxStock) return prev;
      return { ...prev, [productId]: next };
    });
  };

  // Add to Wholesale Cart
  const handleAddToCart = (product) => {
    if (dealerProfile.status === 'Suspended') {
      setIsSuspendedModalOpen(true);
      return;
    }
    const qty = quantities[product.id] || product.moq || 1;
    addToDealerCart(product, qty);
    setAddedToast({
      name: product.name,
      qty: qty,
      time: new Date().toLocaleTimeString()
    });
    setTimeout(() => setAddedToast(null), 3500);
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const matchesSearch = !productSearch || 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    
    let matchesStock = true;
    const stock = p.stockQuantity ?? p.stock ?? 0;
    if (stockStatusFilter === 'in_stock') {
      matchesStock = stock > 20;
    } else if (stockStatusFilter === 'low_stock') {
      matchesStock = stock <= 20;
    } else if (stockStatusFilter === 'high_margin') {
      const wholesalePrice = p.dealerPrice || p.price || 1;
      const mrp = p.mrp || wholesalePrice * 1.35;
      const margin = ((mrp - wholesalePrice) / mrp) * 100;
      matchesStock = margin >= 30;
    }

    return matchesCategory && matchesSearch && matchesStock;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = !orderSearch || 
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.zohoSalesOrder && o.zohoSalesOrder.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.poNumber && o.poNumber.toLowerCase().includes(orderSearch.toLowerCase()));

    let matchesFilter = true;
    if (orderFilter === 'active') {
      matchesFilter = o.status !== 'Delivered' && o.status !== 'Cancelled';
    } else if (orderFilter === 'delivered') {
      matchesFilter = o.status === 'Delivered';
    } else if (orderFilter === 'credit_due') {
      matchesFilter = o.creditStatus && o.creditStatus.includes('Outstanding');
    }

    return matchesSearch && matchesFilter;
  });

  // Summary Statistics
  const totalCatalogSKUs = products.length;
  const inStockSKUs = products.filter(p => (p.stockQuantity ?? p.stock ?? 0) > 0).length;
  const lowStockSKUs = products.filter(p => (p.stockQuantity ?? p.stock ?? 0) <= 20 && (p.stockQuantity ?? p.stock ?? 0) > 0).length;
  const activeShipmentsCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const outstandingCreditOrders = orders.filter(o => o.creditStatus && o.creditStatus.includes('Outstanding'));

  // Calculate dynamic credit metrics from profile (synchronized with Admin)
  const currentCreditLimit = dealerProfile.creditLimit || 500000;
  const currentOutstanding = dealerProfile.outstandingDue !== undefined ? dealerProfile.outstandingDue : 160000;
  const currentAvailable = dealerProfile.availableCredit !== undefined ? dealerProfile.availableCredit : Math.max(0, currentCreditLimit - currentOutstanding);
  const creditPercentage = Math.min(100, Math.round((currentAvailable / (currentCreditLimit || 1)) * 100));

  return (
    <DealerLayout currentUser={currentUser} onLogout={onLogout} products={products}>
      <div className="w-full min-w-0 max-w-7xl mx-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

        {/* Real-time Admin Credit Governance Update Notification (shows for approvals & credit line changes) */}
        {governanceNotice && !governanceNotice.isSuspended && (
          <div className={`${
            governanceNotice.isSuspended 
              ? 'bg-rose-600 border border-rose-400' 
              : governanceNotice.isApproved 
                ? 'bg-emerald-600 border border-emerald-400' 
                : 'bg-indigo-600'
          } text-white px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-top-4 duration-300 w-full min-w-0`}>
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0">
                {governanceNotice.isSuspended ? (
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                ) : (
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90">
                  {governanceNotice.title}
                </p>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  {governanceNotice.message}
                </p>
              </div>
            </div>
            <span className="self-end sm:self-auto text-[10px] sm:text-[11px] bg-black/25 px-2 py-0.5 rounded-md font-mono shrink-0">
              {governanceNotice.time}
            </span>
          </div>
        )}

        {/* Real-time Order Status Update Notification Banner */}
        {statusNotification && (
          <div className="bg-blue-600 text-white px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 animate-in fade-in slide-in-from-top-4 duration-300 w-full min-w-0">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0">
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-200">Live Shipment Status Update</p>
                <p className="text-xs sm:text-sm font-semibold truncate">
                  Order <span className="font-mono underline">{statusNotification.orderId}</span>: <span className="text-yellow-300 font-bold">{statusNotification.status}</span>
                </p>
              </div>
            </div>
            <span className="self-end sm:self-auto text-[10px] sm:text-[11px] bg-blue-700 px-2 py-0.5 rounded-md font-mono shrink-0">
              {statusNotification.time}
            </span>
          </div>
        )}

        {/* Settled Invoice Alert Banner */}
        {settledNotice && (
          <div className="bg-emerald-600 text-white px-3.5 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-lg flex items-center gap-2.5 sm:gap-3 animate-in fade-in duration-200 w-full min-w-0">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-200 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{settledNotice}</p>
          </div>
        )}

        {/* Account Suspended Alert Banner (if Admin suspended dealer) */}
        {dealerProfile.status === 'Suspended' && (
          <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-rose-400 animate-in fade-in slide-in-from-top-3 duration-200 w-full min-w-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black uppercase tracking-wider text-rose-100 flex items-center gap-2">
                  <span>Account Access Suspended by Admin</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-rose-700 font-extrabold uppercase">Locked</span>
                </h4>
                <p className="text-xs text-rose-100 mt-0.5">
                  Your wholesale B2B account has been suspended by PlumbMart Corporate Governance. Wholesale ordering, credit lines, and shipment dispatches are temporarily frozen.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSupportModalOpen(true)}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition shrink-0 shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Mail className="w-3.5 h-3.5 text-rose-600" />
              <span>Contact Support</span>
            </button>
          </div>
        )}

        {/* Welcome Back Celebration Banner (When Approved after Suspension) */}
        {dealerProfile.status === 'Approved' && isWelcomeBackActive && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 text-white p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-emerald-300 animate-in fade-in slide-in-from-top-3 duration-300 w-full min-w-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
                <PartyPopper className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black uppercase tracking-wider text-emerald-100 flex items-center gap-2">
                  <span>🎉 Welcome Back, {dealerProfile.name}!</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-emerald-800 font-extrabold uppercase">Approved &amp; Active</span>
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Your wholesale B2B account has been officially approved by Corporate Governance. All wholesale catalog pricing, 30D/90D credit lines, and express warehouse dispatches are completely unlocked!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open_dealer_welcome_modal'));
                }}
                className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>View Details</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dealer/products')}
                className="px-4 py-2 rounded-xl bg-white text-emerald-800 font-bold text-xs hover:bg-emerald-50 transition shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Order Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsWelcomeBackActive(false);
                  try {
                    localStorage.removeItem('plumbmart_show_welcome_back');
                    localStorage.removeItem('plumbmart_dealer_welcome_back');
                  } catch (e) {}
                }}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Added to Cart Toast */}
        {addedToast && (
          <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 animate-in slide-in-from-bottom-5 duration-200 max-w-[92vw] sm:max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">Added to Wholesale Cart</p>
              <p className="text-xs font-bold text-slate-100 truncate">{addedToast.qty}x {addedToast.name}</p>
            </div>
            <Link 
              to="/dealer/cart"
              className="ml-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[11px] font-bold transition flex items-center gap-1 shrink-0"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Executive Header & Profile Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden w-full min-w-0">
          {/* Decorative Background Accents */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
            
            {/* Dealer Info */}
            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  B2B Wholesale Portal
                </span>

                {/* Status Badge */}
                {dealerProfile.status === 'Suspended' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-wider uppercase bg-rose-600 text-white shadow-md shadow-rose-600/40 flex items-center gap-1.5 animate-pulse border border-rose-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    Status: Suspended (Access Locked)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Zoho CRM Record Verified
                  </span>
                )}

                {dealerProfile.zohoContactId && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                    Zoho ID: {dealerProfile.zohoContactId}
                  </span>
                )}

                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Hub: {getDealerHub(dealerProfile)}
                </span>
              </div>

              <h1 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white break-words">
                {dealerProfile.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  GSTIN: <span className="font-mono font-bold text-white">{dealerProfile.gstin}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Contact: <strong className="text-white">{dealerProfile.contactPerson || 'Srinivas Rao'}</strong> (+91 {dealerProfile.mobile})</span>
                <span className="hidden sm:inline">•</span>
                {/* 30D / 90D Status Indicator */}
                {dealerProfile.credit30Days && dealerProfile.credit90Days ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    30D & 90D Credit Unlocked
                  </span>
                ) : dealerProfile.credit30Days ? (
                  <span className="text-indigo-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    30D Credit Active • 90D Locked
                  </span>
                ) : dealerProfile.credit90Days ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    90D Credit Active • 30D Locked
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Credit Inactive (Upfront Only)
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
              <button
                onClick={() => {
                  fetchProducts(true);
                  fetchOrders(true);
                  fetchDealerProfile();
                }}
                disabled={isSyncingStock || isRefreshingOrders}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 border border-slate-700 active:scale-95 disabled:opacity-50"
                title="Sync live inventory with Zoho CRM"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 ${(isSyncingStock || isRefreshingOrders) ? 'animate-spin' : ''}`} />
                <span>Sync Live Data</span>
              </button>

              <Link
                to="/dealer/products"
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg shadow-indigo-600/30 active:scale-95"
              >
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Full Catalog</span>
              </Link>

              <Link
                to="/dealer/cart"
                className="col-span-2 sm:col-span-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white text-slate-900 hover:bg-slate-100 text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 shadow-lg active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                <span>Wholesale Cart</span>
              </Link>
            </div>

          </div>

          {/* Governance Metric Cards Grid - Fully Dynamic with Admin */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-slate-800/80 w-full min-w-0">
            
            {/* 1. Credit Limit (Synchronized with Admin Approved Credit Spending Limit) */}
            <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 backdrop-blur-xs min-w-0">
              <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                <span>Credit Limit</span>
                <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
              </div>
              <p className="text-base sm:text-xl font-black text-white truncate">
                ₹{currentCreditLimit.toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] sm:text-[10px] text-indigo-300 mt-0.5 truncate">Approved B2B Line</p>
            </div>

            {/* 2. Available Credit */}
            <div className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border backdrop-blur-xs min-w-0 ${
              dealerProfile.status === 'Suspended'
                ? 'bg-rose-950/50 border-rose-800/80 shadow-md shadow-rose-950/40'
                : 'bg-slate-800/50 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                <span>Available Credit</span>
                {dealerProfile.status === 'Suspended' ? (
                  <span className="text-[9px] font-black text-rose-300 uppercase tracking-wider bg-rose-600/30 px-1.5 py-0.2 rounded border border-rose-500/40">
                    LOCKED
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400"></span>
                )}
              </div>
              <p className={`text-base sm:text-xl font-black truncate ${
                dealerProfile.status === 'Suspended' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {dealerProfile.status === 'Suspended' ? '₹0 (Frozen)' : `₹${currentAvailable.toLocaleString('en-IN')}`}
              </p>
              <div className="w-full bg-slate-700 h-1 sm:h-1.5 rounded-full mt-1 sm:mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    dealerProfile.status === 'Suspended' ? 'bg-rose-500' : 'bg-emerald-400'
                  }`} 
                  style={{ width: `${dealerProfile.status === 'Suspended' ? 0 : creditPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* 3. Outstanding Due (Synchronized with Admin Outstanding Due) */}
            <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 backdrop-blur-xs min-w-0">
              <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                <span>Outstanding Due</span>
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              </div>
              <p className="text-base sm:text-xl font-black text-amber-400 truncate">
                ₹{currentOutstanding.toLocaleString('en-IN')}
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                Next Due: {dealerProfile.nextDueDate || '02 Nov 2026'}
              </p>
            </div>

            {/* 4. Active In-Transit Consignments */}
            <div className="bg-slate-800/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-700/60 backdrop-blur-xs min-w-0">
              <div className="flex items-center justify-between text-slate-400 text-[10px] sm:text-xs mb-0.5 sm:mb-1">
                <span>Active Consignments</span>
                <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
              </div>
              <p className="text-base sm:text-xl font-black text-blue-400 truncate">
                {activeShipmentsCount} In Transit
              </p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">Real-time GPS dispatch</p>
            </div>

          </div>

        </div>

        {/* Main Tab Switcher Bar - 100% Mobile Responsive Grid */}
        <div className="w-full bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 min-w-0">
          
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
            {/* Tab 1: Live Stock */}
            <button
              onClick={() => setActiveMainTab('stock')}
              className={`py-2 px-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
                activeMainTab === 'stock'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Box className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Stock</span>
                <span className="hidden sm:inline">Live Stock & Inventory</span>
              </span>
              <span className={`hidden sm:inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shrink-0 ${
                activeMainTab === 'stock' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {products.length}
              </span>
            </button>

            {/* Tab 2: Shipment Tracking */}
            <button
              onClick={() => setActiveMainTab('tracking')}
              className={`py-2 px-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
                activeMainTab === 'tracking'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Tracking</span>
                <span className="hidden sm:inline">Shipment Tracking</span>
              </span>
              {activeShipmentsCount > 0 && (
                <span className="hidden sm:inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-500 text-white animate-pulse shrink-0">
                  {activeShipmentsCount}
                </span>
              )}
            </button>

            {/* Tab 3: Credit */}
            <button
              onClick={() => setActiveMainTab('credit')}
              className={`py-2 px-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 ${
                activeMainTab === 'credit'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Credit</span>
                <span className="hidden sm:inline">Credit & Invoices</span>
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] sm:text-xs text-slate-500 px-1 sm:pr-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Zoho Sync: <strong className="text-slate-700">{lastSyncedTime}</strong></span>
            </span>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE STOCK & INVENTORY                                           */}
        {/* ========================================================================= */}
        {activeMainTab === 'stock' && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 w-full min-w-0">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4 w-full min-w-0">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
                {/* Search Input */}
                <div className="relative flex-1 w-full min-w-0">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search stock by SKU, product name, or brand..."
                    className="w-full pl-10 pr-12 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Stock Status Pills - Scrollable with min-w-0 */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto min-w-0 no-scrollbar">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-400 mr-0.5 sm:mr-1 flex items-center gap-1 shrink-0">
                    <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Stock:
                  </span>
                  
                  <button
                    onClick={() => setStockStatusFilter('all')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                      stockStatusFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({products.length})
                  </button>

                  <button
                    onClick={() => setStockStatusFilter('in_stock')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1 ${
                      stockStatusFilter === 'in_stock'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    In Stock ({inStockSKUs})
                  </button>

                  <button
                    onClick={() => setStockStatusFilter('low_stock')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1 ${
                      stockStatusFilter === 'low_stock'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Low Stock ({lowStockSKUs})
                  </button>

                  <button
                    onClick={() => setStockStatusFilter('high_margin')}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1 ${
                      stockStatusFilter === 'high_margin'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                    }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    Margin &gt;30%
                  </button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar w-full min-w-0">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 transition ${
                      selectedCategory === cat
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Products & Live Stock Grid */}
            {loadingProducts ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs space-y-3 w-full min-w-0">
                <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">Loading Live Zoho Inventory & Depot Stock...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs space-y-3 w-full min-w-0">
                <Box className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm sm:text-base font-bold text-slate-800">No products match your filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting the stock filter, search keywords, or category selector.
                </p>
                <button
                  onClick={() => {
                    setProductSearch('');
                    setSelectedCategory('All Categories');
                    setStockStatusFilter('all');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
                {filteredProducts.map(p => {
                  const stock = p.stockQuantity ?? p.stock ?? 0;
                  const isLow = stock <= 20 && stock > 0;
                  const isOut = stock === 0;
                  const wholesalePrice = p.dealerPrice || p.price;
                  const retailPrice = p.mrp || Math.round(wholesalePrice * 1.35);
                  const marginPct = Math.round(((retailPrice - wholesalePrice) / retailPrice) * 100);
                  const moq = p.moq || 1;
                  const qty = quantities[p.id] || moq;

                  return (
                    <div 
                      key={p.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group w-full min-w-0"
                    >
                      <div className="min-w-0">
                        {/* Top Metadata Badges */}
                        <div className="flex items-start justify-between gap-2 mb-2.5 sm:mb-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold truncate max-w-[130px] sm:max-w-[170px]">
                            {p.sku || `SKU-${p.id}`}
                          </span>

                          {/* Live Stock Badge */}
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0 animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Low: {stock} Left
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              {stock} In Stock
                            </span>
                          )}
                        </div>

                        {/* Product Image & Title */}
                        <div className="flex gap-2.5 sm:gap-3 mb-2.5 sm:mb-3 min-w-0">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center border border-slate-100">
                            {p.image ? (
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-200" 
                              />
                            ) : (
                              <Box className="w-6 h-6 text-slate-300" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-indigo-600 block truncate">
                              {p.brand || 'PlumbMart Wholesale'}
                            </span>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition">
                              {p.name}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              Peenya Depot Hub 01
                            </p>
                          </div>
                        </div>

                        {/* Pricing & Profit Margin Comparison */}
                        <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-slate-100 space-y-1.5 mb-2.5 sm:mb-3">
                          <div className="flex items-baseline justify-between gap-1">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">Wholesale</span>
                              <p className="text-sm sm:text-base font-black text-indigo-600">₹{wholesalePrice.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-center">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">MRP</span>
                              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 line-through">₹{retailPrice.toLocaleString('en-IN')}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] uppercase font-bold text-emerald-600 block">Margin</span>
                              <p className="text-[11px] sm:text-xs font-black text-emerald-600">+{marginPct}% Profit</p>
                            </div>
                          </div>

                          <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-500">
                            <span>MOQ: <strong className="text-slate-700">{moq} Pcs</strong></span>
                            <span className="text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold truncate">
                              Zoho Live Inventory
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper & Add to Cart Action */}
                      <div className="pt-1 flex items-center gap-2">
                        {/* Stepper */}
                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 shrink-0">
                          <button
                            onClick={() => handleQuantityChange(p.id, -1, stock, moq)}
                            disabled={qty <= moq}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 sm:w-8 text-center text-xs font-bold text-slate-800">
                            {qty}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(p.id, 1, stock, moq)}
                            disabled={stock > 0 && qty >= stock}
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white text-slate-700 hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center transition shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Add to Wholesale Cart Button */}
                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={isOut}
                          className={`flex-1 py-2 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${
                            isOut
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                          }`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isOut ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SHIPMENT & ORDER TRACKING                                        */}
        {/* ========================================================================= */}
        {activeMainTab === 'tracking' && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 w-full min-w-0">
            
            {/* Filter & Live Search */}
            <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
              
              <div className="relative flex-1 w-full min-w-0">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID (PM-XXXX), Zoho SO#, or PO#..."
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 w-full md:w-auto min-w-0 no-scrollbar">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition ${
                    orderFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({orders.length})
                </button>

                <button
                  onClick={() => setOrderFilter('active')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1 ${
                    orderFilter === 'active'
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Active ({activeShipmentsCount})
                </button>

                <button
                  onClick={() => setOrderFilter('credit_due')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1 ${
                    orderFilter === 'credit_due'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Due ({outstandingCreditOrders.length})
                </button>

                <button
                  onClick={() => setOrderFilter('delivered')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1 ${
                    orderFilter === 'delivered'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Delivered
                </button>
              </div>

            </div>

            {/* Orders List */}
            {loadingOrders ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs space-y-3 w-full min-w-0">
                <RefreshCw className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs sm:text-sm font-bold text-slate-700">Connecting to Live Zoho Order Tracking...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-slate-200 shadow-xs space-y-3 w-full min-w-0">
                <Truck className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm sm:text-base font-bold text-slate-800">No shipments found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No orders match your search keyword or selected filter.
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 w-full min-w-0">
                {filteredOrders.map(order => {
                  const isExpanded = expandedOrderId === order.id;
                  const isDelivered = order.status === 'Delivered';
                  const isDispatched = order.status === 'Dispatched / In Transit' || order.status === 'Out for Delivery';
                  const isCreditPending = order.creditStatus && order.creditStatus.includes('Outstanding');

                  // Tracking Steps calculation
                  const trackingSteps = order.tracking || [
                    { step: 1, title: 'Order Confirmed', description: 'Sales Order SO created', completed: true },
                    { step: 2, title: 'Zoho Warehouse Allocation', description: 'Inventory reserved at Peenya', completed: ['Processing', 'Packed', 'Dispatched / In Transit', 'Delivered'].includes(order.status) },
                    { step: 3, title: 'Packed & Quality Verified', description: 'Wholesale batch sealed', completed: ['Packed', 'Dispatched / In Transit', 'Delivered'].includes(order.status) },
                    { step: 4, title: 'Dispatched / In Transit', description: 'Vehicle en route', completed: ['Dispatched / In Transit', 'Delivered'].includes(order.status) },
                    { step: 5, title: 'Delivered', description: 'Depot delivery confirmed', completed: order.status === 'Delivered' }
                  ];

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all duration-200 hover:border-indigo-200 w-full min-w-0"
                    >
                      {/* Order Summary Bar */}
                      <div 
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className="p-3.5 sm:p-6 cursor-pointer hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 select-none w-full min-w-0"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                            isDelivered ? 'bg-emerald-50 text-emerald-600' :
                            isDispatched ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          <div className="space-y-0.5 sm:space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                                #{order.id}
                              </span>
                              {order.zohoSalesOrder && (
                                <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {order.zohoSalesOrder}
                                </span>
                              )}
                              {order.poNumber && (
                                <span className="text-[10px] sm:text-[11px] font-mono text-slate-500">
                                  {order.poNumber}
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                              Placed: <strong className="text-slate-700">{new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</strong> • {order.items ? order.items.length : 1} Line Items
                            </p>
                          </div>
                        </div>

                        {/* Order Right Column */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          
                          {/* Payment / Credit Status */}
                          <div className="text-left md:text-right">
                            <div className="flex items-center gap-1 md:justify-end text-[11px] sm:text-xs font-bold text-slate-800">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>{order.paymentMethod || 'Credit'}</span>
                            </div>
                            {isCreditPending ? (
                              <p className="text-[10px] sm:text-[11px] font-bold text-amber-600 flex items-center gap-1 md:justify-end">
                                <Clock className="w-2.5 h-2.5" />
                                Due: {order.creditDueDate || 'Terms'}
                              </p>
                            ) : (
                              <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
                                {order.paymentStatus || 'Paid'}
                              </p>
                            )}
                          </div>

                          {/* Total Value */}
                          <div className="text-left md:text-right">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                            <p className="text-sm sm:text-base font-black text-slate-900">
                              ₹{(order.total || 0).toLocaleString('en-IN')}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold inline-flex items-center gap-1 sm:gap-1.5 ${
                              isDelivered ? 'bg-emerald-100 text-emerald-800' :
                              isDispatched ? 'bg-blue-100 text-blue-800 animate-pulse' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                                isDelivered ? 'bg-emerald-600' :
                                isDispatched ? 'bg-blue-600' : 'bg-amber-600'
                              }`}></span>
                              {order.status || 'Order Confirmed'}
                            </span>

                            <div className="p-1 text-slate-400">
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          </div>

                        </div>

                      </div>

                      {/* Expanded Section with 5-Step Stepper & Line Items */}
                      {isExpanded && (
                        <div className="px-3.5 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-4 sm:space-y-6 animate-in slide-in-from-top-2 duration-150 w-full min-w-0">
                          
                          {/* Live Fulfillment Stepper */}
                          <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 w-full min-w-0">
                            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              Zoho Live Warehouse & Shipment Pipeline
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 sm:gap-3 w-full min-w-0">
                              {trackingSteps.map((step, idx) => {
                                const isCurrent = !step.completed && (idx === 0 || trackingSteps[idx - 1]?.completed);
                                return (
                                  <div 
                                    key={step.step || idx}
                                    className={`relative p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition min-w-0 ${
                                      step.completed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' :
                                      isCurrent ? 'bg-indigo-50/80 border-indigo-300 text-indigo-950 ring-2 ring-indigo-500/20' :
                                      'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${
                                        step.completed ? 'bg-emerald-600 text-white' :
                                        isCurrent ? 'bg-indigo-600 text-white animate-pulse' :
                                        'bg-slate-200 text-slate-500'
                                      }`}>
                                        {step.completed ? <Check className="w-3 h-3" /> : idx + 1}
                                      </div>
                                      <span className="text-xs font-bold truncate">{step.title}</span>
                                    </div>
                                    <p className="text-[10px] sm:text-[11px] leading-tight text-slate-600">
                                      {step.description}
                                    </p>
                                    {step.time && (
                                      <p className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1">
                                        {step.time}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Line Items & Logistics */}
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
                            
                            {/* Products Ordered List */}
                            <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 space-y-2.5 w-full min-w-0">
                              <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                                Dispatched Wholesale Line Items
                              </h4>

                              <div className="divide-y divide-slate-100">
                                {(order.items || []).map((item, idx) => (
                                  <div key={idx} className="py-2 flex items-center justify-between text-xs gap-2">
                                    <div className="space-y-0.5 min-w-0">
                                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                                      <p className="text-[10px] font-mono text-slate-400">SKU: {item.sku || 'N/A'}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-bold text-slate-900">{item.qty || item.quantity} Units</span>
                                      <p className="text-[10px] sm:text-[11px] text-slate-500">₹{(item.price || 0).toLocaleString('en-IN')}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Logistics & Payment Actions */}
                            <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200 space-y-3 flex flex-col justify-between w-full min-w-0">
                              <div className="space-y-2">
                                <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                                  Delivery Depot Destination
                                </h4>
                                <div className="text-xs text-slate-600 space-y-1">
                                  <p className="font-semibold text-slate-800">{order.clientName}</p>
                                  <p className="text-[11px] leading-relaxed text-slate-500">
                                    {order.deliveryAddress || 'Industrial Warehouse Depot 02, Peenya, Bengaluru'}
                                  </p>
                                  <p className="text-[10px] sm:text-[11px] font-mono text-indigo-600 font-semibold pt-1">
                                    Vehicle: KA-04-E-8812 (Depot Fleet)
                                  </p>
                                </div>
                              </div>

                              {/* Settle Credit Action */}
                              {isCreditPending && (
                                <div className="pt-2 border-t border-slate-100">
                                  <button
                                    onClick={() => handleSettleInvoice(order.id)}
                                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Settle Invoice (Restore Credit)</span>
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CREDIT & INVOICES                                                */}
        {/* ========================================================================= */}
        {activeMainTab === 'credit' && (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200 w-full min-w-0">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full min-w-0">
              
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-1.5 min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Credit Term 1</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">30-Day Approved Credit</h4>
                <p className="text-xs text-slate-500">
                  Zero interest commercial credit for standard wholesale orders. Due in 30 days.
                </p>
                <div className={`pt-1.5 text-xs font-bold flex items-center gap-1 ${
                  dealerProfile.credit30Days ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {dealerProfile.credit30Days ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Status: {dealerProfile.credit30Days ? 'Active & Approved' : 'Locked by Admin'}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-1.5 min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Credit Term 2</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">90-Day Extended Credit</h4>
                <p className="text-xs text-slate-500">
                  Quarterly settlement line reserved for top Tier-1 authorized distributors.
                </p>
                <div className={`pt-1.5 text-xs font-bold flex items-center gap-1 ${
                  dealerProfile.credit90Days ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {dealerProfile.credit90Days ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Status: {dealerProfile.credit90Days ? 'Tier-1 Approved' : 'Tier-1 Approval Required'}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-1.5 min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Commercial Term 3</span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">Upfront NEFT Discount</h4>
                <p className="text-xs text-slate-500">
                  Instant 2% cash discount applied automatically on immediate bank transfer / NEFT checkout.
                </p>
                <div className="pt-1.5 text-xs font-bold text-indigo-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Status: Instant 2% Off</span>
                </div>
              </div>

            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4 w-full min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Commercial Credit Invoices & Ledger</h3>

              <div className="overflow-x-auto w-full min-w-0">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[9px] sm:text-[10px] tracking-wider font-bold">
                      <th className="pb-2.5">Invoice / Order</th>
                      <th className="pb-2.5">Zoho Sales Order</th>
                      <th className="pb-2.5">Amount</th>
                      <th className="pb-2.5">Terms</th>
                      <th className="pb-2.5">Due Date</th>
                      <th className="pb-2.5">Payment</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(o => {
                      const isPending = o.creditStatus && o.creditStatus.includes('Outstanding');
                      return (
                        <tr key={o.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 font-mono font-bold text-slate-900">#{o.id}</td>
                          <td className="py-2.5 font-mono text-indigo-600 font-semibold">{o.zohoSalesOrder || 'SO-ZH-PENDING'}</td>
                          <td className="py-2.5 font-bold text-slate-900">₹{(o.total || 0).toLocaleString('en-IN')}</td>
                          <td className="py-2.5 text-slate-600">{o.paymentMethod || 'Credit'}</td>
                          <td className="py-2.5 font-medium text-slate-700">{o.creditDueDate || 'Settled'}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold ${
                              isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {o.paymentStatus || 'Paid'}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            {isPending ? (
                              <button
                                onClick={() => handleSettleInvoice(o.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-[11px] font-bold transition active:scale-95"
                              >
                                Settle Now
                              </button>
                            ) : (
                              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Settled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Beautiful Dealer Account Suspended Modal */}
      <DealerSuspendedModal
        isOpen={isSuspendedModalOpen}
        onClose={() => setIsSuspendedModalOpen(false)}
        dealerName={dealerProfile.name || 'Sri Venkateswara Distributors'}
      />

      {/* Corporate Support & Account Suspension Appeal Modal */}
      <DealerSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        dealerProfile={dealerProfile}
      />
    </DealerLayout>
  );
}
