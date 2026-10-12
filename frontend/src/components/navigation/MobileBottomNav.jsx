import React from 'react';
import {
  LayoutDashboard,
  Grid,
  Package,
  Truck,
  User,
  ClipboardList,
  BookOpen,
  Bell
} from 'lucide-react';

export default function MobileBottomNav({ role, activeTab, onSelectTab }) {
  let navItems = [];

  if (role === 'customer') {
    navItems = [
      { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
      { id: 'CATEGORIES', label: 'Categories', icon: Grid },
      { id: 'PRODUCTS', label: 'Products', icon: Package },
      { id: 'ORDERS', label: 'My Orders', icon: Truck },
      { id: 'PROFILE', label: 'Profile', icon: User }
    ];
  } else if (role === 'dealer') {
    navItems = [
      { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'PRODUCTS', label: 'Catalog & Stock', icon: Package },
      { id: 'ORDERS', label: 'B2B Orders', icon: Truck },
      { id: 'PROFILE', label: 'Credit Profile', icon: User }
    ];
  } else if (role === 'plumber') {
    navItems = [
      { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
      { id: 'ACTIVITIES', label: 'Activities', icon: ClipboardList, aliases: ['ASSIGNED_JOBS', 'ACTIVITY_DETAIL'] },
      { id: 'PRODUCTS', label: 'Products', icon: Package, aliases: ['PRODUCT_GUIDE', 'PRODUCT_DETAIL', 'PRODUCT_REQUESTS'] },
      { id: 'NOTIFICATIONS', label: 'Alerts', icon: Bell },
      { id: 'PROFILE', label: 'Profile', icon: User }
    ];
  }

  return (
    <div className="bg-slate-950 border-t border-slate-800 px-3 py-2 flex items-center justify-around sticky bottom-0 z-20">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id || (item.aliases && item.aliases.includes(activeTab));
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex-1 py-1 px-1 rounded-xl flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
              active
                ? role === 'dealer'
                  ? 'text-amber-400 bg-amber-500/10'
                  : role === 'plumber'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-blue-400 bg-blue-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="truncate max-w-[65px]">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
