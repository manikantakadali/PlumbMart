import React from 'react';
import { CheckCircle2, Truck, FileSpreadsheet, ArrowRight, Calendar } from 'lucide-react';

export default function DealerOrderConfirmation({
  order,
  onViewOrders,
  onContinueWholesale
}) {
  if (!order) return null;

  const isCredit = order.creditDays > 0;

  return (
    <div className="space-y-5 py-4 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 animate-bounce">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div className="space-y-1">
        <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950 px-2.5 py-1 rounded-full border border-amber-500/40">
          {order.id}
        </span>
        <h2 className="text-xl font-black text-white pt-2">Dealer Order Confirmed!</h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto">
          Stock allocated from Zoho Workbook and bulk transport dispatch initiated.
        </p>
      </div>

      {/* Details Box */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
        <div className="flex justify-between border-b border-slate-900 pb-2">
          <span className="text-slate-400">Total Wholesale Value:</span>
          <span className="font-mono font-bold text-amber-400 text-sm">
            ₹{order.totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Payment Option:</span>
          <span className="font-semibold text-white">{order.paymentSubType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Payment Status:</span>
          <span
            className={`font-semibold ${
              isCredit ? 'text-amber-400 font-bold' : 'text-emerald-400'
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>
        {isCredit && (
          <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-amber-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Calendar className="w-4 h-4 text-amber-400" /> Credit Due Date:
            </span>
            <span className="font-mono font-black text-white text-xs">{order.dueDate}</span>
          </div>
        )}
        <div className="flex justify-between pt-1">
          <span className="text-slate-400">Zoho Inventory:</span>
          <span className="text-emerald-400 font-medium">Automatic stock count deducted</span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={onViewOrders}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
        >
          <Truck className="w-4 h-4" />
          <span>View B2B Orders &amp; Invoices</span>
        </button>
        <button
          onClick={onContinueWholesale}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
        >
          Back to Wholesale Catalog
        </button>
      </div>
    </div>
  );
}
