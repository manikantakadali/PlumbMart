import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import CustomerLayout from '../components/CustomerLayout';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Box, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  Search,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function CustomerOrdersPage({ currentUser, onLogout }) {
  const [searchParams] = useSearchParams();
  const { orderId: paramOrderId } = useParams();
  const placedOrderId = searchParams.get('placed');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'delivered'
  const [searchQuery, setSearchQuery] = useState(paramOrderId || placedOrderId || '');
  const [expandedOrderId, setExpandedOrderId] = useState(paramOrderId || placedOrderId || null);

  const customer = currentUser && currentUser.role === 'Customer' ? currentUser : {
    id: 'CUST-01',
    name: 'Rahul Sharma',
    mobile: '9876543210'
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/orders?clientType=Customer`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setOrders(data.data);
      } else {
        // Default customer demo orders
        setOrders([
          {
            id: 'PM-928410',
            clientType: 'Customer',
            clientName: customer.name,
            clientMobile: customer.mobile,
            total: 3360,
            paymentMethod: 'Online Payment (UPI / QR)',
            paymentStatus: 'Paid',
            status: 'Out for Delivery',
            expectedDate: 'Today by 04:00 PM',
            deliveryAddress: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103',
            createdAt: new Date().toISOString(),
            items: [
              { name: 'Astral CPVC Pro High Pressure Pipe (1 Inch, 3m)', qty: 4, price: 480 },
              { name: 'Ashirvad Brass Concealed Stop Cock (15mm Heavy)', qty: 2, price: 720 }
            ],
            tracking: [
              { step: 1, title: 'Order Confirmed', description: 'Payment verified and order generated', completed: true, time: 'Today 07:15 AM' },
              { step: 2, title: 'Regional Warehouse Packed', description: 'Quality inspected and safely boxed', completed: true, time: 'Today 09:30 AM' },
              { step: 3, title: 'Dispatched / In Transit', description: 'Assigned to courier van KA-03-AA-9102', completed: true, time: 'Today 11:45 AM' },
              { step: 4, title: 'Out for Delivery', description: 'Delivery agent en route to your doorstep', completed: true, time: 'Today 01:20 PM' },
              { step: 5, title: 'Delivered', description: 'Delivered with OTP confirmation', completed: false, time: 'Expected by 04:00 PM' }
            ]
          },
          {
            id: 'PM-817294',
            clientType: 'Customer',
            clientName: customer.name,
            clientMobile: customer.mobile,
            total: 3810,
            paymentMethod: 'Online Payment (Debit/Credit Card)',
            paymentStatus: 'Paid',
            status: 'Delivered',
            expectedDate: 'Delivered on 11 Oct 2026',
            deliveryAddress: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103',
            createdAt: '2026-10-10T09:30:00.000Z',
            items: [
              { name: 'Jaquar Alive Single Lever Basin Mixer Tap (Chrome)', qty: 1, price: 3450 },
              { name: 'Pidilite M-Seal Sanitary & Plumbing Epoxy Putty', qty: 2, price: 180 }
            ],
            tracking: [
              { step: 1, title: 'Order Confirmed', description: 'Payment verified', completed: true, time: '10 Oct 09:30 AM' },
              { step: 2, title: 'Warehouse Packed', description: 'Packed & dispatched', completed: true, time: '10 Oct 02:00 PM' },
              { step: 3, title: 'In Transit', description: 'Hub arrival', completed: true, time: '11 Oct 08:30 AM' },
              { step: 4, title: 'Delivered', description: 'Package handed over to customer', completed: true, time: '11 Oct 03:45 PM' }
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    // Tab filter
    if (activeTab === 'active' && order.status === 'Delivered') return false;
    if (activeTab === 'delivered' && order.status !== 'Delivered') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchItem = order.items && order.items.some(i => i.name.toLowerCase().includes(q));
      return matchId || matchItem;
    }
    return true;
  });

  return (
    <CustomerLayout currentUser={currentUser} onLogout={onLogout}>
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Placed Order Success Banner */}
        {placedOrderId && (
          <div className="mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-5 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight">Order #{placedOrderId} Confirmed!</h3>
                <p className="text-xs text-white/90">
                  Payment cleared online. Your order is being packed and prepared for express shipment.
                </p>
              </div>
            </div>
            <Link
              to="/customer/products"
              className="px-4 py-2 rounded-xl bg-white text-emerald-800 text-xs font-bold hover:bg-emerald-50 transition shadow-sm whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Order More Items
            </Link>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>My Orders &amp; Delivery Tracking</span>
            </h1>
            <p className="text-xs text-slate-500">
              Track live package dispatch, view purchase details and download invoices
            </p>
          </div>

          <Link
            to="/customer/products"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition self-start sm:self-auto"
          >
            <Box className="w-3.5 h-3.5" />
            <span>Browse Catalog</span>
          </Link>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'active', label: 'In Transit' },
              { id: 'delivered', label: 'Delivered' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or item..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200 p-6 animate-pulse space-y-4">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-16 bg-slate-100 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-md mx-auto my-6">
            <Box className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-sm text-slate-700">No matching orders found</p>
            <p className="text-xs text-slate-400 mt-1">Try switching tabs or resetting your search query.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const isDelivered = order.status === 'Delivered';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-2xs hover:shadow-xs transition overflow-hidden"
                >
                  {/* Top Bar of the Order Card */}
                  <div 
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                        isDelivered ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-slate-900 text-sm">#{order.id}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {order.status || 'Processing'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span>Date: <strong>{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
                          <span>&bull;</span>
                          <span>Payment: <strong className="text-emerald-700 font-semibold">{order.paymentMethod || 'Online Paid'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-5">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold uppercase">Total Paid</span>
                        <span className="text-base font-black text-slate-900">
                          ₹{(order.total || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title={isExpanded ? "Collapse" : "Expand Details"}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-5 animate-in fade-in duration-150">
                      
                      {/* Tracking Stepper */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                        <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-blue-600" />
                          <span>Delivery Journey &amp; Status</span>
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative">
                          {[
                            { step: 1, title: 'Order Placed', desc: 'Online Payment Cleared', done: true },
                            { step: 2, title: 'Packed at Hub', desc: 'Boxed & Sealed', done: true },
                            { step: 3, title: 'Out for Delivery', desc: 'Assigned to Agent', done: !isDelivered },
                            { step: 4, title: 'Delivered', desc: 'Doorstep Drop', done: isDelivered }
                          ].map((st, i) => (
                            <div key={i} className="flex items-start gap-2.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                                st.done
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {st.done ? '✓' : i + 1}
                              </div>
                              <div>
                                <h5 className={`text-xs font-bold ${st.done ? 'text-slate-900' : 'text-slate-400'}`}>
                                  {st.title}
                                </h5>
                                <p className="text-[10px] text-slate-500">{st.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Items List & Delivery Address Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Items Purchased */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                          <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                            <Box className="w-4 h-4 text-blue-600" />
                            <span>Ordered Items ({order.items ? order.items.length : 0})</span>
                          </h4>

                          <div className="divide-y divide-slate-100 text-xs">
                            {order.items && order.items.map((item, idx) => (
                              <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                                  <p className="text-[10px] text-slate-400">{item.qty} units &times; ₹{item.price}</p>
                                </div>
                                <span className="font-bold text-slate-900 shrink-0">
                                  ₹{(item.qty * item.price).toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Destination & Actions */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              <span>Delivery Address</span>
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {order.deliveryAddress || 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru'}
                            </p>
                            {order.notes && (
                              <p className="text-[11px] text-blue-700 bg-blue-50 p-2 rounded-xl mt-2">
                                <strong>Instructions:</strong> {order.notes}
                              </p>
                            )}
                          </div>

                          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                            <button
                              onClick={() => alert(`Downloading GST Invoice for Order #${order.id}...`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Invoice</span>
                            </button>

                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Verified Delivery</span>
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>
    </CustomerLayout>
  );
}
