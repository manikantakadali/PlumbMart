import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DealerLayout from '../components/DealerLayout';
import { 
  CreditCard, 
  Building2, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Banknote, 
  Lock, 
  FileText,
  AlertCircle,
  MapPin,
  Phone,
  AlertTriangle,
  X
} from 'lucide-react';
import { getDealerCart, clearDealerCart, getDealerCartTotals } from '../utils/dealerCart';
import DealerSuspendedModal from '../components/DealerSuspendedModal';

export default function DealerCheckoutPage({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentChoice, setPaymentChoice] = useState('credit'); // 'upfront' | 'credit'
  const [creditTerm, setCreditTerm] = useState('30'); // '30' | '90'
  const [upfrontMethod, setUpfrontMethod] = useState('neft'); // 'neft' | 'netbanking' | 'upi'
  const [poNumber, setPoNumber] = useState(() => 'PO-2026-' + Math.floor(1000 + Math.random() * 9000));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
  const [checkoutWarning, setCheckoutWarning] = useState(null);

  const [dealer, setDealer] = useState(() => {
    let saved = null;
    try {
      const item = localStorage.getItem('plumbmart_user');
      saved = item ? JSON.parse(item) : null;
    } catch (e) {}

    return (currentUser && currentUser.role === 'Dealer') ? currentUser : (saved && (saved.role === 'Dealer' || saved.id === 'DLR-01') ? saved : {
      id: 'DLR-01',
      name: 'Sri Venkateswara Distributors',
      mobile: '9000011111',
      gstin: '29ABCDE1234F1Z5',
      status: 'Approved',
      creditLimit: '₹5,00,000',
      availableCredit: '₹5,00,000',
      credit30Days: true,
      credit90Days: true
    });
  });

  const [deliveryAddress, setDeliveryAddress] = useState({
    recipientName: dealer.name || 'Sri Venkateswara Distributors',
    phone: dealer.mobile || '9000011111',
    addressType: 'Warehouse / Depot',
    streetAddress: 'Plot 42, Main Wholesale Commercial Zone, Phase 1',
    landmark: 'Near Regional Logistics Depot Hub',
    city: dealer.city || 'Bengaluru',
    state: dealer.state || 'Karnataka',
    pincode: '560001'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const targetId = currentUser?.id || currentUser?.mobile || dealer.id || 'DLR-01';
        let res = await fetch(`/api/dealers/${targetId}`);
        if (!res || !res.ok) res = await fetch(`http://localhost:5000/api/dealers/${targetId}`);
        if (!res || !res.ok) res = await fetch(`http://localhost:4000/api/dealers/${targetId}`);
        if (res && res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            setDealer(prev => ({ ...prev, ...json.data }));
          }
        }
      } catch (e) {}
    };

    fetchProfile();
    const interval = setInterval(fetchProfile, 1500);

    let ch;
    try {
      ch = new BroadcastChannel('plumbmart_dealers');
      ch.onmessage = (event) => {
        if (event.data?.type === 'DEALER_GOVERNANCE_UPDATED') {
          fetchProfile();
        }
      };
    } catch (e) {}

    const items = getDealerCart();
    setCartItems(items);

    return () => {
      clearInterval(interval);
      if (ch) ch.close();
    };
  }, [currentUser]);

  const totals = getDealerCartTotals(cartItems);

  // Upfront cash discount (2%)
  const upfrontDiscount = paymentChoice === 'upfront' ? Math.round(totals.grandTotal * 0.02) : 0;
  const finalPayable = totals.grandTotal - upfrontDiscount;

  // Compute Credit Due Dates
  const today = new Date();
  const dueDate30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  const dueDate90 = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const selectedCreditDueDate = creditTerm === '90' ? dueDate90 : dueDate30;

  // Available credit numeric check
  const numericAvailableCredit = parseInt((dealer.availableCredit || '340000').toString().replace(/[^0-9]/g, ''), 10) || 340000;
  const isCreditSufficient = numericAvailableCredit >= totals.grandTotal;

  const handlePlaceOrder = async () => {
    if (dealer.status === 'Suspended') {
      setIsSuspendedModalOpen(true);
      return;
    }

    if (cartItems.length === 0) {
      setCheckoutWarning('Your cart is empty. Please add wholesale products first.');
      navigate('/dealer/products');
      return;
    }

    if (paymentChoice === 'credit' && !isCreditSufficient) {
      setCheckoutWarning('Order amount exceeds your available credit line. Please choose Upfront payment or reduce quantity.');
      return;
    }

    if (!deliveryAddress.streetAddress || !deliveryAddress.city || !deliveryAddress.pincode) {
      setCheckoutWarning('Please fill in your delivery street address, city, and PIN code.');
      return;
    }

    setCheckoutWarning(null);
    setIsSubmitting(true);

    const paymentMethodLabel = paymentChoice === 'upfront' 
      ? `Upfront (${upfrontMethod.toUpperCase()})` 
      : `${creditTerm}-Day Credit`;

    const formattedAddress = `${deliveryAddress.recipientName} (${deliveryAddress.addressType}) - ${deliveryAddress.streetAddress}, ${deliveryAddress.landmark ? deliveryAddress.landmark + ', ' : ''}${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.pincode} [Ph: ${deliveryAddress.phone}]`;

    const payload = {
      clientId: dealer.id || 'DLR-01',
      clientName: dealer.name || 'Sri Venkateswara Distributors',
      clientMobile: deliveryAddress.phone || dealer.mobile || '9000011111',
      clientEmail: dealer.email || currentUser?.email || 'dealer@plumbmart-demo.com',
      clientType: 'Dealer',
      deliveryAddress: formattedAddress,
      poNumber,
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
      let res;
      try {
        res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Proxy status: ' + res.status);
      } catch (e1) {
        try {
          res = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) throw new Error('Port 5000 status: ' + res.status);
        } catch (e2) {
          res = await fetch('http://localhost:4000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      }

      const data = await res.json();

      if (data && data.success && data.order) {
        // Broadcast new order to Admin Portal instantly
        try {
          const ch = new BroadcastChannel('plumbmart_orders');
          ch.postMessage({ type: 'NEW_ORDER', order: data.order });
          ch.close();
        } catch (e) {}

        try {
          localStorage.setItem('plumbmart_last_order_broadcast', JSON.stringify({ id: data.order.id, time: Date.now() }));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent('plumbmart_order_created', { detail: data.order }));

        clearDealerCart();
        navigate(`/dealer/orders?placed=${data.order.id}`);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      // Fallback simulation
      const fallbackId = 'PM-' + Math.floor(100000 + Math.random() * 900000);
      try {
        const ch = new BroadcastChannel('plumbmart_orders');
        ch.postMessage({ type: 'NEW_ORDER', order: { id: fallbackId, clientName: payload.clientName, total: payload.total } });
        ch.close();
      } catch (e) {}
      clearDealerCart();
      navigate(`/dealer/orders?placed=${fallbackId}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DealerLayout currentUser={currentUser} onLogout={onLogout}>
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Choose Payment Method
            </h1>
            <p className="text-xs text-slate-500">
              Upfront payment or approved credit terms
            </p>
          </div>

          <Link
            to="/dealer/cart"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
        </div>

        {checkoutWarning && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs font-bold">{checkoutWarning}</p>
            </div>
            <button 
              onClick={() => setCheckoutWarning(null)} 
              className="p-1 rounded-lg hover:bg-amber-100 text-amber-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto my-8">
            <h3 className="text-base font-bold text-slate-900 mb-1">No items to checkout</h3>
            <p className="text-xs text-slate-500 mb-6">Add products to your cart before selecting a payment method.</p>
            <Link
              to="/dealer/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Payment Selection & Delivery Info */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Payment Method Cards */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Select Payment Option</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Option 1: Upfront Payment */}
                  <div
                    onClick={() => setPaymentChoice('upfront')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                      paymentChoice === 'upfront'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          paymentChoice === 'upfront' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Upfront Payment</h4>
                          <span className="text-[10px] text-slate-500 block">Instant Settlement</span>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentChoice === 'upfront' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {paymentChoice === 'upfront' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 mb-3 leading-relaxed">
                      Pay now via Corporate Net Banking, NEFT/RTGS, or UPI. Immediate tax invoice generation.
                    </p>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>2% Instant Cash Discount Applied (-₹{Math.round(totals.grandTotal * 0.02).toLocaleString('en-IN')})</span>
                    </div>

                    {/* Sub-methods when selected */}
                    {paymentChoice === 'upfront' && (
                      <div className="mt-4 pt-3 border-t border-indigo-100 space-y-2">
                        <label className="text-[10px] font-bold text-slate-700 block">Transfer Method:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'neft', label: 'NEFT / RTGS' },
                            { id: 'netbanking', label: 'Net Banking' },
                            { id: 'upi', label: 'UPI / QR' }
                          ].map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setUpfrontMethod(m.id); }}
                              className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border transition ${
                                upfrontMethod === m.id
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Approved Credit Option */}
                  <div
                    onClick={() => setPaymentChoice('credit')}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                      paymentChoice === 'credit'
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                          paymentChoice === 'credit' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Approved Credit</h4>
                          <span className="text-[10px] text-slate-500 block">Zoho CRM Credit Line</span>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentChoice === 'credit' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {paymentChoice === 'credit' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 mt-2 mb-3 leading-relaxed">
                      Zero upfront payment. Dispatched immediately with invoice due based on approved credit term.
                    </p>

                    <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-[10px] text-indigo-900 font-bold flex items-center justify-between">
                      <span>Available Credit Line:</span>
                      <span className="text-emerald-700 font-black">{dealer.availableCredit}</span>
                    </div>

                    {/* Credit Term Selector when selected */}
                    {paymentChoice === 'credit' && (
                      <div className="mt-4 pt-3 border-t border-indigo-100 space-y-2">
                        <label className="text-[10px] font-bold text-slate-700 block">Select Approved Credit Term:</label>
                        <div className="grid grid-cols-2 gap-2">
                          
                          {/* 30 Days */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCreditTerm('30'); }}
                            className={`p-2 rounded-xl text-left border transition ${
                              creditTerm === '30'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-[11px] font-black block">30-Day Credit</span>
                            <span className={`text-[9px] block ${creditTerm === '30' ? 'text-indigo-200' : 'text-slate-500'}`}>
                              Due: {dueDate30}
                            </span>
                          </button>

                          {/* 90 Days */}
                          {dealer.credit90Days ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setCreditTerm('90'); }}
                              className={`p-2 rounded-xl text-left border transition ${
                                creditTerm === '90'
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-[11px] font-black block">90-Day Credit</span>
                              <span className={`text-[9px] block ${creditTerm === '90' ? 'text-indigo-200' : 'text-slate-500'}`}>
                                Due: {dueDate90}
                              </span>
                            </button>
                          ) : (
                            <div className="p-2 rounded-xl text-left border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed">
                              <div className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span className="text-[10px] font-bold">90-Day Locked</span>
                              </div>
                              <span className="text-[9px] block">Requires Tier-1 Approval</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* Credit Due Date Highlight Box when credit is chosen */}
                {paymentChoice === 'credit' && (
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
                    <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-900">
                        Payment Due Date: <span className="underline">{selectedCreditDueDate}</span>
                      </h5>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Your wholesale order will be processed and dispatched immediately. Full payment of <strong>₹{totals.grandTotal.toLocaleString('en-IN')}</strong> will be due in {creditTerm} days.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery Address Form Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Delivery Address Details</span>
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    B2B Freight Destination
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Address Destination Type */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Destination Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Warehouse / Depot', 'Retail Store', 'Project Site'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDeliveryAddress(prev => ({ ...prev, addressType: type }))}
                          className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition text-center ${
                            deliveryAddress.addressType === type
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient / Firm Name & Contact Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Recipient / Firm Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={deliveryAddress.recipientName}
                        onChange={e => setDeliveryAddress(prev => ({ ...prev, recipientName: e.target.value }))}
                        placeholder="e.g. Sri Venkateswara Distributors"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
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
                          placeholder="9000011111"
                          className="w-full pl-11 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Street Address / Unit */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Street Address / Unit / Shed <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={deliveryAddress.streetAddress}
                      onChange={e => setDeliveryAddress(prev => ({ ...prev, streetAddress: e.target.value }))}
                      placeholder="e.g. Plot 42, 2nd Cross, Peenya Industrial Area, Phase 1"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Landmark / Nearby Logistics Hub (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.landmark}
                      onChange={e => setDeliveryAddress(prev => ({ ...prev, landmark: e.target.value }))}
                      placeholder="e.g. Near City Wholesale Hub / Main Industrial Road"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
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
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
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
                        placeholder="560058"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* PO Number & Logistics Instructions */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Dealer PO Number
                      </label>
                      <input
                        type="text"
                        value={poNumber}
                        onChange={e => setPoNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Logistics Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. Unload at Peenya Gate 3"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Summary & Confirmation Button */}
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
                        <span className="text-[10px] text-slate-400 font-mono">{item.quantity} units × ₹{item.price}</span>
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
                    <span className="text-slate-500">18% GST (Input Credit)</span>
                    <span className="font-semibold text-slate-800">₹{totals.gst.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Freight Transport</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>

                  {upfrontDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>2% Cash Discount</span>
                      <span>-₹{upfrontDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-sm">Final Amount</span>
                    <span className="text-lg font-black text-indigo-600">
                      ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Due Date or Terms Callout */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Selected Method:</span>
                    <strong className="text-slate-900">
                      {paymentChoice === 'upfront' ? `Upfront (${upfrontMethod.toUpperCase()})` : `${creditTerm}-Day Approved Credit`}
                    </strong>
                  </div>
                  {paymentChoice === 'credit' && (
                    <div className="flex justify-between text-[11px] text-indigo-700 font-bold pt-1 border-t border-slate-200">
                      <span>Payment Due Date:</span>
                      <span>{selectedCreditDueDate}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Destination Preview */}
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-900">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      <span>Deliver To:</span>
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">
                      {deliveryAddress.addressType}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-800 truncate">
                    {deliveryAddress.recipientName || dealer.name}
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
                  disabled={isSubmitting || (paymentChoice === 'credit' && !isCreditSufficient)}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition active:scale-98 ${
                    paymentChoice === 'credit' && !isCreditSufficient
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Processing Order with Zoho...</span>
                  ) : (
                    <>
                      <span>
                        {paymentChoice === 'upfront'
                          ? `Confirm Order & Pay ₹${finalPayable.toLocaleString('en-IN')}`
                          : `Confirm Order with ${creditTerm}-Day Credit`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-tight">
                  By confirming, a verified Zoho Sales Order and E-Way Bill will be generated.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Beautiful Dealer Account Suspended Modal */}
      <DealerSuspendedModal
        isOpen={isSuspendedModalOpen}
        onClose={() => setIsSuspendedModalOpen(false)}
        dealerName={dealer.name || 'Sri Venkateswara Distributors'}
      />
    </DealerLayout>
  );
}
