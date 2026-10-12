import React from 'react';
import { Building2, Phone, CreditCard, ShieldCheck, LogOut, CheckCircle2, Lock } from 'lucide-react';

export default function DealerProfile({ dealer, onLogout }) {
  const availableCredit = Math.max(0, (dealer?.creditLimit || 0) - (dealer?.creditUsed || 0));

  return (
    <div className="space-y-4 py-2">
      <h2 className="text-base font-extrabold text-white">Dealership Profile &amp; Credit Ledger</h2>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{dealer?.name}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> Zoho CRM ID: {dealer?.zohoContactId}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Contact Person:</span>
            <span className="font-bold text-white">{dealer?.contactPerson}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Registered Mobile:</span>
            <span className="font-mono text-amber-300">+91 {dealer?.mobile}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">GSTIN:</span>
            <span className="font-mono text-white">{dealer?.gstin}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">City / Zone:</span>
            <span className="text-slate-200">{dealer?.city}</span>
          </div>
        </div>
      </div>

      {/* Credit Ledger Breakdown */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-amber-400" />
          Zoho Books Credit Ledger
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">Total Sanctioned Limit</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              ₹{(dealer?.creditLimit || 0).toLocaleString('en-IN')}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">Available Credit Balance</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              ₹{availableCredit.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 pt-1 text-[11px]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
            <span>30-Day Credit Status:</span>
            <span className={dealer?.credit30DaysAllowed ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {dealer?.credit30DaysAllowed ? '✓ Active' : '✗ Locked'}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
            <span>90-Day Credit Status:</span>
            <span className={dealer?.credit90DaysAllowed ? 'text-purple-400 font-bold' : 'text-rose-400'}>
              {dealer?.credit90DaysAllowed ? '★ Selected / Approved' : '🔒 Not Approved by Admin'}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout from Dealership</span>
      </button>
    </div>
  );
}
