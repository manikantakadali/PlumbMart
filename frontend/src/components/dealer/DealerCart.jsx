import React from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  Trash2,
  AlertTriangle,
  RefreshCw,
  PackageCheck
} from 'lucide-react';

export default function DealerCart({
  cart = [],
  isLoading = false,
  error = null,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  onContinueShopping,
  onRetry
}) {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price || item.product.dealerPrice || 0) * item.qty, 0);
  const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono text-xs flex flex-col items-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
        <span>Syncing Wholesale Dealer Cart...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-slate-950 rounded-2xl border border-rose-500/40 my-4 space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Cart Sync Error</h3>
        <p className="text-xs text-rose-300">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Retry
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
          <h3 className="text-base font-bold text-white">Dealer Bulk Cart is Empty</h3>
          <p className="text-xs text-slate-400">
            Add wholesale products from the catalog to build a bulk order quote.
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
        >
          Browse Wholesale Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Dealer Bulk Order Cart ({cart.length} SKUs)
          </h2>
          <p className="text-[11px] text-slate-400 font-mono">
            {totalUnits} Total Wholesale Units Selected
          </p>
        </div>
        <button
          onClick={onClearCart}
          className="text-xs text-rose-400 hover:underline font-medium"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-2.5">
        {cart.map((item) => {
          const unitPrice = item.product.price || item.product.dealerPrice || 0;
          const maxStock = item.product.stockQuantity || 0;
          const minMoq = item.product.minDealerOrderQty || 1;
          const isAtMax = maxStock > 0 && item.qty >= maxStock;

          return (
            <div
              key={item.product.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {item.product.sku}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Zoho Stock: <strong className="text-emerald-300">{maxStock}</strong>
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white leading-snug">{item.product.name}</h4>
                <div className="text-[11px] font-semibold text-amber-400">
                  ₹{unitPrice.toLocaleString('en-IN')}{' '}
                  <span className="text-slate-400 font-normal">× {item.qty} units =</span>{' '}
                  <strong className="text-white">₹{(unitPrice * item.qty).toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => onUpdateQty(item.product.id, -1)}
                    className="p-1 text-slate-400 hover:text-white transition"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono font-bold text-xs text-white px-1.5">{item.qty}</span>
                  <button
                    onClick={() => onUpdateQty(item.product.id, 1)}
                    disabled={isAtMax}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                    title={isAtMax ? 'Stock limit reached' : 'Increase quantity'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Summary Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Total Wholesale Units</span>
          <span className="font-mono text-white font-bold">{totalUnits} Units</span>
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>Freight / Bulk Transport</span>
          <span className="text-emerald-400 font-semibold font-mono">Free B2B Delivery</span>
        </div>
        <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-900">
          <span>Wholesale Order Value</span>
          <span className="text-amber-400 font-mono text-base">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <button
          onClick={onProceedToCheckout}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
        >
          <span>Select Payment &amp; Credit Option</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
