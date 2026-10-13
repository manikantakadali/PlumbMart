import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  ArrowLeft, 
  CreditCard, 
  Layers, 
  FileText, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Search,
  Truck,
  Box,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Package
} from 'lucide-react';

export default function DealerDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'credit' | 'orders' | 'zoho'
  const [stockSearch, setStockSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const dealer = currentUser || {
    name: 'Sri Venkateswara Distributors',
    mobile: '9000011111',
    email: 'dealer@plumbmart-demo.com',
    role: 'Dealer',
    gstin: '29ABCDE1234F1Z5'
  };

  const b2bCatalog = [
    {
      id: 'prod-001',
      name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)',
      retailPrice: 480,
      dealerPrice: 375,
      exactStock: 85,
      moq: 10,
      brand: 'Astral Pipes',
      sku: 'AST-CPVC-1IN-3M'
    },
    {
      id: 'prod-002',
      name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)',
      retailPrice: 720,
      dealerPrice: 560,
      exactStock: 45,
      moq: 5,
      brand: 'Ashirvad',
      sku: 'ASH-STP-15MM-BR'
    },
    {
      id: 'prod-003',
      name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)',
      retailPrice: 3450,
      dealerPrice: 2750,
      exactStock: 24,
      moq: 2,
      brand: 'Jaquar',
      sku: 'JAQ-ALV-BSN-CH'
    },
    {
      id: 'prod-004',
      name: 'Supreme UPVC Ball Valve Heavy Body (25mm)',
      retailPrice: 210,
      dealerPrice: 155,
      exactStock: 120,
      moq: 20,
      brand: 'Supreme',
      sku: 'SUP-BLL-25MM-UPVC'
    },
    {
      id: 'prod-005',
      name: 'Cera Stainless Steel 304 Overhead Rain Shower',
      retailPrice: 1850,
      dealerPrice: 1420,
      exactStock: 35,
      moq: 5,
      brand: 'Cera',
      sku: 'CER-SHW-304-8IN'
    },
    {
      id: 'prod-006',
      name: 'Finolex SWR PVC Drainage Bend 90° with Door',
      retailPrice: 310,
      dealerPrice: 235,
      exactStock: 90,
      moq: 15,
      brand: 'Finolex',
      sku: 'FIN-SWR-110MM-BND'
    }
  ];

  const filteredCatalog = b2bCatalog.filter(item => 
    item.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.brand.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const demoInvoices = [
    {
      invoiceNo: 'INV-2026-0881',
      date: '02 Oct 2026',
      dueDate: '02 Nov 2026',
      type: '30-Day Credit',
      amount: 68400,
      status: 'Outstanding',
      itemsCount: 140
    },
    {
      invoiceNo: 'INV-2026-0742',
      date: '15 Sep 2026',
      dueDate: '15 Dec 2026',
      type: '90-Day Credit',
      amount: 91600,
      status: 'Outstanding',
      itemsCount: 220
    },
    {
      invoiceNo: 'INV-2026-0519',
      date: '10 Aug 2026',
      dueDate: '10 Sep 2026',
      type: '30-Day Credit',
      amount: 124500,
      status: 'Paid',
      itemsCount: 310
    }
  ];

  return (
    <div className="h-screen bg-slate-50 text-slate-800 flex flex-col font-sans overflow-hidden">
      
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
                <PanelLeftClose className="w-4 h-4 text-indigo-600" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900">
                Plumb<span className="text-indigo-600">Mart</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              B2B Wholesale Portal
            </span>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block leading-tight">{dealer.name}</span>
              <span className="text-[10px] text-slate-500 block">GSTIN: {dealer.gstin}</span>
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
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Dealer B2B Suite</span>
                    <span className="text-[10px] text-slate-400">Wholesale Console</span>
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
                  onClick={() => setActiveTab('stock')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'stock'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Box className="w-4 h-4" />
                    <span>Wholesale Catalog</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'stock' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {b2bCatalog.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('credit')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'credit'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Terms &amp; Limits</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'credit' ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    30D/90D
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'orders'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4" />
                    <span>B2B Purchase Orders</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'orders' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {demoInvoices.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('zoho')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'zoho'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4" />
                    <span>Zoho ERP Ledger</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'zoho' ? 'bg-indigo-500 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    Synced
                  </span>
                </button>
              </div>

              {/* B2B Credit Limit Box */}
              <div className="mt-6 p-4 bg-indigo-50/80 border border-indigo-100 rounded-2xl">
                <span className="text-[11px] font-bold text-indigo-900 block mb-1">Approved Credit Line</span>
                <span className="text-sm font-black text-slate-900 block">₹3,40,000 Available</span>
                <span className="text-[10px] text-indigo-700 block mt-0.5">of ₹5,00,000 Approved Limit</span>
                <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center gap-2 text-[10px] text-emerald-700 font-bold">
                  <span>✓ 30-Day Pay Later</span>
                  <span>•</span>
                  <span>✓ 90-Day Tier 1</span>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-indigo-600" />
                <span>Store Catalog</span>
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
                <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
                <span>Show Sidebar Navigation</span>
              </button>
            </div>
          )}
        
        {/* B2B Header & Credit Summary Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-600/20">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{dealer.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    Zoho CRM Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mobile: {dealer.mobile} • GSTIN: <span className="font-mono font-medium text-slate-700">{dealer.gstin}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                to="/"
                className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
              >
                Wholesale Store
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

          {/* B2B Credit & Finance Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Total Credit Limit</span>
              <span className="text-2xl font-black text-slate-900">₹5,00,000</span>
              <span className="text-[10px] text-emerald-600 font-medium block mt-1">Available: ₹3,40,000</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Outstanding Payables</span>
              <span className="text-2xl font-black text-amber-600">₹1,60,000</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">Due next: 02 Nov 2026</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">90-Day Credit Status</span>
              <span className="text-2xl font-black text-emerald-600">UNLOCKED</span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">Zoho Score: 98/100</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Live Warehouse Sync</span>
              <span className="text-2xl font-black text-blue-600">ACTIVE</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">Synced 2 mins ago</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stock'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Wholesale Pricing &amp; Exact Stock ({b2bCatalog.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('credit')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'credit'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Credit Invoices &amp; Ledger ({demoInvoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('zoho')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'zoho'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Zoho CRM Verification &amp; Terms</span>
          </button>
        </div>

        {/* TAB 1: Wholesale Catalog & Real Stock */}
        {activeTab === 'stock' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Master Inventory &amp; Wholesale Price Matrix</h3>
                <p className="text-xs text-slate-500">Dealers receive exact available inventory quantities with wholesale margins</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Search SKU, brand, pipe..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold rounded-l-xl">SKU / Brand</th>
                    <th className="py-3 px-4 font-bold">Product Name</th>
                    <th className="py-3 px-4 font-bold">Retail Price</th>
                    <th className="py-3 px-4 font-bold text-indigo-700">Dealer Price</th>
                    <th className="py-3 px-4 font-bold text-emerald-700">Available Stock</th>
                    <th className="py-3 px-4 font-bold">Min Order (MOQ)</th>
                    <th className="py-3 px-4 font-bold rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCatalog.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {item.sku}
                        <span className="block text-[10px] text-indigo-600 font-sans font-bold">{item.brand}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs">{item.name}</td>
                      <td className="py-3.5 px-4 text-slate-400 line-through">₹{item.retailPrice}</td>
                      <td className="py-3.5 px-4 font-bold text-indigo-700 text-sm">₹{item.dealerPrice}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.exactStock} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{item.moq} Units</td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to="/"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition shadow-xs"
                        >
                          Order MOQ
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Credit Invoices & Ledger */}
        {activeTab === 'credit' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">B2B Credit Statements &amp; GST Invoices</h3>
                <p className="text-xs text-slate-500">Track 30-day and 90-day revolving credit orders with auto-generated tax invoices</p>
              </div>

              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold">
                <Download className="w-3.5 h-3.5" />
                <span>Download Statement (PDF)</span>
              </button>
            </div>

            <div className="space-y-4">
              {demoInvoices.map((inv, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{inv.invoiceNo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {inv.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Issued: {inv.date} • <strong className="text-slate-700">Due Date: {inv.dueDate}</strong> • {inv.itemsCount} Items
                    </span>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Total Taxable Amount</span>
                      <span className="text-base font-bold text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</span>
                    </div>
                    {inv.status !== 'Paid' ? (
                      <button className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs">
                        Pay Invoice
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-600">✓ Settled</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: Zoho CRM Verification & Terms */}
        {activeTab === 'zoho' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Zoho CRM Wholesale Partner Verification</h3>
                <p className="text-xs text-slate-500">Live API Synchronisation with Zoho CRM Workbook &amp; Books</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Zoho Account ID</span>
                <span className="font-mono font-semibold text-slate-900">ZOHO-WHS-2024-9102</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Business Verification Status</span>
                <span className="font-bold text-emerald-600">VERIFIED &amp; APPROVED</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">30-Day Credit Status</span>
                <span className="font-bold text-emerald-600">Active (Up to ₹5,00,000)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">90-Day Credit Status</span>
                <span className="font-bold text-indigo-600">Tier-1 Wholesaler Approved</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Associated Warehouse Hub</span>
                <span className="font-semibold text-slate-900">South Bengaluru Central Depot (Hub 01)</span>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="text-indigo-900 font-semibold">
                Need to increase your credit ceiling? Submit audited annual accounts to your Zoho Account Manager.
              </div>
              <button className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shrink-0">
                Request Credit Review
              </button>
            </div>
          </div>
        )}

        {/* Footer copyright */}
        <footer className="mt-12 py-4 text-center text-xs text-slate-400 border-t border-slate-200">
          © 2026 PlumbMart Technologies Pvt. Ltd. • Wholesale B2B Portal
        </footer>
      </main>
      </div>
    </div>
  );
}
