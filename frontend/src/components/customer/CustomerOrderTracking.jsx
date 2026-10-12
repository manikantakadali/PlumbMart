import React from 'react';
import {
  Truck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Wrench,
  Package,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function CustomerOrderTracking({
  orders = [],
  activeOrder,
  onSelectOrder,
  isLoading = false,
  error = null,
  onRetry,
  onBrowseProducts
}) {
  const current = activeOrder || (orders && orders[0]) || null;

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="h-6 w-1/3 bg-slate-800 rounded animate-pulse" />
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 animate-pulse space-y-3">
          <div className="h-4 w-1/2 bg-slate-800 rounded" />
          <div className="h-20 w-full bg-slate-900 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center space-y-3 bg-slate-950 rounded-2xl border border-rose-500/40 my-4">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Could not load orders</h3>
        <p className="text-xs text-slate-400">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 my-4 space-y-3">
        <Truck className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-base font-bold text-white">No Orders Placed Yet</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Explore CPVC pipes, diverters, booster pumps, and valves with direct payment and installer support.
        </p>
        {onBrowseProducts && (
          <button
            onClick={onBrowseProducts}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition"
          >
            Start Shopping
          </button>
        )}
      </div>
    );
  }

  // 6 standard order statuses
  const allStages = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          My Orders &amp; Live Tracking ({orders.length})
        </h2>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        )}
      </div>

      {/* Order Selector Chips if customer has multiple orders */}
      {orders.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {orders.map((ord) => (
            <button
              key={ord.id}
              onClick={() => onSelectOrder(ord)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition ${
                current?.id === ord.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {ord.id} ({ord.orderStatus})
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className="space-y-4">
          {/* Order Details Header Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-sm text-blue-400">{current.id}</span>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {current.orderDate
                      ? new Date(current.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Recent'}
                  </span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  current.orderStatus === 'Delivered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : current.orderStatus === 'Cancelled'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                }`}
              >
                {current.orderStatus}
              </span>
            </div>

            {/* Purchased Items List */}
            <div className="pt-2 border-t border-slate-900 space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Items Ordered:</div>
              <div className="space-y-1.5">
                {current.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="text-slate-300">
                      {item.name} <strong className="text-white font-mono">(Qty: {item.qty})</strong>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ₹{item.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-900 flex justify-between font-bold text-sm">
                <span className="text-slate-300">Total Amount:</span>
                <span className="text-emerald-400 font-mono">
                  ₹{current.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Payment:
                </span>
                <span className="font-semibold text-emerald-400">
                  {current.paymentStatus} ({current.paymentSubType})
                </span>
              </div>
            </div>

            {/* Assigned Plumber Section */}
            {current.assignedPlumberName && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-2.5 text-xs">
                <Wrench className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-purple-200">
                    Assigned Installation Partner: {current.assignedPlumberName}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {current.plumberNotes || 'Free on-site pipe alignment & pressure inspection.'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Timeline (Placed -> Confirmed -> Processing -> Shipped -> Delivered) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Status Progression
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Current: <strong className="text-white">{current.orderStatus}</strong>
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {(current.trackingTimeline || []).map((step, idx) => {
                const isCurrentStage = current.orderStatus === step.step;
                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold z-10 ${
                        step.done
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                          : isCurrentStage
                          ? 'bg-blue-600 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            step.done
                              ? 'text-white'
                              : isCurrentStage
                              ? 'text-blue-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {step.step}
                          {isCurrentStage && (
                            <span className="ml-2 px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[9px]">
                              Current State
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{step.time}</span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          step.done ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
