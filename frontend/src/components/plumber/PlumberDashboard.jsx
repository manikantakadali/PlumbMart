import React from 'react';
import { Wrench, Award, ClipboardList, BookOpen, CheckCircle2, MapPin, ArrowRight } from 'lucide-react';

export default function PlumberDashboard({
  plumber,
  assignedOrders,
  onNavigateTab
}) {
  const isVerified = plumber?.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-4 pb-4">
      {/* Plumber Trade Header */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
            CERTIFIED PLUMBER PORTAL
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isVerified ? '✓ Trade License Verified' : 'KYC Review Pending'}
          </span>
        </div>

        <div>
          <h2 className="text-base font-extrabold text-white leading-snug">{plumber?.name}</h2>
          <div className="text-[11px] text-purple-300 font-mono mt-0.5">License: {plumber?.licenseNo}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{plumber?.specialization}</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">Completed</div>
            <div className="text-sm font-black text-white font-mono mt-0.5">
              {plumber?.completedJobs || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">Reward Points</div>
            <div className="text-sm font-black text-amber-400 font-mono mt-0.5">
              {plumber?.rewardPoints || 0} pts
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400">Wallet</div>
            <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
              ₹{(plumber?.walletBalance || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onNavigateTab('ASSIGNED_JOBS')}
            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5 transition"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Assigned Jobs ({assignedOrders?.length || 0})</span>
          </button>
          <button
            onClick={() => onNavigateTab('PRODUCT_GUIDE')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Product Specs</span>
          </button>
        </div>
      </div>

      {/* Assigned Activities Quick Preview */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Site Assignments
          </h3>
          <button
            onClick={() => onNavigateTab('ASSIGNED_JOBS')}
            className="text-xs text-purple-400 hover:underline font-semibold"
          >
            View All →
          </button>
        </div>

        {(!assignedOrders || assignedOrders.length === 0) ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-slate-950 rounded-2xl border border-slate-800">
            No pending assignments.
          </div>
        ) : (
          assignedOrders.slice(0, 2).map((job) => (
            <div
              key={job.id}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-purple-300">{job.id}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {job.plumberTaskStatus || 'ASSIGNED'}
                </span>
              </div>
              <div className="text-xs font-bold text-white">Customer: {job.userName}</div>
              <div className="text-[11px] text-slate-400 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{job.shippingAddress}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
