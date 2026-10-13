import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Box, 
  ShoppingCart, 
  Truck, 
  Layers, 
  Droplets, 
  Wrench, 
  Zap, 
  Hammer, 
  User, 
  LogOut, 
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { getCustomerCart } from '../utils/customerCart';

const SIDEBAR_CATEGORIES = [
  { name: 'All Categories', query: '', icon: Layers, count: 9 },
  { name: 'Pipes & Tubes', query: 'Pipes & Tubes', icon: Box, count: 2 },
  { name: 'Fittings & Valves', query: 'Fittings & Valves', icon: Wrench, count: 2 },
  { name: 'Bath & Faucets', query: 'Bath & Faucets', icon: Droplets, count: 2 },
  { name: 'Pumps & Motors', query: 'Pumps & Motors', icon: Zap, count: 1 },
  { name: 'Tools & Sealants', query: 'Tools & Sealants', icon: Hammer, count: 2 }
];

export default function CustomerLayout({ children, currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategoryParam = searchParams.get('category') || '';

  const [cartCount, setCartCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('customer_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('customer_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const customer = currentUser && currentUser.role === 'Customer' ? currentUser : {
    id: 'CUST-01',
    name: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@example.com',
    role: 'Customer',
    address: 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru'
  };

  useEffect(() => {
    const updateCount = () => {
      const items = getCustomerCart();
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCount();
    window.addEventListener('customer_cart_updated', updateCount);
    return () => window.removeEventListener('customer_cart_updated', updateCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutAction = () => {
    setIsProfileMenuOpen(false);
    try {
      localStorage.removeItem('plumbmart_user');
    } catch {
      // ignore
    }
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Main Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <Link to="/customer/products" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20 group-hover:bg-blue-700 transition">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-base font-black tracking-tight text-slate-900">
                    Plumb<span className="text-blue-600">Mart</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Retail
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Track Orders Icon */}
            <Link
              to="/customer/orders"
              className="p-2 text-slate-600 hover:text-blue-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50"
              title="Track Orders"
              aria-label="Track Orders"
            >
              <Truck className="w-5 h-5" />
            </Link>

            {/* Cart Icon Only (No Text, No Background) */}
            <Link
              to="/customer/cart"
              className="relative p-2 text-slate-600 hover:text-blue-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50"
              title="Shopping Cart"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 text-slate-600 hover:text-blue-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50"
                title="Account Menu"
                aria-label="Account Menu"
              >
                <User className="w-5 h-5" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{customer.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">+91 {customer.mobile}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={handleLogoutAction}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* Body with Category Sidebar + Main Content */}
      <div className="flex-1 flex w-full relative">
        
        {/* Category Sidebar */}
        <aside className={`${isCollapsed ? 'w-16 sm:w-18 p-2' : 'w-56 sm:w-60 p-3.5'} shrink-0 bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-200 min-h-[calc(100vh-65px)]`}>
          <div>
            {/* Sidebar Corner Toggle Button */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} pb-2 mb-2 border-b border-slate-100`}>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 flex items-center justify-center transition active:scale-95 shadow-xs"
                title={isCollapsed ? "Expand sidebar" : "Collapse to icons"}
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>

            {/* Category Options List */}
            <div className="space-y-1.5">
              {SIDEBAR_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isMatchingCategory = cat.query === '' 
                  ? (!currentCategoryParam || currentCategoryParam === 'All Categories')
                  : currentCategoryParam === cat.query;
                const isProductsPage = location.pathname === '/customer/products' || location.pathname === '/customer';
                const isSelected = isProductsPage && isMatchingCategory;

                const targetUrl = cat.query 
                  ? `/customer/products?category=${encodeURIComponent(cat.query)}`
                  : '/customer/products';

                return (
                  <Link
                    key={cat.name}
                    to={targetUrl}
                    title={cat.name}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{cat.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${
                        isSelected ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Help Callout */}
          {!isCollapsed ? (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-center">
                <span className="text-[11px] font-bold text-slate-800 block mb-0.5">Customer Support</span>
                <span className="text-[10px] text-slate-500 block">Toll-free 1800-2026-PM</span>
                <span className="inline-block mt-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  100% Genuine
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex justify-center">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400" title="100% Genuine">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          )}
        </aside>

        {/* Content Page Area */}
        <div className="flex-1 overflow-x-hidden min-w-0">
          {children}
        </div>

      </div>

      {/* Customer Profile Details Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/25">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{customer.name}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Customer Account
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Contact Mobile:</span>
                </div>
                <strong className="text-slate-900 font-mono">+91 {customer.mobile}</strong>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Email:</span>
                </div>
                <strong className="text-slate-900 font-mono">{customer.email || 'customer@plumbmart.com'}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Delivery Address:</span>
                </div>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  {customer.address || 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 flex items-center justify-between">
                <span>Account Type:</span>
                <span className="font-bold text-blue-700">Retail Direct Consumer</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
