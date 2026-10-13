import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  ArrowLeft, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Star, 
  Phone, 
  ShieldCheck, 
  ChevronRight,
  Package,
  Heart,
  Truck,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  LayoutDashboard,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function CustomerDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'saved' | 'support'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Dynamic Customer Profile & State
  const activeMobile = currentUser?.mobile || '9876543210';
  const [customer, setCustomer] = useState(currentUser || {
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'customer@plumbmart-demo.com',
    role: 'Customer',
    rewardPoints: 240,
    totalSaved: 850
  });

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeDeliveries: 0,
    rewardPoints: 240,
    totalSaved: 850,
    savedItemsCount: 4
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Modal State for Adding New Address
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    title: '',
    address: '',
    phone: '',
    pincode: '',
    isDefault: false
  });

  // Technician Request State
  const [isRequestingTechnician, setIsRequestingTechnician] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch dynamic customer data from Supabase backend
  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      else setIsRefreshing(true);

      const res = await fetch(`/api/customer/dashboard?mobile=${encodeURIComponent(activeMobile)}`);
      const data = await res.json();

      if (data.success) {
        if (data.customer) {
          setCustomer(prev => ({
            ...prev,
            ...data.customer
          }));
        }
        setOrders(data.orders || []);
        setAddresses(data.addresses || []);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        console.warn('Dashboard fetch response not successful:', data.message);
      }
    } catch (err) {
      console.error('Error fetching customer dashboard from Supabase:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeMobile]);

  // Handle Add New Address to Supabase
  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newAddressForm.title.trim() || !newAddressForm.address.trim()) {
      alert('Please fill out the Title and Full Address.');
      return;
    }

    try {
      setIsSubmittingAddress(true);
      const res = await fetch('/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: customer?.mobile || activeMobile,
          title: newAddressForm.title.trim(),
          address: newAddressForm.address.trim(),
          phone: newAddressForm.phone.trim() || customer?.mobile || activeMobile,
          pincode: newAddressForm.pincode.trim() || '560103',
          isDefault: Boolean(newAddressForm.isDefault)
        })
      });

      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses || []);
        setIsAddAddressModalOpen(false);
        setNewAddressForm({
          title: '',
          address: '',
          phone: '',
          pincode: '',
          isDefault: false
        });
        showToast('Site / Delivery address saved successfully to Supabase DB!');
        // Refresh full dashboard
        fetchDashboardData(true);
      } else {
        alert(data.message || 'Failed to save address.');
      }
    } catch (err) {
      alert('Error connecting to backend: ' + err.message);
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Handle Set Default Address in Supabase
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: customer?.mobile || activeMobile })
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
        showToast('Default delivery address updated!');
      } else {
        alert(data.message || 'Failed to set default address.');
      }
    } catch (err) {
      console.error('Error setting default address:', err);
    }
  };

  // Handle Delete Address from Supabase
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/customer/addresses/${addressId}?mobile=${encodeURIComponent(customer?.mobile || activeMobile)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
        showToast('Address removed successfully from Supabase DB.');
      } else {
        alert(data.message || 'Failed to delete address.');
      }
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  // Handle Request Expert Technician
  const handleRequestTechnician = async () => {
    try {
      setIsRequestingTechnician(true);
      const res = await fetch('/api/customer/support-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: customer?.mobile || activeMobile,
          name: customer?.name || 'Rahul Sharma',
          type: 'Expert Technician Request',
          issue: 'Installation and pipe fitting request for residential site'
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Expert technician requested! Ticket #${data.ticketId} created.`);
      }
    } catch (err) {
      console.error('Error requesting technician:', err);
    } finally {
      setIsRequestingTechnician(false);
    }
  };

  const userInitial = (customer?.name || 'R').charAt(0).toUpperCase();

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col font-sans overflow-hidden">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 px-4 sm:px-6 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs transition active:scale-95 shadow-xs"
              title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4 text-blue-600" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
              )}
              <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            <Link to="/" className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold transition">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Back to Store</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden md:block" />

            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
                <Droplets className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900">
                Plumb<span className="text-blue-600">Mart</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Customer Portal
            </span>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block leading-tight">{customer?.name}</span>
              <span className="text-[10px] text-slate-500 block">{customer?.mobile}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full relative overflow-hidden min-h-0">
        
        {/* Collapsible Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 sm:w-72 shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-all duration-300 h-full overflow-y-auto">
            <div>
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Customer Menu</span>
                    <span className="text-[10px] text-slate-400">Account Navigation</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  title="Hide Sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Menu Items */}
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'orders'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    <span>My Orders</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'orders' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'addresses'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4" />
                    <span>Delivery Addresses</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'addresses' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {addresses.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('saved')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'saved'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    <span>Saved Items</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'saved' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {stats.savedItemsCount || 4}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('support')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'support'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4" />
                    <span>Help &amp; Support</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'support' ? 'bg-blue-500 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    24x7
                  </span>
                </button>
              </div>

              {/* Loyalty Reward Card */}
              <div className="mt-6 p-4 bg-blue-50/80 border border-blue-100 rounded-2xl">
                <span className="text-[11px] font-bold text-blue-900 block mb-1">PlumbMart Rewards</span>
                <p className="text-sm font-black text-amber-600 mb-1">⭐ {stats.rewardPoints} Points</p>
                <span className="text-[10px] text-blue-700 block">Worth ₹{stats.rewardPoints} off your next plumbing order.</span>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Continue Shopping</span>
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8 h-full overflow-y-auto">
          
          {/* Quick Toggle pill when sidebar is closed */}
          {!isSidebarOpen && (
            <div className="mb-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-100 transition"
              >
                <PanelLeftOpen className="w-4 h-4 text-blue-600" />
                <span>Show Sidebar Navigation</span>
              </button>
            </div>
          )}
        
          {/* Profile & KPI Summary Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-blue-500/20">
                  {userInitial}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{customer?.name}</h1>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified Customer
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mobile: {customer?.mobile} • {customer?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link
                  to="/"
                  className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-600/20"
                >
                  Continue Shopping
                </Link>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Orders</span>
                <span className="text-2xl font-black text-slate-900">{stats.totalOrders}</span>
                <span className="text-[10px] text-blue-600 font-medium block mt-1">Direct from Warehouse</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Active Deliveries</span>
                <span className="text-2xl font-black text-emerald-600">{stats.activeDeliveries}</span>
                <span className="text-[10px] text-emerald-700 font-medium block mt-1">Out for delivery today</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">PlumbMart Points</span>
                <span className="text-2xl font-black text-amber-500">⭐ {stats.rewardPoints}</span>
                <span className="text-[10px] text-amber-700 font-medium block mt-1">Redeemable for ₹{stats.rewardPoints} OFF</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Saved</span>
                <span className="text-2xl font-black text-blue-600">₹{Math.round(stats.totalSaved).toLocaleString('en-IN')}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">On retail MRP discounts</span>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs Header */}
          <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Orders &amp; Live Tracking ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'addresses'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Delivery Addresses</span>
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'support'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Phone className="w-4 h-4" />
              <span>Helpdesk &amp; Warranty</span>
            </button>
          </div>

          {/* TAB 1: Orders & Live Tracking */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {isLoading ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-600">Loading your orders from database...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">No Orders Found</h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    You haven't placed any plumbing orders yet. Explore our high-grade pipes and fittings catalog.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition hover:border-blue-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 text-sm">Order #{order.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            order.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 mt-0.5 block">Placed on {order.date}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Total Amount</span>
                        <span className="text-lg font-bold text-slate-900">₹{order.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Progress Tracking Bar */}
                    <div className="my-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="flex items-center justify-between text-xs font-semibold mb-2">
                        <span className="text-blue-600 flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          <span>{order.expectedDate || 'Standard Delivery'}</span>
                        </span>
                        <span className="text-slate-500 text-[11px]">Shipment via Express Logistics</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: order.status === 'Delivered' 
                              ? '100%' 
                              : order.status === 'Out for Delivery' 
                              ? '75%' 
                              : order.status === 'Packed at Hub' 
                              ? '50%' 
                              : '25%' 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                        <span className="font-semibold text-emerald-600">✓ Order Placed</span>
                        <span className={`font-semibold ${order.status !== 'Order Placed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                          ✓ Packed at Hub
                        </span>
                        <span className={order.status === 'Delivered' ? 'font-semibold text-emerald-600' : 'font-semibold text-blue-600'}>
                          {order.status === 'Delivered' ? '✓ Delivered' : '● Out for Delivery'}
                        </span>
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div className="space-y-2 mb-4">
                      <span className="text-xs font-semibold text-slate-700 block">Ordered Items:</span>
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                              {item.qty}
                            </span>
                            <span className="font-medium text-slate-900">{item.name}</span>
                          </div>
                          <span className="font-bold text-slate-900">₹{((item.price || 0) * (item.qty || 1)).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Destination Address */}
                    <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-2 border-t border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>Delivery to: {order.deliveryAddress}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Delivery Addresses */}
          {activeTab === 'addresses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative flex flex-col justify-between transition hover:border-blue-300"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-slate-900 text-sm">{addr.title}</h3>
                      </div>
                      {addr.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {addr.address}
                    </p>
                    <p className="text-xs text-slate-500">
                      Contact: <span className="font-mono font-medium text-slate-700">{addr.phone}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-emerald-600 font-medium">✓ Verified Pincode</span>
                  </div>
                </div>
              ))}

              {/* Add New Address Card Button */}
              <div 
                onClick={() => setIsAddAddressModalOpen(true)}
                className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-500 hover:bg-slate-100/70 transition cursor-pointer min-h-[180px] active:scale-[0.99]"
              >
                <Plus className="w-8 h-8 text-slate-400 mb-2" />
                <span className="font-bold text-xs text-slate-700">Add New Site / Delivery Address</span>
                <span className="text-[11px] text-slate-400 mt-1">Save site locations for direct pipe delivery</span>
              </div>
            </div>
          )}

          {/* TAB 3: Helpdesk & Warranty */}
          {activeTab === 'support' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Customer Care &amp; Warranty Assistance</h3>
              <p className="text-xs text-slate-500 mb-6 max-w-xl">
                All plumbing pipes and sanitary fixtures bought from PlumbMart carry standard manufacturer warranties (Astral, Ashirvad, Jaquar, etc.).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <span className="text-xs font-bold text-slate-900 block mb-1">Toll-Free Helpline</span>
                  <span className="text-sm font-black text-blue-600 block">+91 98765 43210</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Available 8 AM - 8 PM</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <span className="text-xs font-bold text-slate-900 block mb-1">Email Support</span>
                  <span className="text-sm font-semibold text-slate-800 block">support@plumbmart-demo.com</span>
                  <span className="text-[10px] text-slate-500 block mt-1">Guaranteed 2h Response</span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <span className="text-xs font-bold text-slate-900 block mb-1">Return / Replacement</span>
                  <span className="text-sm font-bold text-emerald-600 block">7-Day Free Pickup</span>
                  <span className="text-[10px] text-slate-500 block mt-1">For transit damaged goods</span>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Need a certified plumber for installation? Request an expert technician.</span>
                </div>
                <button 
                  onClick={handleRequestTechnician}
                  disabled={isRequestingTechnician}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isRequestingTechnician ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <span>Request Technician</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer copyright */}
          <footer className="mt-12 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
            © 2026 PlumbMart Technologies Pvt. Ltd. • Customer Experience Portal
          </footer>
        </main>
      </div>

      {/* MODAL: Add New Delivery / Site Address */}
      {isAddAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Site / Delivery Address</h3>
                  <span className="text-xs text-slate-500">Save site details directly to Supabase</span>
                </div>
              </div>
              <button
                onClick={() => setIsAddAddressModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Site Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prestige Villa Site - Phase 2 or Home"
                  value={newAddressForm.title}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Street Address *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Plot number, Street, Landmark, Area, City..."
                  value={newAddressForm.address}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Site Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder={customer?.mobile || "9876543210"}
                    value={newAddressForm.phone}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="560103"
                    value={newAddressForm.pincode}
                    onChange={(e) => setNewAddressForm({ ...newAddressForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddressCheckbox"
                  checked={newAddressForm.isDefault}
                  onChange={(e) => setNewAddressForm({ ...newAddressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="defaultAddressCheckbox" className="text-xs font-medium text-slate-700 select-none cursor-pointer">
                  Make this my default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAddressModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAddress}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingAddress ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Supabase...</span>
                    </>
                  ) : (
                    <span>Save Address</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
