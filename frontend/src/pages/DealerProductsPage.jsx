import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import DealerLayout from '../components/DealerLayout';
import { 
  Box, 
  Search, 
  RefreshCw, 
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
  Check 
} from 'lucide-react';
import { addToDealerCart, getDealerCartTotals } from '../utils/dealerCart';
import DealerSuspendedModal from '../components/DealerSuspendedModal';

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

export default function DealerProductsPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || 'All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);

  // Auth guard: Require Dealer login
  useEffect(() => {
    if (!currentUser) {
      navigate('/login?redirect=dealer', { replace: true });
    }
  }, [currentUser, navigate]);

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
  const [isSyncing, setIsSyncing] = useState(false);
  const [zohoMetadata, setZohoMetadata] = useState({
    workbookId: 'WB-ZOHO-PLUMB-2026',
    sheet: 'Master_Inventory_Live',
    lastSyncedAt: new Date().toLocaleTimeString(),
    syncState: 'Active / Live'
  });

  const fetchProducts = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('http://localhost:4000/api/dealer/products');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setProducts(data.data);
        if (data.zohoSource) {
          setZohoMetadata({
            ...data.zohoSource,
            lastSyncedAt: new Date().toLocaleTimeString()
          });
        }
        // Initialize quantities with MOQ
        const initialQty = {};
        data.data.forEach(p => {
          initialQty[p.id] = p.moq || 1;
        });
        setQuantities(initialQty);
      }
    } catch (err) {
      console.error('Failed to load dealer products:', err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleQtyChange = (productId, change, moq = 1) => {
    setQuantities(prev => {
      const current = prev[productId] || moq;
      const updated = Math.max(moq, current + change);
      return { ...prev, [productId]: updated };
    });
  };

  const handleDirectQtyInput = (productId, value, moq = 1) => {
    const parsed = parseInt(value, 10);
    setQuantities(prev => ({
      ...prev,
      [productId]: isNaN(parsed) ? moq : Math.max(1, parsed)
    }));
  };

  const handleAddToCart = (product) => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('plumbmart_user') || 'null');
    } catch (e) {}
    const isSuspended = currentUser?.status === 'Suspended' || saved?.status === 'Suspended';
    if (isSuspended) {
      setIsSuspendedModalOpen(true);
      return;
    }

    const qty = quantities[product.id] || product.moq || 1;
    addToDealerCart(product, qty);
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

  const cartTotals = getDealerCartTotals();

  return (
    <DealerLayout currentUser={currentUser} onLogout={onLogout} products={products}>
      {/* Notice Pill */}
      {addedNotice && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Added {addedNotice.qty}x {addedNotice.name.slice(0, 24)}... to cart!</span>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Simple Page Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {selectedCategory === 'All Categories' ? 'All Products' : selectedCategory}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {filteredProducts.length} items
            </span>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name, brand, SKU..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xs"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading products from Zoho Workbook...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto">
            <Box className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No matching products found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try adjusting your search query or selecting &ldquo;All Categories&rdquo;.
            </p>
            <button
              onClick={() => { setSelectedCategory('All Categories'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const qty = quantities[product.id] || product.moq || 1;
              const margin = product.mrp - (product.dealerPrice || product.price);
              const marginPercent = Math.round((margin / product.mrp) * 100);

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative rounded-xl overflow-hidden bg-white h-36 mb-2.5 border border-slate-100 flex items-center justify-center">
                      <img
                        src={product.image || '/products/PLB-PIPE-051.jpg'}
                        alt={product.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                        }}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/95 text-indigo-700 shadow-xs backdrop-blur-xs">
                          {product.brand}
                        </span>
                        {product.tag && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-white shadow-xs backdrop-blur-xs">
                            {product.tag}
                          </span>
                        )}
                      </div>

                      {/* Zoho SKU Badge */}
                      <div className="absolute bottom-1.5 right-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-900/90 text-emerald-400 shadow-xs">
                          {product.sku}
                        </span>
                      </div>
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
                            Wholesale Price
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-indigo-700">
                              ₹{(product.dealerPrice || product.price).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400 line-through">
                              ₹{product.mrp}
                            </span>
                          </div>
                        </div>

                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          +{marginPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Available Stock & MOQ */}
                    <div className="space-y-1 mb-2.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Stock:</span>
                        <span className={`inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded text-[10px] ${
                          product.stock > 20 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${product.stock > 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          {product.stock} Units
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>MOQ:</span>
                        <span className="font-semibold text-slate-600">{product.moq || 1} Units</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Quantity Selector */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                        <button
                          onClick={() => handleQtyChange(product.id, -(product.moq || 1), product.moq)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 text-xs"
                          title="Decrease Qty"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={qty}
                          onChange={e => handleDirectQtyInput(product.id, e.target.value, product.moq)}
                          className="w-9 text-center bg-transparent font-bold text-xs text-slate-900 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQtyChange(product.id, product.moq || 1, product.moq)}
                          className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95 text-xs"
                          title="Increase Qty"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => setSelectedProductDetails(product)}
                        className="text-slate-400 hover:text-indigo-600 text-[11px] font-semibold flex items-center gap-0.5 transition"
                      >
                        <Info className="w-3 h-3" />
                        <span>Specs</span>
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-xs transition"
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
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Zoho Item Specs • {selectedProductDetails.sku}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedProductDetails.name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <p className="text-slate-600 leading-relaxed">
                  {selectedProductDetails.description}
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Brand</span>
                    <span className="font-bold text-slate-900">{selectedProductDetails.brand}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Zoho Item SKU</span>
                    <span className="font-mono font-bold text-indigo-700">{selectedProductDetails.sku}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Zoho Live Available Stock</span>
                    <span className="font-bold text-emerald-700">{selectedProductDetails.stock} Units</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Minimum Order Qty</span>
                    <span className="font-semibold text-slate-900">{selectedProductDetails.moq} Units</span>
                  </div>
                  {selectedProductDetails.specs && Object.entries(selectedProductDetails.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-1 border-b border-slate-200/60 last:border-b-0">
                      <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium text-slate-800 text-right max-w-[240px]">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProductDetails);
                    setSelectedProductDetails(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Cart Next Step Banner */}
        {cartTotals.itemCount > 0 && (
          <div className="sticky bottom-5 mt-8 bg-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {cartTotals.itemCount} items in Dealer Cart ({cartTotals.uniqueCount} products)
                </span>
                <span className="text-[11px] text-slate-400">
                  Subtotal: <strong className="text-emerald-400">₹{cartTotals.subtotal.toLocaleString('en-IN')}</strong> (Excluding GST)
                </span>
              </div>
            </div>

            <Link
              to="/dealer/cart"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              <span>Review Cart &amp; Check Stock</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

      </main>

      {/* Beautiful Dealer Account Suspended Modal */}
      <DealerSuspendedModal
        isOpen={isSuspendedModalOpen}
        onClose={() => setIsSuspendedModalOpen(false)}
        dealerName={currentUser?.name || 'Sri Venkateswara Distributors'}
      />
    </DealerLayout>
  );
}
