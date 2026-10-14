import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DealerLayout from '../components/DealerLayout';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Box,
  Truck
} from 'lucide-react';
import { 
  getDealerCart, 
  updateDealerCartQuantity, 
  removeFromDealerCart, 
  clearDealerCart, 
  getDealerCartTotals 
} from '../utils/dealerCart';

export default function DealerCartPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [stockCheckResult, setStockCheckResult] = useState({
    allInStock: true,
    items: [],
    checkedAt: null
  });
  const [isCheckingStock, setIsCheckingStock] = useState(false);
  const [dealerStatus, setDealerStatus] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('plumbmart_user') || 'null');
      return saved?.status || currentUser?.status || 'Approved';
    } catch {
      return 'Approved';
    }
  });

  // Sync cart from storage
  const reloadCart = useCallback(() => {
    const items = getDealerCart();
    setCartItems(items);
  }, []);

  useEffect(() => {
    reloadCart();
    window.addEventListener('dealer_cart_updated', reloadCart);

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/dealers/DLR-01');
        if (res.ok) {
          const json = await res.json();
          if (json?.data?.status) setDealerStatus(json.data.status);
        }
      } catch (e) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 1500);

    let ch;
    try {
      ch = new BroadcastChannel('plumbmart_dealers');
      ch.onmessage = (e) => {
        if (e.data?.updates?.status) setDealerStatus(e.data.updates.status);
      };
    } catch (e) {}

    return () => {
      window.removeEventListener('dealer_cart_updated', reloadCart);
      clearInterval(interval);
      if (ch) ch.close();
    };
  }, [reloadCart]);

  // Live stock verification API call to backend
  const verifyStockWithZoho = useCallback(async (items) => {
    if (!items || items.length === 0) {
      setStockCheckResult({ allInStock: true, items: [], checkedAt: new Date().toLocaleTimeString() });
      return;
    }

    setIsCheckingStock(true);
    try {
      const payload = {
        items: items.map(i => ({ id: i.id, quantity: i.quantity, name: i.name }))
      };
      const res = await fetch('http://localhost:4000/api/dealer/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success) {
        setStockCheckResult({
          allInStock: data.allInStock,
          items: data.items,
          checkedAt: new Date().toLocaleTimeString()
        });
      }
    } catch (err) {
      console.error('Error verifying stock:', err);
    } finally {
      setIsCheckingStock(false);
    }
  }, []);

  // Check stock whenever cart items change
  useEffect(() => {
    verifyStockWithZoho(cartItems);
  }, [cartItems, verifyStockWithZoho]);

  const handleUpdateQty = (productId, newQty) => {
    updateDealerCartQuantity(productId, newQty);
  };

  const handleSetMaxStock = (productId, maxStock) => {
    updateDealerCartQuantity(productId, maxStock);
  };

  const handleRemove = (productId) => {
    removeFromDealerCart(productId);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearDealerCart();
    }
  };

  const totals = getDealerCartTotals(cartItems);

  // Helper to find stock info for a given item
  const getItemStockInfo = (productId) => {
    return stockCheckResult.items.find(item => item.id === productId);
  };

  return (
    <DealerLayout currentUser={currentUser} onLogout={onLogout}>
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Cart &amp; Stock Availability
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {cartItems.length} products
            </span>
          </div>

          <button
            onClick={() => verifyStockWithZoho(cartItems)}
            disabled={isCheckingStock || cartItems.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStock ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Re-Check Stock</span>
          </button>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Your wholesale cart is empty</h3>
            <p className="text-xs text-slate-500 mb-6">
              Browse the wholesale catalog and add pipes, fittings, valves or tools to check stock and checkout.
            </p>
            <Link
              to="/dealer/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              <span>Explore Products &amp; Prices</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Cart Items & Stock Alerts */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Overall Stock Status Alert Banner */}
              {stockCheckResult.allInStock ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Zoho Stock Verified • All Items Available
                    </h4>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      All requested quantities are in stock at your allocated Regional Warehouse Hub. You can proceed to payment method selection.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">
                      Stock Shortage Detected • Checkout Locked
                    </h4>
                    <p className="text-[11px] text-rose-700 mt-0.5">
                      One or more products exceed available inventory in Zoho Workbook. Please reduce quantities to the maximum available before proceeding to checkout.
                    </p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
                  <span className="font-bold text-slate-900">
                    Cart Items ({cartItems.length} Products)
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Cart</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {cartItems.map(item => {
                    const stockInfo = getItemStockInfo(item.id);
                    const isAvailable = stockInfo ? stockInfo.inStock : true;
                    const maxStock = stockInfo ? stockInfo.availableStock : item.stock;

                    return (
                      <div 
                        key={item.id} 
                        className={`py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all rounded-xl ${
                          !isAvailable ? 'bg-rose-50/60 p-3 -mx-2 border border-rose-200' : ''
                        }`}
                      >
                        {/* Thumbnail & Info */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={item.image || '/products/PLB-PIPE-051.jpg'}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                            }}
                            className="w-16 h-16 rounded-xl object-contain p-1 bg-white border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 block">
                              {item.sku}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Wholesale: <strong className="text-slate-800">₹{item.price.toLocaleString('en-IN')}</strong> / unit
                            </div>

                            {/* Stock Badge for this specific item */}
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                              {isAvailable ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>In Stock ({maxStock} available)</span>
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Only {maxStock} available in Zoho</span>
                                  </span>
                                  <button
                                    onClick={() => handleSetMaxStock(item.id, maxStock)}
                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                                  >
                                    Adjust to {maxStock}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Controls & Line Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          {/* Qty +/- */}
                          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-0.5">
                            <button
                              onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
                              title="Decrease Qty"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={e => handleUpdateQty(item.id, parseInt(e.target.value, 10) || 1)}
                              className="w-12 text-center bg-transparent font-bold text-xs text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition active:scale-95"
                              title="Increase Qty"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[90px]">
                            <span className="text-[10px] text-slate-400 block">Total</span>
                            <span className="text-sm font-black text-slate-900">
                              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/dealer/products"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Add more products from catalog</span>
                </Link>
              </div>
            </div>

            {/* Right 1 Col: Summary & Checkout Button */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
                  Wholesale Order Summary
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Items Quantity</span>
                    <span className="font-semibold text-slate-800">{totals.itemCount} Units</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal (Wholesale)</span>
                    <span className="font-bold text-slate-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">18% GST (Input Tax Credit)</span>
                    <span className="font-semibold text-slate-800">₹{totals.gst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Freight / Transport</span>
                    <span className="font-semibold text-emerald-600">
                      {totals.shipping === 0 ? 'FREE (Wholesale Order)' : `₹${totals.shipping}`}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Total Payable</span>
                    <span className="text-lg font-black text-indigo-600">
                      ₹{totals.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Checkout Button - Protected by Stock Availability & Suspension */}
                {dealerStatus === 'Suspended' ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl bg-rose-100 text-rose-700 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2 border border-rose-300"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Checkout Locked (Account Suspended)</span>
                    </button>
                    <p className="text-[10px] text-rose-600 text-center font-medium leading-tight">
                      Your wholesale account has been suspended by administration.
                    </p>
                  </div>
                ) : stockCheckResult.allInStock ? (
                  <button
                    onClick={() => navigate('/dealer/checkout')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Checkout Locked (Stock Shortage)</span>
                    </button>
                    <p className="text-[10px] text-rose-600 text-center font-medium leading-tight">
                      Adjust quantities for red items to match Zoho available stock.
                    </p>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day and 90-Day Credit options available at next step.</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </DealerLayout>
  );
}
