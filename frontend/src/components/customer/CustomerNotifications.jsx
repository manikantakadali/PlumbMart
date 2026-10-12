import React from 'react';
import { Bell, Truck, CreditCard, Info } from 'lucide-react';

export default function CustomerNotifications({ notifications }) {
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

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Customer Notifications ({notifications?.length || 0})
        </h2>
      </div>

      {(!notifications || notifications.length === 0) ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition ${
                n.read
                  ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                  : 'bg-slate-900 border-blue-500/30 text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[10px] text-slate-500">{n.time}</span>
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
