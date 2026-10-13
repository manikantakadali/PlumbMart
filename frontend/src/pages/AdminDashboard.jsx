import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  DollarSign, 
  Search,
  Check,
  AlertTriangle,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react';

export default function AdminDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('dealers'); // 'dealers' | 'plumbers' | 'orders' | 'inventory'
  const [syncing, setSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Dealers state
  const [dealers, setDealers] = useState([
    {
      id: 'DLR-01',
      name: 'Sri Venkateswara Distributors',
      mobile: '9000011111',
      zohoVerified: true,
      credit30Days: true,
      credit90Days: true,
      creditLimit: '₹5,00,000'
    },
    {
      id: 'DLR-02',
      name: 'Metro Pipe Syndicate',
      mobile: '9000022222',
      zohoVerified: true,
      credit30Days: true,
      credit90Days: false,
      creditLimit: '₹2,50,000'
    },
    {
      id: 'DLR-03',
      name: 'Coastal Builders Mart',
      mobile: '9000033333',
      zohoVerified: false,
      credit30Days: false,
      credit90Days: false,
      creditLimit: '₹0'
    }
  ]);

  // 2. Plumbers state
  const [plumbers, setPlumbers] = useState([
    {
      id: 'PLM-01',
      name: 'Ramesh Babu',
      mobile: '9111122222',
      license: 'PLUMB-KA-2024-884',
      completedJobs: 48,
      rating: 4.9,
      status: 'VERIFIED'
    },
    {
      id: 'PLM-02',
      name: 'Suresh Kumar',
      mobile: '9111133333',
      license: 'PLUMB-KA-2024-912',
      completedJobs: 14,
      rating: 4.7,
      status: 'PENDING_VERIFICATION'
    }
  ]);

  // 3. Orders state
  const [orders, setOrders] = useState([
    {
      id: 'PM-928410',
      client: 'Rahul Sharma (Customer)',
      total: 3360,
      itemsCount: 6,
      status: 'Out for Delivery',
      date: 'Today, 07:15 AM'
    },
    {
      id: 'PM-881902',
      client: 'Sri Venkateswara Mart (Dealer B2B)',
      total: 68400,
      itemsCount: 140,
      status: 'Dispatched',
      date: 'Yesterday'
    },
    {
      id: 'PM-817294',
      client: 'Anil Desai (Customer)',
      total: 3810,
      itemsCount: 3,
      status: 'Delivered',
      date: '10 Oct 2026'
    }
  ]);

  // Fetch live database records on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/dealers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setDealers(data.data);
        }
      })
      .catch(() => {});

    fetch('http://localhost:4000/api/plumbers')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setPlumbers(data.data);
        }
      })
      .catch(() => {});

    fetch('http://localhost:4000/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.length > 0) {
          setOrders(data.data);
        }
      })
      .catch(() => {});
  }, []);

  // 4. Inventory state
  const [inventory, setInventory] = useState([
    { id: 'prod-001', name: 'Astral CPVC Pro Pipe (1 Inch, 3m)', stock: 85, retail: 480, dealer: 375 },
    { id: 'prod-002', name: 'Ashirvad Brass Stop Cock (15mm Heavy)', stock: 45, retail: 720, dealer: 560 },
    { id: 'prod-003', name: 'Jaquar Alive Basin Mixer Tap', stock: 24, retail: 3450, dealer: 2750 },
    { id: 'prod-004', name: 'Supreme UPVC Ball Valve (25mm)', stock: 120, retail: 210, dealer: 155 },
    { id: 'prod-005', name: 'Cera 304 Overhead Rain Shower', stock: 35, retail: 1850, dealer: 1420 }
  ]);

  // Toggles with backend persistence
  const toggleDealerZoho = async (dealerId) => {
    const target = dealers.find(d => d.id === dealerId);
    if (!target) return;
    const newZoho = !target.zohoVerified;
    const newCredit30 = newZoho;

    setDealers(prev => prev.map(d => 
      d.id === dealerId ? { ...d, zohoVerified: newZoho, credit30Days: newCredit30 } : d
    ));

    try {
      await fetch(`http://localhost:4000/api/dealers/${dealerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zohoVerified: newZoho, credit30Days: newCredit30 })
      });
    } catch (e) {
      console.warn('Backend update failed:', e);
    }
  };

  const toggleDealer90Days = async (dealerId) => {
    const target = dealers.find(d => d.id === dealerId);
    if (!target) return;
    const newCredit90 = !target.credit90Days;

    setDealers(prev => prev.map(d => 
      d.id === dealerId ? { ...d, credit90Days: newCredit90 } : d
    ));

    try {
      await fetch(`http://localhost:4000/api/dealers/${dealerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credit90Days: newCredit90 })
      });
    } catch (e) {
      console.warn('Backend update failed:', e);
    }
  };

  const togglePlumberKYC = async (plumberId) => {
    const target = plumbers.find(p => p.id === plumberId);
    if (!target) return;
    const newStatus = target.status === 'VERIFIED' ? 'PENDING_VERIFICATION' : 'VERIFIED';

    setPlumbers(prev => prev.map(p => 
      p.id === plumberId ? { ...p, status: newStatus } : p
    ));

    try {
      await fetch(`http://localhost:4000/api/plumbers/${plumberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {
      console.warn('Backend update failed:', e);
    }
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
  };

  const handleTriggerZohoSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncToast('Zoho Workbook Master Inventory synchronized successfully!');
      setTimeout(() => setSyncToast(''), 3000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Toast */}
      {syncToast && (
        <div className="fixed top-18 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-slate-800 py-3 px-4 sm:px-6 border-b border-slate-200 shadow-xs">
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

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900">
                Plumb<span className="text-blue-600">Mart</span> <span className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Admin</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">System Administrator</span>
              <span className="text-[10px] text-slate-500 block font-mono">Master SuperAdmin Level</span>
            </div>
            {onLogout ? (
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 text-xs font-semibold transition"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/admin/login"
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition"
              >
                Admin Sign In
              </Link>
            )}
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
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Admin Governance</span>
                    <span className="text-[10px] text-slate-400">Master Control Console</span>
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
                  onClick={() => setActiveTab('dealers')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'dealers'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="w-4 h-4" />
                    <span>Dealers &amp; Credit</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'dealers' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {dealers.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('plumbers')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'plumbers'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wrench className="w-4 h-4" />
                    <span>Plumbers &amp; KYC</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'plumbers' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {plumbers.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'orders'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    <span>Orders &amp; Dispatch</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'orders' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {orders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'inventory'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4" />
                    <span>Zoho Master Catalog</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'inventory' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {inventory.length}
                  </span>
                </button>
              </div>

              {/* Zoho Master Sync Box in Sidebar */}
              <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700">Zoho ERP Workbook</span>
                  <button
                    onClick={handleTriggerZohoSync}
                    disabled={syncing}
                    className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                    title="Sync with Zoho"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <span className="text-xs font-black text-emerald-600 block">✓ Connected &amp; Synced</span>
                <span className="text-[10px] text-slate-500 block mt-1">Multi-dealer ledger &amp; credit approval queue active.</span>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Storefront</span>
              </Link>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Administrator</span>
                </button>
              )}
            </div>
          </aside>
        )}

        {/* Main Governance Dashboard */}
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
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross GMV</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900 block">₹48.6 Lakh</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">↑ 18.4% month-over-month</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hardware Dealers</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900 block">{dealers.length} Dealers</span>
            <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">
              {dealers.filter(d => d.zohoVerified).length} Zoho Verified
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certified Plumbers</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900 block">{plumbers.length} Active</span>
            <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">62 Completed Installations</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zoho Workbook</span>
              <button
                onClick={handleTriggerZohoSync}
                disabled={syncing}
                className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition"
                title="Sync with Zoho"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <span className="text-2xl font-black text-blue-600 block">SYNCED</span>
            <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Live Master Catalog</span>
          </div>
        </div>


        {/* TAB 1: Dealers Governance */}
        {activeTab === 'dealers' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">B2B Dealer Governance &amp; Credit Eligibility</h3>
              <p className="text-xs text-slate-500">
                Grant Zoho Verification and unlock 30-Day or 90-Day Credit checkout eligibility for distributors.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold rounded-l-xl">Dealer Name / Mobile</th>
                    <th className="py-3 px-4 font-bold">Zoho CRM Verification</th>
                    <th className="py-3 px-4 font-bold">30-Day Credit</th>
                    <th className="py-3 px-4 font-bold">90-Day Credit</th>
                    <th className="py-3 px-4 font-bold">Credit Limit</th>
                    <th className="py-3 px-4 font-bold rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dealers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {d.name}
                        <span className="block text-[11px] font-mono font-normal text-slate-500">{d.mobile}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          d.zohoVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {d.zohoVerified ? '✓ Verified in Zoho' : '✗ Unverified'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          d.credit30Days ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                        }`}>
                          {d.credit30Days ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          d.credit90Days ? 'text-indigo-700 bg-indigo-50 border border-indigo-200' : 'text-slate-400 bg-slate-100'
                        }`}>
                          {d.credit90Days ? 'Approved (90D)' : 'Locked'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {d.creditLimit}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => toggleDealerZoho(d.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition"
                        >
                          {d.zohoVerified ? 'Revoke Zoho' : 'Verify Zoho'}
                        </button>
                        <button
                          onClick={() => toggleDealer90Days(d.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition"
                        >
                          {d.credit90Days ? 'Lock 90D' : 'Approve 90D'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Plumbers Governance */}
        {activeTab === 'plumbers' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Plumber Partner KYC &amp; License Approvals</h3>
              <p className="text-xs text-slate-500">
                Verify plumbers trade licenses to authorize them for assigned customer installation activities.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold rounded-l-xl">Plumber Name</th>
                    <th className="py-3 px-4 font-bold">Mobile</th>
                    <th className="py-3 px-4 font-bold">Trade License No.</th>
                    <th className="py-3 px-4 font-bold">Jobs Done / Rating</th>
                    <th className="py-3 px-4 font-bold">Verification Status</th>
                    <th className="py-3 px-4 font-bold rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plumbers.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{p.mobile}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{p.license}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {p.completedJobs} Jobs • <span className="text-amber-500 font-bold">⭐ {p.rating}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.status === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => togglePlumberKYC(p.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] transition"
                        >
                          {p.status === 'VERIFIED' ? 'Revoke KYC' : 'Approve Partner'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Orders & Dispatch */}
        {activeTab === 'orders' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Live Orders &amp; Dispatch Governance</h3>
              <p className="text-xs text-slate-500">Supervise central warehouse dispatch across retail customers and wholesale dealers.</p>
            </div>

            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{o.id}</span>
                      <span className="font-semibold text-slate-800">{o.client}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {o.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 mt-1 block">{o.date} • {o.itemsCount} Items</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-bold text-slate-900">₹{o.total.toLocaleString('en-IN')}</span>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Out for Delivery">Out for Delivery</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Zoho Inventory Master */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Master Inventory &amp; Zoho Sync Matrix</h3>
                <p className="text-xs text-slate-500">Central inventory feeds synced to both retail store and wholesale catalog</p>
              </div>

              <button
                onClick={handleTriggerZohoSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Synchronizing...' : 'Sync with Zoho Workbook'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold rounded-l-xl">Product Name</th>
                    <th className="py-3 px-4 font-bold">Central Stock</th>
                    <th className="py-3 px-4 font-bold">Customer Retail Price</th>
                    <th className="py-3 px-4 font-bold text-indigo-700">Wholesale Dealer Price</th>
                    <th className="py-3 px-4 font-bold rounded-r-xl text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.stock} Units</td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">₹{item.retail}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-700">₹{item.dealer}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-[11px] font-bold text-emerald-600">✓ In Sync</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 PlumbMart Technologies Pvt. Ltd. • Master Administration &amp; Zoho Governance
      </footer>
    </div>
  );
}
