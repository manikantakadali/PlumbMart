import React, { useState } from 'react';
import { ArrowLeft, ShoppingCart, EyeOff, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CustomerProductDetails({
  product,
  onBack,
  onAddToCart,
  onGoToCart
}) {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  return (
    <div className="space-y-4 py-2">
      <button
        onClick={onBack}
        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1.5 font-semibold transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Products</span>
      </button>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        {/* SKU & Category */}
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
            SKU: {product.sku}
          </span>
          <span className="text-xs text-slate-400">{product.categoryName}</span>
        </div>

        {/* Product Title & Brand */}
        <div>
          <h2 className="text-base font-extrabold text-white leading-snug">{product.name}</h2>
          <div className="text-xs text-slate-400 mt-0.5">Brand: <strong className="text-slate-200">{product.brand}</strong></div>
        </div>

        {/* Price Box */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400">Customer Retail Price</div>
            <div className="text-2xl font-black text-emerald-400">
              ₹{product.price.toLocaleString('en-IN')}
              <span className="text-xs text-slate-400 font-normal"> / {product.unit}</span>
            </div>
            <div className="text-[10px] text-slate-500 line-through">
              MRP ₹{product.mrp.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Business rule highlight */}
          <div className="text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
              <EyeOff className="w-3 h-3" /> Stock Qty Hidden
            </span>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              ✓ {product.availability}
            </div>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="space-y-1.5 text-xs">
          <div className="font-bold text-slate-200">Specifications &amp; Standards:</div>
          <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            {product.specifications || product.description}
          </p>
        </div>

        {/* Quantity Selector & Add Button */}
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-2 py-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-2 py-1 text-slate-300 font-bold hover:text-white"
            >
              -
            </button>
            <span className="px-3 font-mono font-bold text-xs text-white">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="px-2 py-1 text-slate-300 font-bold hover:text-white"
            >
              +
            </button>
          </div>

          <button
            onClick={() => {
              onAddToCart(product, qty);
              onGoToCart();
            }}
            className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart &amp; Checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
