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
  ChevronRight
} from 'lucide-react';
import { getDealerCart } from '../utils/dealerCart';

const SIDEBAR_CATEGORIES = [
  { name: 'All Categories', query: '', icon: Layers, count: 9 },
  { name: 'Pipes & Tubes', query: 'Pipes & Tubes', icon: Box, count: 2 },
  { name: 'Fittings & Valves', query: 'Fittings & Valves', icon: Wrench, count: 2 },
  { name: 'Bath & Faucets', query: 'Bath & Faucets', icon: Droplets, count: 2 },
  { name: 'Pumps & Motors', query: 'Pumps & Motors', icon: Zap, count: 1 },
  { name: 'Tools & Sealants', query: 'Tools & Sealants', icon: Hammer, count: 2 }
];

export default function DealerLayout({ children, currentUser, onLogout }) {
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
      const saved = localStorage.getItem('dealer_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('dealer_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const dealer = currentUser && currentUser.role === 'Dealer' ? currentUser : {
    id: 'DLR-01',
    name: 'Sri Venkateswara Distributors',
    mobile: '9000011111',
    gstin: '29ABCDE1234F1Z5',
    availableCredit: '₹3,40,000',
    creditLimit: '₹5,00,000'
  };

  useEffect(() => {
    const updateCount = () => {
      const items = getDealerCart();
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    };

    updateCount();
    window.addEventListener('dealer_cart_updated', updateCount);
    return () => window.removeEventListener('dealer_cart_updated', updateCount);
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
            <Link to="/dealer/products" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700 transition">
                <Building2 className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-base font-black tracking-tight text-slate-900">
                    Plumb<span className="text-indigo-600">Mart</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    B2B
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/dealer/orders"
              className="p-2 text-slate-600 hover:text-indigo-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50"
              title="Track Orders"
              aria-label="Track Orders"
            >
              <Truck className="w-5 h-5" />
            </Link>

            {/* Cart Icon Only (No Text, No Background) */}
            <Link
              to="/dealer/cart"
              className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50"
              title="Wholesale Cart"
              aria-label="Wholesale Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 text-slate-600 hover:text-indigo-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50"
                title="Account Menu"
                aria-label="Account Menu"
              >
                <User className="w-5 h-5" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{dealer.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">GSTIN: {dealer.gstin}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition"
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
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-600 hover:text-indigo-600 flex items-center justify-center transition active:scale-95 shadow-xs"
                title={isCollapsed ? "Expand sidebar" : "Collapse to icons"}
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
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
                const isProductsPage = location.pathname === '/dealer/products';
                const isSelected = isProductsPage && isMatchingCategory;

                const targetUrl = cat.query 
                  ? `/dealer/products?category=${encodeURIComponent(cat.query)}`
                  : '/dealer/products';

                return (
                  <Link
                    key={cat.name}
                    to={targetUrl}
                    title={cat.name}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                      {!isCollapsed && <span className="truncate">{cat.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {cat.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sidebar Bottom helper */}
          {!isCollapsed && (
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Zoho Master Inventory
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Render Page Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>

      </div>

      {/* Profile Details Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{dealer.name}</h3>
                  <span className="text-[10px] text-indigo-600 font-semibold">Authorized B2B Dealer • {dealer.id}</span>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">GSTIN</span>
                  <span className="font-mono font-bold text-slate-900">{dealer.gstin}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Registered Phone</span>
                  <span className="font-semibold text-slate-900">+91 {dealer.mobile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Available Credit Line</span>
                  <span className="font-bold text-emerald-600">{dealer.availableCredit || '₹3,40,000'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Approved Credit Limit</span>
                  <span className="font-semibold text-slate-900">{dealer.creditLimit || '₹5,00,000'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Warehouse Hub</span>
                  <span className="font-medium text-slate-800 text-right">Peenya Central Depot 01</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
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
