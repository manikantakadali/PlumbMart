import React from 'react';
import { Truck, Calendar, CreditCard, Package } from 'lucide-react';

export default function DealerOrders({ orders }) {
  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 my-4 space-y-2">
        <Truck className="w-8 h-8 text-slate-600 mx-auto" />
        <h3 className="text-sm font-bold text-white">No Dealer Orders</h3>
        <p className="text-xs text-slate-400">You haven&apos;t placed any wholesale orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
        B2B Wholesale Orders ({orders.length})
      </h2>

      <div className="space-y-3">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-amber-400">{ord.id}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                {ord.orderStatus}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-extrabold text-sm">
                <span className="text-slate-200">Wholesale Value:</span>
                <span className="text-amber-400 font-mono">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Payment: <strong className="text-slate-200">{ord.paymentSubType}</strong>
              </div>
              {ord.dueDate && ord.dueDate !== 'Immediate' && (
                <div className="text-[11px] text-amber-300 font-mono">
                  Credit Due: <strong>{ord.dueDate}</strong> ({ord.paymentStatus})
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-900 space-y-1 text-[11px]">
              <div className="text-slate-400 font-medium">Allocated Products:</div>
              {ord.items.map((i, idx) => (
                <div key={idx} className="flex justify-between text-slate-300">
                  <span>{i.name} × {i.qty}</span>
                  <span className="font-mono text-slate-400">₹{i.total.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="pt-2 border-t border-slate-900 space-y-1.5">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Logistics Stage:</div>
              <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-bold">
                {['Placed', 'Confirmed', 'Processing', 'Shipped'].map((st) => (
                  <div
                    key={st}
                    className={`py-1 rounded ${
                      ord.orderStatus === st || ord.trackingTimeline?.find((t) => t.step === st)?.done
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-900 text-slate-600'
                    }`}
                  >
                    {st}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
