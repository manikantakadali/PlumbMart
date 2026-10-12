import React, { useState } from 'react';
import {
  X,
  MapPin,
  Phone,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FileText,
  Package,
  Award,
  ArrowRight,
  MessageSquare
} from 'lucide-react';

export default function PlumberActivityDetailsModal({
  activity,
  onClose,
  onUpdateStatus,
  onUpdateRemarks
}) {
  const [remarksInput, setRemarksInput] = useState(activity?.remarks || '');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingRemarks, setIsUpdatingRemarks] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [remarksSuccess, setRemarksSuccess] = useState(false);

  if (!activity) return null;

  const currentStatus = activity.status || 'ASSIGNED';
  const isCompleted = currentStatus === 'COMPLETED';

  const handleStatusChange = async (targetStatus) => {
    setErrorMsg('');
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus(activity.id, targetStatus, remarksInput);
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveRemarks = async () => {
    if (!onUpdateRemarks) return;
    setErrorMsg('');
    setIsUpdatingRemarks(true);
    try {
      await onUpdateRemarks(activity.id, remarksInput);
      setRemarksSuccess(true);
      setTimeout(() => setRemarksSuccess(false), 2500);
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Failed to save remarks');
    } finally {
      setIsUpdatingRemarks(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'ACCEPTED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-extrabold text-purple-300">
              {activity.id}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                currentStatus
              )}`}
            >
              {currentStatus}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Work Description Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5 text-purple-400" />
            <span>Required Work &amp; Assignment</span>
          </div>
          <h3 className="text-sm font-bold text-white">{activity.requiredWork}</h3>
          {activity.orderId && (
            <div className="text-[10px] text-purple-300 font-mono">
              Linked Customer Order: {activity.orderId}
            </div>
          )}
        </div>

        {/* Customer & Location */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-slate-400 text-[10px]">Customer Name</div>
              <div className="text-sm font-bold text-white">{activity.customerName}</div>
            </div>
            {activity.customerMobile && (
              <a
                href={`tel:${activity.customerMobile}`}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono flex items-center gap-1.5 transition"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>+91 {activity.customerMobile}</span>
              </a>
            )}
          </div>

          <div className="pt-1.5 border-t border-slate-900 text-slate-300 flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{activity.location}</span>
          </div>

          {(activity.scheduledDate || activity.scheduledTime) && (
            <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{activity.scheduledDate || 'Today'}</span>
              </span>
              {activity.scheduledTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{activity.scheduledTime}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Required Products BoM */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-purple-400" />
            <span>Bill of Materials (Products to Install)</span>
          </div>

          {(!activity.requiredProducts || activity.requiredProducts.length === 0) ? (
            <div className="text-xs text-slate-500 italic">No specific products attached to this job.</div>
          ) : (
            <div className="space-y-1.5">
              {activity.requiredProducts.map((prod, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <span className="text-slate-200 font-medium">• {prod.name}</span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                    Qty: {prod.qty}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        {activity.instructions && (
          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-1 text-xs text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <FileText className="w-3.5 h-3.5" />
              <span>Installation &amp; Testing Instructions</span>
            </div>
            <p className="leading-relaxed text-[11px]">{activity.instructions}</p>
          </div>
        )}

        {/* Remarks Form */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
              <span>Plumber Site Remarks &amp; Notes</span>
            </label>
            {remarksSuccess && (
              <span className="text-[10px] text-emerald-400 font-semibold">
                ✓ Remarks saved
              </span>
            )}
          </div>
          <textarea
            rows={2}
            value={remarksInput}
            onChange={(e) => setRemarksInput(e.target.value)}
            placeholder="Add on-site findings, pressure test readings, or remarks..."
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
          />
          {!isCompleted && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleSaveRemarks}
                disabled={isUpdatingRemarks}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition"
              >
                {isUpdatingRemarks ? 'Saving...' : 'Update Remarks'}
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons strictly reflecting valid sequence */}
        <div className="pt-2">
          {currentStatus === 'ASSIGNED' && (
            <button
              onClick={() => handleStatusChange('ACCEPTED')}
              disabled={isUpdatingStatus}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
            >
              <span>{isUpdatingStatus ? 'Accepting...' : 'Accept Activity'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStatus === 'ACCEPTED' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              disabled={isUpdatingStatus}
              className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 transition"
            >
              <Wrench className="w-4 h-4" />
              <span>{isUpdatingStatus ? 'Starting...' : 'Start Job / Mark In Progress'}</span>
            </button>
          )}

          {currentStatus === 'IN_PROGRESS' && (
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={isUpdatingStatus}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isUpdatingStatus ? 'Completing...' : 'Complete Activity (+150 Pts & ₹500)'}</span>
            </button>
          )}

          {isCompleted && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
              <div className="text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job Completed &amp; Verified</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Completed on: {activity.completedDate ? new Date(activity.completedDate).toLocaleDateString('en-IN') : 'Recently'}
                {' • '}
                <span className="text-amber-400 font-bold">+150 Reward Points</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
