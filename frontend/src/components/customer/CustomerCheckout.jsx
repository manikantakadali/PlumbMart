import React, { useState } from 'react';
import {
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';

export default function CustomerCheckout({
  cart,
  customer,
  addresses = [],
  selectedAddressId,
  onSelectAddress,
  onAddNewAddress,
  paymentMode,
  onChangePaymentMode,
  subtotal = 0,
  deliveryCharge = 0,
  totalAmount = 0,
  error,
  isSubmitting,
  onPlaceOrder,
  onBackToCart
}) {
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newLabel, setNewLabel] = useState('New Site');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('Hyderabad');
  const [newPincode, setNewPincode] = useState('500081');

  const paymentOptions = [
    {
      id: 'UPI (PhonePe / GPay)',
      name: 'UPI (Google Pay, PhonePe, Paytm)',
      desc: 'Instant UPI settlement via VPA or QR code',
      badge: 'Zero Convenience Fee'
    },
    {
      id: 'Credit / Debit Card',
      name: 'Credit / Debit Card (Visa, RuPay, MC)',
      desc: '128-bit encrypted bank checkout gateway',
      badge: 'All Major Cards'
    },
    {
      id: 'NetBanking',
      name: 'Corporate & Retail NetBanking',
      desc: 'Direct bank portal authorization',
      badge: '50+ Banks'
    }
  ];

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!newLine.trim() || !newPincode.trim()) return;

    await onAddNewAddress({
      label: newLabel,
      addressLine: newLine,
      city: newCity,
      pincode: newPincode,
      isDefault: false
    });

    setNewLine('');
    setShowAddAddressModal(false);
  };

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-base font-extrabold text-white">Customer Checkout &amp; Direct Payment</h2>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Dynamic Delivery Address Selection */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Delivery &amp; Installation Address</span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddAddressModal(true)}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Address
          </button>
        </div>

        {/* Saved Addresses List */}
        <div className="space-y-2">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr.id)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start justify-between ${
                  isSelected
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {addr.addressLine}, {addr.city} - {addr.pincode}
                  </div>
                </div>
                <CheckCircle2
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    isSelected ? 'text-blue-400' : 'text-slate-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-400 pt-1">
          ✓ Certified Plumber (Ramesh Babu) will be assigned to this address for inspection.
        </div>
      </div>

      {/* 2. Direct Payment Options Only (Strict Rule: NO Dealer Credit) */}
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
                    ? 'bg-blue-950/60 border-blue-500 text-white shadow'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px]">
                      {opt.badge}
                    </span>
                  </div>
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

      {/* 3. Dynamic Order Summary Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
        <div className="font-bold text-slate-300 mb-1">Order Items ({cart.length})</div>
        <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
          {cart.map((i) => (
            <div key={i.product.id} className="flex justify-between text-[11px] text-slate-400">
              <span className="truncate max-w-[200px] text-slate-300">
                {i.product.name} × {i.qty}
              </span>
              <span className="font-mono text-slate-200">
                ₹{(i.product.price * i.qty).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-900 space-y-1">
          <div className="flex justify-between text-slate-400">
            <span>Subtotal</span>
            <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Delivery Fee</span>
            <span className="font-mono text-slate-200">
              {deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}
            </span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-900">
            <span>Total Payable</span>
            <span className="text-emerald-400 font-mono text-base">
              ₹{totalAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <button
          onClick={onPlaceOrder}
          disabled={isSubmitting}
          className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          <span>
            {isSubmitting
              ? 'Verifying Payment Gateway...'
              : `Pay ₹${totalAmount.toLocaleString('en-IN')} & Confirm Order`}
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

      {/* Modal: Add New Address */}
      {showAddAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add Delivery Address</h3>
              <button
                onClick={() => setShowAddAddressModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Address Label</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="e.g. Home, Construction Site, Farmhouse"
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Street / Building Address</label>
                <textarea
                  rows={2}
                  value={newLine}
                  onChange={(e) => setNewLine(e.target.value)}
                  placeholder="Flat No, Building, Street, Landmark"
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">City</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newPincode}
                    onChange={(e) => setNewPincode(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition mt-2"
              >
                Save &amp; Use Address
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
