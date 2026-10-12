import React from 'react';
import { Bell, Truck, CreditCard, Info, CheckCircle2 } from 'lucide-react';

export default function CustomerNotifications({
  notifications = [],
  onMarkAsRead
}) {
  const getIcon = (type) => {
    switch (type) {
      case 'ORDER_UPDATE':
        return <Truck className="w-4 h-4 text-blue-400" />;
      case 'PAYMENT_UPDATE':
        return <CreditCard className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-400" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Customer Notifications ({notifications.length})
        </h2>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {unreadCount} Unread
          </span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkAsRead && !n.read && onMarkAsRead(n.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                n.read
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-blue-500/40 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
