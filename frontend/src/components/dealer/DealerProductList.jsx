import React from 'react';
import { Search, Package, Eye, ShoppingCart, CheckCircle2 } from 'lucide-react';

export default function DealerProductList({
  products,
  searchQuery,
  onSearchChange,
  onAddToCart,
  onOpenCart
}) {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Wholesale Products &amp; Stock
          </h2>
          <p className="text-[11px] text-slate-400">
            Live Zoho Workbook inventory &amp; dealer tier pricing
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <Eye className="w-3 h-3" /> Exact Stock Visible
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search wholesale products, SKU, category..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 focus:outline-none placeholder-slate-500"
        />
      </div>

      {/* Products list with Stock Quantity & Wholesale Price */}
      <div className="space-y-3">
        {products.map((prod) => (
          <div
            key={prod.id}
            className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {prod.zohoRowId} • {prod.sku}
                </span>
                <h4 className="text-xs font-bold text-white mt-0.5">{prod.name}</h4>
                <div className="text-[10px] text-slate-400">{prod.categoryName}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium">
                MOQ: {prod.minDealerOrderQty} {prod.unit}
              </span>
            </div>

            {/* Wholesale Price vs Retail Price */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Dealer Wholesale Price</div>
                <div className="text-base font-black text-amber-400">
                  ₹{prod.price.toLocaleString('en-IN')}{' '}
                  <span className="text-xs text-slate-400 font-normal">/ {prod.unit}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Retail (Customer): <strong className="text-slate-200">₹{prod.customerPrice}</strong> (Margin: ₹{prod.customerPrice - prod.dealerPrice})
                </div>
              </div>

              {/* Exact Stock Quantity Visible to Dealer (Section 4 & 6) */}
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Zoho Available Stock</div>
                <div className="text-sm font-black font-mono text-emerald-400">
                  {prod.stockQuantity} {prod.unit}
                </div>
                <div className="text-[10px] text-emerald-500/80">In Central Warehouse</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400 font-medium">
                Min Order: <strong>{prod.minDealerOrderQty} units</strong>
              </span>

              <button
                onClick={() => onAddToCart(prod, prod.minDealerOrderQty || 1)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>+ Add (MOQ {prod.minDealerOrderQty})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
