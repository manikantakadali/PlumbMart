import React from 'react';
import {
  Search,
  Grid,
  Package,
  EyeOff,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function CustomerDashboard({
  customer,
  categories,
  products,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenProductDetails,
  onAddToCart,
  onOpenCart,
  onOpenCategories,
  onOpenOrders
}) {
  return (
    <div className="space-y-4 pb-4">
      {/* Customer Welcome Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            CUSTOMER PORTAL
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <EyeOff className="w-3.5 h-3.5" /> Stock Qty Hidden
          </span>
        </div>
        <div>
          <h2 className="text-base font-extrabold text-white">Welcome back, {customer?.name}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Order certified plumbing pipes, valves &amp; fittings with verified plumber installation support.
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onOpenCategories}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Browse Categories</span>
          </button>
          <button
            onClick={onOpenOrders}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            My Orders
          </button>
        </div>
      </div>

      {/* Product Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search CPVC pipes, diverters, booster pumps, SKU..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none placeholder-slate-500"
        />
      </div>

      {/* Categories Horizontal Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Categories
          </h3>
          <button
            onClick={onOpenCategories}
            className="text-[11px] text-blue-400 hover:underline font-semibold"
          >
            View All ({categories.length})
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Listing (Section 3 & 6: Products + Prices YES, Stock Quantity NO) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Zoho Catalog ({products.length} Items)
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono">Retail B2C Rates</span>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
            No products found matching your search.
          </div>
        ) : (
          products.map((prod) => (
            <div
              key={prod.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-2.5"
            >
              <div
                onClick={() => onOpenProductDetails(prod)}
                className="cursor-pointer space-y-1"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-slate-500">
                    {prod.sku} • {prod.brand}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium">
                    {prod.unit}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white hover:text-blue-400 transition leading-snug">
                  {prod.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-emerald-400">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500 line-through">
                      MRP ₹{prod.mrp.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {/* Strict rule check: Customers cannot see stock quantity */}
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <span className="text-emerald-400">● {prod.availability}</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-rose-400/80 font-mono text-[9px]">Stock Qty Hidden</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenProductDetails(prod)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onAddToCart(prod)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
                  >
                    + Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
