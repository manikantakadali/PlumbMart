import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Box,
  Truck
} from 'lucide-react';
import { 
  getCustomerCart, 
  updateCustomerCartQuantity, 
  removeFromCustomerCart, 
  clearCustomerCart, 
  getCustomerCartTotals 
} from '../utils/customerCart';

export default function CustomerCartPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // Sync cart from storage
  const reloadCart = useCallback(() => {
    const items = getCustomerCart();
    setCartItems(items);
  }, []);

  useEffect(() => {
    reloadCart();
    window.addEventListener('customer_cart_updated', reloadCart);
    return () => window.removeEventListener('customer_cart_updated', reloadCart);
  }, [reloadCart]);

  const handleUpdateQty = (productId, newQty) => {
    updateCustomerCartQuantity(productId, newQty);
  };

  const handleRemove = (productId) => {
    removeFromCustomerCart(productId);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCustomerCart();
    }
  };

  const totals = getCustomerCartTotals(cartItems);

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <span>Shopping Cart</span>
            </h1>
            <p className="text-xs text-slate-500">
              Review selected items and proceed to online checkout
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping</span>
            </Link>

            {cartItems.length > 0 && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mb-6">
              You haven't added any plumbing supplies yet. Explore our top-tier catalog.
            </p>
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Cart Items List */}
            <div className="lg:col-span-2 space-y-3">
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80';
                      }}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono font-bold text-blue-600 block">
                        {item.brand || 'PlumbMart'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {item.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Price: <strong className="text-slate-800">₹{item.price.toLocaleString('en-IN')}</strong> / unit
                      </div>

                      {/* Stock Status Pill - Numeric count is HIDDEN */}
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>In Stock &bull; Ready for Delivery</span>
                        </span>
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

                    {/* Subtotal for line */}
                    <div className="text-right min-w-[80px]">
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="font-bold text-sm text-slate-900">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Trash Button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right 1 Col: Order Summary Box */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Cart Summary</span>
                  <span className="text-xs text-slate-500 font-normal">{totals.count} items</span>
                </h3>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (18% Applicable)</span>
                    <span className="font-semibold text-slate-800">₹{totals.gst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Standard Delivery</span>
                    {totals.shipping === 0 ? (
                      <span className="font-semibold text-emerald-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">₹{totals.shipping}</span>
                    )}
                  </div>

                  {totals.shipping > 0 && (
                    <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg">
                      Add ₹{(1000 - totals.subtotal).toLocaleString('en-IN')} more for Free Delivery!
                    </p>
                  )}

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Estimated Total</span>
                    <span className="text-lg font-black text-blue-600">
                      ₹{totals.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Delivery Guarantee Pill */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dispatched directly from regional warehouse hub</span>
                </div>

                {/* Proceed to Checkout Button */}
                <button
                  onClick={() => navigate('/customer/checkout')}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition active:scale-98"
                >
                  <span>Proceed to Online Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  Instant secure online payment via UPI, Credit/Debit Card &amp; Net Banking.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
    </CustomerLayout>
  );
}
