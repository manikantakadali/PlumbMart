import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplets, 
  ArrowLeft, 
  Wrench, 
  Calendar, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Wallet, 
  Award, 
  ShieldCheck, 
  Check, 
  AlertCircle,
  FileCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Package
} from 'lucide-react';

export default function PlumberDashboard({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'request' | 'wallet' | 'kyc'
  const [requestSent, setRequestSent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const plumber = currentUser || {
    name: 'Ramesh Kumar',
    mobile: '9111122222',
    email: 'plumber@plumbmart-demo.com',
    role: 'Plumber',
    license: 'PLUMB-KA-2024-884',
    rating: 4.9,
    rewardPoints: 650
  };

  const [jobs, setJobs] = useState([
    {
      id: 'JOB-701',
      customerName: 'Rahul Sharma',
      customerMobile: '9876543210',
      address: 'Flat 402, Green Glen Heights, Bellandur, Bengaluru',
      scheduledDate: 'Today, 02:00 PM',
      workType: 'CPVC Pipeline & Stopcock Installation (Bath 2)',
      rewardAmount: 650,
      rewardPoints: 50,
      status: 'Assigned'
    },
    {
      id: 'JOB-702',
      customerName: 'Sanjay Reddy',
      customerMobile: '9845012345',
      address: 'Villa 18, Palm Meadows, Whitefield, Bengaluru',
      scheduledDate: 'Tomorrow, 10:00 AM',
      workType: 'Kirloskar 0.5HP Booster Pump Setup & Pressure Testing',
      rewardAmount: 850,
      rewardPoints: 80,
      status: 'Assigned'
    },
    {
      id: 'JOB-689',
      customerName: 'Anil Desai',
      customerMobile: '9900112233',
      address: '14th Cross, Indiranagar, Bengaluru',
      scheduledDate: '11 Oct 2026',
      workType: 'Jaquar Basin Mixer Tap Replacement',
      rewardAmount: 450,
      rewardPoints: 40,
      status: 'Completed'
    }
  ]);

  const [reqProduct, setReqProduct] = useState({
    jobId: 'JOB-701',
    productName: 'Astral CPVC Pro Pipe (1 Inch, 3m)',
    quantity: 2,
    reason: 'Extra distance between overhead tank and concealed bathroom wall'
  });

  const handleCompleteJob = (jobId) => {
    setJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'Completed' } : job
    ));
  };

  const handleSendProductRequest = (e) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setReqProduct({
        jobId: 'JOB-701',
        productName: 'Astral CPVC Pro Pipe (1 Inch, 3m)',
        quantity: 2,
        reason: ''
      });
    }, 3000);
  };

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
                <PanelLeftClose className="w-4 h-4 text-emerald-600" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
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
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-base font-black tracking-tight text-slate-900">
                Plumb<span className="text-emerald-600">Mart</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Plumber Partner App
            </span>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 block leading-tight">{plumber.name}</span>
              <span className="text-[10px] text-slate-500 block">Lic: {plumber.license}</span>
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
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">Plumber Console</span>
                    <span className="text-[10px] text-slate-400">Field Service Suite</span>
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
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'jobs'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" />
                    <span>Assigned Jobs</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'jobs' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {jobs.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('request')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'request'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="w-4 h-4" />
                    <span>Order Site Materials</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'request' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    Express
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'wallet'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4" />
                    <span>Earnings &amp; Wallet</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'wallet' ? 'bg-emerald-500 text-white' : 'bg-amber-50 text-amber-700'
                  }`}>
                    ₹{plumber.walletBalance || 250}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('kyc')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'kyc'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4" />
                    <span>License &amp; KYC</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'kyc' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    Verified
                  </span>
                </button>
              </div>

              {/* Plumber Quick Stats Box */}
              <div className="mt-6 p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl">
                <span className="text-[11px] font-bold text-emerald-900 block mb-1">Technician Scorecard</span>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700">Service Rating</span>
                  <span className="text-xs font-black text-amber-600">⭐ {plumber.rating || 4.9} / 5.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Completed Jobs</span>
                  <span className="text-xs font-black text-emerald-700">48 Installs</span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Lic: {plumber.license}</span>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                to="/"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
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
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Quick Toggle pill when sidebar is closed */}
          {!isSidebarOpen && (
            <div className="mb-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-slate-100 transition"
              >
                <PanelLeftOpen className="w-4 h-4 text-emerald-600" />
                <span>Show Sidebar Navigation</span>
              </button>
            </div>
          )}
        
        {/* Profile & KPI Summary Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-600/20">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{plumber.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Partner
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mobile: {plumber.mobile} • License: <span className="font-mono font-medium text-slate-700">{plumber.license}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                to="/"
                className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20"
              >
                Browse Store
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

          {/* Plumber Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Active Site Jobs</span>
              <span className="text-2xl font-black text-slate-900">
                {jobs.filter(j => j.status === 'Assigned').length}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium block mt-1">Scheduled for this week</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Completed Installations</span>
              <span className="text-2xl font-black text-blue-600">48</span>
              <span className="text-[10px] text-slate-500 font-medium block mt-1">Customer Rating: ⭐ 4.9/5</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Wallet Earnings</span>
              <span className="text-2xl font-black text-emerald-600">₹4,850</span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-1">Ready to withdraw to UPI</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Plumber Reward Points</span>
              <span className="text-2xl font-black text-amber-500">⭐ {plumber.rewardPoints}</span>
              <span className="text-[10px] text-amber-700 font-medium block mt-1">Redeemable for free tools</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs Header */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Assigned Installation Jobs ({jobs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'request'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Request Products for Site</span>
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Earnings &amp; UPI Payouts</span>
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'kyc'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Trade License &amp; KYC</span>
          </button>
        </div>

        {/* TAB 1: Assigned Installation Jobs */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm transition hover:border-emerald-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{job.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        job.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scheduled: {job.scheduledDate}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Installation Reward</span>
                    <span className="text-base font-bold text-emerald-600">
                      +₹{job.rewardAmount} <span className="text-xs text-amber-500">({job.rewardPoints} pts)</span>
                    </span>
                  </div>
                </div>

                <div className="py-4 space-y-2 text-xs">
                  <div className="font-semibold text-slate-900 text-sm">{job.workType}</div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">Customer:</span>
                    <span>{job.customerName} (<a href={`tel:${job.customerMobile}`} className="text-blue-600 font-mono underline">{job.customerMobile}</a>)</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{job.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={`tel:${job.customerMobile}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call Customer</span>
                  </a>

                  {job.status === 'Assigned' ? (
                    <button
                      onClick={() => handleCompleteJob(job.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mark Job Completed</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Reward Credited to Wallet</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: Request Products for Site */}
        {activeTab === 'request' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm max-w-xl mx-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Request Extra Plumbing Materials</h3>
            <p className="text-xs text-slate-500 mb-6">
              Need extra pipes, joints, or solvent cement for your active installation site? Submit a quick request for express dispatch.
            </p>

            {requestSent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2 animate-bounce" />
                <h4 className="font-bold text-slate-900 text-sm">Material Request Dispatched!</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Warehouse has verified requirement for <span className="font-semibold text-slate-900">{reqProduct.jobId}</span>. Express delivery initiated.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProductRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Active Site Job</label>
                  <select
                    value={reqProduct.jobId}
                    onChange={(e) => setReqProduct({ ...reqProduct, jobId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="JOB-701">JOB-701: Rahul Sharma (Bellandur Site)</option>
                    <option value="JOB-702">JOB-702: Sanjay Reddy (Palm Meadows)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Needed</label>
                  <select
                    value={reqProduct.productName}
                    onChange={(e) => setReqProduct({ ...reqProduct, productName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="Astral CPVC Pro Pipe (1 Inch, 3m)">Astral CPVC Pro Pipe (1 Inch, 3m)</option>
                    <option value="Ashirvad Brass Concealed Stop Cock (15mm)">Ashirvad Brass Concealed Stop Cock (15mm)</option>
                    <option value="Pidilite M-Seal Sanitary & Plumbing Epoxy Putty">Pidilite M-Seal Epoxy Putty (100g)</option>
                    <option value="Finolex SWR PVC Drainage Bend 90°">Finolex SWR PVC Drainage Bend 90°</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={reqProduct.quantity}
                    onChange={(e) => setReqProduct({ ...reqProduct, quantity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site Requirement Note</label>
                  <textarea
                    rows="3"
                    value={reqProduct.reason}
                    onChange={(e) => setReqProduct({ ...reqProduct, reason: e.target.value })}
                    placeholder="Describe why extra fittings are needed..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Send Material Request to Warehouse
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Earnings & UPI Payouts */}
        {activeTab === 'wallet' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-1">Available Plumber Wallet Balance</span>
                <span className="text-3xl font-black text-emerald-600">₹4,850</span>
                <span className="text-xs text-slate-500 block mt-1">Direct instant settlement to registered UPI ID</span>
              </div>

              <button className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20">
                Instant UPI Withdrawal (Demo)
              </button>
            </div>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Recent Job Payouts</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900 block">JOB-689 Tap Replacement</span>
                    <span className="text-[11px] text-slate-500">11 Oct 2026 • Credited to Wallet</span>
                  </div>
                  <span className="font-bold text-emerald-600">+₹450</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-900 block">JOB-650 Full Bath Pipeline Setup</span>
                    <span className="text-[11px] text-slate-500">05 Oct 2026 • Credited to Wallet</span>
                  </div>
                  <span className="font-bold text-emerald-600">+₹1,400</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Trade License & KYC */}
        {activeTab === 'kyc' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Trade License &amp; KYC Verification</h3>
                <p className="text-xs text-slate-500">Official Government Trade Certified Plumbing Contractor</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs mb-6">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">License Certificate No.</span>
                <span className="font-mono font-semibold text-slate-900">{plumber.license}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Trade Verification Status</span>
                <span className="font-bold text-emerald-600">VERIFIED &amp; ACTIVE</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Specialization</span>
                <span className="font-semibold text-slate-900">CPVC/UPVC Piping, Booster Pumps, Sanitaryware</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Plumber Experience</span>
                <span className="font-semibold text-slate-900">8 Years Professional Field Service</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Service Hub</span>
                <span className="font-semibold text-slate-900">Bengaluru Central &amp; East Hub</span>
              </div>
            </div>
          </div>
        )}

      </main>
      </div>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 PlumbMart Technologies Pvt. Ltd. • Plumber Field Partner Network
      </footer>
    </div>
  );
}
