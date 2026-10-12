import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Database,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Lock,
  Unlock,
  Layers,
  FileSpreadsheet,
  GitBranch,
  UserCheck,
  Building2,
  Wrench,
  Sliders
} from 'lucide-react';

export default function BlueprintAndComparison({ zohoMeta, products, onTriggerZohoSync, onSwitchView }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await onTriggerZohoSync();
    setTimeout(() => setSyncing(false), 500);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
              <Layers className="w-3.5 h-3.5" />
              Expected Interview Output — Architecture & Wireframe Blueprint
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              PlumbMart End-to-End Application Flow & Zoho Integration Architecture
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Complete interactive breakdown of the 3 Mobile Dashboards (Customer, Dealer, Plumber), OTP & Zoho CRM Verification, Zoho Workbook Price/Stock Synchronisation, and 30/90-Day Credit Governance.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSwitchView('mobile')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              <Smartphone className="w-4 h-4" />
              Launch Interactive Mobile App
            </button>
            <button
              onClick={() => onSwitchView('admin')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-2 transition"
            >
              <Sliders className="w-4 h-4" />
              Open Admin Control Panel
            </button>
          </div>
        </div>
      </div>

      {/* 1. Key Differences Between Customer and Dealer Access */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Key Differences: Customer vs Dealer Access (Business Logic Enforcement)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Enforced at both the Node.js API layer (<code className="text-blue-300">GET /api/products?role=...</code>) and React Mobile UI.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <th className="py-3 px-4 bg-slate-950/60 rounded-tl-xl">Feature / Access Control</th>
                <th className="py-3 px-4 bg-blue-950/30 text-blue-300">Customer Access</th>
                <th className="py-3 px-4 bg-amber-950/30 text-amber-300">Dealer Access (B2B)</th>
                <th className="py-3 px-4 bg-purple-950/30 text-purple-300 rounded-tr-xl">Plumber Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">1. Login & Registration (OTP)</td>
                <td className="py-3.5 px-4 text-slate-300">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Open Mobile OTP
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">Any customer can register & login via mobile OTP</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                    <Lock className="w-4 h-4" /> Restricted by Zoho Registry
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">Login allowed ONLY if mobile is registered & verified in Zoho</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300">
                  <span className="inline-flex items-center gap-1 text-purple-400 font-medium">
                    <UserCheck className="w-4 h-4" /> KYC / License Verified
                  </span>
                  <div className="text-xs text-slate-400 mt-0.5">OTP login + Admin trade license verification</div>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">2. Zoho Stock Quantity Visibility</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <XCircle className="w-3.5 h-3.5" /> Stock Quantity Hidden
                  </span>
                  <div className="text-xs text-slate-400 mt-1">Sees only &ldquo;In Stock&rdquo; badge; exact count stripped by API</div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Exact Stock Quantity Visible
                  </span>
                  <div className="text-xs text-slate-400 mt-1">Views live Zoho Workbook stock count (e.g., 420 Bundles)</div>
                </td>
                <td className="py-3.5 px-4 text-slate-400 text-xs">
                  Sees product availability + installation technical notes
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">3. Product Pricing Tier</td>
                <td className="py-3.5 px-4 text-slate-300">
                  <strong>Retail Customer Price</strong> (B2C)
                </td>
                <td className="py-3.5 px-4 text-amber-300">
                  <strong>Wholesale Dealer Price</strong> (B2B Margin + MOQ)
                </td>
                <td className="py-3.5 px-4 text-purple-300">
                  Retail Reference + <strong>Reward Points / Scan</strong>
                </td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-slate-200">4. Checkout & Payment Options</td>
                <td className="py-3.5 px-4 text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-medium">Direct Payment Only</span>
                  <div className="text-xs text-slate-400 mt-1">UPI, Credit/Debit Card, NetBanking</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300 space-y-1">
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-medium">1. Upfront Payment</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs font-medium">2. Credit – 30 Days</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-medium">3. Credit – 90 Days*</span>
                  </div>
                  <div className="text-xs text-slate-400">*90-Day Credit unlocked ONLY for Admin-selected/approved dealers</div>
                </td>
                <td className="py-3.5 px-4 text-slate-400 text-xs">
                  N/A (Receives assigned installation jobs & commission payouts)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. End-to-End Application Flow Wireframes (All 4 Flows) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Flow Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              3. Customer Flow
            </span>
            <span className="text-xs text-slate-400">B2C Retail Experience</span>
          </div>
          <h3 className="text-base font-bold text-white mb-3">Customer Purchase & Live Order Tracking</h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              'OTP Login',
              'Customer Dashboard',
              'Categories',
              'Products (Price Only, No Stock Qty)',
              'Product Details',
              'Cart',
              'Checkout',
              'Direct Payment',
              'Order Confirmation',
              'Order Tracking'
            ].map((step, idx, arr) => (
              <React.Fragment key={step}>
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium">
                  {idx + 1}. {step}
                </span>
                {idx < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Dealer Flow Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              4. Dealer Flow
            </span>
            <span className="text-xs text-slate-400">B2B Wholesale & Credit Line</span>
          </div>
          <h3 className="text-base font-bold text-white mb-3">Zoho-Verified Dealer & 30/90-Day Credit Checkout</h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              'OTP Login',
              'Zoho CRM Verification Gate',
              'Dealer Dashboard (Credit Limit)',
              'Products Catalog',
              'View Wholesale Price & Exact Stock Qty',
              'Bulk Cart',
              'Checkout (Upfront / 30-Day / 90-Day Approved Credit)'
            ].map((step, idx, arr) => (
              <React.Fragment key={step}>
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-amber-500/30 text-amber-100 font-medium">
                  {idx + 1}. {step}
                </span>
                {idx < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Plumber Flow Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider">
              5. Plumber Flow
            </span>
            <span className="text-xs text-slate-400">Field Partner & Service App</span>
          </div>
          <h3 className="text-base font-bold text-white mb-3">Plumber Verification, Assigned Jobs & Tech Specs</h3>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              'OTP Login',
              'KYC / License Verification Check',
              'Plumber Dashboard',
              'Assigned Orders & Installation Tasks',
              'Product Specs & Reward Points',
              'Profile & Instant Notifications'
            ].map((step, idx, arr) => (
              <React.Fragment key={step}>
                <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-purple-500/30 text-purple-100 font-medium">
                  {idx + 1}. {step}
                </span>
                {idx < arr.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Zoho Integration Architecture Card */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Zoho Integration Points
            </span>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing Zoho...' : 'Sync Zoho Workbook Now'}
            </button>
          </div>
          <h3 className="text-base font-bold text-white mb-2">How Zoho Synchronises End-to-End</h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">1. Zoho Workbook (Sheet API / Webhook):</strong> Master source for SKUs, Retail Price, Dealer Wholesale Price, and Warehouse Stock Quantity. Last synced:{' '}
                <span className="text-emerald-400 font-mono">
                  {zohoMeta?.lastSyncedAt ? new Date(zohoMeta.lastSyncedAt).toLocaleTimeString() : 'Live'}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">2. Zoho CRM Dealer Registry:</strong> Validates Dealer mobile number &amp; <code className="text-amber-300">zohoVerified</code> flag during OTP login. Blocks unverified dealers automatically.
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <GitBranch className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">3. Zoho Books Credit Ledger:</strong> Tracks Dealer credit limits, 30-Day vs 90-Day credit eligibility, and auto-deducts Zoho Workbook stock on order placement.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Zoho Workbook Sheet Snapshot */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Live Zoho Workbook Master Sheet ({zohoMeta?.workbookName || 'PlumbMart_Master_Inventory.xlsx'})
            </h3>
            <p className="text-xs text-slate-400">
              Showing real-time rows synced from Zoho Workbook. Notice how Customer Price, Dealer Price, and Stock Quantity are maintained in one sheet and filtered per role.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Workbook ID: {zohoMeta?.workbookId || 'ZOHO-WB-2026'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                <th className="py-2.5 px-3">Zoho Row</th>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Customer Price (B2C)</th>
                <th className="py-2.5 px-3">Dealer Price (B2B)</th>
                <th className="py-2.5 px-3">Zoho Stock Qty (Dealer/Admin Only)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(products || []).map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-emerald-400">{p.zohoRowId || 'ROW'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">{p.sku}</td>
                  <td className="py-2.5 px-3 font-medium text-white">{p.name}</td>
                  <td className="py-2.5 px-3 text-blue-300 font-semibold">₹{Number(p.customerPrice || p.price).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3 text-amber-300 font-semibold">₹{Number(p.dealerPrice || p.price).toLocaleString('en-IN')}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-mono font-semibold">
                      {p.stockQuantity ?? 'Hidden'} {p.unit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
