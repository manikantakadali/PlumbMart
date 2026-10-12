import React from 'react';
import {
  Building2,
  CheckCircle2,
  Lock,
  Package,
  Eye,
  CreditCard,
  Truck,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DealerDashboard({
  dealer,
  products,
  orders,
  onNavigate
}) {
  const availableCredit = Math.max(0, (dealer?.creditLimit || 0) - (dealer?.creditUsed || 0));
  const creditUsagePct = dealer?.creditLimit > 0 ? Math.round(((dealer?.creditUsed || 0) / dealer?.creditLimit) * 100) : 0;

  return (
    <div className="space-y-4 pb-4">
      {/* Dealership Zoho Verified Header Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Zoho Verified ({dealer?.zohoContactId})
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Eye className="w-3.5 h-3.5" /> Live Stock Visible
          </span>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-white leading-snug">{dealer?.name}</h2>
          <div className="text-[11px] text-amber-300 font-medium mt-0.5">{dealer?.tier}</div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">GSTIN: {dealer?.gstin} • {dealer?.city}</div>
        </div>

        {/* Zoho Books Credit Line Widget */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" /> Zoho Credit Line
            </span>
            <span className="font-mono text-emerald-400 font-bold">
              ₹{availableCredit.toLocaleString('en-IN')} Available
            </span>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, creditUsagePct)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Used: <strong className="text-white">₹{(dealer?.creditUsed || 0).toLocaleString('en-IN')}</strong></span>
            <span>Limit: <strong className="text-white">₹{(dealer?.creditLimit || 0).toLocaleString('en-IN')}</strong> ({creditUsagePct}%)</span>
          </div>
        </div>

        {/* 3 Payment Permissions Pills */}
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Upfront Payment
          </span>
          <span
            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
              dealer?.credit30DaysAllowed
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {dealer?.credit30DaysAllowed ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            30-Day Credit: {dealer?.credit30DaysAllowed ? 'Active' : 'Locked'}
          </span>
          <span
            className={`px-2 py-0.5 rounded font-semibold flex items-center gap-1 ${
              dealer?.credit90DaysAllowed
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                : 'bg-rose-500/15 text-rose-300 border border-rose-500/20'
            }`}
          >
            {dealer?.credit90DaysAllowed ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            90-Day Credit: {dealer?.credit90DaysAllowed ? 'Approved' : 'Not Approved'}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onNavigate('PRODUCTS')}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Order Wholesale Stock</span>
          </button>
          <button
            onClick={() => onNavigate('ORDERS')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Orders ({orders?.length || 0})
          </button>
        </div>
      </div>

      {/* Featured Wholesale Inventory Preview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Warehouse Stock (Zoho Live)
          </h3>
          <button
            onClick={() => onNavigate('PRODUCTS')}
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Full Catalog →
          </button>
        </div>

        {products.slice(0, 3).map((prod) => (
          <div
            key={prod.id}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
          >
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500">{prod.sku}</span>
              <h4 className="text-xs font-bold text-white">{prod.name}</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-extrabold text-amber-400">
                  ₹{prod.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">
                  (Retail: ₹{prod.customerPrice})
                </span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold">
                Zoho Stock: {prod.stockQuantity} {prod.unit}
              </div>
            </div>

            <button
              onClick={() => onNavigate('PRODUCTS')}
              className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold transition"
            >
              Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
