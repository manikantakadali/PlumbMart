import React from 'react';
import { Star, Plus, Minus, Wrench, ShieldCheck } from 'lucide-react';
import { BucketIcon } from './Header';

export default function ProductCard({
  product,
  cartItem,
  onAddToCart,
  onUpdateQuantity
}) {
  const [imageError, setImageError] = React.useState(false);
  const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="group bg-white hover:bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-2.5 sm:p-3 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5">
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center mb-2 border border-slate-100">
          {imageError ? (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1 p-2 text-center">
              <Wrench className="w-6 h-6 text-slate-300" />
              <span className="text-[10px] font-medium text-slate-500 line-clamp-1">{product.name}</span>
            </div>
          ) : (
            <img
              src={product.image || '/products/PLB-PIPE-051.jpg'}
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}

          {/* Badges */}
          {product.tag && (
            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-xs">
              {product.tag}
            </span>
          )}

          {discountPercent > 0 && (
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
          <span className="font-bold text-blue-600 uppercase tracking-wider truncate max-w-[65%]">{product.brand}</span>
          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium text-[9px] truncate">{product.category}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-xs line-clamp-2 leading-snug mb-1 group-hover:text-blue-600 transition-colors" title={product.name}>
          {product.name}
        </h3>

        {/* Rating & Stock */}
        <div className="flex items-center justify-between text-[10px] mb-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200/60 font-semibold">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
            <span>{product.rating}</span>
          </div>

          <div className="flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium">
            <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Stock: {product.stock}</span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Bucket Button */}
      <div className="pt-0.5">
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-slate-900 tracking-tight">₹{product.price.toLocaleString('en-IN')}</span>
          {product.mrp > product.price && (
            <span className="text-[11px] text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
          )}
        </div>

        {cartItem ? (
          <div className="flex items-center justify-between bg-slate-100 border border-blue-400 rounded-lg p-0.5">
            <button
              onClick={() => onUpdateQuantity(product.id, cartItem.quantity - 1)}
              className="w-7 h-7 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition shadow-xs active:scale-95"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-slate-900 px-2 flex items-center gap-1">
              <span>{cartItem.quantity}</span>
              <span className="text-[9px] text-slate-500 font-normal hidden sm:inline">in bucket</span>
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, cartItem.quantity + 1)}
              className="w-7 h-7 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition shadow-xs active:scale-95"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onAddToCart(product)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-wide shadow-xs transition active:scale-[0.98]"
          >
            <BucketIcon className="w-3.5 h-3.5" />
            <span>Add to Bucket</span>
          </button>
        )}
      </div>
    </div>
  );
}
