import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CustomerCart({
  cart,
  onUpdateQty,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping
}) {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="p-8 text-center space-y-4 bg-slate-950 rounded-2xl border border-slate-800 my-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Your Cart is Empty</h3>
          <p className="text-xs text-slate-400">Add CPVC pipes, diverters, or fittings to get started.</p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Shopping Cart ({cart.length} Items)
        </h2>
        <button
          onClick={onClearCart}
          className="text-xs text-rose-400 hover:underline font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
          >
            <div className="flex-1 space-y-0.5">
              <div className="text-[10px] font-mono text-slate-500">{item.product.sku}</div>
              <h4 className="text-xs font-bold text-white leading-snug">{item.product.name}</h4>
              <div className="text-[11px] font-semibold text-emerald-400">
                ₹{item.product.price.toLocaleString('en-IN')}{' '}
                <span className="text-slate-400 font-normal">× {item.qty} =</span>{' '}
                <strong className="text-white">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => onUpdateQty(item.product.id, -1)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs text-white px-1.5">{item.qty}</span>
              <button
                onClick={() => onUpdateQty(item.product.id, 1)}
                className="p-1 text-slate-400 hover:text-white transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Installation Support</span>
          <span className="text-emerald-400 font-medium">Free Plumber Inspection</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-900">
          <span>Total Payable</span>
          <span className="text-emerald-400 font-mono text-base">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <button
          onClick={onProceedToCheckout}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
