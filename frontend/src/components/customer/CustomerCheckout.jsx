import React, { useState } from 'react';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

export default function CustomerCheckout({
  cart,
  customer,
  paymentMode,
  onChangePaymentMode,
  shippingAddress,
  onChangeShippingAddress,
  error,
  isSubmitting,
  onPlaceOrder,
  onBackToCart
}) {
  const total = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const paymentOptions = [
    { id: 'UPI (PhonePe / GPay)', name: 'UPI (Google Pay, PhonePe, Paytm)', desc: 'Instant UPI settlement via QR or VPA' },
    { id: 'Credit / Debit Card', name: 'Credit / Debit Card (Visa, RuPay, MC)', desc: 'Secure 128-bit encrypted card gateway' },
    { id: 'NetBanking', name: 'NetBanking (All Major Banks)', desc: 'Direct bank portal authorization' }
  ];

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-base font-extrabold text-white">Customer Checkout &amp; Direct Payment</h2>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Delivery Address */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span>Site Delivery &amp; Installation Address</span>
        </div>
        <textarea
          rows={2}
          value={shippingAddress}
          onChange={(e) => onChangeShippingAddress(e.target.value)}
          placeholder="Enter detailed site address..."
          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-blue-500 focus:outline-none"
        />
        <div className="text-[10px] text-slate-400">
          Verified Plumber (Ramesh Babu) will be assigned to this address upon confirmation.
        </div>
      </div>

      {/* Direct Payment Selection (Section 3 & 10) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Direct Payment Mode
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
            Direct Settlement
          </span>
        </div>

        <div className="space-y-2">
          {paymentOptions.map((opt) => {
            const selected = paymentMode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangePaymentMode(opt.id)}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between ${
                  selected
                    ? 'bg-blue-950/50 border-blue-500 text-white shadow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white">{opt.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </div>
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    selected ? 'text-blue-400' : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bill Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Items ({cart.length})</span>
          <span className="font-mono text-slate-200">₹{total.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Plumber Verification Fee</span>
          <span className="text-emerald-400">Waived (₹0)</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-900">
          <span>Total Direct Payment</span>
          <span className="text-emerald-400 font-mono text-base">₹{total.toLocaleString('en-IN')}</span>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          <span>
            {isSubmitting ? 'Processing Payment...' : `Pay ₹${total.toLocaleString('en-IN')} & Confirm Order`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onBackToCart}
          className="w-full text-center text-[11px] text-slate-400 hover:text-white pt-1"
        >
          ← Edit Shopping Cart
        </button>
      </div>
    </div>
  );
}
