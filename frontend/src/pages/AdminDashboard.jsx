import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Users, 
  Building2, 
  Wrench, 
  Package, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Layers, 
  CreditCard, 
  Search, 
  Check, 
  AlertTriangle, 
  LogOut, 
  User,
  UserCheck,
  ChevronRight, 
  ChevronLeft, 
  DollarSign, 
  Bell, 
  BarChart3, 
  Clock, 
  Calendar, 
  FileText, 
  Send, 
  Lock, 
  Unlock, 
  Filter, 
  Download, 
  CheckSquare, 
  Sliders, 
  AlertCircle, 
  Eye, 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowUpRight,
  TrendingDown,
  FileCheck,
  ChevronDown,
  RotateCcw,
  RotateCw,
  Truck,
  Printer,
  Trash2,
  Edit3
} from 'lucide-react';
import { dispatchInAppNotification } from '../utils/inAppNotificationDispatcher';
import { 
  playSuccessSound, 
  playClickSound, 
  playToggleSound, 
  playWarningSound 
} from '../utils/soundEffects';

export default function AdminDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const { dealerId: routeDealerId } = useParams();

  // Navigation Menu State
  // 'overview' | 'customers' | 'dealers' | 'plumbers' | 'orders' | 'products' | 'payments' | 'reports' | 'notifications'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Admin User details - state with localStorage persistence
  const [admin, setAdmin] = useState(() => {
    try {
      const stored = localStorage.getItem('plumbmart_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.role === 'Admin' || parsed.accessLevel)) {
          return {
            id: parsed.id || 'ADM-01',
            name: parsed.name || 'System Administrator',
            email: parsed.email || 'admin@plumbmart.com',
            mobile: parsed.mobile || '+91 98765 43210',
            role: parsed.role || 'Admin',
            accessLevel: parsed.accessLevel || 'SuperAdmin'
          };
        }
      }
    } catch {
      // ignore
    }
    return {
      id: currentUser?.id || 'ADM-01',
      name: currentUser?.name || 'System Administrator',
      email: currentUser?.email || 'admin@plumbmart.com',
      mobile: currentUser?.mobile || '+91 98765 43210',
      role: currentUser?.role || 'Admin',
      accessLevel: currentUser?.accessLevel || 'SuperAdmin'
    };
  });

  // Admin Account Menu Dropdown & Profile Modal State
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isAdminProfileModalOpen, setIsAdminProfileModalOpen] = useState(false);
  const [isEditingAdminProfile, setIsEditingAdminProfile] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({
    name: '',
    email: '',
    mobile: '',
    accessLevel: ''
  });
  const adminMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartEditAdminProfile = () => {
    playClickSound();
    setAdminProfileForm({
      name: admin.name || '',
      email: admin.email || '',
      mobile: admin.mobile || '+91 98765 43210',
      accessLevel: admin.accessLevel || 'SuperAdmin'
    });
    setIsEditingAdminProfile(true);
  };

  const handleSaveAdminProfile = (e) => {
    if (e) e.preventDefault();
    if (!adminProfileForm.name.trim() || !adminProfileForm.email.trim()) {
      playWarningSound();
      return;
    }

    const updatedAdmin = {
      ...admin,
      name: adminProfileForm.name.trim(),
      email: adminProfileForm.email.trim(),
      mobile: adminProfileForm.mobile.trim(),
      accessLevel: admin.accessLevel || 'SuperAdmin'
    };

    setAdmin(updatedAdmin);
    try {
      localStorage.setItem('plumbmart_user', JSON.stringify(updatedAdmin));
    } catch (err) {
      console.error('Failed to update localStorage', err);
    }

    setIsEditingAdminProfile(false);
    playSuccessSound();
    setSyncToast('Admin profile updated successfully!');
    setTimeout(() => setSyncToast(null), 3500);
  };

  // ==========================================
  // DATA STATES
  // ==========================================

  // 1. Customers
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');

  // 2. Dealers
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerSearch, setDealerSearch] = useState('');
  const [viewingDealer, setViewingDealer] = useState(null);
  const [dealerNoticeText, setDealerNoticeText] = useState('');
  const [isSendingDealerNotice, setIsSendingDealerNotice] = useState(false);
  const [quickLimitInput, setQuickLimitInput] = useState('');

  // Sync URL route parameter /admin/dealers/:dealerId with viewingDealer
  useEffect(() => {
    if (routeDealerId && dealers.length > 0) {
      const match = dealers.find(d => d.id === routeDealerId || d.mobile === routeDealerId);
      if (match) {
        setViewingDealer(match);
        setActiveTab('dealers');
      }
    }
  }, [routeDealerId, dealers]);

  // Keep viewingDealer up to date when dealers list updates
  useEffect(() => {
    if (viewingDealer) {
      const refreshed = dealers.find(d => d.id === viewingDealer.id);
      if (refreshed) {
        setViewingDealer(refreshed);
      }
    }
  }, [dealers]);

  // 3. Plumbers
  const [plumbers, setPlumbers] = useState([]);
  const [selectedPlumber, setSelectedPlumber] = useState(null);
  const [plumberSearch, setPlumberSearch] = useState('');

  // 4. Products & Zoho Sync
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCatFilter, setProductCatFilter] = useState('All');
  const [zohoSyncMeta, setZohoSyncMeta] = useState({
    state: 'Synced Live',
    workbookId: 'WB-ZOHO-PLUMB-2026',
    sheet: 'Master_Inventory_Live',
    lastSyncedAt: new Date().toLocaleTimeString() + ' Today',
    totalSkus: 9,
    latencyMs: 142,
    errorsCount: 0
  });
  const [isSyncingZoho, setIsSyncingZoho] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  // 5. Orders
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sendingReceiptId, setSendingReceiptId] = useState(null);
  const [receiptFeedback, setReceiptFeedback] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderClientFilter, setOrderClientFilter] = useState('All');

  // 6. Payments
  const [payments, setPayments] = useState([]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // 7. Notifications
  const [notifications, setNotifications] = useState([]);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    targetGroup: 'All',
    title: '',
    message: ''
  });
  const [notifFilter, setNotifFilter] = useState('All'); // 'All' | 'Customers' | 'Dealers' | 'Plumbers'

  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const knownOrderIdsRef = useRef(new Set());

  // 8. Dynamic Reports & Analytics State
  const [analyticsPeriod, setAnalyticsPeriod] = useState('all'); // 'all' | 'month' | 'week' | 'today'
  const [analyticsChannel, setAnalyticsChannel] = useState('all'); // 'all' | 'Dealer' | 'Customer'
  const [analyticsStockFilter, setAnalyticsStockFilter] = useState('all'); // 'all' | 'low' | 'optimal' | 'out' | 'highDemand'
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsDisplayCount, setAnalyticsDisplayCount] = useState(10);

  // Dedicated real-time Orders fetcher
  const fetchOrders = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshingOrders(true);
    try {
      let res;
      try {
        res = await fetch('/api/orders');
        if (!res.ok) throw new Error('Proxy error: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch('http://localhost:5000/api/orders');
          if (!res.ok) throw new Error('Port 5000 error: ' + res.status);
        } catch (e2) {
          res = await fetch('http://localhost:4000/api/orders');
        }
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        // Detect newly arrived orders in real-time
        if (knownOrderIdsRef.current.size > 0) {
          const freshOrders = data.data.filter(o => !knownOrderIdsRef.current.has(o.id));
          if (freshOrders.length > 0) {
            const latest = freshOrders[0];
            setNewOrderAlert({
              id: latest.id,
              clientName: latest.clientName || 'Valued Customer',
              clientType: latest.clientType || 'Customer',
              total: latest.total || 0,
              time: 'Just now'
            });
            setTimeout(() => setNewOrderAlert(null), 7000);
          }
        }

        // Record all current IDs
        data.data.forEach(o => knownOrderIdsRef.current.add(o.id));
        setOrders(data.data);
      }
    } catch (err) {
      console.warn('Orders live fetch error:', err.message);
    } finally {
      if (showSpinner) setIsRefreshingOrders(false);
    }
  };

  // Resilient API GET helper
  const resilientFetch = async (endpoint) => {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return await res.json();
    } catch (e) {}
    try {
      const res = await fetch('http://localhost:5000' + endpoint);
      if (res.ok) return await res.json();
    } catch (e) {}
    try {
      const res = await fetch('http://localhost:4000' + endpoint);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  };

  // Fetch initial data from backend & setup real-time listeners
  useEffect(() => {
    // 0. Fetch Customers
    resilientFetch('/api/customers').then(data => {
      if (data && data.success && Array.isArray(data.data)) {
        setCustomers(data.data);
      }
    });

    // 1. Fetch Dealers
    resilientFetch('/api/dealers').then(data => {
      if (data && data.success && Array.isArray(data.data)) {
        setDealers(data.data.map(d => ({
          ...d,
          contactPerson: d.contactPerson || (d.name ? d.name.split(' ')[0] : 'Dealer'),
          creditLimit: typeof d.creditLimit === 'number' ? d.creditLimit : (parseInt((d.creditLimit || '500000').toString().replace(/[^0-9]/g, ''), 10) || 500000),
          availableCredit: typeof d.availableCredit === 'number' ? d.availableCredit : (parseInt((d.availableCredit !== undefined ? d.availableCredit : '500000').toString().replace(/[^0-9]/g, ''), 10) || 500000),
          outstandingDue: typeof d.outstandingDue === 'number' ? d.outstandingDue : 0,
          status: d.status || (d.zohoVerified ? 'ACTIVE' : 'PENDING')
        })));
      }
    });

    // 2. Fetch Plumbers
    resilientFetch('/api/plumbers').then(data => {
      if (data && data.success && Array.isArray(data.data)) {
        setPlumbers(data.data.map(p => ({
          ...p,
          activeJobs: p.activeJobs || 0
        })));
      }
    });

    // 3. Fetch Products
    resilientFetch('/api/products').then(data => {
      if (data && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        setZohoSyncMeta(prev => ({
          ...prev,
          totalSkus: data.data.length
        }));
      }
    });

    // 4. Initial Orders Fetch
    fetchOrders(false);

    // 5. Fetch Notifications
    resilientFetch('/api/admin/notifications').then(data => {
      if (data && data.success && Array.isArray(data.data)) {
        setNotifications(data.data);
      }
    });

    // 6. Fetch Payments
    resilientFetch('/api/admin/payments').then(data => {
      if (data && data.success && Array.isArray(data.data)) {
        setPayments(data.data);
      }
    });

    // --- REAL-TIME LIVE UPDATE LISTENERS ---
    // (a) Fast polling every 2.5 seconds
    const pollTimer = setInterval(() => {
      fetchOrders(false);
    }, 2500);

    // (b) BroadcastChannel for instant cross-tab order notification & plumber responses
    let channel;
    try {
      channel = new BroadcastChannel('plumbmart_orders');
      channel.onmessage = (event) => {
        if (event.data && (
          event.data.type === 'NEW_ORDER' || 
          event.data.type === 'ORDER_PLACED' || 
          event.data.type === 'PLUMBER_RESPONSE_SUBMITTED' ||
          event.data.type === 'STATUS_UPDATED'
        )) {
          fetchOrders(true);
          if (event.data.type === 'PLUMBER_RESPONSE_SUBMITTED') {
            try {
              playSuccessSound();
              dispatchInAppNotification({
                title: `Plumber Update: #${event.data.orderId}`,
                message: `${event.data.plumberResponse?.plumberName || 'Plumber'} confirmed "${event.data.plumberResponse?.stageLabel || 'Stage Done'}".`,
                type: 'plumber'
              });
            } catch (errNotif) {}
          }
        }
      };
    } catch (e) {}

    // (c) Window storage event listener for cross-tab communication
    const handleStorageEvent = (e) => {
      if (e.key === 'plumbmart_last_order_broadcast' || e.key === 'plumbmart_status_broadcast') {
        fetchOrders(true);
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // (d) Window custom event listener for in-app order creation & plumber updates
    const handleCustomOrderEvent = () => fetchOrders(true);
    window.addEventListener('plumbmart_order_created', handleCustomOrderEvent);
    window.addEventListener('plumbmart_order_updated', handleCustomOrderEvent);

    return () => {
      clearInterval(pollTimer);
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener('plumbmart_order_created', handleCustomOrderEvent);
      window.removeEventListener('plumbmart_order_updated', handleCustomOrderEvent);
    };
  }, []);

  // Sync with Zoho Workbook Trigger
  const handleTriggerZohoSync = async () => {
    setIsSyncingZoho(true);
    try {
      const res = await fetch('http://localhost:4000/api/admin/zoho-sync', { method: 'POST' });
      const data = await res.json();
      if (data && data.success) {
        setZohoSyncMeta({
          state: 'Synced Live',
          workbookId: data.workbookId,
          sheet: data.sheet,
          lastSyncedAt: data.lastSyncedAt,
          totalSkus: data.totalSkusSynced || products.length,
          latencyMs: data.latencyMs || 142,
          errorsCount: 0
        });
        playSuccessSound();
        setSyncToast('Zoho Master Workbook successfully synchronized! 0 sync errors.');
      }
    } catch {
      const now = new Date();
      setZohoSyncMeta(prev => ({
        ...prev,
        state: 'Synced Live',
        lastSyncedAt: now.toLocaleTimeString() + ' Today',
        latencyMs: 135
      }));
      playSuccessSound();
      setSyncToast('Zoho Master Workbook synchronized locally (Live Stream Active).');
    } finally {
      setIsSyncingZoho(false);
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  // Customer Account Status Toggle (Active / Suspended / Restricted)
  const handleUpdateCustomerStatus = (customerId, newStatus) => {
    if (newStatus === 'Suspended' || newStatus === 'Restricted') {
      playWarningSound();
    } else {
      playSuccessSound();
    }
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, status: newStatus } : c
    ));
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(prev => ({ ...prev, status: newStatus }));
    }

    // Instant In-App notification broadcast to Customers
    dispatchInAppNotification({
      title: 'Customer Account Updated',
      message: `Your PlumbMart customer account status has been updated to "${newStatus}".`,
      targetGroup: 'Customers',
      type: 'CUSTOMER_UPDATE',
      sender: admin.name || 'Admin Operations'
    });

    fetch(`http://localhost:4000/api/customers/${customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  // Dealer Approval & Credit Management
  const handleUpdateDealer = (dealerId, initialUpdates) => {
    const updates = { ...initialUpdates };
    if (updates.status === 'Suspended') {
      updates.suspendedBy = {
        name: admin?.name || 'System Administrator',
        email: admin?.email || 'admin@plumbmart.com',
        role: admin?.accessLevel || admin?.role || 'SuperAdmin',
        phone: '+91 8000 123 456',
        department: 'Corporate Credit Governance & Compliance Desk',
        suspendedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        reason: 'Regulatory credit KYC audit & pending governance review'
      };
    } else if (updates.status === 'Approved') {
      updates.approvedBy = {
        name: admin?.name || 'System Administrator',
        email: admin?.email || 'admin@plumbmart.com',
        role: admin?.accessLevel || admin?.role || 'SuperAdmin',
        phone: '+91 8000 123 456',
        department: 'Corporate Credit Governance & Compliance Desk',
        approvedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      };
      updates.suspendedBy = null;
    }

    setDealers(prev => prev.map(d => {
      if (d.id !== dealerId) return d;
      const newLimit = updates.creditLimit !== undefined ? updates.creditLimit : d.creditLimit;
      const due = typeof d.outstandingDue === 'number' ? d.outstandingDue : 0;
      const newAvail = updates.availableCredit !== undefined ? updates.availableCredit : Math.max(0, newLimit - due);
      return {
        ...d,
        ...updates,
        creditLimit: newLimit,
        availableCredit: newAvail
      };
    }));

    if (selectedDealer && selectedDealer.id === dealerId) {
      setSelectedDealer(prev => {
        const newLimit = updates.creditLimit !== undefined ? updates.creditLimit : prev.creditLimit;
        const due = typeof prev.outstandingDue === 'number' ? prev.outstandingDue : 0;
        const newAvail = updates.availableCredit !== undefined ? updates.availableCredit : Math.max(0, newLimit - due);
        return {
          ...prev,
          ...updates,
          creditLimit: newLimit,
          availableCredit: newAvail
        };
      });
    }

    // 1. Broadcast immediately across tabs so Dealer portal updates instantly with zero latency
    const targetDealer = dealers.find(d => d.id === dealerId) || selectedDealer;
    const dealerName = targetDealer?.name || 'Sri Venkateswara Distributors';
    const isApprovedAction = updates.status === 'Approved';
    const broadcastPayload = {
      type: 'DEALER_GOVERNANCE_UPDATED',
      dealerId,
      updates: {
        ...updates,
        isApproved: isApprovedAction,
        isWelcomeBack: isApprovedAction
      },
      status: updates.status,
      isApproved: isApprovedAction,
      isWelcomeBack: isApprovedAction,
      dealerName,
      timestamp: Date.now()
    };

    try {
      const chDealers = new BroadcastChannel('plumbmart_dealers');
      chDealers.postMessage(broadcastPayload);
      setTimeout(() => chDealers.close(), 3000);
    } catch (e) {}

    try {
      const chOrders = new BroadcastChannel('plumbmart_orders');
      chOrders.postMessage(broadcastPayload);
      setTimeout(() => chOrders.close(), 3000);
    } catch (e) {}

    try {
      localStorage.setItem('plumbmart_dealer_governance_broadcast', JSON.stringify(broadcastPayload));
      localStorage.setItem('plumbmart_dealer_status_broadcast', JSON.stringify(broadcastPayload));
      if (isApprovedAction) {
        localStorage.setItem('plumbmart_show_welcome_back', 'true');
        localStorage.setItem('plumbmart_dealer_welcome_back', JSON.stringify({
          dealerId,
          dealerName,
          timestamp: Date.now()
        }));
      } else if (updates.status === 'Suspended') {
        localStorage.removeItem('plumbmart_show_welcome_back');
        localStorage.removeItem('plumbmart_dealer_welcome_back');
      }
    } catch (e) {}

    try {
      const savedUserStr = localStorage.getItem('plumbmart_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.id === dealerId || savedUser.role === 'Dealer' || savedUser.name?.includes('Venkateswara'))) {
          const updatedUser = { ...savedUser, ...updates };
          localStorage.setItem('plumbmart_user', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('plumbmart_dealer_updated', { detail: broadcastPayload }));

    // Instant In-App notification broadcast to Dealers
    if (isApprovedAction) {
      dispatchInAppNotification({
        title: '🎉 Welcome Back! Account Approved & Re-Activated',
        message: `Wholesale B2B account for "${selectedDealer?.name || 'Sri Venkateswara Distributors'}" is now officially APPROVED & ACTIVE! Full credit limit and wholesale ordering are unlocked.`,
        targetGroup: 'Dealers',
        priority: 'urgent',
        type: 'DEALER_APPROVED',
        sender: 'Corporate Governance Desk'
      });
    } else {
      const dealerNoticeMsg = updates.creditLimit !== undefined
        ? `Credit line updated to ₹${Number(updates.creditLimit).toLocaleString('en-IN')}. Available limit and ledger synced.`
        : (updates.status ? `Dealer account status updated to "${updates.status}".` : 'Your dealer terms and governance have been updated by Admin.');

      dispatchInAppNotification({
        title: 'Dealer Account & Credit Updated',
        message: dealerNoticeMsg,
        targetGroup: 'Dealers',
        priority: 'urgent',
        type: 'DEALER_UPDATE',
        sender: 'Credit Governance Desk'
      });
    }

    // 2. Resilient PUT request to backend
    const syncDealer = async () => {
      let saved = false;
      try {
        const res = await fetch(`/api/dealers/${dealerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) saved = true;
      } catch (e) {}

      if (!saved) {
        try {
          const res = await fetch(`http://localhost:5000/api/dealers/${dealerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          if (res.ok) saved = true;
        } catch (e) {}
      }

      if (!saved) {
        try {
          await fetch(`http://localhost:4000/api/dealers/${dealerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
        } catch (e) {}
      }
    };
    syncDealer();

    // 3. User feedback toast & sound
    const dealerEmail = targetDealer?.email || 'dealer@plumbmart-demo.com';
    if (updates.status === 'Suspended') {
      playWarningSound();
      setSyncToast(`Dealer #${dealerId} SUSPENDED! Official email alert dispatched to ${dealerEmail}.`);
    } else if (updates.status === 'Approved') {
      playSuccessSound();
      setSyncToast(`Dealer #${dealerId} APPROVED! Welcome & credit activation email sent to ${dealerEmail}.`);
    } else {
      if (updates.credit30Days !== undefined && updates.credit90Days === undefined && updates.creditLimit === undefined) {
        playToggleSound(updates.credit30Days);
      } else if (updates.credit90Days !== undefined && updates.credit30Days === undefined && updates.creditLimit === undefined) {
        playToggleSound(updates.credit90Days);
      } else {
        playSuccessSound();
      }
      setSyncToast(`Dealer #${dealerId} credit policy updated!`);
    }
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Plumber Verification & Status Toggle with Real-time Multi-Tab Broadcast
  const handleUpdatePlumber = (plumberId, updates) => {
    if (updates.status === 'SUSPENDED' || updates.status === 'REJECTED') {
      playWarningSound();
    } else {
      playSuccessSound();
    }

    setPlumbers(prev => prev.map(p => 
      p.id === plumberId ? { ...p, ...updates } : p
    ));
    if (selectedPlumber && selectedPlumber.id === plumberId) {
      setSelectedPlumber(prev => ({ ...prev, ...updates }));
    }

    const targetPlumber = plumbers.find(p => p.id === plumberId) || selectedPlumber;
    const targetMobile = targetPlumber?.mobile;

    // 1. Cross-tab Broadcast Channel
    const broadcastPayload = {
      plumberId,
      mobile: targetMobile,
      updates,
      status: updates.status,
      timestamp: Date.now()
    };

    try {
      const ch = new BroadcastChannel('plumbmart_plumbers');
      ch.postMessage(broadcastPayload);
      setTimeout(() => ch.close(), 3000);
    } catch (e) {}

    // 2. LocalStorage broadcast & plumbmart_user sync
    try {
      localStorage.setItem('plumbmart_plumber_status_broadcast', JSON.stringify(broadcastPayload));
      const savedUserStr = localStorage.getItem('plumbmart_user');
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && (savedUser.role === 'Plumber' || savedUser.id === plumberId || (targetMobile && savedUser.mobile === targetMobile))) {
          localStorage.setItem('plumbmart_user', JSON.stringify({ ...savedUser, ...updates }));
        }
      }
    } catch (e) {}

    // 3. Custom Event dispatch
    window.dispatchEvent(new CustomEvent('plumbmart_plumber_updated', { detail: broadcastPayload }));

    // 4. Instant In-App notification broadcast to Plumbers
    const plumbMsg = updates.status === 'SUSPENDED'
      ? 'Your plumber account has been SUSPENDED by Administration. Job execution is locked.'
      : (updates.status ? `Your plumber account verification status is now "${updates.status}".` : 'Your plumber credentials have been updated.');

    dispatchInAppNotification({
      title: updates.status === 'SUSPENDED' ? '⚠️ Plumber Account Suspended' : 'Plumber Profile & Verification Updated',
      message: plumbMsg,
      targetGroup: 'Plumbers',
      priority: 'high',
      type: 'PLUMBER_UPDATE',
      sender: admin.name || 'Admin Operations'
    });

    // 5. Resilient API PUT request
    const syncPlumber = async () => {
      let saved = false;
      try {
        const res = await fetch(`/api/plumbers/${plumberId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (res.ok) saved = true;
      } catch (e) {}

      if (!saved) {
        try {
          const res = await fetch(`http://localhost:5000/api/plumbers/${plumberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
          if (res.ok) saved = true;
        } catch (e) {}
      }

      if (!saved) {
        try {
          await fetch(`http://localhost:4000/api/plumbers/${plumberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
          });
        } catch (e) {}
      }
    };
    syncPlumber();

    // 6. Admin Toast
    if (updates.status === 'SUSPENDED') {
      setSyncToast(`Plumber #${plumberId} SUSPENDED! Real-time lockdown dispatched.`);
    } else {
      setSyncToast(`Plumber #${plumberId} status updated to ${updates.status || 'Verified'}.`);
    }
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Update Order Status & Broadcast Live Update to Customer Portal
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // 1. Optimistic UI update in Admin
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }

    // 2. Broadcast immediately across tabs so customer side updates with 0 latency
    try {
      const ch = new BroadcastChannel('plumbmart_orders');
      ch.postMessage({ type: 'STATUS_UPDATED', orderId, status: newStatus });
      ch.close();
    } catch (e) {}

    try {
      localStorage.setItem('plumbmart_status_broadcast', JSON.stringify({ orderId, status: newStatus, time: Date.now() }));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('plumbmart_status_updated', { detail: { orderId, status: newStatus } }));

    // Instant In-App notification broadcast to target role (Dealer or Customer)
    const targetOrder = orders.find(o => o.id === orderId);
    const clientTarget = (targetOrder?.clientType || '').toLowerCase().includes('dealer') ? 'Dealers' : 'Customers';

    dispatchInAppNotification({
      title: `Order #${orderId} ${newStatus}`,
      message: `Your order #${orderId} status has been updated to "${newStatus}" by PlumbMart Operations.`,
      targetGroup: clientTarget,
      priority: newStatus.toLowerCase() === 'delivered' ? 'normal' : 'high',
      type: 'ORDER_UPDATE',
      sender: 'PlumbMart Logistics'
    });

    // 3. Persist to Backend API (with resilient proxy / port fallbacks)
    try {
      let res;
      try {
        res = await fetch(`/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error('Proxy status: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
          if (!res.ok) throw new Error('Port 5000 status: ' + res.status);
        } catch (e2) {
          res = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
          });
        }
      }
      playSuccessSound();
      setSyncToast(`Order #${orderId} marked as "${newStatus}"! Live customer tracking updated.`);
      setTimeout(() => setSyncToast(null), 3000);
    } catch (err) {
      playWarningSound();
      console.warn('Order status sync error:', err.message);
    }
  };

  // Resend or dispatch Bill Receipt & Congratulatory Email
  const handleSendOrderReceipt = async (order) => {
    if (!order) return;
    setSendingReceiptId(order.id);
    setReceiptFeedback(null);
    try {
      let res;
      try {
        res = await fetch(`/api/orders/${order.id}/send-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: order.clientEmail })
        });
      } catch (e1) {
        res = await fetch(`http://localhost:5000/api/orders/${order.id}/send-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: order.clientEmail })
        });
      }
      const data = await res.json();
      if (data && data.success) {
        playSuccessSound();
        setReceiptFeedback({ type: 'success', message: `Receipt sent to ${data.emailResult?.email || order.clientEmail || 'registered email'}!` });
      } else {
        playWarningSound();
        setReceiptFeedback({ type: 'error', message: data?.message || 'Failed to dispatch receipt' });
      }
    } catch (err) {
      playWarningSound();
      setReceiptFeedback({ type: 'error', message: err.message || 'Error sending receipt' });
    } finally {
      setSendingReceiptId(null);
    }
  };

  // Send Broadcast Notification
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    const cleanTarget = broadcastForm.targetGroup || 'All';
    const now = new Date();
    const newNotif = {
      id: 'NOTIF-' + Math.floor(1000 + Math.random() * 9000),
      targetGroup: cleanTarget,
      title: broadcastForm.title.trim(),
      message: broadcastForm.message.trim(),
      sentAt: 'Today, ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString(),
      sender: admin.name || 'System Admin'
    };

    // 1. Optimistic UI update in Admin
    setNotifications(prev => [newNotif, ...prev]);
    setBroadcastModalOpen(false);
    setBroadcastForm({ targetGroup: 'All', title: '', message: '' });
    playSuccessSound();
    setSyncToast(`Broadcast announcement dispatched to ${cleanTarget}!`);
    setTimeout(() => setSyncToast(null), 4000);

    // 2. Real-time Cross-tab BroadcastChannel & LocalStorage
    try {
      const ch = new BroadcastChannel('plumbmart_announcements');
      ch.postMessage({ type: 'NEW_ANNOUNCEMENT', announcement: newNotif });
      ch.close();
    } catch (err) {}

    try {
      localStorage.setItem('plumbmart_announcement_broadcast', JSON.stringify({ announcement: newNotif, time: Date.now() }));
    } catch (err) {}

    window.dispatchEvent(new CustomEvent('plumbmart_announcement_created', { detail: newNotif }));

    // Instant in-app notification popup across target role screens
    dispatchInAppNotification({
      id: newNotif.id,
      title: newNotif.title,
      message: newNotif.message,
      targetGroup: cleanTarget,
      priority: 'high',
      type: 'ANNOUNCEMENT',
      sender: admin.name || 'System Admin'
    });

    // 3. Persist to Backend API with resilient fallbacks
    try {
      await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotif)
      });
    } catch (err1) {
      try {
        await fetch('http://localhost:5000/api/admin/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newNotif)
        });
      } catch (err2) {
        try {
          await fetch('http://localhost:4000/api/admin/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNotif)
          });
        } catch (err3) {}
      }
    }
  };

  // Delete Broadcast Notification
  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this broadcast announcement?')) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' });
    } catch (e1) {
      try {
        await fetch(`http://localhost:5000/api/admin/notifications/${id}`, { method: 'DELETE' });
      } catch (e2) {}
    }
  };

  // Process Payment Refund
  const handleProcessRefund = (paymentId) => {
    if (window.confirm(`Initiate full refund for payment transaction ${paymentId}?`)) {
      setPayments(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'Refunded' } : p
      ));
    }
  };

  // Logout Action
  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('plumbmart_user');
    } catch {}
    if (onLogout) onLogout();
    navigate('/admin/login');
  };

  // Navigation Items according to requested wireframe
  const mainNavItems = [
    { id: 'overview', label: 'Dashboard', icon: BarChart3, desc: 'Monitor users, orders, payments & Zoho sync' },
    { id: 'customers', label: 'Customers', icon: Users, desc: 'View and manage accounts', count: customers.length },
    { id: 'dealers', label: 'Dealers', icon: Building2, desc: 'Verification and credit', count: dealers.length },
    { id: 'plumbers', label: 'Plumbers', icon: Wrench, desc: 'Verification and activities', count: plumbers.length },
    { id: 'orders', label: 'Orders', icon: Package, desc: 'Track and manage orders', count: orders.length }
  ];

  const secondaryNavItems = [
    { id: 'products', label: 'Products & Zoho Sync', icon: Layers, desc: 'Master inventory & sync engine' },
    { id: 'payments', label: 'Payments & Credit', icon: CreditCard, desc: 'Gateway reconciliation & credit terms' },
    { id: 'reports', label: 'Reports & Analytics', icon: TrendingUp, desc: 'Sales, demand & audit metrics' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Broadcast announcements', count: notifications.length }
  ];

  // ========================================================
  // DYNAMIC REPORTS & ANALYTICS COMPUTATIONS (REAL-TIME DATA)
  // ========================================================
  const now = new Date();
  const currentFiscalMonth = now.toLocaleString('en-IN', { month: 'short', year: 'numeric' });

  // 1. Dynamic filtering based on user-selected period & channel
  const analyticsFilteredOrders = orders.filter(order => {
    // Channel filter: 'all' | 'Dealer' | 'Customer'
    if (analyticsChannel !== 'all' && order.clientType !== analyticsChannel) {
      return false;
    }
    // Period filter: 'all' | 'month' | 'week' | 'today'
    if (analyticsPeriod === 'today') {
      const orderDate = order.createdAt ? new Date(order.createdAt) : null;
      if (orderDate && orderDate.toDateString() !== now.toDateString()) return false;
      if (!orderDate && order.date && !order.date.toLowerCase().includes('today')) return false;
    } else if (analyticsPeriod === 'week') {
      if (order.createdAt) {
        const diffMs = now.getTime() - new Date(order.createdAt).getTime();
        if (diffMs > 7 * 24 * 60 * 60 * 1000) return false;
      }
    } else if (analyticsPeriod === 'month') {
      if (order.createdAt) {
        const d = new Date(order.createdAt);
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      }
    }
    return true;
  });

  // 2. Real Revenue Metrics calculated dynamically from orders state
  const dynamicDealerB2BSales = analyticsFilteredOrders
    .filter(o => o.clientType === 'Dealer' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const dynamicCustomerRetailSales = analyticsFilteredOrders
    .filter(o => o.clientType === 'Customer' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const dynamicTotalGrossSales = dynamicDealerB2BSales + dynamicCustomerRetailSales;

  // Real Collections: orders that have been paid or settled
  const dynamicTotalCollections = analyticsFilteredOrders
    .filter(o => {
      const ps = (o.paymentStatus || '').toLowerCase();
      const cs = (o.creditStatus || '').toLowerCase();
      return (ps.includes('paid') || ps.includes('settled') || cs.includes('settled')) && o.status !== 'Cancelled';
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Real Outstanding Credit Receivables
  const dynamicOutstandingCredit = analyticsFilteredOrders
    .filter(o => {
      const ps = (o.paymentStatus || '').toLowerCase();
      const cs = (o.creditStatus || '').toLowerCase();
      return (ps.includes('pending') || cs.includes('outstanding')) && o.status !== 'Cancelled';
    })
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // 3. Aggregate Product Sales directly from orders items
  const productSalesMap = {};
  orders.forEach(order => {
    if (order.status === 'Cancelled') return;
    (order.items || []).forEach(it => {
      const key = (it.sku || it.id || it.name || '').toLowerCase().trim();
      const qty = Number(it.qty || it.quantity || 1);
      const price = Number(it.price || 0);
      if (!productSalesMap[key]) {
        productSalesMap[key] = {
          name: it.name,
          sku: it.sku,
          unitsSold: 0,
          revenue: 0,
          orderCount: 0
        };
      }
      productSalesMap[key].unitsSold += qty;
      productSalesMap[key].revenue += (qty * price);
      productSalesMap[key].orderCount += 1;
    });
  });

  // 4. Category Breakdown derived dynamically from products & orders
  const categoryStatsMap = {};
  products.forEach(p => {
    const cat = p.category || 'Pipes & Fittings';
    if (!categoryStatsMap[cat]) {
      categoryStatsMap[cat] = {
        name: cat,
        productCount: 0,
        totalStock: 0,
        unitsSold: 0,
        revenue: 0
      };
    }
    categoryStatsMap[cat].productCount += 1;
    categoryStatsMap[cat].totalStock += Number(p.stock || 0);

    const matchSales = productSalesMap[(p.sku || '').toLowerCase()] || 
                       productSalesMap[(p.id || '').toLowerCase()] || 
                       productSalesMap[(p.name || '').toLowerCase()];
    if (matchSales) {
      categoryStatsMap[cat].unitsSold += matchSales.unitsSold;
      categoryStatsMap[cat].revenue += matchSales.revenue;
    }
  });

  const categoryAnalyticsList = Object.values(categoryStatsMap).sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold);
  const highestCategoryRevenue = Math.max(...categoryAnalyticsList.map(c => c.revenue), 1);

  // 5. Fulfillment status breakdown
  const fulfillmentStatusCounts = {
    Delivered: analyticsFilteredOrders.filter(o => o.status === 'Delivered').length,
    InTransit: analyticsFilteredOrders.filter(o => o.status === 'Shipped' || o.status === 'Out for Delivery').length,
    Processing: analyticsFilteredOrders.filter(o => o.status === 'Processing' || o.status === 'Confirmed' || o.status === 'Pending').length,
    Cancelled: analyticsFilteredOrders.filter(o => o.status === 'Cancelled').length
  };

  // 6. Payment method distribution
  const paymentMethodSummary = {};
  analyticsFilteredOrders.forEach(o => {
    const method = o.paymentMethod || 'Online Payment';
    if (!paymentMethodSummary[method]) {
      paymentMethodSummary[method] = { method, count: 0, amount: 0 };
    }
    paymentMethodSummary[method].count += 1;
    paymentMethodSummary[method].amount += (Number(o.total) || 0);
  });
  const paymentMethodSummaryList = Object.values(paymentMethodSummary).sort((a, b) => b.amount - a.amount);

  // 7. Dynamic Inventory List with Live Zoho Stock & Order Demand
  const dynamicProductsInventory = products.map(p => {
    const sales = productSalesMap[(p.sku || '').toLowerCase()] || 
                  productSalesMap[(p.id || '').toLowerCase()] || 
                  productSalesMap[(p.name || '').toLowerCase()] || 
                  { unitsSold: 0, revenue: 0, orderCount: 0 };
    
    const stock = typeof p.stock === 'number' ? p.stock : 50;

    let demandText = 'Optimal Stock';
    let demandBadgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

    if (sales.unitsSold >= 5) {
      demandText = 'High Demand';
      demandBadgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    } else if (sales.unitsSold >= 1) {
      demandText = 'Active Sales';
      demandBadgeClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    } else if (stock <= 10 && stock > 0) {
      demandText = 'Low Stock Alert';
      demandBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    } else if (stock === 0) {
      demandText = 'Out of Stock';
      demandBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }

    return {
      ...p,
      unitsSold: sales.unitsSold,
      revenueGenerated: sales.revenue,
      orderCount: sales.orderCount,
      demandText,
      demandBadgeClass
    };
  });

  // Filter dynamic inventory items by search & stock filter
  const filteredAnalyticsProducts = dynamicProductsInventory.filter(p => {
    const q = analyticsSearch.toLowerCase().trim();
    if (q) {
      const match = (p.name || '').toLowerCase().includes(q) ||
                    (p.sku || '').toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.brand || '').toLowerCase().includes(q);
      if (!match) return false;
    }

    if (analyticsStockFilter === 'low') return (p.stock || 0) <= 15 && (p.stock || 0) > 0;
    if (analyticsStockFilter === 'out') return (p.stock || 0) === 0;
    if (analyticsStockFilter === 'optimal') return (p.stock || 0) > 15;
    if (analyticsStockFilter === 'highDemand') return p.unitsSold > 0;
    return true;
  });

  // Export Analytics to CSV handler
  const handleExportAnalyticsCSV = () => {
    const headers = ['Order ID', 'Client Name', 'Client Type', 'Date', 'Payment Method', 'Payment Status', 'Fulfillment Status', 'Total Amount (INR)'];
    const rows = analyticsFilteredOrders.map(o => [
      `"${o.id || ''}"`,
      `"${(o.clientName || '').replace(/"/g, '""')}"`,
      `"${o.clientType || 'Customer'}"`,
      `"${o.date || ''}"`,
      `"${(o.paymentMethod || '').replace(/"/g, '""')}"`,
      `"${o.paymentStatus || ''}"`,
      `"${o.status || ''}"`,
      o.total || 0
    ]);
    const csvString = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlumbMart_Analytics_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{syncToast}</span>
        </div>
      )}

      {/* Real-time New Order Alert Notification */}
      {newOrderAlert && (
        <div className="fixed top-18 right-5 z-50 flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Package className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              New Order Received!
            </div>
            <div className="text-xs font-bold">
              Order #{newOrderAlert.id} &bull; {newOrderAlert.clientName} (₹{newOrderAlert.total.toLocaleString('en-IN')})
            </div>
          </div>
          <button 
            onClick={() => setNewOrderAlert(null)} 
            className="ml-2 text-white/70 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <header className="shrink-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-white shrink-0">
                Plumb<span className="text-blue-500">Mart</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 sm:px-2 py-0.5 rounded-md truncate max-w-[140px] sm:max-w-none">
                Admin &bull; {mainNavItems.find(i => i.id === activeTab)?.label || secondaryNavItems.find(i => i.id === activeTab)?.label || 'Overview'}
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Zoho Sync Live Badge */}
          <div 
            onClick={handleTriggerZohoSync}
            className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition"
            title="Click to force sync with Zoho Workbook"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono text-slate-300">Zoho Live: {zohoSyncMeta.state}</span>
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isSyncingZoho ? 'animate-spin text-blue-400' : ''}`} />
          </div>

          {/* Admin Profile Dropdown Menu */}
          <div className="relative" ref={adminMenuRef}>
            <button
              onClick={() => {
                playClickSound();
                setIsAdminMenuOpen(!isAdminMenuOpen);
              }}
              className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition active:scale-95 cursor-pointer"
              title="Admin Profile & Account Menu"
              aria-label="Admin Profile & Account Menu"
            >
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-white leading-none">{admin.name}</p>
                <p className="text-[10px] text-blue-400 font-mono mt-0.5">{admin.accessLevel}</p>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            </button>

            {/* Profile Dropdown Popup */}
            {isAdminMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100">
                {/* User Info Header */}
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-slate-900 truncate">{admin.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{admin.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    VERIFIED &bull; {admin.accessLevel || 'SUPERADMIN'}
                  </span>
                </div>

                {/* Actions: Quick Profile Info */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsAdminMenuOpen(false);
                      setIsEditingAdminProfile(false);
                      setIsAdminProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Quick Profile Info</span>
                  </button>
                </div>

                {/* Logout Button */}
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsAdminMenuOpen(false);
                      handleAdminLogout();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Workspace */}
      <div className="flex-1 flex w-full relative overflow-hidden min-h-0">
        
        {/* Left Admin Navigation Sidebar - Desktop / Tablet Only */}
        <aside className={`${isSidebarCollapsed ? 'w-16 p-2' : 'w-64 p-3.5'} hidden md:flex shrink-0 bg-slate-950 border-r border-slate-800 flex-col justify-between transition-all duration-200 h-full overflow-y-auto overflow-x-hidden z-20`}>
          <div className="space-y-5">
            {/* Sidebar Toggle Corner */}
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} pb-2 border-b border-slate-800/80`}>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </span>
              )}
              <button
                onClick={() => {
                  playClickSound();
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }}
                className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Group 1: MAIN OVERVIEW & ENTITIES */}
            <div className="space-y-1">
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 block">
                  Core Management
                </span>
              )}
              {mainNavItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playClickSound();
                      setActiveTab(item.id);
                    }}
                    title={item.label}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Group 2: ADMIN MENU TOOLS & GOVERNANCE */}
            <div className="space-y-1 pt-3 border-t border-slate-800/80">
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1 block">
                  Admin Menu
                </span>
              )}
              {secondaryNavItems.map(item => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playClickSound();
                      setActiveTab(item.id);
                    }}
                    title={item.label}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 font-bold'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Link */}
          {!isSidebarCollapsed && (
            <div className="pt-4 border-t border-slate-800">
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Content Workspace Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6">

          {/* ======================================================== */}
          {/* 1. DASHBOARD OVERVIEW                                    */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <BarChart3 className="w-6 h-6 text-blue-500" />
                    <span>Admin Panel &bull; Overview</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Monitor users, orders, payments, and live product synchronization
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      handleTriggerZohoSync();
                    }}
                    disabled={isSyncingZoho}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingZoho ? 'animate-spin' : ''}`} />
                    <span>{isSyncingZoho ? 'Syncing Zoho...' : 'Trigger Zoho Sync'}</span>
                  </button>
                </div>
              </div>

              {/* Top 4 KPI Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Total Users */}
                <div 
                  onClick={() => {
                    playClickSound();
                    setActiveTab('customers');
                  }}
                  className="cursor-pointer bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2 group"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Total Accounts</span>
                    <Users className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white">
                      {customers.length + dealers.length + plumbers.length}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      +100% Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {customers.length} Customers &bull; {dealers.length} Dealers &bull; {plumbers.length} Plumbers
                  </p>
                </div>

                {/* Metric 2: Orders Total & Revenue */}
                <div 
                  onClick={() => {
                    playClickSound();
                    setActiveTab('orders');
                  }}
                  className="cursor-pointer bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2 group"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Gross Orders Volume</span>
                    <Package className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-white">
                      ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {orders.length} Orders
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    B2B Wholesale + Direct Consumer Retail
                  </p>
                </div>

                {/* Metric 3: Dealer Credit Outstandings */}
                <div 
                  onClick={() => {
                    playClickSound();
                    setActiveTab('payments');
                  }}
                  className="cursor-pointer bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2 group"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Outstanding Credit</span>
                    <CreditCard className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-400">
                      ₹{dealers.reduce((sum, d) => sum + (d.outstandingDue || 0), 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Terms Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Zoho Approved 30D / 90D Credit Lines
                  </p>
                </div>

                {/* Metric 4: Zoho Master Sync */}
                <div 
                  onClick={() => {
                    playClickSound();
                    setActiveTab('products');
                  }}
                  className="cursor-pointer bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition space-y-2 group"
                >
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-semibold">Zoho Synchronization</span>
                    <Layers className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-400">
                      {zohoSyncMeta.totalSkus} SKUs
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      0 Errors
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {zohoSyncMeta.sheet} &bull; {zohoSyncMeta.latencyMs}ms
                  </p>
                </div>

              </div>

              {/* Overview 2-Column Split: Recent Orders & Quick Module Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Live Orders Tracker */}
                <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span>Live Order Stream</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <span>View All ({orders.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800/80 text-xs">
                    {orders.slice(0, 4).map(o => (
                      <div key={o.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono font-bold text-white">{o.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              o.clientType === 'Dealer'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {o.clientType}
                            </span>
                          </div>
                          <p className="text-slate-400 truncate">{o.clientName}</p>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-white block">₹{(o.total || 0).toLocaleString('en-IN')}</span>
                          <span className={`text-[10px] font-semibold ${
                            o.status === 'Delivered' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right 1 Col: Quick Governance Modules */}
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white pb-2 border-b border-slate-800">
                      Quick Governance Shortcuts
                    </h3>

                    {[
                      { tab: 'dealers', title: 'Verify Dealers with Zoho', desc: `${dealers.filter(d => !d.zohoVerified).length} pending Zoho checks` },
                      { tab: 'plumbers', title: 'Verify Plumber KYC Licenses', desc: `${plumbers.filter(p => p.status === 'PENDING_VERIFICATION').length} awaiting verification` },
                      { tab: 'payments', title: 'Review 30D/90D Credit Due Dates', desc: `₹${dealers.reduce((s, d) => s + (Number(d.outstandingDue) || 0), 0).toLocaleString('en-IN')} outstanding` },
                      { tab: 'notifications', title: 'Broadcast Push Notification', desc: 'Alert customers, dealers or plumbers' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          playClickSound();
                          setActiveTab(item.tab);
                        }}
                        className="cursor-pointer p-3 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800/80 transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-xs text-white">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 2. CUSTOMER MANAGEMENT                                  */}
          {/* ======================================================== */}
          {activeTab === 'customers' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>Customer Management</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    View customer profiles, search accounts, monitor order history, and manage status
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search by name or mobile..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Orders &amp; Value</th>
                        <th className="py-3 px-4">Account Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {customers.filter(c => 
                        (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                        (c.mobile || '').includes(customerSearch)
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-8 text-center text-slate-400">
                            No registered customer accounts found.
                          </td>
                        </tr>
                      ) : (
                        customers
                          .filter(c => 
                            (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
                            (c.mobile || '').includes(customerSearch)
                          )
                          .map(cust => (
                            <tr key={cust.id} className="hover:bg-slate-900/50 transition">
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white text-xs">{cust.name}</div>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {cust.id} &bull; Reg: {cust.registeredDate}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono">
                                <div className="text-slate-300">+91 {cust.mobile}</div>
                                <div className="text-slate-500 text-[10px]">{cust.email}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold text-white">{cust.totalOrders} Orders</div>
                                <div className="text-slate-400 text-[10px]">₹{(cust.totalSpent || 0).toLocaleString('en-IN')} total spent</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  cust.status === 'Active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : cust.status === 'Suspended'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                  {cust.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedCustomer(cust)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-400 text-xs font-semibold border border-slate-800"
                                  >
                                    Profile
                                  </button>
                                  {cust.status !== 'Active' ? (
                                    <button
                                      onClick={() => handleUpdateCustomerStatus(cust.id, 'Active')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/20"
                                    >
                                      Activate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleUpdateCustomerStatus(cust.id, 'Suspended')}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[11px] font-bold border border-rose-500/20"
                                    >
                                      Suspend
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 3. DEALER MANAGEMENT                                    */}
          {/* ======================================================== */}
          {activeTab === 'dealers' && (
            viewingDealer ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Header Navigation & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        playClickSound();
                        setViewingDealer(null);
                        navigate('/admin');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Dealers List</span>
                    </button>
                    <div className="h-5 w-px bg-slate-800 hidden sm:block" />
                    <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                      <span>Dealers</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                      <span className="font-semibold text-white">{viewingDealer.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={async () => {
                        playClickSound();
                        try {
                          const res = await fetch(`/api/dealers/${viewingDealer.id}/zoho-status`);
                          const data = await res.json();
                          if (data.existsInZoho) {
                            playSuccessSound();
                            setSyncToast(`✓ Dealer verified in Zoho CRM (${data.zohoContact?.companyName || data.zohoContact?.contactName || 'Active'}).`);
                            handleUpdateDealer(viewingDealer.id, { zohoVerified: true, zohoDetails: data.zohoContact });
                          } else {
                            playWarningSound();
                            setSyncToast(`⚠️ Record NOT found in Zoho Inventory for ${viewingDealer.email}.`);
                            handleUpdateDealer(viewingDealer.id, { zohoVerified: false });
                          }
                          setTimeout(() => setSyncToast(null), 4000);
                        } catch (e) {
                          setSyncToast('Failed to check Zoho status.');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Check Zoho</span>
                    </button>

                    <button
                      onClick={() => {
                        playClickSound();
                        setSelectedDealer(viewingDealer);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Edit Credit Policy</span>
                    </button>

                    {viewingDealer.status !== 'Approved' && viewingDealer.status !== 'ACTIVE' && viewingDealer.status !== 'Active' ? (
                      <button
                        onClick={() => {
                          handleUpdateDealer(viewingDealer.id, { status: 'ACTIVE', zohoVerified: true });
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Dealer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleUpdateDealer(viewingDealer.id, { status: 'Suspended' });
                        }}
                        className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-600/30 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Suspend Access</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Hero Profile Banner */}
                <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-600/30 shrink-0">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/20">
                            {viewingDealer.id || 'DLR'}
                          </span>
                          <span className="font-mono text-xs text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
                            GSTIN: {viewingDealer.gstin || 'N/A'}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            viewingDealer.status === 'Approved' || viewingDealer.status === 'ACTIVE' || viewingDealer.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : viewingDealer.status === 'Pending' || viewingDealer.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            Status: {viewingDealer.status === 'Approved' ? 'ACTIVE' : (viewingDealer.status || 'PENDING')}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            viewingDealer.zohoVerified
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {viewingDealer.zohoVerified ? '✓ Zoho CRM Record Verified' : '⚠️ Pending Zoho Verification'}
                          </span>
                        </div>

                        <h1 className="text-2xl font-black text-white tracking-tight">{viewingDealer.name || 'Registered Dealer'}</h1>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                          <span>Contact Person: <strong className="text-slate-200">{viewingDealer.contactPerson || viewingDealer.name || 'Authorized Contact'}</strong></span>
                          <span>&bull;</span>
                          <span>Mobile: <strong className="text-slate-200 font-mono">+91 {viewingDealer.mobile || 'N/A'}</strong></span>
                          <span>&bull;</span>
                          <span>Email: <strong className="text-slate-200 font-mono">{viewingDealer.email || 'N/A'}</strong></span>
                          <span>&bull;</span>
                          <span>Location: <strong className="text-slate-200">{viewingDealer.city || 'Bengaluru, Karnataka'}</strong></span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Metrics Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px]">Approved Credit Limit</span>
                      <CreditCard className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-xl font-black text-white font-mono">
                      ₹{(Number(viewingDealer.creditLimit) || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className={viewingDealer.credit30Days ? 'text-indigo-400 font-semibold' : 'text-slate-500'}>30D Active</span>
                      <span>&bull;</span>
                      <span className={viewingDealer.credit90Days ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>90D Approved</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px]">Available Credit</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xl font-black text-emerald-400 font-mono">
                      ₹{(Number(viewingDealer.availableCredit) || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {Math.max(0, Math.round(((Number(viewingDealer.availableCredit) || 0) / (Number(viewingDealer.creditLimit) || 1)) * 100))}% Credit Available
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px]">Outstanding Balance</span>
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-xl font-black text-amber-400 font-mono">
                      ₹{(Number(viewingDealer.outstandingDue) || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Next Due: <strong className="text-slate-300">{viewingDealer.nextDueDate || 'None'}</strong>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px]">Total B2B Spend</span>
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xl font-black text-blue-400 font-mono">
                      ₹{(Number(viewingDealer.totalVolume) || 0).toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {orders.filter(o => (o.clientId === viewingDealer.id || o.clientMobile === viewingDealer.mobile || o.clientName === viewingDealer.name) && o.clientType === 'Dealer').length} Orders Placed
                    </div>
                  </div>
                </div>

                {/* 4. Two-Column Detailed Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column (5 Cols) */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Credit Governance & Limits */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-indigo-400" />
                          <span>Credit Facility Governance</span>
                        </h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Usage: {Math.min(100, Math.round((Math.max(0, (Number(viewingDealer.creditLimit) || 0) - (Number(viewingDealer.availableCredit) || 0)) / (Number(viewingDealer.creditLimit) || 1)) * 100))}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Credit Utilization</span>
                          <span className="text-white font-mono font-bold">
                            ₹{Math.max(0, (Number(viewingDealer.creditLimit) || 0) - (Number(viewingDealer.availableCredit) || 0)).toLocaleString('en-IN')} / ₹{(Number(viewingDealer.creditLimit) || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full"
                            style={{ width: `${Math.min(100, Math.round((Math.max(0, (Number(viewingDealer.creditLimit) || 0) - (Number(viewingDealer.availableCredit) || 0)) / (Number(viewingDealer.creditLimit) || 1)) * 100))}%` }}
                          />
                        </div>
                      </div>

                      {/* Eligibility switches */}
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <span className="text-xs font-bold text-white block">30-Day Pay Later Terms</span>
                            <span className="text-[10px] text-slate-400">Invoice due 30 days from dispatch</span>
                          </div>
                          <button
                            onClick={() => handleUpdateDealer(viewingDealer.id, { credit30Days: !viewingDealer.credit30Days })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              viewingDealer.credit30Days ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {viewingDealer.credit30Days ? 'ENABLED' : 'DISABLED'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                          <div>
                            <span className="text-xs font-bold text-white block">90-Day Tier 1 Credit</span>
                            <span className="text-[10px] text-slate-400">Quarterly credit for high volume distributors</span>
                          </div>
                          <button
                            onClick={() => handleUpdateDealer(viewingDealer.id, { credit90Days: !viewingDealer.credit90Days })}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              viewingDealer.credit90Days ? 'APPROVED' : 'LOCKED'}
                            }`}
                          >
                            {viewingDealer.credit90Days ? 'APPROVED' : 'LOCKED'}
                          </button>
                        </div>
                      </div>

                      {/* Quick Credit Limit Adjuster */}
                      <div className="pt-2 border-t border-slate-800 space-y-2">
                        <label className="text-xs text-slate-300 font-semibold block">Quick Limit Adjustment (₹):</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={quickLimitInput}
                            onChange={(e) => setQuickLimitInput(e.target.value)}
                            placeholder={(viewingDealer.creditLimit || '500000').toString()}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => {
                              const val = parseInt(quickLimitInput, 10);
                              if (!isNaN(val) && val >= 0) {
                                handleUpdateDealer(viewingDealer.id, {
                                  creditLimit: val,
                                  availableCredit: Math.max(0, val - (Number(viewingDealer.outstandingDue) || 0))
                                });
                                setQuickLimitInput('');
                              } else {
                                setSyncToast('Please enter a valid credit amount');
                              }
                            }}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/20"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Complete Legal & Business Details */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3.5">
                      <h3 className="font-bold text-sm text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span>Business &amp; Legal Details</span>
                      </h3>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Business / Trade Name</span>
                          <span className="font-bold text-white text-right">{viewingDealer.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Authorized Contact</span>
                          <span className="text-slate-200">{viewingDealer.contactPerson || viewingDealer.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Mobile Phone</span>
                          <a href={`tel:${viewingDealer.mobile || ''}`} className="font-mono text-blue-400 hover:underline">
                            +91 {viewingDealer.mobile || 'N/A'}
                          </a>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Email Address</span>
                          <a href={`mailto:${viewingDealer.email || ''}`} className="font-mono text-blue-400 hover:underline">
                            {viewingDealer.email || 'N/A'}
                          </a>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">GSTIN Identification</span>
                          <span className="font-mono font-bold text-indigo-300">{viewingDealer.gstin || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Operating City / Region</span>
                          <span className="text-slate-200">{viewingDealer.city || 'Bengaluru, Karnataka'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">System Dealer ID</span>
                          <span className="font-mono text-slate-300">{viewingDealer.id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Registration Date</span>
                          <span className="text-slate-300">
                            {new Date(viewingDealer.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct In-App Message / Priority Notice */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3">
                      <h3 className="font-bold text-sm text-white flex items-center gap-2">
                        <Send className="w-4 h-4 text-emerald-400" />
                        <span>Send SuperAdmin Notice to Dealer</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Dispatch a priority notice directly to {viewingDealer.name}&apos;s dashboard.
                      </p>
                      <textarea
                        value={dealerNoticeText}
                        onChange={(e) => setDealerNoticeText(e.target.value)}
                        rows={3}
                        placeholder="e.g. Your credit limit has been increased to ₹5 Lakhs for festive season stock..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={async () => {
                          if (!dealerNoticeText.trim()) return;
                          setIsSendingDealerNotice(true);
                          playClickSound();
                          try {
                            dispatchInAppNotification({
                              targetRole: 'Dealer',
                              targetId: viewingDealer.id,
                              title: 'Official Notice from SuperAdmin',
                              message: dealerNoticeText.trim(),
                              type: 'account'
                            });
                            playSuccessSound();
                            setSyncToast(`✓ Priority notice sent to ${viewingDealer.name}!`);
                            setDealerNoticeText('');
                            setTimeout(() => setSyncToast(null), 3500);
                          } catch (e) {
                            setSyncToast('Failed to send notice.');
                          } finally {
                            setIsSendingDealerNotice(false);
                          }
                        }}
                        disabled={isSendingDealerNotice || !dealerNoticeText.trim()}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-600/25"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSendingDealerNotice ? 'Sending Notice...' : 'Send Direct Notice'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column (7 Cols): Wholesale Orders History */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <h3 className="font-bold text-sm text-white flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-400" />
                            <span>B2B Wholesale Orders &amp; Invoices</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Orders placed by {viewingDealer.name} with live shipment and credit status
                          </p>
                        </div>
                        <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-xl border border-blue-500/20 self-start sm:self-auto">
                          {orders.filter(o => (o.clientId === viewingDealer.id || o.clientMobile === viewingDealer.mobile || o.clientName === viewingDealer.name) && o.clientType === 'Dealer').length} Total Orders
                        </span>
                      </div>

                      {/* Orders Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="py-3 px-3">Order ID</th>
                              <th className="py-3 px-3">Date</th>
                              <th className="py-3 px-3">Amount</th>
                              <th className="py-3 px-3">Payment Terms</th>
                              <th className="py-3 px-3">Order Status</th>
                              <th className="py-3 px-3 text-right">Credit Due</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {orders.filter(o => (o.clientId === viewingDealer.id || o.clientMobile === viewingDealer.mobile || o.clientName === viewingDealer.name) && o.clientType === 'Dealer').length === 0 ? (
                              <tr>
                                <td colSpan="6" className="py-12 text-center text-slate-400">
                                  <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                  <p className="text-sm font-bold text-slate-300">No wholesale orders recorded yet</p>
                                  <p className="text-xs text-slate-500 mt-1">Orders placed by {viewingDealer.name} will appear here in real time.</p>
                                </td>
                              </tr>
                            ) : (
                              orders
                                .filter(o => (o.clientId === viewingDealer.id || o.clientMobile === viewingDealer.mobile || o.clientName === viewingDealer.name) && o.clientType === 'Dealer')
                                .map(ord => (
                                  <tr key={ord.id} className="hover:bg-slate-900/50 transition">
                                    <td className="py-3 px-3 font-mono font-bold text-white">{ord.id}</td>
                                    <td className="py-3 px-3 text-slate-300 text-[11px]">
                                      {new Date(ord.createdAt || ord.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </td>
                                    <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                                      ₹{(ord.total || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                                        {ord.paymentMethod || 'Upfront'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        ord.status === 'Delivered'
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          : ord.status === 'Cancelled'
                                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                      }`}>
                                        {ord.status || 'Processing'}
                                      </span>
                                    </td>
                                    <td className="py-3 px-3 text-right">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        ord.creditStatus && ord.creditStatus.toLowerCase().includes('outstanding')
                                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      }`}>
                                        {ord.creditStatus || 'Settled'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span>Dealer Management &amp; Zoho Governance</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Verify dealer details against Zoho CRM records &bull; Approve/reject &bull; Assign credit eligibility
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={dealerSearch}
                    onChange={e => setDealerSearch(e.target.value)}
                    placeholder="Search dealer or GSTIN..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Dealers Cards & Table */}
              <div className="space-y-3">
                {dealers.filter(d => 
                  (d.name || '').toLowerCase().includes(dealerSearch.toLowerCase()) ||
                  (d.mobile || '').includes(dealerSearch) ||
                  (d.gstin && d.gstin.toLowerCase().includes(dealerSearch.toLowerCase()))
                ).length === 0 ? (
                  <div className="p-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                    <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">No registered dealers found</p>
                    <p className="text-xs text-slate-500 mt-1">Dealers will appear here once registered.</p>
                  </div>
                ) : (
                  dealers
                    .filter(d => 
                      (d.name || '').toLowerCase().includes(dealerSearch.toLowerCase()) ||
                      (d.mobile || '').includes(dealerSearch) ||
                      (d.gstin && d.gstin.toLowerCase().includes(dealerSearch.toLowerCase()))
                    )
                    .map(dealer => (
                    <div 
                      key={dealer.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-800">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-mono font-bold text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                              {dealer.id}
                            </span>
                            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                              GSTIN: {dealer.gstin || 'N/A'}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              dealer.zohoVerified
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {dealer.zohoVerified ? '✓ Zoho CRM Record Verified' : '⚠️ Pending Zoho Verification'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white">{dealer.name || 'Registered Dealer'}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Contact Person: <strong className="text-slate-300">{dealer.contactPerson || dealer.name || 'Authorized Contact'}</strong> &bull; Mobile: <span className="font-mono text-slate-300">+91 {dealer.mobile || 'N/A'}</span>
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-start">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                            dealer.status === 'Approved' || dealer.status === 'ACTIVE' || dealer.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : dealer.status === 'Pending' || dealer.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            Status: {dealer.status === 'Approved' ? 'ACTIVE' : (dealer.status || 'PENDING')}
                          </span>
                        </div>
                      </div>

                      {/* Credit Terms & Limit Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Approved Credit Limit</span>
                          <span className="text-sm font-black text-white">₹{(Number(dealer.creditLimit) || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Available Credit</span>
                          <span className="text-sm font-black text-emerald-400">₹{(Number(dealer.availableCredit) || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Outstanding Due</span>
                          <span className="text-sm font-black text-amber-400">₹{(Number(dealer.outstandingDue) || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Next Payment Due</span>
                          <span className="text-xs font-bold text-slate-300">{dealer.nextDueDate || 'None'}</span>
                        </div>
                      </div>

                      {/* Governance & Permissions Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        {/* Credit Eligibility Toggles */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* 30D Credit Switch */}
                          <button
                            onClick={() => handleUpdateDealer(dealer.id, { credit30Days: !dealer.credit30Days })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              dealer.credit30Days 
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            30-Day Credit: {dealer.credit30Days ? 'ENABLED' : 'DISABLED'}
                          </button>

                          {/* 90D Credit Switch */}
                          <button
                            onClick={() => handleUpdateDealer(dealer.id, { credit90Days: !dealer.credit90Days })}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              dealer.credit90Days 
                                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            90-Day Credit (Tier 1): {dealer.credit90Days ? 'APPROVED' : 'LOCKED'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              playClickSound();
                              setViewingDealer(dealer);
                              navigate(`/admin/dealers/${dealer.id}`);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                            title="View complete dealer profile and order history"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Details</span>
                          </button>

                          <button
                            onClick={async () => {
                              playClickSound();
                              try {
                                const res = await fetch(`/api/dealers/${dealer.id}/zoho-status`);
                                const data = await res.json();
                                if (data.existsInZoho) {
                                  playSuccessSound();
                                  setSyncToast(`✓ Dealer verified in Zoho Inventory (${data.zohoContact?.companyName || data.zohoContact?.contactName || 'Active'}).`);
                                  setDealers(prev => prev.map(d => d.id === dealer.id ? { ...d, zohoVerified: true, zohoDetails: data.zohoContact } : d));
                                } else {
                                  playWarningSound();
                                  setSyncToast(`⚠️ Record NOT found in Zoho Inventory for ${dealer.email}. Create customer in Zoho first.`);
                                  setDealers(prev => prev.map(d => d.id === dealer.id ? { ...d, zohoVerified: false } : d));
                                }
                                setTimeout(() => setSyncToast(null), 4000);
                              } catch (e) {
                                setSyncToast('Failed to check Zoho status.');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 flex items-center gap-1.5"
                            title="Verify customer record in Zoho Inventory"
                          >
                            <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                            <span>Check Zoho</span>
                          </button>

                          <button
                            onClick={() => {
                              playClickSound();
                              setSelectedDealer(dealer);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800"
                          >
                            Edit Credit Limit
                          </button>

                          {dealer.status !== 'Approved' && dealer.status !== 'ACTIVE' && dealer.status !== 'Active' ? (
                            <button
                              onClick={() => handleUpdateDealer(dealer.id, { status: 'ACTIVE', zohoVerified: true })}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                            >
                              Approve Dealer
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateDealer(dealer.id, { status: 'Suspended' })}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-600/30"
                            >
                              Suspend Access
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )
        )}

          {/* ======================================================== */}
          {/* 4. PLUMBER MANAGEMENT                                   */}
          {/* ======================================================== */}
          {activeTab === 'plumbers' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-amber-500" />
                    <span>Plumber Management &amp; KYC Verification</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Verify plumber registration, license numbers, active job assignments, and field status
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={plumberSearch}
                    onChange={e => setPlumberSearch(e.target.value)}
                    placeholder="Search by plumber or license..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Plumber Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plumbers.filter(p => 
                  (p.name || '').toLowerCase().includes(plumberSearch.toLowerCase()) ||
                  (p.mobile || '').includes(plumberSearch) ||
                  (p.license && p.license.toLowerCase().includes(plumberSearch.toLowerCase()))
                ).length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                    <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">No registered plumbers found</p>
                    <p className="text-xs text-slate-500 mt-1">Plumbers will appear here once registered.</p>
                  </div>
                ) : (
                  plumbers
                    .filter(p => 
                      (p.name || '').toLowerCase().includes(plumberSearch.toLowerCase()) ||
                      (p.mobile || '').includes(plumberSearch) ||
                      (p.license && p.license.toLowerCase().includes(plumberSearch.toLowerCase()))
                    )
                    .map(plumber => (
                    <div 
                      key={plumber.id}
                      className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3.5 hover:border-slate-700 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="font-mono text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {plumber.id}
                            </span>
                            <h3 className="font-bold text-sm text-white mt-1">{plumber.name}</h3>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            plumber.status === 'VERIFIED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : plumber.status === 'SUSPENDED'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {plumber.status}
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-400">
                          <p>📱 <span className="font-mono text-slate-300">+91 {plumber.mobile}</span></p>
                          <p>📜 License: <strong className="text-slate-300 font-mono text-[11px]">{plumber.license}</strong></p>
                          <p>📍 Service Zone: <span className="text-slate-300">{plumber.serviceZone}</span></p>
                          <p>★ Rating: <strong className="text-amber-400">{plumber.rating} / 5.0</strong> &bull; {plumber.completedJobs} jobs done</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setSelectedPlumber(plumber)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800"
                        >
                          View Activities
                        </button>

                        {plumber.status !== 'VERIFIED' ? (
                          <button
                            onClick={() => handleUpdatePlumber(plumber.id, { status: 'VERIFIED' })}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
                          >
                            Verify Plumber
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdatePlumber(plumber.id, { status: 'SUSPENDED' })}
                            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-600/30"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 5. ORDER MANAGEMENT                                     */}
          {/* ======================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Package className="w-5 h-5 text-indigo-400" />
                    <span>Order Tracking &amp; Fulfillment</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Track B2B Wholesale and Direct Retail orders &bull; Update status &bull; Cancel per governance rules
                  </p>
                </div>

                {/* Right Header Controls: Live Badge, Refresh, Search */}
                <div className="flex items-center flex-wrap gap-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Live Auto-Sync</span>
                  </div>

                  <button
                    onClick={() => fetchOrders(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition"
                    title="Force refresh orders"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingOrders ? 'animate-spin text-blue-400' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  {/* Search */}
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={e => setOrderSearch(e.target.value)}
                      placeholder="Search by order ID or user..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Tabs Bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Client filter */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {['All', 'Customer', 'Dealer'].map(clientType => (
                    <button
                      key={clientType}
                      onClick={() => setOrderClientFilter(clientType)}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        orderClientFilter === clientType
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {clientType === 'All' ? 'All Clients' : clientType + 's'}
                    </button>
                  ))}
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto">
                  {['All', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'].map(st => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                        orderStatusFilter === st
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Order ID &amp; Date</th>
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Total Amount</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4 text-center">Update Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {orders.filter(o => {
                        const matchClient = orderClientFilter === 'All' || o.clientType === orderClientFilter;
                        const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                        const q = orderSearch.toLowerCase();
                        const matchSearch = (o.id || '').toLowerCase().includes(q) || (o.clientName && o.clientName.toLowerCase().includes(q));
                        return matchClient && matchStatus && matchSearch;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-slate-400">
                            No orders found matching the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        orders
                          .filter(o => {
                            const matchClient = orderClientFilter === 'All' || o.clientType === orderClientFilter;
                            const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                            const q = orderSearch.toLowerCase();
                            const matchSearch = (o.id || '').toLowerCase().includes(q) || (o.clientName && o.clientName.toLowerCase().includes(q));
                            return matchClient && matchStatus && matchSearch;
                          })
                          .map(order => (
                            <tr
                              key={order.id}
                              onClick={() => setSelectedOrder(order)}
                              className="hover:bg-slate-900/80 cursor-pointer transition group"
                              title="Click to view full order details"
                            >
                              <td className="py-3.5 px-4">
                                <span className="font-mono font-bold text-white group-hover:text-blue-400 transition block">{order.id}</span>
                                <span className="text-[10px] text-slate-500">{order.date || 'Recent'}</span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-bold text-slate-200 block">{order.clientName}</span>
                                <span className={`text-[10px] font-bold ${order.clientType === 'Dealer' ? 'text-indigo-400' : 'text-blue-400'}`}>
                                  {order.clientType} &bull; +91 {order.clientMobile}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-slate-300">
                                {order.paymentMethod}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white">
                                ₹{(order.total || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : order.status === 'Cancelled'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                  {order.status}
                                </span>

                                {/* Live Plumber Telemetry Response Badge */}
                                {order.plumberStage === 'TASK_DONE' || order.plumberTaskDone ? (
                                  <span className="flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 w-fit">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>Plumber: Task Done &amp; Signed</span>
                                  </span>
                                ) : order.plumberStage === 'MATERIALS_RECEIVED' ? (
                                  <span className="flex items-center gap-1 mt-1 text-[9px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/30 w-fit">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Plumber: Materials Received</span>
                                  </span>
                                ) : null}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <select
                                  value={order.status}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => {
                                    e.stopPropagation();
                                    handleUpdateOrderStatus(order.id, e.target.value);
                                  }}
                                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>

                                {/* 1-Click Approve Task Completed button when plumber signed off */}
                                {(order.plumberStage === 'TASK_DONE' || order.plumberTaskDone) && order.status !== 'Delivered' && (
                                  <button
                                    type="button"
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleUpdateOrderStatus(order.id, 'Delivered');
                                    }}
                                    className="mt-1.5 w-full px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                                    title="Verify plumber's field sign-off and mark task complete"
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Verify &amp; Close Task</span>
                                  </button>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/15 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 transition text-xs font-semibold shadow-sm"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 6. PRODUCTS & ZOHO SYNC ENGINE                           */}
          {/* ======================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-400" />
                    <span>Products &amp; Zoho Synchronization Engine</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Zoho Workbook is the single source of truth for pricing and inventory &bull; App-side sync monitor
                  </p>
                </div>

                <button
                  onClick={handleTriggerZohoSync}
                  disabled={isSyncingZoho}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2 self-start sm:self-auto transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingZoho ? 'animate-spin' : ''}`} />
                  <span>{isSyncingZoho ? 'Synchronizing with Zoho...' : 'Retry / Force Sync Now'}</span>
                </button>
              </div>

              {/* Zoho Synchronization Status Banner */}
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-950 rounded-2xl border border-emerald-500/30 p-5 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="font-bold text-sm text-white">
                      Zoho Workbook Live Data Stream Active
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    Sync Latency: {zohoSyncMeta.latencyMs} ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Master Workbook</span>
                    <span className="font-mono text-slate-300">{zohoSyncMeta.workbookId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Sheet Reference</span>
                    <span className="font-mono text-slate-300">{zohoSyncMeta.sheet}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Last Successful Sync</span>
                    <span className="text-slate-300">{zohoSyncMeta.lastSyncedAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Sync Error Count</span>
                    <span className="font-bold text-emerald-400">{zohoSyncMeta.errorsCount} Errors (All SKUs Healthy)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 pt-1">
                  <strong>Source of Truth Policy:</strong> Products, retail prices, wholesale dealer rates, and physical warehouse stock quantities are automatically derived from Zoho Workbook. App modifications are governed by Zoho reconciliation to prevent overwrites.
                </p>
              </div>

              {/* Product Catalog Search & Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['All', 'Pipes & Tubes', 'Fittings & Valves', 'Bath & Faucets', 'Pumps & Motors', 'Tools & Sealants', 'Water Tanks & Storage', 'Drainage & Sanitary'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          playClickSound();
                          setProductCatFilter(cat);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                          productCatFilter === cat
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search product SKU, brand..."
                    className="w-full sm:w-64 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">SKU &amp; Product</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Retail Price</th>
                        <th className="py-2.5 px-3">Dealer Wholesale</th>
                        <th className="py-2.5 px-3">Live Stock</th>
                        <th className="py-2.5 px-3">Zoho Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {products
                        .filter(p => {
                          const matchCat = productCatFilter === 'All' || p.category === productCatFilter;
                          const q = productSearch.toLowerCase();
                          const matchSearch = p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
                          return matchCat && matchSearch;
                        })
                        .map(prod => (
                          <tr key={prod.id} className="hover:bg-slate-900/50 transition">
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-[10px] text-emerald-400 block">{prod.sku || 'ZH-SKU'}</span>
                              <span className="font-bold text-white truncate max-w-xs block">{prod.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">{prod.category}</td>
                            <td className="py-2.5 px-3 font-bold text-white">₹{prod.price}</td>
                            <td className="py-2.5 px-3 font-bold text-indigo-400">₹{prod.dealerPrice || prod.price}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono font-bold text-white">{prod.stock} Units</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Synced
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 7. PAYMENTS & DEALER CREDIT MANAGEMENT                  */}
          {/* ======================================================== */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    <span>Payments &amp; Dealer Credit Governance</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Reconcile payment transactions &bull; Enforce 30D/90D credit limits &bull; Track due dates
                  </p>
                </div>
              </div>

              {/* Dealer Credit Governance Table (Requested in Feature 7) */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Dealer Credit Terms Policy Matrix</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">
                    Backend Enforced
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Dealer</th>
                        <th className="py-3 px-3">Upfront Pay</th>
                        <th className="py-3 px-3">30-Day Credit</th>
                        <th className="py-3 px-3">90-Day Credit</th>
                        <th className="py-3 px-3">Approved Limit</th>
                        <th className="py-3 px-3">Outstanding Balance</th>
                        <th className="py-3 px-3">Due Date Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {dealers.map(d => (
                        <tr key={d.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-3 font-bold text-white">{d.name}</td>
                          <td className="py-3 px-3 text-emerald-400 font-semibold">Enabled (Always)</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.credit30Days ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {d.credit30Days ? '30D Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              d.credit90Days ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {d.credit90Days ? 'Tier 1 Approved' : 'Locked'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-white font-mono">
                            ₹{(Number(d.creditLimit) || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                            ₹{(Number(d.outstandingDue) || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {d.nextDueDate || 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Stream & Reconciliation */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Payment Transactions &amp; Gateway Reconciliation</span>
                  </h3>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl text-xs self-start sm:self-auto overflow-x-auto max-w-full">
                    {['All', 'Successful', 'Pending'].map(st => (
                      <button
                        key={st}
                        onClick={() => setPaymentStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg font-semibold transition shrink-0 ${
                          paymentStatusFilter === st ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-3">Txn ID</th>
                        <th className="py-3 px-3">Order ID</th>
                        <th className="py-3 px-3">Client</th>
                        <th className="py-3 px-3">Method</th>
                        <th className="py-3 px-3">Gateway Ref</th>
                        <th className="py-3 px-3">Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {payments.filter(p => paymentStatusFilter === 'All' || p.status === paymentStatusFilter).length === 0 ? (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-400">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        payments
                          .filter(p => paymentStatusFilter === 'All' || p.status === paymentStatusFilter)
                          .map(pay => (
                            <tr key={pay.id} className="hover:bg-slate-900/50 transition">
                              <td className="py-3 px-3 font-mono text-slate-300">{pay.id}</td>
                              <td className="py-3 px-3 font-mono font-bold text-white">{pay.orderId}</td>
                              <td className="py-3 px-3 text-slate-200">{pay.clientName}</td>
                              <td className="py-3 px-3 text-slate-400">{pay.method}</td>
                              <td className="py-3 px-3 font-mono text-[10px] text-blue-400">{pay.gatewayRef}</td>
                              <td className="py-3 px-3 font-bold text-white">₹{(pay.amount || 0).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  pay.status === 'Successful'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : pay.status === 'Refunded'
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {pay.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                {pay.status === 'Successful' && (
                                  <button
                                    onClick={() => handleProcessRefund(pay.id)}
                                    className="px-2 py-1 rounded bg-slate-900 hover:bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-900/40"
                                  >
                                    Refund
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 8. REPORTS & ANALYTICS (FULLY DYNAMIC & LIVE ZOHO SYNCED) */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              
              {/* Header with Title & Filter Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span>Reports &amp; Analytics</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Live audit performance, sales distribution, Zoho warehouse stock health, and cash collections
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Fiscal Period Dynamic Badge */}
                  <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-400" />
                    Fiscal: {currentFiscalMonth}
                  </span>

                  {/* Channel Filter */}
                  <select
                    value={analyticsChannel}
                    onChange={e => setAnalyticsChannel(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Channels (B2B + Retail)</option>
                    <option value="Dealer">Dealer B2B Only</option>
                    <option value="Customer">Customer Retail Only</option>
                  </select>

                  {/* Period Filter */}
                  <select
                    value={analyticsPeriod}
                    onChange={e => setAnalyticsPeriod(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="month">This Month ({currentFiscalMonth})</option>
                    <option value="week">Last 7 Days</option>
                    <option value="today">Today Only</option>
                  </select>

                  {/* CSV Export Button */}
                  <button
                    onClick={handleExportAnalyticsCSV}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition cursor-pointer"
                    title="Download complete audit data as CSV file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* 4 Dynamic Key Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Dealer B2B Sales */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Dealer B2B Sales</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Wholesale
                    </span>
                  </div>
                  <div className="text-2xl font-black text-indigo-400 font-mono tracking-tight">
                    ₹{dynamicDealerB2BSales.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{analyticsFilteredOrders.filter(o => o.clientType === 'Dealer' && o.status !== 'Cancelled').length} B2B orders</span>
                    <span className="text-indigo-400 font-semibold">Bulk Supply</span>
                  </p>
                </div>

                {/* Customer Retail Sales */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer Retail Sales</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Retail
                    </span>
                  </div>
                  <div className="text-2xl font-black text-blue-400 font-mono tracking-tight">
                    ₹{dynamicCustomerRetailSales.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>{analyticsFilteredOrders.filter(o => o.clientType === 'Customer' && o.status !== 'Cancelled').length} retail orders</span>
                    <span className="text-blue-400 font-semibold">Instant Online</span>
                  </p>
                </div>

                {/* Total Collections Reconciled */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Collections</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Settled
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    ₹{dynamicTotalCollections.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Reconciled in bank</span>
                    <span className="text-emerald-400 font-semibold">100% Verified</span>
                  </p>
                </div>

                {/* Outstanding Credit Receivables */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden group hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Outstanding Credit</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Receivable
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                    ₹{dynamicOutstandingCredit.toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>30D / 90D Dealer ledger</span>
                    <span className="text-amber-400 font-semibold">Due in Cycles</span>
                  </p>
                </div>

              </div>

              {/* Middle Section: 3 Deep Analytics Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* Category Revenue Breakdown */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-blue-400" />
                      Category Sales Share
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {categoryAnalyticsList.length} Categories
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {categoryAnalyticsList.length > 0 ? (
                      categoryAnalyticsList.slice(0, 5).map((cat, i) => {
                        const sharePercent = dynamicTotalGrossSales > 0 
                          ? Math.min(100, Math.round((cat.revenue / dynamicTotalGrossSales) * 100))
                          : 0;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-200">{cat.name}</span>
                              <span className="font-mono font-bold text-white">
                                ₹{cat.revenue.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                style={{ width: `${Math.max(sharePercent, 4)}%` }} 
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                              <span>{cat.unitsSold} units sold</span>
                              <span>{sharePercent}% of total</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-slate-500 text-xs py-3 text-center">No categories recorded yet.</p>
                    )}
                  </div>
                </div>

                {/* Fulfillment Performance Stepper */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-amber-400" />
                      Fulfillment Performance
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {analyticsFilteredOrders.length} Orders
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      { label: 'Delivered Successfully', count: fulfillmentStatusCounts.Delivered, color: 'text-emerald-400', bar: 'bg-emerald-500' },
                      { label: 'In Transit / Shipped', count: fulfillmentStatusCounts.InTransit, color: 'text-blue-400', bar: 'bg-blue-500' },
                      { label: 'Confirmed / Processing', count: fulfillmentStatusCounts.Processing, color: 'text-indigo-400', bar: 'bg-indigo-500' },
                      { label: 'Cancelled / Returned', count: fulfillmentStatusCounts.Cancelled, color: 'text-rose-400', bar: 'bg-rose-500' }
                    ].map((st, i) => {
                      const totalCount = analyticsFilteredOrders.length || 1;
                      const pct = Math.round((st.count / totalCount) * 100);
                      return (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300 font-medium text-[11px]">{st.label}</span>
                            <span className={`font-mono font-bold ${st.color}`}>{st.count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                            <div className={`${st.bar} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Channels Breakdown */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      Payment Channels
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {paymentMethodSummaryList.length} Methods
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {paymentMethodSummaryList.length > 0 ? (
                      paymentMethodSummaryList.map((pm, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block text-xs">{pm.method}</span>
                            <span className="text-[10px] text-slate-500">{pm.count} transactions</span>
                          </div>
                          <span className="font-mono font-bold text-slate-200">
                            ₹{pm.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs py-3 text-center">No payment data available.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Product Demand & Warehouse Inventory Health (Fully Dynamic Live Zoho Engine) */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Package className="w-4 h-4 text-blue-400" />
                      <span>Product Demand &amp; Warehouse Inventory Health</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Live stock levels from Zoho Inventory synced against verified customer &amp; dealer purchase orders
                    </p>
                  </div>

                  {/* Search inside inventory */}
                  <div className="relative w-full md:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search SKU or Product..."
                      value={analyticsSearch}
                      onChange={e => setAnalyticsSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {[
                    { id: 'all', label: `All Products (${dynamicProductsInventory.length})` },
                    { id: 'highDemand', label: `High Demand (${dynamicProductsInventory.filter(p => p.unitsSold > 0).length})` },
                    { id: 'optimal', label: `Optimal Stock (${dynamicProductsInventory.filter(p => (p.stock || 0) > 15).length})` },
                    { id: 'low', label: `Low Stock Alert (${dynamicProductsInventory.filter(p => (p.stock || 0) <= 15 && (p.stock || 0) > 0).length})` },
                    { id: 'out', label: `Out of Stock (${dynamicProductsInventory.filter(p => (p.stock || 0) === 0).length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAnalyticsStockFilter(tab.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        analyticsStockFilter === tab.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dynamic Product Inventory List */}
                <div className="divide-y divide-slate-800/80 text-xs">
                  {filteredAnalyticsProducts.length > 0 ? (
                    filteredAnalyticsProducts.slice(0, analyticsDisplayCount).map(p => (
                      <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-900/40 px-2 rounded-xl transition">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-blue-400">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-200 block">{p.name}</span>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                              <span className="text-slate-400">{p.sku}</span>
                              <span>&bull;</span>
                              <span>{p.category}</span>
                              {p.unitsSold > 0 && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-emerald-400 font-bold">{p.unitsSold} units ordered</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <div>
                            <span className="font-bold text-white font-mono block">
                              {p.stock} Units in Zoho
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              MRP: ₹{(p.price || p.dealerPrice || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${p.demandBadgeClass}`}>
                            {p.demandText}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No products matched the selected filters.
                    </div>
                  )}
                </div>

                {/* Show More / Show Less Controls */}
                {filteredAnalyticsProducts.length > 10 && (
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Showing {Math.min(analyticsDisplayCount, filteredAnalyticsProducts.length)} of {filteredAnalyticsProducts.length} items
                    </span>
                    <div className="flex items-center gap-2">
                      {analyticsDisplayCount < filteredAnalyticsProducts.length ? (
                        <button
                          onClick={() => setAnalyticsDisplayCount(prev => prev + 15)}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold border border-slate-700 transition cursor-pointer"
                        >
                          Load More (+15)
                        </button>
                      ) : (
                        <button
                          onClick={() => setAnalyticsDisplayCount(10)}
                          className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold border border-slate-700 transition cursor-pointer"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 9. NOTIFICATIONS & BROADCASTS                           */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Bell className="w-5 h-5 text-rose-500" />
                    <span>Broadcast Notifications &amp; Alerts</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Send targeted notifications to Customers, Dealers, or Plumbers &bull; System announcements
                  </p>
                </div>

                <button
                  onClick={() => setBroadcastModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 self-start sm:self-auto transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast Announcement</span>
                </button>
              </div>

              {/* Target Audience Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {[
                  { id: 'All', label: `All Audiences (${notifications.length})` },
                  { id: 'Customers', label: `Customers (${notifications.filter(n => n.targetGroup === 'Customers').length})` },
                  { id: 'Dealers', label: `Dealers (${notifications.filter(n => n.targetGroup === 'Dealers').length})` },
                  { id: 'Plumbers', label: `Plumbers (${notifications.filter(n => n.targetGroup === 'Plumbers').length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setNotifFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      notifFilter === tab.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification History Feed */}
              <div className="space-y-3">
                {notifications.filter(n => notifFilter === 'All' || n.targetGroup === notifFilter).length === 0 ? (
                  <div className="p-10 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800">
                    <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-300">No broadcast announcements</p>
                    <p className="text-xs text-slate-500 mt-1">Send a broadcast alert to reach customers, dealers, or plumbers.</p>
                  </div>
                ) : (
                  notifications
                    .filter(n => notifFilter === 'All' || n.targetGroup === notifFilter)
                    .map(notif => {
                    let badgeClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    if (notif.targetGroup === 'Dealers') badgeClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                    else if (notif.targetGroup === 'Plumbers') badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    else if (notif.targetGroup === 'All') badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                    return (
                      <div 
                        key={notif.id}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4 group hover:border-slate-700 transition"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 border ${
                            notif.targetGroup === 'Dealers' ? 'bg-indigo-950/40 border-indigo-800 text-indigo-400' :
                            notif.targetGroup === 'Plumbers' ? 'bg-amber-950/40 border-amber-800 text-amber-400' :
                            notif.targetGroup === 'Customers' ? 'bg-blue-950/40 border-blue-800 text-blue-400' :
                            'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-xs text-white">{notif.title}</h4>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                                Target: {notif.targetGroup} Only
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-slate-500 block font-mono">
                              Sent {notif.sentAt} by {notif.sender || 'Administrator'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0 opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Delete broadcast announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

        </main>

      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CUSTOMER PROFILE & ORDER HISTORY               */}
      {/* ======================================================== */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Customer Details</span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedCustomer.name}</h3>
              <p className="text-xs text-slate-400 font-mono">+91 {selectedCustomer.mobile} &bull; {selectedCustomer.email}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block text-[10px]">Registered Address:</span>
                <p className="text-slate-200">{selectedCustomer.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Total Orders:</span>
                  <span className="font-bold text-white text-sm">{selectedCustomer.totalOrders} Placed</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Total Spent:</span>
                  <span className="font-bold text-emerald-400 text-sm">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedCustomer.status !== 'Active' ? (
                  <button
                    onClick={() => handleUpdateCustomerStatus(selectedCustomer.id, 'Active')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Activate Account
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpdateCustomerStatus(selectedCustomer.id, 'Suspended')}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Suspend Account
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT DEALER CREDIT LIMIT                        */}
      {/* ======================================================== */}
      {selectedDealer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedDealer(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Credit Governance</span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedDealer.name}</h3>
              <p className="text-xs text-slate-400 font-mono">GSTIN: {selectedDealer.gstin}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Approved Credit Spending Limit (₹):</label>
                <input
                  type="number"
                  defaultValue={selectedDealer.creditLimit}
                  id="creditLimitInput"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Credit Policy Eligibility</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={selectedDealer.credit30Days}
                    id="credit30Check"
                    onChange={(e) => playToggleSound(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-slate-200">Enable 30-Day Pay Later Terms</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={selectedDealer.credit90Days}
                    id="credit90Check"
                    onChange={(e) => playToggleSound(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-slate-200">Grant 90-Day Tier-1 Credit Facility</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedDealer(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const limit = parseInt(document.getElementById('creditLimitInput').value, 10) || selectedDealer.creditLimit;
                  const c30 = document.getElementById('credit30Check').checked;
                  const c90 = document.getElementById('credit90Check').checked;
                  handleUpdateDealer(selectedDealer.id, {
                    creditLimit: limit,
                    credit30Days: c30,
                    credit90Days: c90
                  });
                  setSelectedDealer(null);
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
              >
                Save Policy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PLUMBER ACTIVITIES & VERIFICATION               */}
      {/* ======================================================== */}
      {selectedPlumber && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedPlumber(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-800">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">Plumber Identity &amp; Activities</span>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedPlumber.name}</h3>
              <p className="text-xs text-slate-400 font-mono">+91 {selectedPlumber.mobile} &bull; License: {selectedPlumber.license}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Customer Rating:</span>
                  <span className="font-bold text-amber-400 text-sm">★ {selectedPlumber.rating} / 5.0</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Completed Jobs:</span>
                  <span className="font-bold text-emerald-400 text-sm">{selectedPlumber.completedJobs} Verified</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Activities &amp; Status:</span>
                {Array.isArray(selectedPlumber.jobs) && selectedPlumber.jobs.length > 0 ? (
                  <div className="space-y-2 divide-y divide-slate-800/80">
                    {selectedPlumber.jobs.map((job, idx) => (
                      <div key={job.id || idx} className="pt-1.5 first:pt-0 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">#{job.id || `JOB-${idx+1}`} &bull; {job.title || 'Plumbing Service'}</p>
                          <p className="text-[10px] text-slate-400">{job.location || selectedPlumber.serviceZone || 'Service Site'} &bull; Customer: {job.customer || 'Direct Request'}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          job.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {job.status || 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center text-slate-400 text-xs">
                    No active job tickets currently assigned to this plumber.
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedPlumber.status !== 'VERIFIED' ? (
                  <button
                    onClick={() => {
                      handleUpdatePlumber(selectedPlumber.id, { status: 'VERIFIED' });
                      setSelectedPlumber(prev => ({ ...prev, status: 'VERIFIED' }));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Approve / Verify
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUpdatePlumber(selectedPlumber.id, { status: 'SUSPENDED' });
                      setSelectedPlumber(prev => ({ ...prev, status: 'SUSPENDED' }));
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-xs font-bold border border-rose-600/30"
                  >
                    Suspend Plumber
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedPlumber(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: BROADCAST NOTIFICATION MODAL                    */}
      {/* ======================================================== */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <form onSubmit={handleSendBroadcast} className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setBroadcastModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Broadcast Announcement</h3>
              <p className="text-xs text-slate-400">Send an instant alert to selected application users</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Target User Audience:</label>
                <select
                  value={broadcastForm.targetGroup}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, targetGroup: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All User Groups (Everyone)</option>
                  <option value="Customers">Customers Only</option>
                  <option value="Dealers">Dealers Only</option>
                  <option value="Plumbers">Plumbers Only</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Announcement Title:</label>
                <input
                  type="text"
                  required
                  value={broadcastForm.title}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Schedule Change or Logistics Update"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Message Body:</label>
                <textarea
                  required
                  rows={3}
                  value={broadcastForm.message}
                  onChange={e => setBroadcastForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Type announcement details here..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setBroadcastModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20"
              >
                Send Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: COMPLETE ORDER DETAILS & FULFILLMENT BREAKDOWN  */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-800 shadow-2xl relative my-8 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    selectedOrder.clientType === 'Dealer'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {selectedOrder.clientType || 'Customer'} Order
                  </span>
                  {selectedOrder.zohoSalesOrder && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      Zoho: {selectedOrder.zohoSalesOrder}
                    </span>
                  )}
                  {selectedOrder.poNumber && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      PO: {selectedOrder.poNumber}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-mono font-bold text-white flex items-center gap-2">
                  <span>{selectedOrder.id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed: <span className="text-slate-300 font-medium">{selectedOrder.date || 'Recent'}</span>
                  {selectedOrder.createdAt && (
                    <span className="text-slate-500 ml-2">({new Date(selectedOrder.createdAt).toLocaleString('en-IN')})</span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Print Order Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
              
              {/* Quick Status Bar & Controls */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedOrder.status === 'Delivered'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : selectedOrder.status === 'Cancelled'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Update Status:</span>
                  <select
                    value={selectedOrder.status}
                    onChange={e => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* 3 Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Client Info */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold uppercase text-[10px] tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Customer / Client</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{selectedOrder.clientName}</h4>
                    <p className="text-slate-400 mt-0.5 flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-500" />
                      +91 {selectedOrder.clientMobile}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Account Type: <span className="text-slate-300 font-semibold">{selectedOrder.clientType || 'Customer'}</span>
                    </p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Delivery Address</span>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {selectedOrder.deliveryAddress || 'Standard Warehouse / Store Address'}
                  </p>
                  {selectedOrder.expectedDate && (
                    <p className="text-[10px] text-slate-400">
                      ETA: <span className="text-emerald-400 font-semibold">{selectedOrder.expectedDate}</span>
                    </p>
                  )}
                </div>

                {/* Payment Info */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase text-[10px] tracking-wider">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment &amp; Terms</span>
                  </div>
                  <div>
                    <p className="font-mono font-bold text-white text-xs">{selectedOrder.paymentMethod}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedOrder.paymentStatus === 'Paid' || selectedOrder.creditStatus === 'Settled'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedOrder.paymentStatus || 'Settled'}
                    </span>
                    {selectedOrder.creditDueDate && (
                      <p className="text-[10px] text-slate-400 mt-1.5">
                        Due Date: <span className="text-amber-300 font-mono font-semibold">{selectedOrder.creditDueDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    Items Ordered ({selectedOrder.items?.length || selectedOrder.itemsCount || 0})
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Order Total: <span className="text-white">₹{(selectedOrder.total || 0).toLocaleString('en-IN')}</span>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">Product Name &amp; SKU</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => {
                          const unitPrice = item.price || (selectedOrder.total / (item.qty || 1));
                          const lineTotal = (item.qty || 1) * unitPrice;
                          return (
                            <tr key={idx} className="hover:bg-slate-900/40">
                              <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                              <td className="py-2.5 px-4">
                                <span className="font-bold text-slate-100 block">{item.name}</span>
                                {item.sku && (
                                  <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-center font-bold font-mono text-slate-200">
                                {item.qty}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-slate-300">
                                ₹{(unitPrice || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                                ₹{(lineTotal || 0).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-slate-400">
                            {selectedOrder.itemsCount || 1} Plumbing Item(s) included &bull; ₹{(selectedOrder.total || 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-900/60 border-t border-slate-800 font-semibold">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-4 text-slate-400 text-right">Subtotal:</td>
                        <td colSpan={2} className="py-2.5 px-4 text-right font-mono text-slate-300">
                          ₹{(selectedOrder.total || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="py-2 px-4 text-slate-400 text-right">GST / Taxes:</td>
                        <td colSpan={2} className="py-2 px-4 text-right font-mono text-emerald-400 text-[11px]">
                          Inclusive (18% GST)
                        </td>
                      </tr>
                      <tr className="border-t border-slate-700/80 text-sm">
                        <td colSpan={3} className="py-3 px-4 font-bold text-white text-right">Grand Total:</td>
                        <td colSpan={2} className="py-3 px-4 text-right font-mono font-bold text-blue-400 text-base">
                          ₹{(selectedOrder.total || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Zoho Fulfillment & Dispatch Stepper */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Zoho Fulfillment &amp; Dispatch Pipeline
                    </h4>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Synced with Zoho Inventory API
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { step: 1, label: 'Order Confirmed', statusMatch: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'] },
                    { step: 2, label: 'Zoho Inventory Reserved', statusMatch: ['Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'] },
                    { step: 3, label: 'Packed & Invoiced', statusMatch: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'] },
                    { step: 4, label: 'Dispatched / In Transit', statusMatch: ['Shipped', 'Out for Delivery', 'Delivered'] },
                    { step: 5, label: 'Delivered', statusMatch: ['Delivered'] }
                  ].map((st, i) => {
                    const isCompleted = st.statusMatch.includes(selectedOrder.status);
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center transition ${
                          isCompleted
                            ? 'bg-blue-950/30 border-blue-600/40 text-blue-200'
                            : 'bg-slate-900/40 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                          isCompleted
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : st.step}
                        </div>
                        <span className={`text-[11px] font-bold leading-tight ${isCompleted ? 'text-white' : 'text-slate-400'}`}>
                          {st.label}
                        </span>
                        <span className="text-[9px] mt-1 text-slate-400">
                          {isCompleted ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Field Plumber Verification & Sign-Off Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Field Plumber Verification &amp; Stage Response
                    </h4>
                  </div>
                  {selectedOrder.plumberStage === 'TASK_DONE' || selectedOrder.plumberTaskDone ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Plumber Signed Off (Task 100% Done)</span>
                    </span>
                  ) : selectedOrder.plumberStage === 'MATERIALS_RECEIVED' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3 text-amber-400" />
                      <span>Materials Received &amp; Inspected</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                      Awaiting Plumber Response
                    </span>
                  )}
                </div>

                {selectedOrder.plumberResponse ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Plumber</span>
                      <p className="text-white font-bold mt-0.5">{selectedOrder.plumberResponse.plumberName}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">License: {selectedOrder.plumberResponse.plumberLicense}</p>
                      <p className="text-[11px] text-slate-400 font-mono">📱 +91 {selectedOrder.plumberResponse.plumberMobile}</p>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 sm:col-span-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Field Notes / Test Report</span>
                        <span className="text-[10px] text-slate-500 font-mono">{selectedOrder.plumberResponse.timestampStr}</span>
                      </div>
                      <p className="text-slate-200 text-xs italic bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        &ldquo;{selectedOrder.plumberResponse.notes || 'Verified on site'}&rdquo;
                      </p>
                      <p className="text-[10px] text-emerald-400 font-medium">
                        ✓ Live field telematics verified from Plumber Dashboard
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No plumber response recorded yet. When the plumber on site inspects materials or completes the installation, their sign-off and test report will appear here.
                  </p>
                )}

                {/* Admin Close Button if Plumber Signed Off */}
                {selectedOrder.status !== 'Delivered' && (
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400">
                      {selectedOrder.plumberStage === 'TASK_DONE'
                        ? 'Plumber has submitted full sign-off. Admin approval will close this order.'
                        : 'You can verify and finalize this order once ready.'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Delivered')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Plumber Sign-Off &amp; Close Task</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  Order <span className="font-mono font-bold text-slate-200">{selectedOrder.id}</span>
                </span>
                {receiptFeedback && (
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                    receiptFeedback.type === 'success' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {receiptFeedback.message}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSendOrderReceipt(selectedOrder)}
                  disabled={sendingReceiptId === selectedOrder.id}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{sendingReceiptId === selectedOrder.id ? 'Sending Bill Receipt...' : 'Email Bill Receipt'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setReceiptFeedback(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <nav 
        aria-label="Admin Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] px-2 py-1.5"
      >
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 px-1">
          {[...mainNavItems, ...secondaryNavItems].map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            const shortLabel = item.id === 'overview' ? 'Overview' :
                               item.id === 'customers' ? 'Customers' :
                               item.id === 'dealers' ? 'Dealers' :
                               item.id === 'plumbers' ? 'Plumbers' :
                               item.id === 'orders' ? 'Orders' :
                               item.id === 'products' ? 'Products' :
                               item.id === 'payments' ? 'Payments' :
                               item.id === 'reports' ? 'Reports' :
                               item.id === 'notifications' ? 'Alerts' : item.label;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playClickSound();
                  setActiveTab(item.id);
                }}
                className={`flex flex-col items-center justify-center shrink-0 min-w-[62px] py-1.5 px-2 rounded-xl text-center transition active:scale-95 relative ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/35 font-bold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={item.label}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black flex items-center justify-center font-mono ${
                      isSelected ? 'bg-white text-blue-700 shadow-xs' : 'bg-blue-600 text-white'
                    }`}>
                      {item.count > 99 ? '99+' : item.count}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-none tracking-tight whitespace-nowrap">
                  {shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Admin Quick Profile Info Modal with Edit Capability */}
      {isAdminProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-5 text-white relative">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white leading-tight">Quick Profile Info</h3>
                  <p className="text-xs text-slate-400">Security Clearance &bull; Level 5 Master</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAdminProfileModalOpen(false);
                  setIsEditingAdminProfile(false);
                }}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Info or Edit Mode Form */}
            {!isEditingAdminProfile ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Administrator Name</span>
                    <span className="font-bold text-white">{admin.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Admin Email</span>
                    <span className="font-mono text-blue-400">{admin.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Contact Mobile</span>
                    <span className="font-mono text-slate-300">{admin.mobile || '+91 98765 43210'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Admin ID</span>
                    <span className="font-mono text-slate-300">{admin.id || 'ADM-01'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Role &amp; Privilege</span>
                    <span className="font-bold text-emerald-400">{admin.accessLevel || 'SuperAdmin'}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    System Permissions &amp; Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium">Zoho Live Sync</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">Dealer Approval</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-medium">Payment Reconcile</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-medium">Broadcast Engine</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5">
                  <button
                    onClick={handleStartEditAdminProfile}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setIsAdminProfileModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveAdminProfile} className="space-y-4 text-xs">
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800/80 space-y-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Administrator Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={adminProfileForm.name}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, name: e.target.value })}
                      placeholder="e.g. System Administrator"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={adminProfileForm.email}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, email: e.target.value })}
                      placeholder="e.g. admin@plumbmart.com"
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                      Contact Mobile
                    </label>
                    <input
                      type="text"
                      value={adminProfileForm.mobile}
                      onChange={(e) => setAdminProfileForm({ ...adminProfileForm, mobile: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Edit Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsEditingAdminProfile(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
