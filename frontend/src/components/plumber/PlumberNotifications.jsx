import React from 'react';
import {
  Bell,
  Wrench,
  Award,
  Package,
  Info,
  CheckCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function PlumberNotifications({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead
}) {
  const getIcon = (type) => {
    switch (type) {
      case 'ASSIGNED_ACTIVITY':
        return <Wrench className="w-4 h-4 text-purple-400" />;
      case 'REWARD_UPDATE':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'REQUEST_UPDATE':
        return <Package className="w-4 h-4 text-emerald-400" />;
      case 'ALERT':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  return (
    <div className="space-y-4 py-2 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-purple-400" />
            <span>Plumber Alerts &amp; Updates</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Site dispatches, material requests &amp; loyalty wallet credits
          </p>
        </div>

        {unreadCount > 0 && onMarkAllAsRead && (
          <button
            onClick={onMarkAllAsRead}
            className="px-2.5 py-1 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 transition"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {(!notifications || notifications.length === 0) ? (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs my-2 space-y-2">
          <Bell className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Notifications Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Dispatches, requirement status changes, and reward points will be notified in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && onMarkAsRead && onMarkAsRead(n.id)}
              className={`p-3.5 rounded-2xl border transition cursor-pointer space-y-1 ${
                n.read
                  ? 'bg-slate-950/70 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900 border-purple-500/40 text-slate-200 shadow-md shadow-purple-950/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl shrink-0 mt-0.5 border ${
                    n.read
                      ? 'bg-slate-950 border-slate-800'
                      : 'bg-purple-950/60 border-purple-500/30'
                  }`}
                >
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">{n.time}</span>
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
