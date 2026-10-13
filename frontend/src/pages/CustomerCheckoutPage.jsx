import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { 
  CreditCard, 
  Building2, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  MapPin, 
  Phone,
  QrCode,
  Smartphone,
  Landmark,
  BadgePercent
} from 'lucide-react';
import { getCustomerCart, clearCustomerCart, getCustomerCartTotals } from '../utils/customerCart';

export default function CustomerCheckoutPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [onlineMethod, setOnlineMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = currentUser && currentUser.role === 'Customer' ? currentUser : {
    id: 'CUST-01',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@example.com',
    role: 'Customer'
  };

  const [deliveryAddress, setDeliveryAddress] = useState({
    recipientName: customer.name || 'Rahul Sharma',
    phone: customer.mobile || '9876543210',
    addressType: 'Home / Flat',
    streetAddress: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur',
    landmark: 'Near EcoSpace Tech Park',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103'
  });

  useEffect(() => {
    const items = getCustomerCart();
    setCartItems(items);
    if (items.length === 0) {
      // Empty cart redirect
    }
  }, [navigate]);

  const totals = getCustomerCartTotals(cartItems);

  // Online Instant Discount (5% on Direct UPI/Card)
  const onlineDiscount = onlineMethod === 'upi' ? Math.round(totals.grandTotal * 0.02) : 0;
  const finalPayable = totals.grandTotal - onlineDiscount;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add products first.');
      navigate('/customer/products');
      return;
    }

    if (!deliveryAddress.streetAddress || !deliveryAddress.city || !deliveryAddress.pincode) {
      alert('Please fill in your delivery street address, city, and PIN code.');
      return;
    }

    setIsSubmitting(true);

    const paymentMethodLabel = onlineMethod === 'upi' 
      ? 'Online Payment (Instant UPI / QR)'
      : onlineMethod === 'card'
      ? 'Online Payment (Debit / Credit Card)'
      : 'Online Payment (Corporate Net Banking)';

    const formattedAddress = `${deliveryAddress.recipientName} (${deliveryAddress.addressType}) - ${deliveryAddress.streetAddress}, ${deliveryAddress.landmark ? deliveryAddress.landmark + ', ' : ''}${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode} [Mobile: ${deliveryAddress.phone}]`;

    const payload = {
      clientId: customer.id || 'CUST-01',
      clientName: deliveryAddress.recipientName || customer.name || 'Rahul Sharma',
      clientMobile: deliveryAddress.phone || customer.mobile || '9876543210',
      clientType: 'Customer',
      deliveryAddress: formattedAddress,
      notes,
      paymentMethod: paymentMethodLabel,
      total: finalPayable,
      items: cartItems.map(i => ({
        id: i.id,
        name: i.name,
        qty: i.quantity,
        price: i.price,
        sku: i.sku
      }))
    };

    try {
      const res = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data && data.success && data.order) {
        clearCustomerCart();
        navigate(`/customer/orders?placed=${data.order.id}`);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Customer order placement failed:', err);
      // Fallback local placement
      const fallbackId = 'PM-' + Math.floor(100000 + Math.random() * 900000);
      clearCustomerCart();
      navigate(`/customer/orders?placed=${fallbackId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Instant Online Checkout
            </h1>
            <p className="text-xs text-slate-500">
              Direct secure online payment &bull; Express door delivery
            </p>
          </div>

          <Link
            to="/customer/cart"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto my-8">
            <h3 className="text-base font-bold text-slate-900 mb-1">No items to checkout</h3>
            <p className="text-xs text-slate-500 mb-6">Add products to your cart before proceeding to checkout.</p>
            <Link
              to="/customer/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Online Payment & Delivery Info */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Payment Method Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Pay Online Directly</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    100% Encrypted &bull; 256-bit SSL
                  </span>
                </div>

                {/* Online Options Pills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Option 1: UPI / QR */}
                  <div
                    onClick={() => setOnlineMethod('upi')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                      onlineMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        onlineMethod === 'upi' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {onlineMethod === 'upi' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">UPI / QR Code</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm</p>
                    <span className="inline-block mt-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      2% Instant Discount
                    </span>
                  </div>

                  {/* Option 2: Cards */}
                  <div
                    onClick={() => setOnlineMethod('card')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                      onlineMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        onlineMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {onlineMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Debit / Credit Card</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Visa, Mastercard, RuPay</p>
                    <span className="inline-block mt-2 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      Zero Surcharge
                    </span>
                  </div>

                  {/* Option 3: Net Banking */}
                  <div
                    onClick={() => setOnlineMethod('netbanking')}
                    className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                      onlineMethod === 'netbanking'
                        ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        onlineMethod === 'netbanking' ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {onlineMethod === 'netbanking' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">Net Banking</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">50+ Indian Banks</p>
                    <span className="inline-block mt-2 text-[9px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      Instant Confirmation
                    </span>
                  </div>

                </div>

                {/* Credit Notice Callout: 30/90-Day Credit is NO for Customers */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-[11px]">
                      30/90-Day Credit Terms: <strong className="text-slate-700">Not Applicable</strong> (Exclusively available for verified B2B Dealers)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    Direct Retail
                  </span>
                </div>
              </div>

              {/* Delivery Address Form Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Delivery Address Details</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Doorstep Delivery Destination
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Address Destination Type */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Destination Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Home / Flat', 'Office / Commercial', 'Project Site'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDeliveryAddress(prev => ({ ...prev, addressType: type }))}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                            deliveryAddress.addressType === type
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient Name & Contact Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Recipient Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.recipientName}
                        onChange={e => setDeliveryAddress(prev => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Contact Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">+91</span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={deliveryAddress.phone}
                          onChange={e => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                          placeholder="9876543210"
                          className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Street Address / Flat */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Flat / House No., Apartment &amp; Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.streetAddress}
                      onChange={e => setDeliveryAddress(prev => ({ ...prev, streetAddress: e.target.value }))}
                      placeholder="e.g. Flat 402, Green Glen Heights, Outer Ring Road, Bellandur"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Landmark / Nearby Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={e => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="e.g. Near EcoSpace Tech Park / Opposite Metro Gate"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                    />
                  </div>

                  {/* City, State, PIN Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.city}
                        onChange={e => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        State <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.state}
                        onChange={e => setDeliveryAddress(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="e.g. Karnataka"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        PIN Code <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={deliveryAddress.pincode}
                        onChange={e => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, '') }))}
                        placeholder="560103"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Call before delivery, leave with security if unavailable"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Summary & Confirmation */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 sticky top-24">
                <h3 className="font-bold text-sm text-slate-900 pb-3 border-b border-slate-100">
                  Order &amp; Payment Summary
                </h3>

                {/* Items Mini List */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 text-xs">
                  {cartItems.map(item => (
                    <div key={item.id} className="pt-2 first:pt-0 flex justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-slate-800 block truncate">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.quantity} units &times; ₹{item.price}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">₹{totals.subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">GST (18%)</span>
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

                  {onlineDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>2% Instant UPI Discount</span>
                      <span>-₹{onlineDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Final Payable</span>
                    <span className="text-lg font-black text-blue-600">
                      ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Selected Method Callout */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Payment Option:</span>
                    <strong className="text-slate-900">
                      {onlineMethod === 'upi' ? 'Instant UPI / QR' : onlineMethod === 'card' ? 'Debit/Credit Card' : 'Net Banking'}
                    </strong>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-1 border-t border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Direct online instant clearance</span>
                  </div>
                </div>

                {/* Delivery Destination Preview */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-blue-900">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600" />
                      <span>Deliver To:</span>
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                      {deliveryAddress.addressType}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    {deliveryAddress.recipientName || customer.name}
                  </p>
                  <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                    {deliveryAddress.streetAddress 
                      ? `${deliveryAddress.streetAddress}, ${deliveryAddress.city} - ${deliveryAddress.pincode}`
                      : 'Please specify street address'}
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition active:scale-98"
                >
                  {isSubmitting ? (
                    <span>Processing Payment Securely...</span>
                  ) : (
                    <>
                      <span>Pay ₹{finalPayable.toLocaleString('en-IN')} &amp; Confirm Order</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  By confirming, an automated tax invoice and express order tracking ID will be generated.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>
    </CustomerLayout>
  );
}
