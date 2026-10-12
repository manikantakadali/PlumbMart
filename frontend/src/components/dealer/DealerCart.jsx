import React from 'react';
import { ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';

export default function DealerCart({
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
          <h3 className="text-base font-bold text-white">Dealer Bulk Cart is Empty</h3>
          <p className="text-xs text-slate-400">Add products from wholesale catalog to place a bulk order.</p>
        </div>
        <button
          onClick={onContinueShopping}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
        >
          Browse Wholesale Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Dealer Bulk Order Cart ({cart.length} SKUs)
        </h2>
        <button
          onClick={onClearCart}
          className="text-xs text-rose-400 hover:underline font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="space-y-2.5">
        {cart.map((item) => (
          <div
            key={item.product.id}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
          >
            <div className="flex-1 space-y-1">
              <div className="text-[10px] font-mono text-emerald-400">
                {item.product.sku} • In Stock: {item.product.stockQuantity}
              </div>
              <h4 className="text-xs font-bold text-white">{item.product.name}</h4>
              <div className="text-[11px] font-semibold text-amber-400">
                ₹{item.product.price.toLocaleString('en-IN')}{' '}
                <span className="text-slate-400 font-normal">× {item.qty} units =</span>{' '}
                <strong className="text-white">₹{(item.product.price * item.qty).toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => onUpdateQty(item.product.id, -1)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-xs text-white px-1.5">{item.qty}</span>
              <button
                onClick={() => onUpdateQty(item.product.id, 1)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Checkout Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex justify-between text-xs text-slate-400">
          <span>Total Units</span>
          <span className="font-mono text-white font-bold">
            {cart.reduce((sum, item) => sum + item.qty, 0)} Units
          </span>
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
