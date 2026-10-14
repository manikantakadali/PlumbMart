import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  Truck, 
  CreditCard, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  User, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

/**
 * Modern In-App Notification Toast Component
 * Listens in real-time across tabs to:
 * - BroadcastChannel('plumbmart_inapp_notifications')
 * - BroadcastChannel('plumbmart_announcements')
 * - BroadcastChannel('plumbmart_orders')
 * - LocalStorage sync ('plumbmart_inapp_notification_broadcast')
 * - Window custom events ('plumbmart_inapp_notify')
 * 
 * Plays a pleasant synthetic Web Audio API chime and renders
 * an animated floating card at top-right of the user's screen.
 */
export default function InAppNotificationToast({ role = 'Customer', onNotificationClick }) {
  const [toasts, setToasts] = useState([]);
  const seenIdsRef = useRef(new Set());

  // Web Audio API dual-tone chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic chord: D5 (587Hz) -> A5 (880Hz)
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Audio playback might be restricted if no user gesture yet, which is safe to ignore
    }
  };

  const addToast = (notif) => {
    if (!notif) return;
    const toastId = notif.id || `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    
    // Prevent duplicate triggers for the same notification id in short succession
    if (seenIdsRef.current.has(toastId)) return;
    seenIdsRef.current.add(toastId);

    // Filter by role: 'All' or specific role match
    const rawTarget = (notif.targetGroup || notif.role || 'All').toString().toLowerCase();
    const currentRole = role.toLowerCase();

    const isTargetMatch = 
      rawTarget === 'all' || 
      rawTarget.includes('all') ||
      (currentRole.includes('customer') && rawTarget.includes('customer')) ||
      (currentRole.includes('dealer') && rawTarget.includes('dealer')) ||
      (currentRole.includes('plumber') && rawTarget.includes('plumber'));

    if (!isTargetMatch) {
      return; // Not meant for this role
    }

    playChime();

    const newToast = {
      id: toastId,
      title: notif.title || 'New Admin Notification',
      message: notif.message || notif.text || 'You have a new update from PlumbMart Admin.',
      targetGroup: notif.targetGroup || (rawTarget.includes('dealer') ? 'Dealers' : rawTarget.includes('plumber') ? 'Plumbers' : rawTarget.includes('customer') ? 'Customers' : 'All Roles'),
      type: notif.type || 'NOTIFICATION',
      priority: notif.priority || 'normal',
      timestamp: notif.sentAt || 'Just now',
      link: notif.link || null,
      createdAt: Date.now(),
      duration: 7000 // 7 seconds auto-dismiss
    };

    setToasts(prev => [newToast, ...prev.slice(0, 3)]); // Keep max 4 visible at once

    // Auto dismiss after duration
    setTimeout(() => {
      removeToast(toastId);
    }, newToast.duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // 1. BroadcastChannel for in-app notifications
    let inappCh;
    let announcementCh;
    let ordersCh;

    try {
      inappCh = new BroadcastChannel('plumbmart_inapp_notifications');
      inappCh.onmessage = (event) => {
        if (event.data) {
          addToast(event.data);
        }
      };
    } catch {}

    try {
      announcementCh = new BroadcastChannel('plumbmart_announcements');
      announcementCh.onmessage = (event) => {
        if (event.data && event.data.announcement) {
          addToast({
            ...event.data.announcement,
            type: 'ANNOUNCEMENT'
          });
        }
      };
    } catch {}

    try {
      ordersCh = new BroadcastChannel('plumbmart_orders');
      ordersCh.onmessage = (event) => {
        if (event.data) {
          if (event.data.type === 'STATUS_UPDATED') {
            addToast({
              id: `order-status-${event.data.orderId}-${Date.now()}`,
              title: `Order #${event.data.orderId} ${event.data.status}`,
              message: `Order status has been updated to "${event.data.status}". Check your Orders tab for tracking.`,
              targetGroup: role === 'Dealer' ? 'Dealers' : 'Customers',
              type: 'ORDER_UPDATE',
              priority: 'high'
            });
          } else if (event.data.type === 'DEALER_GOVERNANCE_UPDATED' && role === 'Dealer') {
            const updates = event.data.updates || {};
            const creditMsg = updates.creditLimit !== undefined 
              ? `Credit limit updated to ₹${Number(updates.creditLimit).toLocaleString('en-IN')}.`
              : 'Your dealer credit terms and governance status have been updated.';
            addToast({
              id: `dealer-gov-${Date.now()}`,
              title: 'Credit & Account Governance Updated',
              message: creditMsg,
              targetGroup: 'Dealers',
              type: 'DEALER_UPDATE',
              priority: 'urgent'
            });
          }
        }
      };
    } catch {}

    // 2. Storage event listener (cross-tab fallback)
    const handleStorage = (e) => {
      if (e.key === 'plumbmart_inapp_notification_broadcast' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          addToast(parsed);
        } catch {}
      } else if (e.key === 'plumbmart_announcement_broadcast' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && parsed.announcement) {
            addToast(parsed.announcement);
          }
        } catch {}
      } else if (e.key === 'plumbmart_status_broadcast' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          addToast({
            id: `order-status-${parsed.orderId}-${Date.now()}`,
            title: `Order #${parsed.orderId} ${parsed.status}`,
            message: `Admin updated order #${parsed.orderId} status to "${parsed.status}".`,
            targetGroup: role === 'Dealer' ? 'Dealers' : 'Customers',
            type: 'ORDER_UPDATE'
          });
        } catch {}
      } else if (e.key === 'plumbmart_dealer_governance_broadcast' && e.newValue && role === 'Dealer') {
        try {
          const parsed = JSON.parse(e.newValue);
          const updates = parsed.updates || {};
          addToast({
            id: `dealer-gov-${Date.now()}`,
            title: 'Dealer Account Updated by Admin',
            message: updates.creditLimit ? `Credit line set to ₹${Number(updates.creditLimit).toLocaleString('en-IN')}.` : 'Dealer account terms updated.',
            targetGroup: 'Dealers',
            type: 'DEALER_UPDATE'
          });
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    // 3. Window Custom Event for intra-window triggers
    const handleCustomEvent = (e) => {
      if (e.detail) {
        addToast(e.detail);
      }
    };
    window.addEventListener('plumbmart_inapp_notify', handleCustomEvent);

    return () => {
      if (inappCh) inappCh.close();
      if (announcementCh) announcementCh.close();
      if (ordersCh) ordersCh.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('plumbmart_inapp_notify', handleCustomEvent);
    };
  }, [role]);

  if (toasts.length === 0) return null;

  return (
    <aside 
      aria-label="Live In-App Notifications" 
      className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[999999] pointer-events-none flex flex-col gap-3 max-w-sm sm:max-w-md w-full px-2"
    >
      {toasts.map((toast) => {
        const isUrgent = toast.priority === 'urgent';
        const isHigh = toast.priority === 'high';

        // Badge styling based on target role
        let theme = {
          badgeBg: 'bg-blue-600',
          badgeText: 'text-white',
          accentBorder: 'border-blue-400',
          iconBg: 'bg-blue-50 text-blue-600',
          progressBg: 'bg-blue-600',
          label: 'Customer Notice'
        };

        if (role === 'Dealer' || toast.targetGroup === 'Dealers') {
          theme = {
            badgeBg: 'bg-indigo-600',
            badgeText: 'text-white',
            accentBorder: 'border-indigo-400',
            iconBg: 'bg-indigo-50 text-indigo-600',
            progressBg: 'bg-indigo-600',
            label: 'Dealer Bulletin'
          };
        } else if (role === 'Plumber' || toast.targetGroup === 'Plumbers') {
          theme = {
            badgeBg: 'bg-emerald-600',
            badgeText: 'text-white',
            accentBorder: 'border-emerald-400',
            iconBg: 'bg-emerald-50 text-emerald-600',
            progressBg: 'bg-emerald-600',
            label: 'Plumber Alert'
          };
        }

        if (toast.type === 'ORDER_UPDATE') {
          theme.label = 'Order Update';
          theme.iconBg = 'bg-amber-50 text-amber-600';
          theme.badgeBg = 'bg-amber-600';
        } else if (toast.type === 'DEALER_UPDATE') {
          theme.label = 'Credit & Governance';
        }

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-4 transition-all duration-300 transform translate-y-0 opacity-100 hover:shadow-indigo-100/50"
            style={{
              animation: 'inAppToastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${theme.iconBg} shadow-xs`}>
                  {toast.type === 'ORDER_UPDATE' ? (
                    <Truck className="w-4 h-4" />
                  ) : toast.type === 'DEALER_UPDATE' ? (
                    <CreditCard className="w-4 h-4" />
                  ) : role === 'Plumber' ? (
                    <Wrench className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} shadow-xs`}>
                      {theme.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {toast.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Dismiss"
                aria-label="Dismiss Notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Message */}
            <div className="pl-1 pr-2">
              <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                {toast.title}
              </h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>

            {/* Footer with target audience badge */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Instant Delivery
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Audience: {toast.targetGroup}
              </span>
            </div>

            {/* Auto-dismiss shrinking progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
              <div 
                className={`h-full ${theme.progressBg}`}
                style={{
                  animation: `inAppToastProgress ${toast.duration}ms linear forwards`
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Inline styles for keyframe animations */}
      <style>{`
        @keyframes inAppToastSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-16px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes inAppToastProgress {
          0% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }
      `}</style>
    </aside>
  );
}
