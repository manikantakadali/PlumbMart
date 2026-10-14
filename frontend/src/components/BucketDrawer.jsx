import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';
import { BucketIcon } from './Header';

export default function BucketDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutSuccess,
  currentUser
}) {
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = React.useState('cart'); // 'cart' | 'placed'
  const [placedOrderId, setPlacedOrderId] = React.useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const shipping = subtotal > 1500 || subtotal === 0 ? 0 : 99;
  const grandTotal = subtotal + gst + shipping;

  const handleCheckout = () => {
    const orderId = 'PM-' + Math.floor(100000 + Math.random() * 900000);
    setPlacedOrderId(orderId);
    setCheckoutStep('placed');
    if (onCheckoutSuccess) {
      onCheckoutSuccess(orderId, grandTotal);
    }
  };

  const handleCloseAndReset = () => {
    if (checkoutStep === 'placed') {
      onClearCart();
      setCheckoutStep('cart');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={handleCloseAndReset}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 text-slate-900 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <BucketIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Plumbing Bucket</h2>
                <p className="text-xs text-slate-500">
                  {cartItems.length} unique item{cartItems.length !== 1 ? 's' : ''} in bucket
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseAndReset}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
              aria-label="Close Bucket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {checkoutStep === 'placed' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Order Successfully Placed!</h3>
                <p className="text-xs text-slate-600 mb-4 max-w-xs leading-relaxed">
                  Demo order <span className="font-mono font-semibold text-blue-600">#{placedOrderId}</span> has been simulated with instant dispatch to warehouse.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 w-full mb-6 text-xs text-slate-700">
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500">Total Paid (Demo)</span>
                    <span className="font-bold text-slate-900">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Estimated Delivery</span>
                    <span className="font-semibold text-emerald-600">Tomorrow by 11:00 AM</span>
                  </div>
                </div>
                <button
                  onClick={handleCloseAndReset}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition"
                >
                  Continue Shopping
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <BucketIcon className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">Your bucket is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Browse our plumbing and hardware catalog and add pipes, fittings, or tools to your bucket.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs pb-1">
                  <span className="text-slate-500 font-medium">Items in bucket</span>
                  <button
                    onClick={onClearCart}
                    className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-3 items-center"
                  >
                    <img
                      src={item.image || '/products/PLB-PIPE-051.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/products/PLB-PIPE-051.jpg';
                      }}
                      className="w-16 h-16 rounded-lg object-contain p-1 bg-white border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate mb-0.5">{item.name}</h4>
                      <div className="text-[11px] text-blue-600 font-medium mb-2">{item.brand}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-slate-900 px-2">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 transition ml-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Calculations */}
          {cartItems.length > 0 && checkoutStep === 'cart' && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/95 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GST (18% Estimate)</span>
                  <span className="font-semibold text-slate-900">₹{gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping Delivery</span>
                  <span className="font-semibold text-emerald-600">
                    {shipping === 0 ? 'FREE (Orders > ₹1,500)' : `₹${shipping}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Grand Total</span>
                  <span className="text-blue-600 text-base">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {!currentUser ? (
                <div className="space-y-2.5 pt-1">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-900 text-xs">Login Required to Buy</p>
                      <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">
                        Please sign in with your mobile number to confirm delivery address and place your order.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      navigate('/login?redirect=checkout');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Login to Buy</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center text-xs text-slate-500 pt-0.5">
                    <span>New to PlumbMart? </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/register?redirect=checkout');
                      }}
                      className="font-bold text-blue-600 hover:underline hover:text-blue-700"
                    >
                      Register here
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/customer/checkout');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98]"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      navigate('/customer/cart');
                    }}
                    className="w-full py-2 px-3 text-center text-xs text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition font-semibold"
                  >
                    View Shopping Cart Details
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Genuine Plumbing Supplies • Fast Dispatch</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
