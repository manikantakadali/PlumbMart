import React from 'react';
import {
  Wrench,
  Award,
  ClipboardList,
  Package,
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  Wallet,
  AlertCircle,
  RefreshCw,
  Bell,
  Star,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function PlumberDashboard({
  plumber,
  dashboardData,
  isLoading = false,
  error = null,
  onRetry,
  onNavigateTab,
  onOpenActivity,
  onOpenProduct
}) {
  const isVerified = plumber?.verificationStatus === 'VERIFIED';

  if (isLoading && !dashboardData && !plumber) {
    return (
      <div className="py-8 space-y-4 animate-pulse">
        <div className="h-32 bg-slate-800/60 rounded-2xl"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
          <div className="h-20 bg-slate-800/60 rounded-xl"></div>
        </div>
        <div className="h-44 bg-slate-800/60 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !dashboardData && !plumber) {
    return (
      <div className="p-6 my-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Dashboard Error</h3>
        <p className="text-xs text-rose-200">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading</span>
          </button>
        )}
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    assignedActivitiesCount: 0,
    pendingActivitiesCount: 0,
    inProgressActivitiesCount: 0,
    completedActivitiesCount: plumber?.completedJobs || 0,
    productRequestsCount: 0,
    pendingProductRequestsCount: 0
  };

  const recentActivities = dashboardData?.recentActivities || [];
  const recentNotifications = dashboardData?.recentNotifications || plumber?.notifications || [];

  return (
    <div className="space-y-4 pb-6">
      {/* Plumber Certified Portal Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/50 via-slate-900 to-slate-950 border border-purple-500/40 space-y-3 shadow-lg shadow-purple-950/20">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
              <Wrench className="w-3 h-3" />
              PLUMBER PARTNER
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-400 bg-slate-800/80">
              ID: {plumber?.id}
            </span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isVerified ? (
              <>
                <ShieldCheck className="w-3 h-3" /> Trade License Verified
              </>
            ) : (
              <>
                <Clock className="w-3 h-3" /> KYC Review Pending
              </>
            )}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-base font-extrabold text-white leading-snug">
              {plumber?.name}
            </h2>
            <div className="text-[11px] text-purple-300 font-mono">
              License: {plumber?.licenseNo || 'Pending'}
            </div>
            <div className="text-[10px] text-slate-400 leading-relaxed max-w-sm">
              {plumber?.specialization || 'General Plumbing & Sanitary Installations'}
            </div>
          </div>

          <div className="text-right shrink-0 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">Rating</div>
            <div className="text-xs font-black text-amber-400 flex items-center justify-end gap-1 font-mono">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{plumber?.rating || 4.9}</span>
            </div>
            <div className="text-[9px] text-slate-500">{plumber?.experienceYears || 5} yrs exp</div>
          </div>
        </div>

        {/* Loyalty Wallet & Rewards Strip */}
        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Cash Wallet Balance</div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                ₹{(plumber?.walletBalance || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>Zoho Loyalty Points</span>
            </div>
            <div className="text-sm font-black text-amber-400 font-mono">
              {(plumber?.rewardPoints || 0).toLocaleString('en-IN')} pts
            </div>
          </div>
        </div>

        {/* Quick Nav Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('ACTIVITIES')}
            className="py-2 px-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1 transition"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="truncate">Activities</span>
          </button>
          <button
            onClick={() => onNavigateTab('PRODUCTS')}
            className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="truncate">Products</span>
          </button>
          <button
            onClick={() => onNavigateTab('PRODUCT_REQUESTS')}
            className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            <Package className="w-3.5 h-3.5" />
            <span className="truncate">Requests</span>
          </button>
        </div>
      </div>

      {/* Dynamic 6-Metric Activity & Request Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span>Real-Time Work Metrics</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* 1. Assigned Activities */}
          <button
            onClick={() => onNavigateTab('ACTIVITIES')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Assigned</span>
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>
            <div className="text-xl font-black text-white font-mono">
              {stats.assignedActivitiesCount}
            </div>
            <div className="text-[10px] text-blue-300">Awaiting acceptance</div>
          </button>

          {/* 2. In Progress */}
          <button
            onClick={() => onNavigateTab('ACTIVITIES')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">In Progress</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {stats.inProgressActivitiesCount}
            </div>
            <div className="text-[10px] text-amber-300">Active site jobs</div>
          </button>

          {/* 3. Completed */}
          <button
            onClick={() => onNavigateTab('ACTIVITIES')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Completed</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {stats.completedActivitiesCount}
            </div>
            <div className="text-[10px] text-emerald-300">Successfully tested</div>
          </button>

          {/* 4. Total Product Requests */}
          <button
            onClick={() => onNavigateTab('PRODUCT_REQUESTS')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Product Requests</span>
              <Package className="w-3 h-3 text-purple-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">
              {stats.productRequestsCount}
            </div>
            <div className="text-[10px] text-purple-300">Total requirements</div>
          </button>

          {/* 5. Pending Requests */}
          <button
            onClick={() => onNavigateTab('PRODUCT_REQUESTS')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Pending Requests</span>
              <Clock className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">
              {stats.pendingProductRequestsCount}
            </div>
            <div className="text-[10px] text-amber-300">Under review</div>
          </button>

          {/* 6. Availability & Service Area */}
          <button
            onClick={() => onNavigateTab('PROFILE')}
            className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-left transition space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold">Service Area</span>
              <MapPin className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-xs font-bold text-white truncate">
              {plumber?.city || 'Hyderabad'}
            </div>
            <div className="text-[10px] text-indigo-300 truncate">
              {plumber?.serviceArea?.split(',')[0] || 'Primary Zone'}
            </div>
          </button>
        </div>
      </div>

      {/* Recent Assigned Activities Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-purple-400" />
            <span>Recent Assigned Activities</span>
          </h3>
          <button
            onClick={() => onNavigateTab('ACTIVITIES')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <ClipboardList className="w-6 h-6 text-slate-600 mx-auto" />
            <div className="font-semibold text-slate-400">No activities assigned right now</div>
            <p className="text-[11px] text-slate-500">
              When installation orders are assigned by the system, they will appear here dynamically.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentActivities.map((act) => {
              const isCompleted = act.status === 'COMPLETED';
              const isInProgress = act.status === 'IN_PROGRESS';

              return (
                <div
                  key={act.id}
                  onClick={() => onOpenActivity ? onOpenActivity(act) : onNavigateTab('ACTIVITIES')}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-purple-300">
                      {act.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isInProgress
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white">
                      Customer: {act.customerName}
                    </div>
                    <div className="text-[11px] text-purple-200 mt-0.5 line-clamp-1">
                      {act.requiredWork}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{act.location}</span>
                  </div>

                  {act.scheduledDate && (
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span>Scheduled: {act.scheduledDate} {act.scheduledTime ? `• ${act.scheduledTime}` : ''}</span>
                      <span className="text-purple-400 font-semibold hover:underline">
                        Details →
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Notifications Strip */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-purple-400" />
            <span>Recent Alerts</span>
          </h3>
          <button
            onClick={() => onNavigateTab('NOTIFICATIONS')}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-0.5"
          >
            <span>All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentNotifications.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
            No recent notifications.
          </div>
        ) : (
          <div className="space-y-2">
            {recentNotifications.slice(0, 2).map((n) => (
              <div
                key={n.id}
                onClick={() => onNavigateTab('NOTIFICATIONS')}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-start gap-2.5 cursor-pointer hover:border-slate-700 transition"
              >
                <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px]">{n.title}</span>
                    <span className="text-[9px] text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
