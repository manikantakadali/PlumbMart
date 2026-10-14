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
  LayoutDashboard,
  Bell
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

export default function DealerLayout({ children, currentUser, onLogout, products = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategoryParam = searchParams.get('category') || '';

  const [cartCount, setCartCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const categoryCounts = React.useMemo(() => {
    if (!products || products.length === 0) {
      return {
        '': 180,
        'All Categories': 180,
        'Pipes & Tubes': 50,
        'Tools & Sealants': 40,
        'Pumps & Motors': 30,
        'Bath & Faucets': 30,
        'Fittings & Valves': 30
      };
    }
    const counts = { '': products.length, 'All Categories': products.length };
    products.forEach(p => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

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

  const [dealer, setDealer] = useState(() => {
    return currentUser && currentUser.role === 'Dealer' ? currentUser : {
      id: 'DLR-01',
      name: 'Sri Venkateswara Distributors',
      mobile: '9000011111',
      gstin: '29ABCDE1234F1Z5',
      availableCredit: '₹3,40,000',
      creditLimit: '₹5,00,000'
    };
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res = await fetch('/api/dealers/DLR-01');
        if (!res || !res.ok) res = await fetch('http://localhost:5000/api/dealers/DLR-01');
        if (!res || !res.ok) res = await fetch('http://localhost:4000/api/dealers/DLR-01');
        if (res && res.ok) {
          const json = await res.json();
          if (json && json.success && json.data) {
            const d = json.data;
            setDealer(prev => ({
              ...prev,
              ...d,
              creditLimit: `₹${(d.creditLimit || 500000).toLocaleString('en-IN')}`,
              availableCredit: `₹${(d.availableCredit !== undefined ? d.availableCredit : 340000).toLocaleString('en-IN')}`
            }));
          }
        }
      } catch (e) {}
    };

    fetchProfile();

    let channel;
    try {
      channel = new BroadcastChannel('plumbmart_orders');
      channel.onmessage = (event) => {
        if (event.data?.type === 'DEALER_GOVERNANCE_UPDATED') {
          fetchProfile();
        }
      };
    } catch (e) {}

    const handleStorage = (e) => {
      if (e.key === 'plumbmart_dealer_governance_broadcast') {
        fetchProfile();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

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

  // Live Broadcast Announcements (Dealer & All)
  const [announcements, setAnnouncements] = useState([]);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('plumbmart_dealer_read_announcements') || '[]');
    } catch {
      return [];
    }
  });
  const notifDropdownRef = useRef(null);

  const fetchDealerAnnouncements = async () => {
    try {
      let res;
      try {
        res = await fetch('/api/notifications?role=Dealer');
      } catch (e1) {
        res = await fetch('http://localhost:5000/api/notifications?role=Dealer');
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        setAnnouncements(data.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchDealerAnnouncements();

    let ch;
    try {
      ch = new BroadcastChannel('plumbmart_announcements');
      ch.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_ANNOUNCEMENT') {
          const target = (event.data.announcement?.targetGroup || 'All').toLowerCase();
          if (target === 'all' || target.includes('dealer')) {
            fetchDealerAnnouncements();
          }
        }
      };
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'plumbmart_announcement_broadcast') {
        fetchDealerAnnouncements();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('plumbmart_announcement_created', fetchDealerAnnouncements);

    const poll = setInterval(fetchDealerAnnouncements, 3000);

    return () => {
      if (ch) ch.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plumbmart_announcement_created', fetchDealerAnnouncements);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideNotif = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setIsNotifMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutsideNotif);
    return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
  }, []);

  const unreadAnnouncementsCount = announcements.filter(a => !readAnnouncements.includes(a.id)).length;

  const handleMarkAllDealerRead = () => {
    const allIds = announcements.map(a => a.id);
    setReadAnnouncements(allIds);
    try {
      localStorage.setItem('plumbmart_dealer_read_announcements', JSON.stringify(allIds));
    } catch {}
  };

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
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-800 w-full max-w-full overflow-hidden min-w-0">
      
      {/* Main Top Header */}
      <header className="shrink-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-6">
            {/* Brand Logo */}
            <Link to="/dealer" className="flex items-center gap-2 group">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/dealer"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  location.pathname === '/dealer' || location.pathname === '/dealer/dashboard'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard (Stock & Tracking)</span>
              </Link>
              <Link
                to="/dealer/products"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  location.pathname === '/dealer/products'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>Catalog</span>
              </Link>
              <Link
                to="/dealer/orders"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  location.pathname === '/dealer/orders'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Orders</span>
              </Link>
            </nav>
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

            {/* Live Announcements Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setIsNotifMenuOpen(!isNotifMenuOpen);
                  if (!isNotifMenuOpen && unreadAnnouncementsCount > 0) {
                    handleMarkAllDealerRead();
                  }
                }}
                className="relative p-2 text-slate-600 hover:text-indigo-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50 cursor-pointer"
                title="Company Announcements & Updates"
                aria-label="Announcements"
              >
                <Bell className="w-5 h-5" />
                {unreadAnnouncementsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs animate-pulse">
                    {unreadAnnouncementsCount}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">Dealer Bulletins & Notices</span>
                    </div>
                    {announcements.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        {announcements.length} Bulletin{announcements.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {announcements.length > 0 ? (
                      announcements.map(item => (
                        <div key={item.id} className="p-3.5 hover:bg-slate-50/80 transition space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                              {item.targetGroup}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{item.message}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                            <span>{item.sentAt || 'Recently'}</span>
                            <span>By {item.sender || 'Admin'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        No new bulletins or announcements.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{dealer.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">GSTIN: {dealer.gstin}</p>
                  </div>

                  <Link
                    to="/dealer"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Dealer Dashboard</span>
                  </Link>

                  <Link
                    to="/dealer/products"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition"
                  >
                    <Box className="w-4 h-4 text-slate-400" />
                    <span>Wholesale Catalog</span>
                  </Link>

                  <Link
                    to="/dealer/orders"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition"
                  >
                    <Truck className="w-4 h-4 text-slate-400" />
                    <span>Order Tracking</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2 transition border-t border-slate-100"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profile & Credit Limit</span>
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
      <div className="flex-1 flex w-full relative overflow-hidden min-h-0">
        
        {/* Category Sidebar - Desktop */}
        <aside className={`${isCollapsed ? 'w-16 sm:w-18 p-2' : 'w-56 sm:w-60 p-3.5'} hidden md:flex shrink-0 bg-white border-r border-slate-200 flex-col justify-between transition-all duration-200 h-full overflow-y-auto overflow-x-hidden z-20`}>
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
                        {categoryCounts[cat.name] ?? categoryCounts[cat.query] ?? cat.count}
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
        <div className="flex-1 min-w-0 w-full flex flex-col h-full overflow-y-auto pb-20 md:pb-0">
          {/* Render Page Content */}
          <div className="flex-1 w-full min-w-0">
            {children}
          </div>
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        aria-label="Dealer Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
      >
        <Link
          to="/dealer"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-95 ${
            location.pathname === '/dealer' || location.pathname === '/dealer/dashboard'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">Dashboard</span>
        </Link>

        <Link
          to="/dealer/products"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-95 ${
            location.pathname === '/dealer/products'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Box className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">Catalog</span>
        </Link>

        <Link
          to="/dealer/cart"
          className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-95 ${
            location.pathname === '/dealer/cart'
              ? 'text-indigo-600 font-bold bg-indigo-50/80 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] px-1 rounded-full font-bold bg-indigo-600 text-white leading-none py-0.5">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">Cart</span>
        </Link>

        <Link
          to="/dealer/orders"
          className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-95 ${
            location.pathname.startsWith('/dealer/orders')
              ? 'text-indigo-600 font-bold bg-indigo-50/80 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">Orders</span>
        </Link>

        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-slate-500 hover:text-slate-900 transition active:scale-95"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">Account</span>
        </button>
      </nav>

      {/* Profile Details Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
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
