import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function CustomerCart({
  cart,
  subtotal = 0,
  deliveryCharge = 0,
  totalAmount = 0,
  isLoading = false,
  error = null,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
  onRetry
}) {
  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-6 w-1/3 bg-slate-800 rounded animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse space-y-2">
            <div className="h-4 w-1/2 bg-slate-800 rounded" />
            <div className="h-4 w-1/4 bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center space-y-3 bg-slate-950 rounded-2xl border border-rose-500/40 my-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Failed to load cart</h3>
        <p className="text-xs text-slate-400">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="p-8 text-center space-y-4 bg-slate-950 rounded-2xl border border-slate-800 my-4">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-slate-500">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">Your Cart is Empty</h3>
          <p className="text-xs text-slate-400">
            Add CPVC pipes, diverters, booster pumps, or fittings from the dynamic catalog.
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
        >
          Browse Certified Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Shopping Cart ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
        </h2>
        <button
          onClick={onClearCart}
          className="text-xs text-rose-400 hover:underline font-medium"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {cart.map((item) => {
          const prod = item.product;
          return (
            <div
              key={prod.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex-1 space-y-0.5">
                <div className="text-[10px] font-mono text-slate-500">{prod.sku}</div>
                <h4 className="text-xs font-bold text-white leading-snug">{prod.name}</h4>
                <div className="text-[11px] font-semibold text-emerald-400">
                  ₹{prod.price.toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 font-normal">× {item.qty} =</span>{' '}
                  <strong className="text-white font-mono">
                    ₹{(prod.price * item.qty).toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => onUpdateQty(prod.id, -1)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Decrease Quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono font-bold text-xs text-white px-1.5">{item.qty}</span>
                <button
                  onClick={() => onUpdateQty(prod.id, 1)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title="Increase Quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => onRemoveItem(prod.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                title="Remove Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Dynamic Order Summary */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-slate-200">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Delivery &amp; Freight</span>
          <span className="font-mono text-slate-200">
            {deliveryCharge === 0 ? (
              <span className="text-emerald-400 font-medium">Free (Order &gt; ₹5,000)</span>
            ) : (
              `₹${deliveryCharge}`
            )}
          </span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Certified Plumber Inspection</span>
          <span className="text-emerald-400 font-medium">Included (₹0)</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-900">
          <span>Total Amount</span>
          <span className="text-emerald-400 font-mono text-base">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
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
