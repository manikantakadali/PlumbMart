import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { 
  Box, 
  Search, 
  Layers, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Check,
  Star
} from 'lucide-react';
import { addToCustomerCart } from '../utils/customerCart';

const CATEGORIES = [
  'All Categories',
  'Pipes & Tubes',
  'Fittings & Valves',
  'Bath & Faucets',
  'Pumps & Motors',
  'Tools & Sealants',
  'Water Tanks & Storage',
  'Drainage & Sanitary'
];

export default function CustomerProductsPage({ currentUser, onLogout }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory('All Categories');
    }
  }, [urlCategory]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All Categories') {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('category');
      setSearchParams(nextParams);
    } else {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('category', cat);
      setSearchParams(nextParams);
    }
  };

  const [quantities, setQuantities] = useState({});
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [addedNotice, setAddedNotice] = useState(null);

  const fetchProducts = async () => {
    try {
      let res;
      try {
        res = await fetch('/api/products');
        if (!res.ok) throw new Error('Proxy status: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch('http://localhost:5000/api/products');
          if (!res.ok) throw new Error('Port 5000 status: ' + res.status);
        } catch (e2) {
          res = await fetch('http://localhost:4000/api/products');
        }
      }

      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        const initialQty = {};
        data.data.forEach(p => {
          initialQty[p.id] = 1;
        });
        setQuantities(initialQty);
      }
    } catch (err) {
      console.error('Failed to load customer products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQtyChange = (productId, change) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const updated = Math.max(1, current + change);
      return { ...prev, [productId]: updated };
    });
  };

  const handleDirectQtyInput = (productId, value) => {
    const parsed = parseInt(value, 10);
    setQuantities(prev => ({
      ...prev,
      [productId]: isNaN(parsed) ? 1 : Math.max(1, parsed)
    }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product.id] || 1;
    addToCustomerCart(product, qty);
    setAddedNotice({
      id: product.id,
      name: product.name,
      qty
    });
    setTimeout(() => {
      setAddedNotice(null);
    }, 2800);
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query)) ||
      (p.sku && p.sku.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Toast when added to cart */}
        {addedNotice && (
          <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold block truncate max-w-xs">{addedNotice.name}</span>
              <span className="text-slate-400">Added {addedNotice.qty} {addedNotice.qty === 1 ? 'unit' : 'units'} to Cart</span>
            </div>
            <Link
              to="/customer/cart"
              className="ml-2 text-xs font-bold text-blue-400 hover:text-blue-300 underline"
            >
              View Cart
            </Link>
          </div>
        )}

        {/* Search & Category Filter Header Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pipes, fittings, faucets, pumps, tools..."
              className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid (Responsive Columns, Compact) */}
        {loading ? (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3.5 animate-pulse space-y-3">
                <div className="h-36 bg-slate-200 rounded-xl" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-6 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
            <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-sm text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try tweaking your search query or select another category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {filteredProducts.map(product => {
              const qty = quantities[product.id] || 1;
              const discountPercent = product.mrp && product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;

              return (
                <div 
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Compact Image */}
                    <div className="relative h-36 w-full rounded-xl overflow-hidden bg-white mb-2.5 border border-slate-100 flex items-center justify-center">
                      <img 
                        src={product.image || product.imageUrl || '/products/PLB-PIPE-051.jpg'} 
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                        }}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/95 text-blue-700 shadow-xs backdrop-blur-xs">
                          {product.brand}
                        </span>
                        {product.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-white shadow-xs backdrop-blur-xs">
                            {product.tag}
                          </span>
                        )}
                      </div>

                      {/* Rating pill */}
                      {product.rating && (
                        <div className="absolute bottom-1.5 right-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/95 text-amber-600 shadow-xs flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            {product.rating}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2 mb-2 h-8" title={product.name}>
                      {product.name}
                    </h3>

                    {/* Pricing Block */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 mb-2.5">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                            Price
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-blue-700">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>
                        </div>

                        {discountPercent > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status: STOCK QUANTITY IS HIDDEN FOR CUSTOMER */}
                    <div className="space-y-1 mb-2.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Availability:</span>
                        {product.stock && product.stock > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Delivery:</span>
                        <span className="font-semibold text-emerald-600">Standard Express</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Quantity Selector */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          onClick={() => handleQtyChange(product.id, -1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 text-xs"
                          title="Decrease Qty"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={e => handleDirectQtyInput(product.id, e.target.value)}
                          className="w-9 text-center bg-transparent font-bold text-xs text-slate-900 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQtyChange(product.id, 1)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 text-xs"
                          title="Increase Qty"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedProductDetails(product)}
                        className="text-slate-400 hover:text-blue-600 text-[11px] font-semibold flex items-center gap-0.5 transition"
                      >
                        <Info className="w-3 h-3" />
                        <span>Specs</span>
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-xs transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Add {qty} to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Details Modal */}
        {selectedProductDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {selectedProductDetails.brand} &bull; {selectedProductDetails.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-snug mt-0.5">
                    {selectedProductDetails.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-4">
                <div className="flex gap-4 items-center">
                  <img
                    src={selectedProductDetails.image || selectedProductDetails.imageUrl || '/products/PLB-PIPE-051.jpg'}
                    alt={selectedProductDetails.name}
                    className="w-20 h-20 rounded-2xl object-contain p-1 bg-white border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-blue-700">
                        ₹{selectedProductDetails.price.toLocaleString('en-IN')}
                      </span>
                      {selectedProductDetails.mrp && (
                        <span className="text-xs text-slate-400 line-through">
                          MRP ₹{selectedProductDetails.mrp}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {selectedProductDetails.description}
                    </p>
                  </div>
                </div>

                {/* Technical Specifications */}
                {selectedProductDetails.specs && (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 block">Product Specifications</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(selectedProductDetails.specs).map(([key, val]) => (
                        <div key={key} className="bg-white p-2 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-slate-800 font-bold text-[11px]">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProductDetails);
                    setSelectedProductDetails(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/25"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </CustomerLayout>
  );
}
