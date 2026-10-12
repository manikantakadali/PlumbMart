import React, { useState } from 'react';
import {
  Search,
  Grid,
  Package,
  EyeOff,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Truck,
  Flame,
  Award,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function CustomerDashboard({
  customer,
  banners = [],
  categories = [],
  products = [],
  isLoading = false,
  error = null,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  sortOption,
  onSortChange,
  activeFilter,
  onFilterChange,
  onOpenProductDetails,
  onAddToCart,
  onOpenCart,
  onOpenCategories,
  onOpenOrders,
  onRetry
}) {
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Derive featured and popular products dynamically
  const featuredProducts = products.filter((p) => p.isFeatured);
  const popularProducts = products.filter((p) => p.isPopular);

  return (
    <div className="space-y-4 pb-4">
      {/* 1. Dynamic Customer Welcome & Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 via-slate-900 to-slate-950 border border-blue-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            CUSTOMER PORTAL
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-rose-300 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
            <EyeOff className="w-3.5 h-3.5" /> Stock Qty Hidden
          </span>
        </div>

        <div className="flex items-center gap-3">
          {customer?.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-12 h-12 rounded-2xl object-cover border border-blue-500/40 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 text-blue-300 flex items-center justify-center font-black text-lg border border-blue-500/40">
              {customer?.name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h2 className="text-base font-extrabold text-white leading-snug">
              Welcome, {customer?.name || 'Customer'}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              {customer?.address || 'Certified plumbing items with verified installation support.'}
            </p>
          </div>
        </div>

        {/* Quick Access Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onOpenCategories}
            className="flex-1 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>
          <button
            onClick={onOpenOrders}
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>My Orders</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Promotional Banners */}
      {banners.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
          {banners.map((b, idx) => {
            if (idx !== activeBannerIdx) return null;
            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    ★ {b.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {idx + 1} of {banners.length}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-white leading-tight">{b.title}</h3>
                <p className="text-xs text-slate-300 leading-snug">{b.subtitle}</p>
              </div>
            );
          })}

          {banners.length > 1 && (
            <div className="flex justify-center gap-1.5 pt-1">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveBannerIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeBannerIdx === i ? 'w-5 bg-blue-500' : 'w-1.5 bg-slate-700'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Dynamic Product Search & Sorting Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search CPVC pipes, diverters, valves, pumps..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 focus:outline-none placeholder-slate-500"
          />
        </div>

        {/* Sorting & Filter Pills */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => onFilterChange(activeFilter === 'featured' ? '' : 'featured')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 ${
                activeFilter === 'featured'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3 h-3" /> Featured
            </button>
            <button
              onClick={() => onFilterChange(activeFilter === 'popular' ? '' : 'popular')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition flex items-center gap-1 ${
                activeFilter === 'popular'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Flame className="w-3 h-3" /> Best Sellers
            </button>
          </div>

          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium shrink-0"
          >
            <option value="">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* 4. Dynamic Categories Horizontal Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Categories ({categories.length})
          </h3>
          <button
            onClick={onOpenCategories}
            className="text-[11px] text-blue-400 hover:underline font-semibold"
          >
            View All
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] opacity-75 font-mono">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Error State with Retry */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-bold text-[10px]"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* 6. Loading Skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse space-y-2.5"
            >
              <div className="h-3 w-1/3 bg-slate-800 rounded" />
              <div className="h-4 w-3/4 bg-slate-800 rounded" />
              <div className="h-8 w-full bg-slate-900 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* 7. Dynamic Product Listing (Strict rule: Price YES, Stock NO) */}
      {!isLoading && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Products Available ({products.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">Verified B2C Pricing</span>
          </div>

          {products.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <Package className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="font-semibold text-white">No products found</div>
              <p className="text-[11px] text-slate-400">Try changing your search query or category filter.</p>
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onSearchChange('');
                  onFilterChange('');
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold"
              >
                Reset Filters
              </button>
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
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      {prod.sku} • {prod.brand}
                    </span>
                    <div className="flex items-center gap-1">
                      {prod.isFeatured && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                          Featured
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium">
                        {prod.unit}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-white hover:text-blue-400 transition leading-snug">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{prod.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 line-through font-mono">
                        MRP ₹{prod.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {/* Security check: Customer can NEVER see stock quantity */}
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
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
