import React, { useState } from 'react';
import {
  Users,
  Building2,
  Wrench,
  Package,
  ShoppingBag,
  CreditCard,
  BarChart3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldAlert,
  Save,
  RotateCcw,
  FileSpreadsheet
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
  const [activeTab, setActiveTab] = useState('dealers');
  const [editingRow, setEditingRow] = useState(null);
  const [rowForm, setRowForm] = useState({});
  const [toast, setToast] = useState('');

  if (!adminData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading Admin Management Portal...
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
    showToast('Zoho Workbook row updated & synced across Customer and Dealer apps!');
  };

  const tabs = [
    { id: 'dealers', label: 'Dealers & 30/90D Credit', icon: Building2, badge: users.dealers.length },
    { id: 'products', label: 'Products (Zoho Workbook)', icon: Package, badge: products.length },
    { id: 'orders', label: 'Orders & Plumber Assign', icon: ShoppingBag, badge: orders.length },
    { id: 'customers', label: 'Customers', icon: Users, badge: users.customers.length },
    { id: 'plumbers', label: 'Plumbers (KYC)', icon: Wrench, badge: users.plumbers.length },
    { id: 'payments', label: 'Payments & Credit Ledger', icon: CreditCard, badge: payments.length },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Order GMV</div>
          <div className="text-2xl font-bold text-white mt-1">
            ₹{Number(metrics.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-400 mt-1">{metrics.totalOrders} Total Orders</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Zoho Verified Dealers</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {metrics.verifiedDealers} / {metrics.totalDealers}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.approved90DayDealers} Approved for 90-Day Credit
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Active Credit Exposure</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            ₹{Number(metrics.activeCreditExposure || 0).toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-slate-400 mt-1">30-Day &amp; 90-Day Dealer Receivables</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Zoho Workbook Sync</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              {zohoMeta?.syncStatus}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={async () => {
                await onTriggerZohoSync();
                showToast('Synchronised latest Products, Pricing & Stock from Zoho Workbook!');
              }}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync Zoho
            </button>
            <button
              onClick={async () => {
                await onResetDemo();
                showToast('Demo store reset to clean initial state.');
              }}
              title="Reset Demo Data"
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toast}
          </span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
              {t.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    active ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DEALERS & CREDIT PERMISSIONS */}
      {activeTab === 'dealers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-white">
              Dealer Zoho Verification, Credit Eligibility &amp; 30/90-Day Credit Permissions
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle Zoho Verification (required for Dealer OTP Login) and control 30-Day / 90-Day credit permissions in real time. Changes take effect immediately in the Mobile App.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {users.dealers.map((dealer) => (
              <div
                key={dealer.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-base">{dealer.name}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                      {dealer.zohoContactId}
                    </span>
                    {dealer.zohoVerified ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Zoho Verified
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        Unverified in Zoho (Login Blocked)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Contact: <strong className="text-slate-200">{dealer.contactPerson}</strong> | Mobile:{' '}
                    <strong className="text-amber-300 font-mono">{dealer.mobile}</strong> | GSTIN: {dealer.gstin} | City: {dealer.city}
                  </div>
                  <div className="text-xs text-slate-400 pt-1">
                    Credit Used:{' '}
                    <strong className="text-white">₹{dealer.creditUsed.toLocaleString('en-IN')}</strong> / Limit:{' '}
                    <strong className="text-emerald-400">₹{dealer.creditLimit.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Admin Toggle Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* 1. Zoho Verified Toggle */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(dealer.id, { zohoVerified: !dealer.zohoVerified });
                      showToast(`Updated Zoho Verification for ${dealer.name}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                      dealer.zohoVerified
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    }`}
                  >
                    {dealer.zohoVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Zoho Verified: {dealer.zohoVerified ? 'YES' : 'NO'}
                  </button>

                  {/* 2. Credit Eligibility Toggle */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(dealer.id, { creditEligible: !dealer.creditEligible });
                      showToast(`Updated Credit Eligibility for ${dealer.name}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      dealer.creditEligible
                        ? 'bg-blue-500/15 border-blue-500/40 text-blue-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Credit Eligible: {dealer.creditEligible ? 'ON' : 'OFF'}
                  </button>

                  {/* 3. 30-Day Credit Permission */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(dealer.id, {
                        creditEligible: true,
                        credit30DaysAllowed: !dealer.credit30DaysAllowed
                      });
                      showToast(`Toggled 30-Day Credit permission for ${dealer.name}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      dealer.credit30DaysAllowed
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    30-Day Credit: {dealer.credit30DaysAllowed ? 'ALLOWED' : 'LOCKED'}
                  </button>

                  {/* 4. 90-Day Credit Permission (Selected/Approved Dealers Only) */}
                  <button
                    onClick={async () => {
                      await onUpdateDealer(dealer.id, {
                        creditEligible: true,
                        credit90DaysAllowed: !dealer.credit90DaysAllowed
                      });
                      showToast(`Toggled 90-Day Special Credit approval for ${dealer.name}`);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                      dealer.credit90DaysAllowed
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    90-Day Credit (Approved): {dealer.credit90DaysAllowed ? 'APPROVED' : 'LOCKED'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS (ZOHO WORKBOOK LIVE SYNC EDITOR) */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                Products, Pricing &amp; Stock — Zoho Workbook Master Sheet
              </h3>
              <p className="text-xs text-slate-400">
                Edit any row below to simulate updating the Zoho Workbook. Changes immediately sync to Customer (price only) and Dealer (wholesale price + stock quantity) views.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-3 px-3">Row / SKU</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Customer Price (₹)</th>
                  <th className="py-3 px-3">Dealer Price (₹)</th>
                  <th className="py-3 px-3">Zoho Stock Qty</th>
                  <th className="py-3 px-3">Dealer MOQ</th>
                  <th className="py-3 px-3 text-right">Action</th>
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
                      <td className="py-3 px-3 font-medium text-white">
                        {prod.name}
                        <div className="text-slate-400 text-[11px]">{prod.categoryName}</div>
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.customerPrice}
                            onChange={(e) => setRowForm({ ...rowForm, customerPrice: e.target.value })}
                            className="w-24 px-2 py-1 rounded bg-slate-950 border border-blue-500 text-white"
                          />
                        ) : (
                          <span className="text-blue-300 font-semibold">₹{prod.customerPrice.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.dealerPrice}
                            onChange={(e) => setRowForm({ ...rowForm, dealerPrice: e.target.value })}
                            className="w-24 px-2 py-1 rounded bg-slate-950 border border-amber-500 text-white"
                          />
                        ) : (
                          <span className="text-amber-300 font-semibold">₹{prod.dealerPrice.toLocaleString('en-IN')}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {isEditing ? (
                          <input
                            type="number"
                            value={rowForm.stockQuantity}
                            onChange={(e) => setRowForm({ ...rowForm, stockQuantity: e.target.value })}
                            className="w-20 px-2 py-1 rounded bg-slate-950 border border-emerald-500 text-white"
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
                            className="w-16 px-2 py-1 rounded bg-slate-950 border border-slate-600 text-white"
                          />
                        ) : (
                          `${prod.minDealerOrderQty} units`
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isEditing ? (
                          <button
                            onClick={() => saveProductRow(prod.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold inline-flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" /> Save &amp; Sync
                          </button>
                        ) : (
                          <button
                            onClick={() => startEditProduct(prod)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                          >
                            Edit Zoho Row
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

      {/* TAB 3: ORDERS & PLUMBER ASSIGNMENT */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Order Management &amp; Plumber Assignment</h3>
          <div className="space-y-3">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-white">{ord.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        ord.orderRole === 'dealer'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {ord.orderRole}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{ord.userName}</span>
                    <span className="text-xs text-emerald-400 font-bold">
                      ₹{ord.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Payment: <strong className="text-slate-200">{ord.paymentMethod}</strong> ({ord.paymentStatus}) | Due:{' '}
                    <strong className="text-amber-300">{ord.dueDate || 'Immediate'}</strong>
                  </div>
                  <div className="text-xs text-slate-400">
                    Items: {ord.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={ord.orderStatus}
                    onChange={async (e) => {
                      await onUpdateOrder(ord.id, { orderStatus: e.target.value });
                      showToast(`Order ${ord.id} status updated to ${e.target.value}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>

                  {ord.orderRole === 'customer' && (
                    <select
                      value={ord.assignedPlumberId || ''}
                      onChange={async (e) => {
                        await onUpdateOrder(ord.id, { assignedPlumberId: e.target.value });
                        showToast(`Assigned plumber updated for ${ord.id}`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-xs text-purple-200"
                    >
                      <option value="">Unassigned Plumber</option>
                      {users.plumbers.map((plb) => (
                        <option key={plb.id} value={plb.id}>
                          Plumber: {plb.name}
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

      {/* TAB 4: CUSTOMERS */}
      {activeTab === 'customers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Registered Customers (OTP Login)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.customers.map((c) => (
              <div key={c.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="text-xs font-mono text-blue-400">{c.id}</span>
                </div>
                <div className="text-xs text-slate-300">Mobile: +91 {c.mobile}</div>
                <div className="text-xs text-slate-400">Address: {c.address}</div>
                <div className="text-[11px] text-rose-300 pt-1">
                  Access Rule: Retail Pricing Only | Stock Quantity Hidden
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLUMBERS */}
      {activeTab === 'plumbers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Plumbers &amp; Verification Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.plumbers.map((p) => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{p.name}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {p.verificationStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Mobile: <strong className="font-mono">{p.mobile}</strong> | License: {p.licenseNo}
                </div>
                <div className="text-xs text-slate-400">Specialization: {p.specialization}</div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-purple-300 font-semibold">
                    Reward Points: {p.rewardPoints} pts | Jobs: {p.completedJobs}
                  </span>
                  <button
                    onClick={async () => {
                      const next =
                        p.verificationStatus === 'VERIFIED' ? 'PENDING_VERIFICATION' : 'VERIFIED';
                      await onUpdatePlumber(p.id, { verificationStatus: next });
                      showToast(`Plumber ${p.name} status set to ${next}`);
                    }}
                    className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                  >
                    Toggle KYC Verification
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Payments &amp; Dealer Credit Receivables</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                  <th className="py-3 px-3">Payment ID</th>
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Payment Mode</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {payments.map((pay) => (
                  <tr key={pay.id}>
                    <td className="py-3 px-3 font-mono text-slate-300">{pay.id}</td>
                    <td className="py-3 px-3 font-mono text-blue-400">{pay.orderId}</td>
                    <td className="py-3 px-3 font-medium text-white">{pay.partyName}</td>
                    <td className="py-3 px-3 uppercase text-slate-400">{pay.role}</td>
                    <td className="py-3 px-3 text-slate-200">{pay.mode}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 font-mono text-amber-300">{pay.dueDate}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          pay.status === 'SETTLED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Dealer Credit Line Utilization Report</h3>
            {users.dealers.map((d) => {
              const pct = d.creditLimit > 0 ? Math.min(100, Math.round((d.creditUsed / d.creditLimit) * 100)) : 0;
              return (
                <div key={d.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-medium">{d.name}</span>
                    <span className="text-slate-400">
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
            <h3 className="text-base font-bold text-white">Zoho Inventory Valuation Summary</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Total Active SKUs in Zoho Workbook:</span>
                <strong className="text-white">{products.length} SKUs</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Total Physical Units in Warehouse:</span>
                <strong className="text-emerald-400">
                  {products.reduce((acc, p) => acc + p.stockQuantity, 0)} Units
                </strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800">
                <span>Total Wholesale Stock Value (Dealer Rate):</span>
                <strong className="text-amber-300">
                  ₹
                  {products
                    .reduce((acc, p) => acc + p.dealerPrice * p.stockQuantity, 0)
                    .toLocaleString('en-IN')}
                </strong>
              </div>
              <div className="flex justify-between py-2">
                <span>Total Retail Stock Value (Customer Rate):</span>
                <strong className="text-blue-300">
                  ₹
                  {products
                    .reduce((acc, p) => acc + p.customerPrice * p.stockQuantity, 0)
                    .toLocaleString('en-IN')}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
