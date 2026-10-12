import React, { useState } from 'react';
import {
  Search,
  Package,
  Eye,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Plus,
  Minus,
  SlidersHorizontal,
  Flame,
  Sparkles
} from 'lucide-react';

export default function DealerProductList({
  products = [],
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  sortOption = '',
  onSortChange,
  onAddToCart,
  onOpenCart
}) {
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});
  const [stockErrors, setStockErrors] = useState({});

  // Get current quantity for a product (defaults to minDealerOrderQty)
  const getQty = (prod) => {
    return itemQuantities[prod.id] !== undefined
      ? itemQuantities[prod.id]
      : (prod.minDealerOrderQty || 1);
  };

  const handleQtyChange = (prod, nextQty) => {
    const minMoq = prod.minDealerOrderQty || 1;
    const maxStock = prod.stockQuantity || 0;
    const targetQty = Math.max(minMoq, Number(nextQty));

    if (targetQty > maxStock) {
      setStockErrors((prev) => ({
        ...prev,
        [prod.id]: `Cannot exceed available stock of ${maxStock} ${prod.unit}.`
      }));
    } else {
      setStockErrors((prev) => {
        const copy = { ...prev };
        delete copy[prod.id];
        return copy;
      });
    }

    setItemQuantities((prev) => ({
      ...prev,
      [prod.id]: Math.min(targetQty, maxStock > 0 ? maxStock : targetQty)
    }));
  };

  const handleAdd = (prod) => {
    const qty = getQty(prod);
    const maxStock = prod.stockQuantity || 0;

    if (maxStock <= 0) {
      setStockErrors((prev) => ({
        ...prev,
        [prod.id]: `Product is out of stock in Zoho Workbook.`
      }));
      return;
    }

    if (qty > maxStock) {
      setStockErrors((prev) => ({
        ...prev,
        [prod.id]: `Cannot add ${qty} units. Only ${maxStock} ${prod.unit} available.`
      }));
      return;
    }

    onAddToCart(prod, qty);
  };

  return (
    <div className="space-y-4 py-2">
      {/* Title & Zoho Stock Visibility Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            Wholesale Products &amp; Stock
          </h2>
          <p className="text-[11px] text-slate-400">
            Live Zoho Workbook inventory &amp; wholesale tier pricing
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <Eye className="w-3 h-3" /> Exact Stock Visible
        </span>
      </div>

      {/* Categories Filter Tabs */}
      {categories && categories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory && onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <span>All Catalog</span>
            <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
              {products.length}
            </span>
          </button>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                {cat.productCount !== undefined && (
                  <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono">
                    {cat.productCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search wholesale products, SKU, category..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-amber-500 focus:outline-none placeholder-slate-500"
          />
        </div>

        {onSortChange && (
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium shrink-0 focus:border-amber-500 focus:outline-none"
          >
            <option value="">Sort: Default</option>
            <option value="price-asc">Wholesale Price: Low to High</option>
            <option value="price-desc">Wholesale Price: High to Low</option>
            <option value="popular">Most Popular / High Volume</option>
          </select>
        )}
      </div>

      {/* Products list with Stock Quantity & Wholesale Price */}
      {products.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
          <Package className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Wholesale Products Found</h3>
          <p className="text-xs text-slate-400">
            No items match your filter criteria in Zoho Workbook.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((prod) => {
            const currentQty = getQty(prod);
            const maxStock = prod.stockQuantity || 0;
            const minMoq = prod.minDealerOrderQty || 1;
            const errorMsg = stockErrors[prod.id];
            const margin = (prod.customerPrice || 0) - (prod.dealerPrice || prod.price);

            return (
              <div
                key={prod.id}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                {/* Product Title and Tags */}
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {prod.zohoRowId} • {prod.sku}
                    </span>
                    <h4 className="text-xs font-bold text-white mt-0.5 leading-snug">
                      {prod.name}
                    </h4>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {prod.categoryName} • <span className="text-slate-300">{prod.brand}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedProductDetails(prod)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 transition shrink-0"
                    title="View Technical Specifications"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {/* Wholesale Price vs Retail Price & Live Zoho Stock */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-slate-400">Dealer Wholesale Price</div>
                    <div className="text-base font-black text-amber-400">
                      ₹{prod.price.toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-slate-400 font-normal">/ {prod.unit}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Retail: <strong className="text-slate-200">₹{prod.customerPrice}</strong>{' '}
                      <span className="text-emerald-400 font-semibold">(Margin: ₹{margin})</span>
                    </div>
                  </div>

                  {/* Exact Stock Quantity Visible to Dealer */}
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Zoho Available Stock</div>
                    <div
                      className={`text-sm font-black font-mono ${
                        maxStock > 20
                          ? 'text-emerald-400'
                          : maxStock > 0
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {maxStock > 0 ? `${maxStock} ${prod.unit}` : 'Out of Stock'}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      MOQ: <strong className="text-slate-300">{minMoq} units</strong>
                    </div>
                  </div>
                </div>

                {/* Stock Warning Error if exceeded */}
                {errorMsg && (
                  <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Quantity Controls & Add to Cart */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 mr-1">Qty:</span>
                    <button
                      onClick={() => handleQtyChange(prod, currentQty - 1)}
                      disabled={currentQty <= minMoq}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={minMoq}
                      max={maxStock}
                      value={currentQty}
                      onChange={(e) => handleQtyChange(prod, e.target.value)}
                      className="w-12 bg-transparent text-center font-mono font-bold text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleQtyChange(prod, currentQty + 1)}
                      disabled={currentQty >= maxStock}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-40 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedProductDetails(prod)}
                      className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition"
                    >
                      Specs
                    </button>
                    <button
                      onClick={() => handleAdd(prod)}
                      disabled={maxStock <= 0}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>+ Add ({currentQty})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Details & Specifications Modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs text-emerald-400 font-bold">
                {selectedProductDetails.zohoRowId} • {selectedProductDetails.sku}
              </span>
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedProductDetails.image && (
              <img
                src={selectedProductDetails.image}
                alt={selectedProductDetails.name}
                className="w-full h-44 rounded-2xl object-cover border border-slate-800"
              />
            )}

            <div>
              <h3 className="text-sm font-extrabold text-white">
                {selectedProductDetails.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Category: <strong className="text-slate-200">{selectedProductDetails.categoryName}</strong> • Brand: <strong className="text-slate-200">{selectedProductDetails.brand}</strong>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Wholesale Price</span>
                <div className="text-sm font-bold text-amber-400 font-mono">
                  ₹{selectedProductDetails.price.toLocaleString('en-IN')} / {selectedProductDetails.unit}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Customer MRP / Retail</span>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  ₹{selectedProductDetails.customerPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Zoho Live Stock</span>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {selectedProductDetails.stockQuantity} {selectedProductDetails.unit}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Min Order Quantity</span>
                <div className="text-sm font-bold text-white font-mono">
                  {selectedProductDetails.minDealerOrderQty || 1} {selectedProductDetails.unit}
                </div>
              </div>
            </div>

            {selectedProductDetails.specifications && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Engineering Specifications
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {selectedProductDetails.specifications}
                </p>
              </div>
            )}

            {selectedProductDetails.installationNote && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Installation / Fitting Guidelines
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  {selectedProductDetails.installationNote}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                handleAdd(selectedProductDetails);
                setSelectedProductDetails(null);
              }}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Wholesale Cart</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
