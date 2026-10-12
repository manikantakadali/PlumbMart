import React from 'react';
import { CheckCircle2, ArrowRight, Truck, Wrench, ShieldCheck } from 'lucide-react';

export default function CustomerOrderConfirmation({
  order,
  onTrackOrder,
  onContinueShopping
}) {
  if (!order) return null;

  return (
    <div className="space-y-5 py-4 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-bounce">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-500/40">
          {order.id}
        </span>
        <h2 className="text-xl font-black text-white pt-2">Order Confirmed &amp; Paid!</h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          Direct payment was settled successfully. Zoho Workbook inventory has been updated.
        </p>
      </div>

      {/* Summary Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
        <div className="flex justify-between border-b border-slate-900 pb-2">
          <span className="text-slate-400">Total Amount Paid:</span>
          <span className="font-mono font-bold text-emerald-400 text-sm">
            ₹{order.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Payment Status:</span>
          <span className="font-semibold text-emerald-400">{order.paymentStatus} ({order.paymentSubType})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Order Status:</span>
          <span className="font-semibold text-blue-400">{order.orderStatus}</span>
        </div>
        {order.assignedPlumberName && (
          <div className="pt-2 border-t border-slate-900 flex items-start gap-2">
            <Wrench className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-purple-300">Assigned Master Plumber:</div>
              <div className="text-slate-300">{order.assignedPlumberName}</div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onTrackOrder}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
        >
          <Truck className="w-4 h-4" />
          <span>Track Live Order Status</span>
        </button>
        <button
          onClick={onContinueShopping}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
