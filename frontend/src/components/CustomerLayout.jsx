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
  MapPin,
  Edit2,
  Save,
  Check,
  Loader2,
  AlertCircle,
  Bell,
  Cylinder,
  Filter
} from 'lucide-react';
import { getCustomerCart } from '../utils/customerCart';
import InAppNotificationToast from './InAppNotificationToast';
import { clearAuthSession } from '../utils/authSession';

const SIDEBAR_CATEGORIES = [
  { name: 'All Categories', query: '', icon: Layers },
  { name: 'Pipes & Tubes', query: 'Pipes & Tubes', icon: Box },
  { name: 'Fittings & Valves', query: 'Fittings & Valves', icon: Wrench },
  { name: 'Bath & Faucets', query: 'Bath & Faucets', icon: Droplets },
  { name: 'Pumps & Motors', query: 'Pumps & Motors', icon: Zap },
  { name: 'Tools & Sealants', query: 'Tools & Sealants', icon: Hammer },
  { name: 'Water Tanks & Storage', query: 'Water Tanks & Storage', icon: Cylinder },
  { name: 'Drainage & Sanitary', query: 'Drainage & Sanitary', icon: Filter }
];

export default function CustomerLayout({ children, currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentCategoryParam = searchParams.get('category') || '';

  const [cartCount, setCartCount] = useState(0);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({ '': 0 });
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
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          const counts = { '': data.data.length };
          data.data.forEach(p => {
            const cat = p.category || 'Pipes & Tubes';
            counts[cat] = (counts[cat] || 0) + 1;
          });
          setCategoryCounts(counts);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('customer_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const [customerProfile, setCustomerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('plumbmart_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id || 'CUST-01',
          name: parsed.name || 'manikanta',
          mobile: String(parsed.mobile || '9347486117').replace(/\D/g, '').slice(-10),
          email: parsed.email || 'manikantakadali99@gmail.com',
          address: parsed.address || 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103',
          role: parsed.role || 'Customer'
        };
      }
    } catch {
      // ignore
    }
    return {
      id: currentUser?.id || 'CUST-01',
      name: currentUser?.name || 'manikanta',
      mobile: String(currentUser?.mobile || '9347486117').replace(/\D/g, '').slice(-10),
      email: currentUser?.email || 'manikantakadali99@gmail.com',
      address: currentUser?.address || 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103',
      role: 'Customer'
    };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  // Live Broadcast Announcements (Customer & All)
  const [announcements, setAnnouncements] = useState([]);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [readAnnouncements, setReadAnnouncements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('plumbmart_customer_read_announcements') || '[]');
    } catch {
      return [];
    }
  });
  const notifDropdownRef = useRef(null);
  const knownAnnouncementsRef = useRef(null);

  const fetchCustomerAnnouncements = async () => {
    try {
      let res;
      try {
        res = await fetch('/api/notifications?role=Customer');
      } catch (e1) {
        res = await fetch('http://localhost:5000/api/notifications?role=Customer');
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.data)) {
        if (knownAnnouncementsRef.current === null) {
          knownAnnouncementsRef.current = new Set(data.data.map(a => a.id));
        } else {
          // Detect fresh announcements and trigger in-app toast
          const fresh = data.data.filter(a => !knownAnnouncementsRef.current.has(a.id));
          if (fresh.length > 0) {
            fresh.forEach(item => {
              knownAnnouncementsRef.current.add(item.id);
              window.dispatchEvent(new CustomEvent('plumbmart_inapp_notify', {
                detail: {
                  ...item,
                  type: 'ANNOUNCEMENT'
                }
              }));
            });
          }
        }
        setAnnouncements(data.data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCustomerAnnouncements();

    let ch;
    try {
      ch = new BroadcastChannel('plumbmart_announcements');
      ch.onmessage = (event) => {
        if (event.data && event.data.type === 'NEW_ANNOUNCEMENT') {
          const target = (event.data.announcement?.targetGroup || 'All').toLowerCase();
          if (target === 'all' || target.includes('customer')) {
            fetchCustomerAnnouncements();
          }
        }
      };
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'plumbmart_announcement_broadcast') {
        fetchCustomerAnnouncements();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('plumbmart_announcement_created', fetchCustomerAnnouncements);

    const poll = setInterval(fetchCustomerAnnouncements, 3000);

    return () => {
      if (ch) ch.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plumbmart_announcement_created', fetchCustomerAnnouncements);
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

  const handleMarkAllCustomerRead = () => {
    const allIds = announcements.map(a => a.id);
    setReadAnnouncements(allIds);
    try {
      localStorage.setItem('plumbmart_customer_read_announcements', JSON.stringify(allIds));
    } catch {}
  };

  // Sync when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setCustomerProfile(prev => ({
        ...prev,
        ...currentUser,
        name: currentUser.name || prev.name,
        mobile: String(currentUser.mobile || prev.mobile).replace(/\D/g, '').slice(-10),
        email: currentUser.email || prev.email,
        address: currentUser.address || prev.address
      }));
    }
  }, [currentUser]);

  // Sync across custom events or storage updates
  useEffect(() => {
    const handleUserUpdate = (e) => {
      if (e?.detail) {
        setCustomerProfile(prev => ({ ...prev, ...e.detail }));
      } else {
        try {
          const saved = localStorage.getItem('plumbmart_user');
          if (saved) setCustomerProfile(JSON.parse(saved));
        } catch {}
      }
    };
    window.addEventListener('plumbmart_user_updated', handleUserUpdate);
    return () => window.removeEventListener('plumbmart_user_updated', handleUserUpdate);
  }, []);

  const handleStartEditing = () => {
    setEditFormData({
      name: customerProfile.name || '',
      mobile: customerProfile.mobile || '',
      email: customerProfile.email || '',
      address: customerProfile.address || ''
    });
    setIsEditingProfile(true);
    setProfileSaveSuccess(false);
    setProfileSaveError('');
  };

  const handleCancelEditing = () => {
    setIsEditingProfile(false);
    setProfileSaveError('');
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (!editFormData.name.trim()) {
      setProfileSaveError('Please enter your name.');
      return;
    }
    const cleanMobile = editFormData.mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      setProfileSaveError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSavingProfile(true);
    setProfileSaveError('');
    setProfileSaveSuccess(false);

    try {
      let res;
      try {
        res = await fetch('/api/customer/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: cleanMobile,
            name: editFormData.name.trim(),
            email: editFormData.email.trim(),
            address: editFormData.address.trim()
          })
        });
      } catch (netErr) {
        res = await fetch('http://localhost:5000/api/customer/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: cleanMobile,
            name: editFormData.name.trim(),
            email: editFormData.email.trim(),
            address: editFormData.address.trim()
          })
        });
      }

      const result = await res.json();
      if (!res.ok && !result.success) {
        throw new Error(result.message || 'Failed to update profile');
      }

      const updated = {
        ...customerProfile,
        name: editFormData.name.trim(),
        mobile: cleanMobile,
        email: editFormData.email.trim(),
        address: editFormData.address.trim()
      };

      setCustomerProfile(updated);
      try {
        localStorage.setItem('plumbmart_user', JSON.stringify(updated));
      } catch {}

      window.dispatchEvent(new CustomEvent('plumbmart_user_updated', { detail: updated }));
      setProfileSaveSuccess(true);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setProfileSaveError(err.message || 'Could not save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
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
    clearAuthSession();
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Real-Time In-App Notification Toast */}
      <InAppNotificationToast role="Customer" />
      
      {/* Main Top Header */}
      <header className="shrink-0 z-40 bg-white border-b border-slate-200 shadow-xs">
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

            {/* Announcements Notification Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                onClick={() => {
                  setIsNotifMenuOpen(!isNotifMenuOpen);
                  if (!isNotifMenuOpen && unreadAnnouncementsCount > 0) {
                    handleMarkAllCustomerRead();
                  }
                }}
                className="relative p-2 text-slate-600 hover:text-blue-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50 cursor-pointer"
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
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-slate-900">Announcements</span>
                    </div>
                    {announcements.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        {announcements.length} Alert{announcements.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {announcements.length > 0 ? (
                      announcements.map(item => (
                        <div key={item.id} className="p-3.5 hover:bg-slate-50/80 transition space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-slate-900 text-xs">{item.title}</h4>
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
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
                        No new announcements at this time.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
                    <p className="text-xs font-bold text-slate-900 truncate">{customerProfile.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">+91 {customerProfile.mobile}</p>
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
      <div className="flex-1 flex w-full relative overflow-hidden min-h-0">
        
        {/* Category Sidebar - Desktop */}
        <aside className={`${isCollapsed ? 'w-16 sm:w-18 p-2' : 'w-56 sm:w-60 p-3.5'} hidden md:flex shrink-0 bg-white border-r border-slate-200 flex-col justify-between transition-all duration-200 h-full overflow-y-auto overflow-x-hidden z-20`}>
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

                const displayCount = categoryCounts[cat.query] !== undefined ? categoryCounts[cat.query] : 0;

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
                        {displayCount}
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
        <div className="flex-1 min-w-0 h-full overflow-y-auto pb-20 md:pb-0">
          {children}
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar with Sidebar Category Icons */}
      <nav 
        aria-label="Category Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
      >
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

          const shortLabel = cat.name === 'All Categories' ? 'All'
            : cat.name === 'Pipes & Tubes' ? 'Pipes'
            : cat.name === 'Fittings & Valves' ? 'Fittings'
            : cat.name === 'Bath & Faucets' ? 'Bath'
            : cat.name === 'Pumps & Motors' ? 'Pumps'
            : cat.name === 'Tools & Sealants' ? 'Tools'
            : cat.name === 'Water Tanks & Storage' ? 'Tanks'
            : cat.name === 'Drainage & Sanitary' ? 'Drainage'
            : cat.name;

          const displayCount = categoryCounts[cat.query] !== undefined ? categoryCounts[cat.query] : 0;

          return (
            <Link
              key={cat.name}
              to={targetUrl}
              title={cat.name}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-0.5 rounded-xl transition active:scale-95 ${
                isSelected
                  ? 'text-blue-600 font-bold bg-blue-50/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600 stroke-[2.25]' : 'text-slate-500 stroke-[1.75]'}`} />
                {displayCount > 0 && (
                  <span className={`absolute -top-1 -right-2 text-[8px] px-1 rounded-full font-mono font-bold leading-none py-0.5 ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {displayCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[52px] text-center leading-tight">
                {shortLabel}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Customer Profile Details Modal (Dynamic View & Edit) */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                setIsEditingProfile(false);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Success notification banner */}
            {profileSaveSuccess && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Customer profile updated successfully!</span>
              </div>
            )}

            {!isEditingProfile ? (
              /* VIEW MODE */
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 pr-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-blue-600/25">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{customerProfile.name}</h3>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Customer Account
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartEditing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-200/60 shadow-2xs hover:shadow-xs"
                    title="Edit profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="py-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>Contact Mobile:</span>
                    </div>
                    <strong className="text-slate-900 font-mono">+91 {customerProfile.mobile}</strong>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>Email:</span>
                    </div>
                    <strong className="text-slate-900 font-mono truncate max-w-[210px]">{customerProfile.email || 'customer@plumbmart.com'}</strong>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Delivery Address:</span>
                    </div>
                    <p className="text-slate-800 text-[11px] leading-relaxed">
                      {customerProfile.address || 'Flat 402, Green Glen Heights, Outer Ring Road, Bellandur, Bengaluru - 560103'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-blue-900 flex items-center justify-between">
                    <span>Account Type:</span>
                    <span className="font-bold text-blue-700">Retail Direct Consumer</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={handleStartEditing}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* EDIT MODE */
              <form onSubmit={handleSaveProfile}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 pr-8">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Edit Customer Profile</h3>
                    <p className="text-[11px] text-slate-500">Update your account and address details</p>
                  </div>
                </div>

                {profileSaveError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{profileSaveError}</span>
                  </div>
                )}

                <div className="py-3.5 space-y-3 text-xs">
                  {/* Name field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        placeholder="e.g. Manikanta Kadali"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Mobile <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-500">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={editFormData.mobile}
                        onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full pl-11 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        value={editFormData.email}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {/* Delivery Address field */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Delivery Address
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <textarea
                        rows={3}
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition leading-relaxed resize-none"
                        placeholder="House / Flat No, Street, Landmark, City - Pincode"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCancelEditing}
                    disabled={isSavingProfile}
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20 disabled:opacity-50"
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
