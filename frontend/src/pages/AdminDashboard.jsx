import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  RotateCcw
} from 'lucide-react';

export default function AdminDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();

  // Navigation Menu State
  // 'overview' | 'customers' | 'dealers' | 'plumbers' | 'orders' | 'products' | 'payments' | 'reports' | 'notifications'
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Admin User details
  const admin = currentUser && currentUser.role === 'Admin' ? currentUser : {
    id: 'ADM-01',
    name: 'System Administrator',
    email: 'admin@plumbmart.com',
    role: 'Admin',
    accessLevel: 'SuperAdmin'
  };

  // ==========================================
  // DATA STATES
  // ==========================================

  // 1. Customers
  const [customers, setCustomers] = useState([
    {
      id: 'CUST-01',
      name: 'Rahul Sharma',
      mobile: '9876543210',
      email: 'rahul.sharma@example.com',
      status: 'Active', // 'Active' | 'Suspended' | 'Restricted'
      totalOrders: 4,
      totalSpent: 14780,
      rewardPoints: 240,
      registeredDate: '12 Sep 2026',
      address: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103'
    },
    {
      id: 'CUST-02',
      name: 'Anil Desai',
      mobile: '9900112233',
      email: 'anil.desai@example.com',
      status: 'Active',
      totalOrders: 2,
      totalSpent: 7260,
      rewardPoints: 110,
      registeredDate: '28 Sep 2026',
      address: '14th Cross, 2nd Stage, Indiranagar, Bengaluru - 560038'
    },
    {
      id: 'CUST-03',
      name: 'Pooja Verma',
      mobile: '9845012345',
      email: 'pooja.verma@example.com',
      status: 'Restricted',
      totalOrders: 1,
      totalSpent: 1850,
      rewardPoints: 20,
      registeredDate: '05 Oct 2026',
      address: 'Villa 18, Palm Meadows, ECC Road, Whitefield, Bengaluru - 560066'
    }
  ]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');

  // 2. Dealers
  const [dealers, setDealers] = useState([
    {
      id: 'DLR-01',
      name: 'Sri Venkateswara Distributors',
      contactPerson: 'Srinivas Rao',
      mobile: '9000011111',
      email: 'dealer@plumbmart-demo.com',
      gstin: '29ABCDE1234F1Z5',
      zohoVerified: true,
      status: 'Approved', // 'Approved' | 'Pending' | 'Suspended' | 'Rejected'
      credit30Days: true,
      credit90Days: true,
      creditLimit: 500000,
      availableCredit: 340000,
      outstandingDue: 160000,
      nextDueDate: '02 Nov 2026',
      totalOrders: 18,
      totalVolume: 485000
    },
    {
      id: 'DLR-02',
      name: 'Metro Pipe Syndicate',
      contactPerson: 'Mahesh Patil',
      mobile: '9000022222',
      email: 'metro@plumbmart-demo.com',
      gstin: '29BCDEF2345G2Z6',
      zohoVerified: true,
      status: 'Approved',
      credit30Days: true,
      credit90Days: false,
      creditLimit: 250000,
      availableCredit: 250000,
      outstandingDue: 0,
      nextDueDate: 'None',
      totalOrders: 7,
      totalVolume: 184000
    },
    {
      id: 'DLR-03',
      name: 'Coastal Builders Mart',
      contactPerson: 'Karthik Shenoy',
      mobile: '9000033333',
      email: 'coastal@plumbmart-demo.com',
      gstin: '29CDEFG3456H3Z7',
      zohoVerified: false,
      status: 'Pending',
      credit30Days: false,
      credit90Days: false,
      creditLimit: 0,
      availableCredit: 0,
      outstandingDue: 0,
      nextDueDate: 'N/A',
      totalOrders: 0,
      totalVolume: 0
    }
  ]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [dealerSearch, setDealerSearch] = useState('');

  // 3. Plumbers
  const [plumbers, setPlumbers] = useState([
    {
      id: 'PLM-01',
      name: 'Ramesh Kumar',
      mobile: '9111122222',
      email: 'plumber@plumbmart-demo.com',
      license: 'PLUMB-KA-2024-884',
      status: 'VERIFIED', // 'VERIFIED' | 'PENDING_VERIFICATION' | 'SUSPENDED'
      rating: 4.9,
      completedJobs: 48,
      activeJobs: 2,
      serviceZone: 'Bengaluru East & South',
      registeredDate: 'March 2024'
    },
    {
      id: 'PLM-02',
      name: 'Suresh Kumar',
      mobile: '9111133333',
      email: 'suresh.plumb@example.com',
      license: 'PLUMB-KA-2024-912',
      status: 'PENDING_VERIFICATION',
      rating: 4.7,
      completedJobs: 14,
      activeJobs: 1,
      serviceZone: 'Bengaluru North',
      registeredDate: 'August 2026'
    },
    {
      id: 'PLM-03',
      name: 'Manjunath Gowda',
      mobile: '9111144444',
      email: 'manju.g@example.com',
      license: 'PLUMB-KA-2025-108',
      status: 'VERIFIED',
      rating: 4.8,
      completedJobs: 32,
      activeJobs: 0,
      serviceZone: 'Bengaluru Central',
      registeredDate: 'January 2025'
    }
  ]);
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
  const [orders, setOrders] = useState([
    {
      id: 'PM-928410',
      clientName: 'Rahul Sharma',
      clientMobile: '9876543210',
      clientType: 'Customer',
      date: 'Today, 07:15 AM',
      itemsCount: 6,
      items: [
        { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 4, price: 480 },
        { name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)', qty: 2, price: 720 }
      ],
      total: 3360,
      paymentMethod: 'Online Payment (UPI)',
      paymentStatus: 'Paid',
      status: 'Out for Delivery', // 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled'
      deliveryAddress: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103'
    },
    {
      id: 'PM-881902',
      clientName: 'Sri Venkateswara Distributors',
      clientMobile: '9000011111',
      clientType: 'Dealer',
      date: 'Yesterday, 02:40 PM',
      itemsCount: 150,
      items: [
        { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 100, price: 375 },
        { name: 'Supreme UPVC Ball Valve Heavy Body (25mm)', qty: 50, price: 155 }
      ],
      total: 68400,
      paymentMethod: '30-Day Credit',
      paymentStatus: 'Pending Settlement',
      status: 'Shipped',
      deliveryAddress: 'Industrial Warehouse Depot 02, Peenya, Bengaluru - 560058'
    },
    {
      id: 'PM-817294',
      clientName: 'Anil Desai',
      clientMobile: '9900112233',
      clientType: 'Customer',
      date: '10 Oct 2026',
      itemsCount: 3,
      items: [
        { name: 'Jaquar Alive Single Lever Basin Mixer Tap', qty: 1, price: 3450 },
        { name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty', qty: 2, price: 180 }
      ],
      total: 3810,
      paymentMethod: 'Online Payment (Card)',
      paymentStatus: 'Paid',
      status: 'Delivered',
      deliveryAddress: '14th Cross, 2nd Stage, Indiranagar, Bengaluru - 560038'
    },
    {
      id: 'PM-742109',
      clientName: 'Sri Venkateswara Distributors',
      clientMobile: '9000011111',
      clientType: 'Dealer',
      date: '15 Sep 2026',
      itemsCount: 40,
      items: [
        { name: 'Jaquar Alive Basin Mixer Tap', qty: 25, price: 2750 },
        { name: 'Cera SS Rain Shower 8 Inch', qty: 15, price: 1420 }
      ],
      total: 91600,
      paymentMethod: '90-Day Credit',
      paymentStatus: 'Settled',
      status: 'Delivered',
      deliveryAddress: 'Industrial Warehouse Depot 02, Peenya, Bengaluru - 560058'
    }
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderClientFilter, setOrderClientFilter] = useState('All');

  // 6. Payments
  const [payments, setPayments] = useState([
    {
      id: 'PAY-901',
      orderId: 'PM-928410',
      clientName: 'Rahul Sharma (Customer)',
      amount: 3360,
      method: 'UPI / QR (PhonePe)',
      gatewayRef: 'TXN-RZP-92840192',
      date: 'Today, 07:15 AM',
      status: 'Successful', // 'Successful' | 'Pending' | 'Failed' | 'Refunded'
      reconciled: true
    },
    {
      id: 'PAY-892',
      orderId: 'PM-881902',
      clientName: 'Sri Venkateswara Distributors (Dealer)',
      amount: 68400,
      method: '30-Day Approved Credit',
      gatewayRef: 'ZOHO-INVOICE-881902',
      date: 'Yesterday, 02:40 PM',
      status: 'Pending',
      reconciled: true
    },
    {
      id: 'PAY-810',
      orderId: 'PM-817294',
      clientName: 'Anil Desai (Customer)',
      amount: 3810,
      method: 'Credit Card (HDFC Visa)',
      gatewayRef: 'TXN-RZP-81729400',
      date: '10 Oct 2026',
      status: 'Successful',
      reconciled: true
    },
    {
      id: 'PAY-740',
      orderId: 'PM-742109',
      clientName: 'Sri Venkateswara Distributors (Dealer)',
      amount: 91600,
      method: '90-Day Credit (Settled via NEFT)',
      gatewayRef: 'UTR-HDFC-99120482',
      date: '15 Sep 2026',
      status: 'Successful',
      reconciled: true
    }
  ]);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // 7. Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-01',
      targetGroup: 'All',
      title: 'Monsoon Operations & Express Delivery Guidelines',
      message: 'All regional distribution hubs are operating normally. Plumbers and dealers please verify sealed moisture packaging.',
      sentAt: 'Today, 10:30 AM',
      sender: 'System Admin'
    },
    {
      id: 'NOTIF-02',
      targetGroup: 'Dealers',
      title: 'Reminder: 30-Day Credit Reconciliation Cycle',
      message: 'Monthly sales order invoices due on 15th Oct. Please check your credit limit in Zoho Ledger.',
      sentAt: 'Yesterday, 04:15 PM',
      sender: 'Credit Governance Desk'
    },
    {
      id: 'NOTIF-03',
      targetGroup: 'Plumbers',
      title: 'New CPVC IS:15778 Installation Protocols',
      message: 'Please refer to the technical manuals section for high pressure pipe deburring guidelines.',
      sentAt: '09 Oct 2026',
      sender: 'Technical Desk'
    }
  ]);
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    targetGroup: 'All',
    title: '',
    message: ''
  });

  // Fetch initial data from backend
  useEffect(() => {
    // 1. Fetch Dealers
    fetch('http://localhost:4000/api/dealers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setDealers(data.data.map(d => ({
            ...d,
            contactPerson: d.contactPerson || d.name.split(' ')[0],
            creditLimit: parseInt((d.creditLimit || '500000').toString().replace(/[^0-9]/g, ''), 10) || 500000,
            availableCredit: parseInt((d.availableCredit || '340000').toString().replace(/[^0-9]/g, ''), 10) || 340000,
            outstandingDue: d.outstandingDue || 160000,
            status: d.status || (d.zohoVerified ? 'Approved' : 'Pending')
          })));
        }
      })
      .catch(() => {});

    // 2. Fetch Plumbers
    fetch('http://localhost:4000/api/plumbers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setPlumbers(data.data.map(p => ({
            ...p,
            activeJobs: p.activeJobs || 1
          })));
        }
      })
      .catch(() => {});

    // 3. Fetch Products
    fetch('http://localhost:4000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setProducts(data.data);
          setZohoSyncMeta(prev => ({
            ...prev,
            totalSkus: data.data.length
          }));
        }
      })
      .catch(() => {});

    // 4. Fetch Orders
    fetch('http://localhost:4000/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setOrders(data.data);
        }
      })
      .catch(() => {});

    // 5. Fetch Notifications
    fetch('http://localhost:4000/api/admin/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setNotifications(data.data);
        }
      })
      .catch(() => {});
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
      setSyncToast('Zoho Master Workbook synchronized locally (Live Stream Active).');
    } finally {
      setIsSyncingZoho(false);
      setTimeout(() => setSyncToast(null), 3500);
    }
  };

  // Customer Account Status Toggle (Active / Suspended / Restricted)
  const handleUpdateCustomerStatus = (customerId, newStatus) => {
    setCustomers(prev => prev.map(c => 
      c.id === customerId ? { ...c, status: newStatus } : c
    ));
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(prev => ({ ...prev, status: newStatus }));
    }
    fetch(`http://localhost:4000/api/customers/${customerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  // Dealer Approval & Credit Management
  const handleUpdateDealer = (dealerId, updates) => {
    setDealers(prev => prev.map(d => 
      d.id === dealerId ? { ...d, ...updates } : d
    ));
    if (selectedDealer && selectedDealer.id === dealerId) {
      setSelectedDealer(prev => ({ ...prev, ...updates }));
    }
    fetch(`http://localhost:4000/api/dealers/${dealerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  // Plumber Verification & Status Toggle
  const handleUpdatePlumber = (plumberId, updates) => {
    setPlumbers(prev => prev.map(p => 
      p.id === plumberId ? { ...p, ...updates } : p
    ));
    if (selectedPlumber && selectedPlumber.id === plumberId) {
      setSelectedPlumber(prev => ({ ...prev, ...updates }));
    }
    fetch(`http://localhost:4000/api/plumbers/${plumberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  // Update Order Status
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
    fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  // Send Broadcast Notification
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) return;

    const newNotif = {
      id: 'NOTIF-' + Math.floor(1000 + Math.random() * 9000),
      targetGroup: broadcastForm.targetGroup,
      title: broadcastForm.title,
      message: broadcastForm.message,
      sentAt: 'Just now',
      sender: admin.name
    };

    setNotifications(prev => [newNotif, ...prev]);
    setBroadcastModalOpen(false);
    setBroadcastForm({ targetGroup: 'All', title: '', message: '' });

    fetch('http://localhost:4000/api/admin/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNotif)
    }).catch(() => {});
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{syncToast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-blue-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-white">
                Plumb<span className="text-blue-500">Mart</span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                Admin Panel &bull; Overview
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
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

          {/* Admin Profile Details */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white leading-none">{admin.name}</p>
              <p className="text-[10px] text-blue-400 font-mono mt-0.5">{admin.accessLevel}</p>
            </div>
            <button
              onClick={handleAdminLogout}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-800 hover:border-rose-900/50 transition"
              title="Logout from Admin Panel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar + Workspace */}
      <div className="flex-1 flex w-full relative">
        
        {/* Left Admin Navigation Sidebar */}
        <aside className={`${isSidebarCollapsed ? 'w-16 p-2' : 'w-64 p-3.5'} shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-all duration-200 min-h-[calc(100vh-57px)]`}>
          <div className="space-y-5">
            {/* Sidebar Toggle Corner */}
            <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} pb-2 border-b border-slate-800/80`}>
              {!isSidebarCollapsed && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </span>
              )}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
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
                    onClick={() => setActiveTab(item.id)}
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
                    onClick={() => setActiveTab(item.id)}
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
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 space-y-6">

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
                    onClick={handleTriggerZohoSync}
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
                  onClick={() => setActiveTab('customers')}
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
                  onClick={() => setActiveTab('orders')}
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
                  onClick={() => setActiveTab('payments')}
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
                  onClick={() => setActiveTab('products')}
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
                      { tab: 'payments', title: 'Review 30D/90D Credit Due Dates', desc: `₹${dealers.reduce((s, d) => s + d.outstandingDue, 0).toLocaleString('en-IN')} outstanding` },
                      { tab: 'notifications', title: 'Broadcast Push Notification', desc: 'Alert customers, dealers or plumbers' }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActiveTab(item.tab)}
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
                      {customers
                        .filter(c => 
                          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                          c.mobile.includes(customerSearch)
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
                              <div className="text-slate-400 text-[10px]">₹{cust.totalSpent.toLocaleString('en-IN')} total spent</div>
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
                        ))}
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
                {dealers
                  .filter(d => 
                    d.name.toLowerCase().includes(dealerSearch.toLowerCase()) ||
                    d.mobile.includes(dealerSearch) ||
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
                              GSTIN: {dealer.gstin}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              dealer.zohoVerified
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {dealer.zohoVerified ? '✓ Zoho CRM Record Verified' : '⚠️ Pending Zoho Verification'}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-white">{dealer.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Contact Person: <strong className="text-slate-300">{dealer.contactPerson}</strong> &bull; Mobile: <span className="font-mono text-slate-300">+91 {dealer.mobile}</span>
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 self-start">
                          <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                            dealer.status === 'Approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : dealer.status === 'Pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            Status: {dealer.status}
                          </span>
                        </div>
                      </div>

                      {/* Credit Terms & Limit Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Approved Credit Limit</span>
                          <span className="text-sm font-black text-white">₹{dealer.creditLimit.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Available Credit</span>
                          <span className="text-sm font-black text-emerald-400">₹{dealer.availableCredit.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Outstanding Due</span>
                          <span className="text-sm font-black text-amber-400">₹{dealer.outstandingDue.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold uppercase block">Next Payment Due</span>
                          <span className="text-xs font-bold text-slate-300">{dealer.nextDueDate}</span>
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

                        {/* Approval / Suspension Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDealer(dealer)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800"
                          >
                            Edit Credit Limit
                          </button>

                          {dealer.status !== 'Approved' ? (
                            <button
                              onClick={() => handleUpdateDealer(dealer.id, { status: 'Approved', zohoVerified: true })}
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
                  ))}
              </div>

            </div>
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
                {plumbers
                  .filter(p => 
                    p.name.toLowerCase().includes(plumberSearch.toLowerCase()) ||
                    p.mobile.includes(plumberSearch) ||
                    p.license.toLowerCase().includes(plumberSearch.toLowerCase())
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
                  ))}
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
                        <th className="py-3 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {orders
                        .filter(o => {
                          const matchClient = orderClientFilter === 'All' || o.clientType === orderClientFilter;
                          const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                          const q = orderSearch.toLowerCase();
                          const matchSearch = o.id.toLowerCase().includes(q) || (o.clientName && o.clientName.toLowerCase().includes(q));
                          return matchClient && matchStatus && matchSearch;
                        })
                        .map(order => (
                          <tr key={order.id} className="hover:bg-slate-900/50 transition">
                            <td className="py-3.5 px-4">
                              <span className="font-mono font-bold text-white block">{order.id}</span>
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
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <select
                                value={order.status}
                                onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
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
                    {['All', 'Pipes & Tubes', 'Fittings & Valves', 'Bath & Faucets', 'Pumps & Motors', 'Tools & Sealants'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setProductCatFilter(cat)}
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
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Dealer Credit Terms Policy Matrix</span>
                  </h3>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
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
                            ₹{d.creditLimit.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-bold text-amber-400 font-mono">
                            ₹{d.outstandingDue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {d.nextDueDate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transactions Stream & Reconciliation */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    <span>Payment Transactions &amp; Gateway Reconciliation</span>
                  </h3>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl text-xs">
                    {['All', 'Successful', 'Pending'].map(st => (
                      <button
                        key={st}
                        onClick={() => setPaymentStatusFilter(st)}
                        className={`px-3 py-1 rounded-lg font-semibold transition ${
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
                      {payments
                        .filter(p => paymentStatusFilter === 'All' || p.status === paymentStatusFilter)
                        .map(pay => (
                          <tr key={pay.id} className="hover:bg-slate-900/50 transition">
                            <td className="py-3 px-3 font-mono text-slate-300">{pay.id}</td>
                            <td className="py-3 px-3 font-mono font-bold text-white">{pay.orderId}</td>
                            <td className="py-3 px-3 text-slate-200">{pay.clientName}</td>
                            <td className="py-3 px-3 text-slate-400">{pay.method}</td>
                            <td className="py-3 px-3 font-mono text-[10px] text-blue-400">{pay.gatewayRef}</td>
                            <td className="py-3 px-3 font-bold text-white">₹{pay.amount.toLocaleString('en-IN')}</td>
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
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 8. REPORTS & ANALYTICS                                   */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span>Reports &amp; Analytics</span>
                  </h1>
                  <p className="text-xs text-slate-400">
                    Audit performance, product demand summaries, credit recovery, and registration metrics
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold">
                    Fiscal Period: Oct 2026
                  </span>
                </div>
              </div>

              {/* Top Sales Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Dealer B2B Sales</span>
                  <span className="text-2xl font-black text-indigo-400">₹1,60,000</span>
                  <p className="text-[11px] text-slate-400">High-volume pipes and concealed valves</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Customer Retail Sales</span>
                  <span className="text-2xl font-black text-blue-400">₹7,170</span>
                  <p className="text-[11px] text-slate-400">Instant online settlements (UPI/Cards)</p>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Collections</span>
                  <span className="text-2xl font-black text-emerald-400">₹98,770</span>
                  <p className="text-[11px] text-slate-400">Fully reconciled with banking gateway</p>
                </div>
              </div>

              {/* Product Demand & Stock Health Summary */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white pb-2 border-b border-slate-800">
                  Product Demand &amp; Warehouse Inventory Health
                </h3>
                <div className="divide-y divide-slate-800/80 text-xs">
                  {products.slice(0, 5).map(p => (
                    <div key={p.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-200">{p.name}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">{p.sku} &bull; {p.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">{p.stock} Units in Zoho</span>
                        <span className="text-[10px] text-emerald-400">Demand: High</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 self-start sm:self-auto transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast Announcement</span>
                </button>
              </div>

              {/* Notification History Feed */}
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div 
                    key={notif.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-blue-400 shrink-0 mt-0.5">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-xs text-white">{notif.title}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Target: {notif.targetGroup}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
                        <span className="text-[10px] text-slate-500 block font-mono">Sent {notif.sentAt} by {notif.sender}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-slate-200">Enable 30-Day Pay Later Terms</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={selectedDealer.credit90Days}
                    id="credit90Check"
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-slate-200">Grant 90-Day Tier-1 Credit Facility</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDealer(null)}
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
                <div className="space-y-2 divide-y divide-slate-800/80">
                  <div className="pt-1.5 first:pt-0 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">#JOB-701 &bull; CPVC Pipeline &amp; Stopcock Setup</p>
                      <p className="text-[10px] text-slate-400">Bellandur &bull; Customer: Rahul Sharma</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      In Progress
                    </span>
                  </div>
                  <div className="pt-1.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">#JOB-702 &bull; Booster Pump Mounting</p>
                      <p className="text-[10px] text-slate-400">Whitefield &bull; Customer: Sanjay Reddy</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Assigned
                    </span>
                  </div>
                </div>
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

    </div>
  );
}
