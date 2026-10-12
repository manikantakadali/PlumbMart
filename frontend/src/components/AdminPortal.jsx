import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wrench,
  Package,
  ShoppingBag,
  CreditCard,
  SlidersHorizontal,
  BarChart3,
  Bell,
  Settings,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Save,
  RotateCcw,
  FileSpreadsheet,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AdminPortal({
  adminData,
  onUpdateDealer,
  onUpdatePlumber,
  onUpdateProductRow,
  onUpdateOrder,
  onTriggerZohoSync,
  onResetDemo
}) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [editingRow, setEditingRow] = useState(null);
  const [rowForm, setRowForm] = useState({});
  const [toast, setToast] = useState('');

  if (!adminData) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs">
        Loading PlumbMart Admin Management Portal...
      </div>
    );
  }

  const { users, products, orders, payments, metrics, zohoMeta } = adminData;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const startEditProduct = (prod) => {
    setEditingRow(prod.id);
    setRowForm({
      customerPrice: prod.customerPrice,
      dealerPrice: prod.dealerPrice,
      stockQuantity: prod.stockQuantity,
      minDealerOrderQty: prod.minDealerOrderQty
    });
  };

  const saveProductRow = async (productId) => {
    await onUpdateProductRow(productId, rowForm);
    setEditingRow(null);
    showToast('Zoho Workbook row updated and synced live!');
  };

  // 11 Sections matching Section 7 exactly
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users, badge: users.customers.length },
    { id: 'dealers', label: 'Dealers', icon: Building2, badge: users.dealers.length },
    { id: 'plumbers', label: 'Plumbers', icon: Wrench, badge: users.plumbers.length },
    { id: 'products', label: 'Products (Zoho)', icon: Package, badge: products.length },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: payments.length },
    { id: 'credit', label: 'Credit Management', icon: SlidersHorizontal },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Title Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> PlumbMart Super Admin Management
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">System Governance &amp; Zoho Control</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            11 Management Modules • Dealer Zoho Verification • 30/90-Day Credit Permissions • Live Workbook Editor
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              await onTriggerZohoSync();
              showToast('Synchronised latest products, pricing, and stock from Zoho Workbook!');
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Zoho Workbook</span>
          </button>
          <button
            onClick={async () => {
              await onResetDemo();
              showToast('Demo store reset to clean state.');
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Reset Demo Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* 11 Section Navigation Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        {sections.map((s) => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
              {s.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    active ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {s.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. DASHBOARD OVERVIEW                                     */}
      {/* ========================================================= */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Total Order GMV</div>
              <div className="text-2xl font-black text-white mt-1">
                ₹{Number(metrics.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-emerald-400 mt-1">{metrics.totalOrders} Confirmed Orders</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Zoho Verified Dealers</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {metrics.verifiedDealers} / {metrics.totalDealers}
              </div>
              <div className="text-xs text-purple-300 mt-1">
                {metrics.approved90DayDealers} Approved for 90D Credit
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Active Credit Exposure</div>
              <div className="text-2xl font-black text-purple-400 mt-1">
                ₹{Number(metrics.activeCreditExposure || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400 mt-1">Zoho Books Outstanding Receivables</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 font-medium">Zoho Master Inventory</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0)} Units
              </div>
              <div className="text-xs text-slate-400 mt-1">{products.length} Active SKUs Synced</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSection('dealers')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition space-y-1"
            >
              <Building2 className="w-5 h-5 text-amber-400" />
              <div className="font-bold text-sm text-white">Approve / Manage Dealers</div>
              <p className="text-xs text-slate-400">Toggle Zoho verification and credit limits.</p>
            </button>
            <button
              onClick={() => setActiveSection('credit')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left transition space-y-1"
            >
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <div className="font-bold text-sm text-white">Credit Management (30D &amp; 90D)</div>
              <p className="text-xs text-slate-400">Grant special 90-day credit approval.</p>
            </button>
            <button
              onClick={() => setActiveSection('products')}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition space-y-1"
            >
              <Package className="w-5 h-5 text-emerald-400" />
              <div className="font-bold text-sm text-white">Zoho Workbook Live Editor</div>
              <p className="text-xs text-slate-400">Edit customer/dealer prices &amp; warehouse stock.</p>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. CUSTOMERS LIST                                         */}
      {/* ========================================================= */}
      {activeSection === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-extrabold text-white">Registered Customers ({users.customers.length})</h2>
              <p className="text-xs text-slate-400">Customers registered via mobile OTP authentication</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-3 px-3">Customer ID</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Mobile Number</th>
                  <th className="py-3 px-3">Address</th>
                  <th className="py-3 px-3">Access Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.customers.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-3 font-mono text-blue-400 font-bold">{c.id}</td>
                    <td className="py-3 px-3 font-semibold text-white">{c.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">+91 {c.mobile}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{c.address}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold text-[10px]">
                        Retail B2C (No Stock Qty)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DEALERS (VIEW, APPROVE, VERIFY IN ZOHO)                */}
      {/* ========================================================= */}
      {activeSection === 'dealers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Dealers Registry &amp; Zoho CRM Verification
            </h2>
            <p className="text-xs text-slate-400">
              Dealers can login <strong className="text-white">ONLY if verified in Zoho CRM</strong>. Toggle verification to test access.
            </p>
          </div>

          <div className="space-y-3">
            {users.dealers.map((dealer) => (
              <div
                key={dealer.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{dealer.name}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300 text-[10px]">
                      {dealer.zohoContactId}
                    </span>
                    {dealer.zohoVerified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Zoho Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Unverified in Zoho (Login Blocked)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Contact: <strong className="text-slate-200">{dealer.contactPerson}</strong> | Mobile:{' '}
                    <span className="font-mono text-amber-300">+91 {dealer.mobile}</span> | GSTIN: {dealer.gstin}
                  </div>
                  <div className="text-xs text-slate-400 pt-0.5">
                    Credit Limit:{' '}
                    <strong className="text-emerald-400 font-mono">₹{dealer.creditLimit.toLocaleString('en-IN')}</strong> | Used:{' '}
                    <span className="font-mono text-white">₹{dealer.creditUsed.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await onUpdateDealer(dealer.id, { zohoVerified: !dealer.zohoVerified });
                      showToast(`Updated Zoho CRM verification for ${dealer.name}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                      dealer.zohoVerified
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    }`}
                  >
                    {dealer.zohoVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Zoho Verified: {dealer.zohoVerified ? 'YES' : 'NO'}</span>
                  </button>

                  <button
                    onClick={() => setActiveSection('credit')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                  >
                    Manage Credit →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. PLUMBERS (VIEW & KYC TRADE VERIFICATION)               */}
      {/* ========================================================= */}
      {activeSection === 'plumbers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Plumbers Trade Registry &amp; Verification Process
            </h2>
            <p className="text-xs text-slate-400">
              Approve plumber trade licenses &amp; KYC status to assign them to customer orders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.plumbers.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{p.name}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {p.verificationStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-0.5">
                  <div>License: <strong className="font-mono text-purple-300">{p.licenseNo}</strong></div>
                  <div>Mobile: <strong className="font-mono text-slate-200">+91 {p.mobile}</strong></div>
                  <div>Specialization: {p.specialization}</div>
                  <div>Rating: ★ {p.rating} | Completed: {p.completedJobs} Jobs</div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-end">
                  <button
                    onClick={async () => {
                      const next = p.verificationStatus === 'VERIFIED' ? 'PENDING_VERIFICATION' : 'VERIFIED';
                      await onUpdatePlumber(p.id, { verificationStatus: next });
                      showToast(`Plumber ${p.name} set to ${next}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                  >
                    Toggle Trade Verification
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. PRODUCTS (ZOHO WORKBOOK LIVE SYNC & EDIT)              */}
      {/* ========================================================= */}
      {activeSection === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Products, Pricing &amp; Stock — Zoho Workbook Master Sheet
              </h2>
              <p className="text-xs text-slate-400">
                Edit rows below to simulate updating Zoho Workbook. Changes immediately reflect in Customer and Dealer views.
              </p>
            </div>
            <button
              onClick={async () => {
                await onTriggerZohoSync();
                showToast('Synchronised products from Zoho Workbook!');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Zoho</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-2.5 px-3">Row / SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Customer Price (₹)</th>
                  <th className="py-2.5 px-3">Dealer Price (₹)</th>
                  <th className="py-2.5 px-3">Zoho Stock Qty</th>
                  <th className="py-2.5 px-3">MOQ</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {products.map((prod) => {
                  const isEditing = editingRow === prod.id;
                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-mono text-emerald-400">
                        {prod.zohoRowId} <div className="text-slate-500">{prod.sku}</div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {prod.name}
                        <div className="text-slate-400 text-[10px]">{prod.categoryName}</div>
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.customerPrice}
                            onChange={(e) => setRowForm({ ...rowForm, customerPrice: e.target.value })}
                            className="w-24 px-2 py-1 rounded bg-slate-950 border border-blue-500 text-white font-mono"
                          />
                        ) : (
                          <span className="text-blue-300 font-bold">₹{prod.customerPrice.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.dealerPrice}
                            onChange={(e) => setRowForm({ ...rowForm, dealerPrice: e.target.value })}
                            className="w-24 px-2 py-1 rounded bg-slate-950 border border-amber-500 text-white font-mono"
                          />
                        ) : (
                          <span className="text-amber-300 font-bold">₹{prod.dealerPrice.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.stockQuantity}
                            onChange={(e) => setRowForm({ ...rowForm, stockQuantity: e.target.value })}
                            className="w-20 px-2 py-1 rounded bg-slate-950 border border-emerald-500 text-white font-mono"
                          />
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-bold">
                            {prod.stockQuantity} {prod.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.minDealerOrderQty}
                            onChange={(e) => setRowForm({ ...rowForm, minDealerOrderQty: e.target.value })}
                            className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-600 text-white font-mono"
                          />
                        ) : (
                          `${prod.minDealerOrderQty} units`
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => saveProductRow(prod.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold inline-flex items-center gap-1 shadow"
                          >
                            <Save className="w-3.5 h-3.5" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                          >
                            Edit Row
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. ORDERS (CUSTOMER & DEALER ORDERS & PLUMBER ASSIGN)     */}
      {/* ========================================================= */}
      {activeSection === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-extrabold text-white">Orders Management ({orders.length})</h2>

          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs">{ord.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.orderRole === 'dealer'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {ord.orderRole}
                    </span>
                    <span className="text-xs font-bold text-white">{ord.userName}</span>
                    <span className="text-xs text-emerald-400 font-mono font-bold">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Payment: <strong className="text-slate-200">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                  </div>
                  <div className="text-xs text-slate-400">
                    Items: {ord.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Dropdown: Placed -> Confirmed -> Processing -> Shipped -> Delivered */}
                  <select
                    value={ord.orderStatus}
                    onChange={async (e) => {
                      await onUpdateOrder(ord.id, { orderStatus: e.target.value });
                      showToast(`Order ${ord.id} status updated to ${e.target.value}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  {/* Plumber assignment for customer orders */}
                  {ord.orderRole === 'customer' && (
                    <select
                      value={ord.assignedPlumberId || ''}
                      onChange={async (e) => {
                        await onUpdateOrder(ord.id, { assignedPlumberId: e.target.value });
                        showToast(`Updated assigned plumber for ${ord.id}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200"
                    >
                      <option value="">No Plumber Assigned</option>
                      {users.plumbers.map((p) => (
                        <option key={p.id} value={p.id}>
                          Assign: {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. PAYMENTS & DEALER CREDIT INVOICES                      */}
      {/* ========================================================= */}
      {activeSection === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-extrabold text-white">Payments &amp; Credit Ledger ({payments.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-2.5 px-3">Payment ID</th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{p.id}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-400">{p.orderId}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{p.partyName}</td>
                    <td className="py-2.5 px-3 uppercase text-slate-400">{p.role}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.mode}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-300">{p.dueDate}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Successful'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. CREDIT MANAGEMENT (30-DAY & 90-DAY PERMISSIONS)        */}
      {/* ========================================================= */}
      {activeSection === 'credit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-white">
              Dealer Credit Eligibility &amp; 30/90-Day Credit Governance
            </h2>
            <p className="text-xs text-slate-400">
              Control which dealers can access 30-day and 90-day credit. 90-day credit should strictly be restricted to selected/approved dealers.
            </p>
          </div>

          <div className="space-y-4">
            {users.dealers.map((d) => (
              <div key={d.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-white text-sm">{d.name}</h4>
                    <div className="text-xs text-amber-300 font-medium">{d.tier}</div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Used: <strong className="text-white">₹{d.creditUsed.toLocaleString('en-IN')}</strong> / Limit: <strong className="text-emerald-400">₹{d.creditLimit.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-900">
                  {/* Credit Eligibility Toggle */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(d.id, { creditEligible: !d.creditEligible });
                      showToast(`Toggled Credit Eligibility for ${d.name}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      d.creditEligible
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold">Credit Line: {d.creditEligible ? 'ENABLED' : 'DISABLED'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Global credit line switch</div>
                  </button>

                  {/* 30-Day Credit Toggle */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(d.id, {
                        creditEligible: true,
                        credit30DaysAllowed: !d.credit30DaysAllowed
                      });
                      showToast(`Toggled 30-Day Credit for ${d.name}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      d.credit30DaysAllowed
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold">30-Day Credit: {d.credit30DaysAllowed ? 'ALLOWED' : 'LOCKED'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Standard verified dealer credit</div>
                  </button>

                  {/* 90-Day Credit Toggle (Selected / Approved Only) */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(d.id, {
                        creditEligible: true,
                        credit90DaysAllowed: !d.credit90DaysAllowed
                      });
                      showToast(`Toggled 90-Day Credit Special Approval for ${d.name}`);
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      d.credit90DaysAllowed
                        ? 'bg-purple-500/25 border-purple-500/40 text-purple-200'
                        : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold">90-Day Credit: {d.credit90DaysAllowed ? '★ APPROVED' : '🔒 LOCKED'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Selected Platinum dealers only</div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. REPORTS & ANALYTICS                                    */}
      {/* ========================================================= */}
      {activeSection === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Dealer Credit Line Utilization
            </h3>
            {users.dealers.map((d) => {
              const pct = d.creditLimit > 0 ? Math.min(100, Math.round((d.creditUsed / d.creditLimit) * 100)) : 0;
              return (
                <div key={d.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{d.name}</span>
                    <span className="text-slate-400 font-mono">
                      ₹{d.creditUsed.toLocaleString('en-IN')} / ₹{d.creditLimit.toLocaleString('en-IN')} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Zoho Inventory Valuation
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Active SKUs in Zoho Workbook:</span>
                <strong className="text-white">{products.length} SKUs</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Total Physical Units:</span>
                <strong className="text-emerald-400 font-mono">
                  {products.reduce((acc, p) => acc + p.stockQuantity, 0)} Units
                </strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span className="text-slate-400">Wholesale Stock Valuation (Dealer Rate):</span>
                <strong className="text-amber-400 font-mono">
                  ₹{products.reduce((acc, p) => acc + p.dealerPrice * p.stockQuantity, 0).toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Retail Stock Valuation (Customer Rate):</span>
                <strong className="text-blue-400 font-mono">
                  ₹{products.reduce((acc, p) => acc + p.customerPrice * p.stockQuantity, 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. NOTIFICATIONS                                         */}
      {/* ========================================================= */}
      {activeSection === 'notifications' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-extrabold text-white">System Notifications &amp; Alerts</h2>
          <div className="space-y-2.5">
            {(users.admins[0]?.notifications || []).map((n) => (
              <div key={n.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-900 text-blue-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{n.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. SETTINGS & ZOHO CONFIGURATION                         */}
      {/* ========================================================= */}
      {activeSection === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-extrabold text-white">System Settings &amp; Zoho Integration Config</h2>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Zoho Workbook ID:</span>
              <span className="font-mono text-emerald-400 font-bold">{zohoMeta?.workbookId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Workbook Sheet Name:</span>
              <span className="text-slate-200">{zohoMeta?.workbookName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Synced Timestamp:</span>
              <span className="font-mono text-slate-200">{new Date(zohoMeta?.lastSyncedAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">API Webhook Status:</span>
              <span className="text-emerald-400 font-bold">Active &amp; Listening</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={async () => {
                await onResetDemo();
                showToast('Reset demo state successfully.');
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-bold transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo to Clean Factory Seed</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
