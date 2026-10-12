import React, { useState } from 'react';
import {
  ClipboardList,
  MapPin,
  CheckCircle2,
  Clock,
  Phone,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Wrench,
  Calendar,
  MessageSquare,
  Award,
  RefreshCw
} from 'lucide-react';
import PlumberActivityDetailsModal from './PlumberActivityDetailsModal';

export default function PlumberActivities({
  activities = [],
  isLoading = false,
  error = null,
  onRetry,
  onUpdateStatus,
  onUpdateRemarks
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Filter activities
  const filteredActivities = (activities || []).filter((job) => {
    // 1. Tab filter
    if (activeTab === 'active' && job.status === 'COMPLETED') return false;
    if (activeTab === 'completed' && job.status !== 'COMPLETED') return false;

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = job.id?.toLowerCase().includes(q);
      const matchCustomer = job.customerName?.toLowerCase().includes(q);
      const matchWork = job.requiredWork?.toLowerCase().includes(q);
      const matchLoc = job.location?.toLowerCase().includes(q);
      return matchId || matchCustomer || matchWork || matchLoc;
    }
    return true;
  });

  const handleQuickStatus = async (job, targetStatus, e) => {
    if (e) e.stopPropagation();
    setActionError('');
    setUpdatingId(job.id);
    try {
      await onUpdateStatus(job.id, targetStatus);
    } catch (err) {
      setActionError(err.data?.error || err.message || 'Status transition error');
    } finally {
      setUpdatingId(null);
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

  const activeCount = activities.filter((a) => a.status !== 'COMPLETED').length;
  const completedCount = activities.filter((a) => a.status === 'COMPLETED').length;

  return (
    <div className="space-y-4 py-2 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-purple-400" />
            <span>My Assigned Activities</span>
          </h2>
          <p className="text-[11px] text-slate-400">
            Installation orders, site tasks &amp; completion records
          </p>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            title="Refresh Activities"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'active'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active ({activeCount})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'completed'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed ({completedCount})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`py-2 rounded-xl transition ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({activities.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, customer name, work or address..."
          className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Action Error alert */}
      {actionError && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 bg-slate-800/60 rounded-2xl"></div>
          <div className="h-32 bg-slate-800/60 rounded-2xl"></div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredActivities.length === 0 && (
        <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 my-2 space-y-2">
          <ClipboardList className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">
            {activeTab === 'completed'
              ? 'No Completed Activities Found'
              : activeTab === 'active'
              ? 'No Active Activities Right Now'
              : 'No Activities Found'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {activeTab === 'completed'
              ? 'When jobs are completed and tested, their history will be preserved here.'
              : 'All customer installation jobs are up-to-date or match criteria.'}
          </p>
        </div>
      )}

      {/* Activities List */}
      {!isLoading && filteredActivities.length > 0 && (
        <div className="space-y-3">
          {filteredActivities.map((job) => {
            const isCompleted = job.status === 'COMPLETED';
            const isAssigned = job.status === 'ASSIGNED';
            const isAccepted = job.status === 'ACCEPTED';
            const isInProgress = job.status === 'IN_PROGRESS';

            return (
              <div
                key={job.id}
                onClick={() => setSelectedActivity(job)}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer space-y-3 shadow"
              >
                {/* ID & Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-purple-400">
                      {job.id}
                    </span>
                    {job.orderId && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        (Order: {job.orderId})
                      </span>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                      job.status
                    )}`}
                  >
                    {job.status || 'ASSIGNED'}
                  </span>
                </div>

                {/* Work & Customer info */}
                <div className="space-y-1">
                  <div className="font-bold text-white text-sm">{job.requiredWork}</div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>Customer: <strong className="text-white">{job.customerName}</strong></span>
                    {job.customerMobile && (
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        +91 {job.customerMobile}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 flex items-start gap-1 text-[11px] pt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{job.location}</span>
                  </div>
                </div>

                {/* BoM Products Preview */}
                {job.requiredProducts && job.requiredProducts.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                      Required Products:
                    </div>
                    {job.requiredProducts.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-slate-300 text-[11px]">
                        <span className="truncate max-w-[200px]">• {p.name}</span>
                        <strong className="text-white font-mono shrink-0">Qty: {p.qty}</strong>
                      </div>
                    ))}
                  </div>
                )}

                {/* Instructions snippet */}
                {job.instructions && (
                  <div className="text-[11px] text-amber-200/90 bg-amber-950/20 p-2 rounded-xl border border-amber-500/20 line-clamp-1">
                    <strong className="text-amber-300">Instructions:</strong> {job.instructions}
                  </div>
                )}

                {/* Remarks if present */}
                {job.remarks && (
                  <div className="text-[11px] text-slate-400 flex items-start gap-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                    <MessageSquare className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">Remarks: {job.remarks}</span>
                  </div>
                )}

                {/* Date & Quick Action Strip */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                  <div className="text-[10px] text-slate-500">
                    {isCompleted ? (
                      <span className="text-emerald-400 font-semibold">
                        ✓ Completed {job.completedDate ? `on ${new Date(job.completedDate).toLocaleDateString('en-IN')}` : ''}
                      </span>
                    ) : (
                      <span>Scheduled: {job.scheduledDate || 'Today'} {job.scheduledTime ? `• ${job.scheduledTime}` : ''}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {isAssigned && (
                      <button
                        onClick={(e) => handleQuickStatus(job, 'ACCEPTED', e)}
                        disabled={updatingId === job.id}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1 transition"
                      >
                        <span>{updatingId === job.id ? 'Accepting...' : 'Accept'}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {isAccepted && (
                      <button
                        onClick={(e) => handleQuickStatus(job, 'IN_PROGRESS', e)}
                        disabled={updatingId === job.id}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 flex items-center gap-1 transition"
                      >
                        <Wrench className="w-3 h-3" />
                        <span>{updatingId === job.id ? 'Starting...' : 'Start Job'}</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={(e) => handleQuickStatus(job, 'COMPLETED', e)}
                        disabled={updatingId === job.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{updatingId === job.id ? 'Completing...' : 'Complete (+150 Pts)'}</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        +150 Pts Earned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Details Modal */}
      {selectedActivity && (
        <PlumberActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onUpdateStatus={async (id, status, remarks) => {
            await onUpdateStatus(id, status, remarks);
            setSelectedActivity((prev) => (prev ? { ...prev, status, remarks: remarks || prev.remarks } : null));
          }}
          onUpdateRemarks={async (id, remarks) => {
            if (onUpdateRemarks) {
              await onUpdateRemarks(id, remarks);
              setSelectedActivity((prev) => (prev ? { ...prev, remarks } : null));
            }
          }}
        />
      )}
    </div>
  );
}
