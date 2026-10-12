import React, { useState } from 'react';
import {
  X,
  Package,
  Send,
  AlertCircle,
  CheckCircle2,
  Wrench,
  HelpCircle,
  Plus,
  Minus
} from 'lucide-react';

export default function PlumberProductRequestModal({
  product,
  activeActivities = [],
  onClose,
  onSubmitRequest
}) {
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMsg('Quantity must be a positive integer greater than 0.');
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please specify the reason or site requirement.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRequest({
        productId: product.id,
        quantity: numQty,
        reason: reason.trim(),
        activityId: selectedActivityId || null,
        remarks: remarks.trim()
      });
      onClose();
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Failed to submit product requirement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Submit Product Requirement
              </h3>
              <p className="text-[10px] text-slate-400">
                Request plumbing materials for your assigned site
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Product Card */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
          {product.image && (
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
            />
          )}
          <div className="space-y-0.5 flex-1 min-w-0">
            <span className="text-[10px] font-mono text-purple-400">
              {product.sku} • {product.categoryName}
            </span>
            <h4 className="text-xs font-bold text-white line-clamp-2">
              {product.name}
            </h4>
            <div className="text-[10px] text-slate-400">
              Unit: <span className="text-slate-300 font-semibold">{product.unit || 'Piece'}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Required Quantity *
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-sm font-mono font-bold focus:border-purple-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reason / Requirement */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Reason / Site Requirement *
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Existing line damaged, emergency replacement required on site..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Activity / Order Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Link to Assigned Activity / Site (Optional)
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
            >
              <option value="">-- No specific activity link --</option>
              {activeActivities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.id} — {act.customerName} ({act.requiredWork?.slice(0, 30)}...)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Linking helps dispatch verify and allocate material to the specific site.
            </p>
          </div>

          {/* Additional Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Remarks &amp; Technical Notes
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Preferred delivery time, urgent requirement..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Submitting Requirement...' : 'Submit Product Requirement'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
