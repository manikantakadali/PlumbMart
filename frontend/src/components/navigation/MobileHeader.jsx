import React from 'react';
import { ArrowLeft, ShoppingCart, Bell, LogOut, CheckCircle2 } from 'lucide-react';

export default function MobileHeader({
  currentUser,
  currentScreen,
  cartCount = 0,
  unreadNotificationsCount = 0,
  onBack,
  onOpenCart,
  onOpenNotifications,
  onLogout
}) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'dealer':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'plumber':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'admin':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  const showBackButton = currentScreen !== 'DASHBOARD' && currentScreen !== 'PROFILE';

  return (
    <div className="bg-slate-900/95 px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRoleBadge(
                currentUser?.role
              )}`}
            >
              {currentUser?.role}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[160px]">
              {currentUser?.name}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
            <span>+91 {currentUser?.mobile}</span>
            {currentUser?.zohoContactId && (
              <span className="text-emerald-400 flex items-center gap-0.5">
                • <CheckCircle2 className="w-3 h-3 inline" /> {currentUser.zohoContactId}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Cart button (Customer & Dealer) */}
        {currentUser?.role !== 'plumber' && (
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 transition"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
