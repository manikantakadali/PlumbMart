import React from 'react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';

export default function DealerCheckout({
  cart,
  dealer,
  paymentMethod,
  onChangePaymentMethod,
  shippingAddress,
  onChangeShippingAddress,
  error,
  isSubmitting,
  onPlaceOrder,
  onBackToCart
}) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const availableCredit = Math.max(0, (dealer?.creditLimit || 0) - (dealer?.creditUsed || 0));

  // Date calculations
  const date30 = new Date();
  date30.setDate(date30.getDate() + 30);
  const due30Str = date30.toISOString().split('T')[0];

  const date90 = new Date();
  date90.setDate(date90.getDate() + 90);
  const due90Str = date90.toISOString().split('T')[0];

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-base font-extrabold text-white">Dealer Bulk Checkout &amp; Credit Line</h2>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Warehouse Destination */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <label className="block text-xs font-bold text-slate-300">
          Delivery Warehouse / Destination Premise
        </label>
        <textarea
          rows={2}
          value={shippingAddress}
          onChange={(e) => onChangeShippingAddress(e.target.value)}
          placeholder="Enter dealer warehouse address..."
          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Credit Balance Card */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <div className="text-[10px] text-slate-400">Available Zoho Books Credit</div>
          <div className="text-sm font-black font-mono text-emerald-400">
            ₹{availableCredit.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">Order Total</div>
          <div className="text-sm font-black font-mono text-amber-400">
            ₹{total.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 3 Payment Options (Section 4 Requirements) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Dealer Payment Options
        </label>

        {/* Option 1: Upfront Payment */}
        <button
          type="button"
          onClick={() => onChangePaymentMethod('UPFRONT')}
          className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
            paymentMethod === 'UPFRONT'
              ? 'bg-emerald-950/60 border-emerald-500 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">1. Upfront Payment</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Available
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Immediate online settlement via RTGS / NEFT / Corporate UPI.
            </p>
          </div>
          <CheckCircle2
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              paymentMethod === 'UPFRONT' ? 'text-emerald-400' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Option 2: Credit Payment – 30 Days (Based on Dealer Eligibility) */}
        <button
          type="button"
          disabled={!dealer?.creditEligible || !dealer?.credit30DaysAllowed}
          onClick={() => onChangePaymentMethod('CREDIT_30_DAYS')}
          className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
            !dealer?.creditEligible || !dealer?.credit30DaysAllowed
              ? 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed text-slate-500'
              : paymentMethod === 'CREDIT_30_DAYS'
              ? 'bg-amber-950/60 border-amber-500 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">2. Credit Payment – 30 Days</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  dealer?.credit30DaysAllowed
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {dealer?.credit30DaysAllowed ? 'Eligible' : 'Locked by Admin'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Zoho Books 30-Day net credit line. Payment due on{' '}
              <strong className="text-amber-300 font-mono">{due30Str}</strong>.
            </p>
          </div>
          {dealer?.credit30DaysAllowed ? (
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                paymentMethod === 'CREDIT_30_DAYS' ? 'text-amber-400' : 'text-slate-600'
              }`}
            />
          ) : (
            <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          )}
        </button>

        {/* Option 3: Credit Payment – 90 Days (ONLY for Selected / Approved Dealers) */}
        <button
          type="button"
          disabled={!dealer?.creditEligible || !dealer?.credit90DaysAllowed}
          onClick={() => onChangePaymentMethod('CREDIT_90_DAYS')}
          className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
            !dealer?.creditEligible || !dealer?.credit90DaysAllowed
              ? 'bg-slate-950/40 border-rose-500/20 opacity-75 cursor-not-allowed text-slate-400'
              : paymentMethod === 'CREDIT_90_DAYS'
              ? 'bg-purple-950/60 border-purple-500 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                3. Credit Payment – 90 Days
              </span>
              {dealer?.credit90DaysAllowed ? (
                <span className="px-2 py-0.5 rounded bg-purple-500/25 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                  ★ Approved Platinum Dealer
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center gap-1 border border-rose-500/30">
                  <Lock className="w-3 h-3" /> Not Approved
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Available <strong>ONLY for selected/approved dealers</strong>. Payment due on{' '}
              <strong className="text-purple-300 font-mono">{due90Str}</strong>.
            </p>
          </div>
          {dealer?.credit90DaysAllowed ? (
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                paymentMethod === 'CREDIT_90_DAYS' ? 'text-purple-400' : 'text-slate-600'
              }`}
            />
          ) : (
            <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
        </button>
      </div>

      {/* Confirmation Button */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <button
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          <span>
            {isSubmitting
              ? 'Booking Dealer Order...'
              : `Confirm Dealer Order (${paymentMethod.replace(/_/g, ' ')})`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onBackToCart}
          className="w-full text-center text-[11px] text-slate-400 hover:text-white"
        >
          ← Return to Bulk Cart
        </button>
      </div>
    </div>
  );
}
