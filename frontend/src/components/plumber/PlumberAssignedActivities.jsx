import React, { useState } from 'react';
import { ClipboardList, MapPin, CheckCircle2, Clock, Phone, AlertCircle } from 'lucide-react';

export default function PlumberAssignedActivities({
  assignedOrders,
  onUpdateStatus
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    await onUpdateStatus(orderId, status);
    setUpdatingId(null);
  };

  if (!assignedOrders || assignedOrders.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 my-4 space-y-2">
        <ClipboardList className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-white">No Assigned Activities</h3>
        <p className="text-xs text-slate-400">All customer installation jobs are up-to-date.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Assigned Customer Activities ({assignedOrders.length})
        </h2>
      </div>

      <div className="space-y-3">
        {assignedOrders.map((job) => {
          const isCompleted = job.plumberTaskStatus === 'COMPLETED';

          return (
            <div
              key={job.id}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-purple-400">{job.id}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : job.plumberTaskStatus === 'IN_PROGRESS'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}
                >
                  {job.plumberTaskStatus || 'ASSIGNED'}
                </span>
              </div>

              {/* Customer & Location Details */}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-white text-sm">Customer: {job.userName}</div>
                <div className="text-slate-400 flex items-center gap-1.5 font-mono">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>+91 {job.userMobile}</span>
                </div>
                <div className="text-slate-300 flex items-start gap-1.5 pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{job.shippingAddress}</span>
                </div>
              </div>

              {/* Installation Bill of Materials */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="font-semibold text-purple-300 text-[11px]">
                  Products to Install &amp; Test:
                </div>
                {job.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                    <span>• {i.name}</span>
                    <strong className="text-white font-mono">Qty: {i.qty}</strong>
                  </div>
                ))}
              </div>

              {/* Plumber Action Buttons */}
              <div className="flex gap-2 pt-1">
                {!isCompleted ? (
                  <>
                    <button
                      onClick={() => handleStatus(job.id, 'IN_PROGRESS')}
                      disabled={updatingId === job.id}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      {job.plumberTaskStatus === 'IN_PROGRESS' ? '● In Progress' : 'Start Job'}
                    </button>
                    <button
                      onClick={() => handleStatus(job.id, 'COMPLETED')}
                      disabled={updatingId === job.id}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete (+150 Pts)</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-center text-xs font-semibold">
                    ✓ Completed • 150 Points Credited to Wallet
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
