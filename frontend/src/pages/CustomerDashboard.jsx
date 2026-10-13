import React, { useState } from 'react';
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
  LayoutDashboard
} from 'lucide-react';

export default function CustomerDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'saved' | 'support'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const user = currentUser || {
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'customer@plumbmart-demo.com',
    role: 'Customer',
    rewardPoints: 240
  };

  const demoOrders = [
    {
      id: 'PM-928410',
      date: 'Today, 07:15 AM',
      items: [
        { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 4, price: 480 },
        { name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)', qty: 2, price: 720 }
      ],
      total: 3360,
      status: 'Out for Delivery',
      expectedDate: 'Today by 04:00 PM',
      deliveryAddress: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103'
    },
    {
      id: 'PM-817294',
      date: '10 Oct 2026',
      items: [
        { name: 'Jaquar Alive Single Lever Basin Mixer Tap', qty: 1, price: 3450 },
        { name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty', qty: 2, price: 180 }
      ],
      total: 3810,
      status: 'Delivered',
      expectedDate: 'Delivered on 11 Oct 2026',
      deliveryAddress: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru - 560103'
    }
  ];

  const demoAddresses = [
    {
      id: 1,
      title: 'Home (Default)',
      address: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru, Karnataka, 560103',
      phone: user.mobile,
      isDefault: true
    },
    {
      id: 2,
      title: 'Construction Site - Villa 14',
      address: 'Plot 14, Prestige Silver Oak Layout, ECC Road, Whitefield, Bengaluru, 560066',
      phone: '+91 98765 00014',
      isDefault: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 px-4 sm:px-6">
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
              <span className="text-xs font-bold text-slate-900 block leading-tight">{user.name}</span>
              <span className="text-[10px] text-slate-500 block">{user.mobile}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex w-full relative">
        
        {/* Collapsible Sidebar */}
        {isSidebarOpen && (
          <aside className="w-64 sm:w-72 shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col justify-between transition-all duration-300 min-h-[calc(100vh-57px)]">
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
                    {demoOrders.length}
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
                    {demoAddresses.length}
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
                    4
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
                <p className="text-sm font-black text-amber-600 mb-1">⭐ {user.rewardPoints} Points</p>
                <span className="text-[10px] text-blue-700 block">Worth ₹{user.rewardPoints} off your next plumbing order.</span>
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
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          
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
                {user.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Verified Customer
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mobile: {user.mobile} • {user.email}
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
              <span className="text-2xl font-black text-slate-900">{demoOrders.length}</span>
              <span className="text-[10px] text-blue-600 font-medium block mt-1">Direct from Warehouse</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Active Deliveries</span>
              <span className="text-2xl font-black text-emerald-600">1</span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">Out for delivery today</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">PlumbMart Points</span>
              <span className="text-2xl font-black text-amber-500">⭐ {user.rewardPoints}</span>
              <span className="text-[10px] text-amber-700 font-medium block mt-1">Redeemable for ₹240 OFF</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Saved</span>
              <span className="text-2xl font-black text-blue-600">₹850</span>
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
            <span>My Orders &amp; Live Tracking ({demoOrders.length})</span>
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
            {demoOrders.map((order) => (
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
                      <span>{order.expectedDate}</span>
                    </span>
                    <span className="text-slate-500 text-[11px]">Shipment via Express Logistics</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: order.status === 'Delivered' ? '100%' : '75%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-2">
                    <span className="font-semibold text-emerald-600">✓ Order Placed</span>
                    <span className="font-semibold text-emerald-600">✓ Packed at Hub</span>
                    <span className={order.status === 'Delivered' ? 'font-semibold text-emerald-600' : 'font-semibold text-blue-600'}>
                      {order.status === 'Delivered' ? '✓ Delivered' : '● Out for Delivery'}
                    </span>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2 mb-4">
                  <span className="text-xs font-semibold text-slate-700 block">Ordered Items:</span>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px]">
                          {item.qty}
                        </span>
                        <span className="font-medium text-slate-900">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Destination Address */}
                <div className="text-[11px] text-slate-500 flex items-start gap-1.5 pt-2 border-t border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>Delivery to: {order.deliveryAddress}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Delivery Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {demoAddresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative flex flex-col justify-between"
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
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                    Edit Address
                  </button>
                  <span className="text-[11px] text-emerald-600 font-medium">✓ Verified Pincode</span>
                </div>
              </div>
            ))}

            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center text-slate-500 hover:bg-slate-100/70 transition cursor-pointer min-h-[180px]">
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

            <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-semibold">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Need a certified plumber for installation? Request an expert technician.</span>
              </div>
              <Link to="/plumber" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">
                Find Plumbers
              </Link>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 PlumbMart Technologies Pvt. Ltd. • Customer Experience Portal
      </footer>
    </div>
  );
}
