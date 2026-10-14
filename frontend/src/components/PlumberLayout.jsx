import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Wrench, 
  BookOpen, 
  Bell, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut, 
  ShieldCheck, 
  Phone, 
  Mail, 
  CheckCircle2, 
  X,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import InAppNotificationToast from './InAppNotificationToast';

export default function PlumberLayout({ 
  children, 
  currentUser, 
  onLogout,
  activeTab = 'activities',
  onSelectTab,
  unreadCount = 2,
  activeJobsCount = 2
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('plumber_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('plumber_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const activeMobile = (currentUser && currentUser.mobile) || '9111122222';
  const [plumber, setPlumber] = useState(currentUser && currentUser.role === 'Plumber' ? currentUser : {
    id: 'PLM-01',
    name: 'Ramesh Kumar',
    mobile: activeMobile,
    email: 'plumber@plumbmart-demo.com',
    role: 'Plumber',
    license: 'PLUMB-KA-2024-884',
    rating: 4.9,
    status: 'VERIFIED',
    city: 'Bengaluru (East & South Zones)',
    specialization: 'CPVC/UPVC Piping, Concealed Valves & Pump Automation'
  });

  // Fetch live plumber profile and sync across tabs
  useEffect(() => {
    let isMounted = true;
    const loadProfile = () => {
      fetch(`/api/plumber/profile?mobile=${encodeURIComponent(activeMobile)}`)
        .then(res => res.json())
        .then(data => {
          if (isMounted && data.success && data.plumber) {
            setPlumber(prev => ({ ...prev, ...data.plumber }));
          }
        })
        .catch(err => console.warn('Could not fetch plumber profile for layout:', err));
    };

    loadProfile();
    const poll = setInterval(loadProfile, 2000);

    const handleProfileSync = (e) => {
      if (e.detail) {
        const updates = e.detail.updates || (e.detail.status ? { status: e.detail.status } : e.detail);
        setPlumber(prev => ({ ...prev, ...updates }));
      }
    };
    window.addEventListener('plumber_profile_updated', handleProfileSync);
    window.addEventListener('plumbmart_plumber_updated', handleProfileSync);

    let ch = null;
    try {
      ch = new BroadcastChannel('plumbmart_plumbers');
      ch.onmessage = (evt) => {
        if (evt.data && (evt.data.status || evt.data.updates)) {
          const updates = evt.data.updates || { status: evt.data.status };
          setPlumber(prev => ({ ...prev, ...updates }));
        }
      };
    } catch (e) {}

    const handleStorage = (evt) => {
      if (evt.key === 'plumbmart_plumber_status_broadcast' && evt.newValue) {
        try {
          const parsed = JSON.parse(evt.newValue);
          if (parsed && (parsed.status || parsed.updates)) {
            const updates = parsed.updates || { status: parsed.status };
            setPlumber(prev => ({ ...prev, ...updates }));
          }
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      clearInterval(poll);
      window.removeEventListener('plumber_profile_updated', handleProfileSync);
      window.removeEventListener('plumbmart_plumber_updated', handleProfileSync);
      window.removeEventListener('storage', handleStorage);
      if (ch) ch.close();
    };
  }, [activeMobile]);

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

  const isSuspended = plumber.status === 'SUSPENDED';

  const navItems = [
    {
      id: 'activities',
      name: 'My Activities',
      icon: Wrench,
      description: 'Check & Perform Assigned Work',
      badge: activeJobsCount > 0 ? `${activeJobsCount} Active` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'products',
      name: 'Product Manuals',
      icon: BookOpen,
      description: 'Specs & Installation Guides',
      badge: '9 Manuals',
      badgeColor: 'bg-slate-100 text-slate-600'
    },
    {
      id: 'updates',
      name: 'Updates & Alerts',
      icon: Bell,
      description: 'Jobs & Company Announcements',
      badge: unreadCount > 0 ? `${unreadCount} New` : null,
      badgeColor: 'bg-rose-100 text-rose-700'
    },
    {
      id: 'profile',
      name: 'My Profile',
      icon: UserCheck,
      description: 'Verification & Registered Info',
      badge: isSuspended ? 'SUSPENDED' : (plumber.status === 'PENDING_VERIFICATION' ? 'Pending' : 'Verified'),
      badgeColor: isSuspended 
        ? 'bg-rose-100 text-rose-800 border border-rose-300 font-extrabold animate-pulse' 
        : (plumber.status === 'PENDING_VERIFICATION' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
    }
  ];

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-800 overflow-hidden">
      {/* Real-Time In-App Notification Toast */}
      <InAppNotificationToast role="Plumber" />

      {/* Account Suspended Alert Banner */}
      {isSuspended && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-3 shadow-md border-b border-rose-700 z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-white shrink-0 animate-bounce" />
            <span>
              <strong>ACCOUNT SUSPENDED:</strong> Your Plumber verification has been suspended by Administration. Job execution and payouts are currently restricted.
            </span>
          </div>
          <button
            onClick={() => {
              if (onSelectTab) onSelectTab('profile');
              window.dispatchEvent(new CustomEvent('open_plumber_suspended_modal'));
            }}
            className="px-2.5 py-1 rounded-lg bg-white text-rose-700 hover:bg-rose-50 text-[11px] font-black transition shadow-xs cursor-pointer shrink-0"
          >
            Suspension Notice &amp; Help
          </button>
        </div>
      )}
      
      {/* Top Header */}
      <header className="shrink-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {/* Brand Logo */}
            <Link to="/plumber" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-600/20 group-hover:bg-amber-700 transition">
                <Wrench className="w-4.5 h-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-base font-black tracking-tight text-slate-900">
                    Plumb<span className="text-amber-600">Mart</span>
                  </span>
                  {isSuspended ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs flex items-center gap-1 animate-pulse">
                      <AlertCircle className="w-3 h-3 text-white" />
                      SUSPENDED
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Plumber Pro
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Quick Tab: Notifications Bell */}
            <button
              onClick={() => onSelectTab && onSelectTab('updates')}
              className={`relative p-2 rounded-xl transition flex items-center justify-center ${
                activeTab === 'updates' ? 'bg-amber-50 text-amber-700' : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
              }`}
              title="Job Updates & Announcements"
              aria-label="Job Updates & Announcements"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="p-2 text-slate-600 hover:text-amber-600 rounded-xl transition flex items-center justify-center hover:bg-slate-50 relative"
                title="Plumber Menu"
                aria-label="Plumber Menu"
              >
                <User className="w-5 h-5" />
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{plumber.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">+91 {plumber.mobile}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {plumber.status || 'VERIFIED'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onSelectTab) onSelectTab('profile');
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 transition"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    <span>My Profile &amp; KYC</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-amber-600 flex items-center gap-2 transition"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Quick Profile Info</span>
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

      {/* Main Body with Sidebar + Tab Content */}
      <div className="flex-1 flex w-full relative overflow-hidden min-h-0">
        
        {/* Plumber Sidebar - Desktop */}
        <aside className={`${isCollapsed ? 'w-16 sm:w-18 p-2' : 'w-56 sm:w-60 p-3.5'} hidden md:flex shrink-0 bg-white border-r border-slate-200 flex-col justify-between transition-all duration-200 h-full overflow-y-auto overflow-x-hidden z-20`}>
          <div>
            {/* Sidebar Corner Toggle Button */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-end'} pb-2 mb-2 border-b border-slate-100`}>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-600 hover:text-amber-600 flex items-center justify-center transition active:scale-95 shadow-xs"
                title={isCollapsed ? "Expand sidebar" : "Collapse to icons"}
                aria-label="Toggle sidebar"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-amber-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>

            {/* Sidebar Navigation Items */}
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab && onSelectTab(item.id)}
                    title={item.name}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'} rounded-xl text-xs font-semibold transition text-left ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 border border-amber-200 font-bold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer Support info */}
          {!isCollapsed ? (
            <div className="pt-4 border-t border-slate-100 mt-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-center">
                <span className="text-[11px] font-bold text-slate-800 block mb-0.5">Plumber Helpline</span>
                <span className="text-[10px] text-slate-500 block">Dispatch: 1800-2026-PLUM</span>
                <span className="inline-block mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Certified Technician
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex justify-center">
              <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400" title="Certified Technician">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          )}
        </aside>

        {/* Content Page Area */}
        <div className="flex-1 min-w-0 w-full h-full overflow-y-auto pb-20 md:pb-0">
          {children}
        </div>

      </div>

      {/* Mobile Bottom Navigation Bar with Sidebar Navigation Icons */}
      <nav 
        aria-label="Plumber Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab && onSelectTab(item.id)}
              title={item.name}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition active:scale-95 ${
                isSelected
                  ? 'text-amber-700 font-bold bg-amber-50/80 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-600 stroke-[2.25]' : 'text-slate-500 stroke-[1.75]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 text-[8px] px-1 rounded-full font-mono font-bold leading-none py-0.5 bg-amber-500 text-white">
                    {item.badge.includes(' ') ? item.badge.split(' ')[0] : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[64px] text-center leading-tight">
                {item.name.replace('My ', '').replace('Product ', '')}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Quick Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-amber-500/25">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{plumber.name}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Plumber &bull; {plumber.status || 'Active'}
                </span>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>Registered Mobile:</span>
                </div>
                <strong className="text-slate-900 font-mono">+91 {plumber.mobile}</strong>
              </div>

              {plumber.email && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Registered Email:</span>
                  </div>
                  <strong className="text-slate-900 font-mono text-[11px] truncate max-w-[190px]">{plumber.email}</strong>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>License Number:</span>
                </div>
                <strong className="text-slate-900 font-mono">{plumber.license || 'PLUMB-KA-2024-884'}</strong>
              </div>

              {plumber.city && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Operating City:</span>
                  <strong className="text-slate-900 text-right">{plumber.city}</strong>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
                <span>Verification Status:</span>
                <span className="font-black text-emerald-700 uppercase">{plumber.status || 'VERIFIED'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => {
                  setIsProfileModalOpen(false);
                  if (onSelectTab) onSelectTab('profile');
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
              >
                Go to Full Profile &rarr;
              </button>

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
