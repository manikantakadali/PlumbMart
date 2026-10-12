import React from 'react';
import { Award, Wrench, ShieldCheck, Wallet, LogOut, CheckCircle2 } from 'lucide-react';

export default function PlumberProfile({ plumber, onLogout }) {
  return (
    <div className="space-y-4 py-2">
      <h2 className="text-base font-extrabold text-white">Plumber Trade Profile &amp; KYC</h2>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{plumber?.name}</h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> {plumber?.verificationStatus}
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Trade License No:</span>
            <span className="font-mono text-purple-300 font-bold">{plumber?.licenseNo}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Registered Mobile:</span>
            <span className="font-mono text-white">+91 {plumber?.mobile}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Trade Experience:</span>
            <span className="text-slate-200">{plumber?.experienceYears} Years</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span className="text-slate-400">Customer Rating:</span>
            <span className="text-amber-400 font-bold">★ {plumber?.rating} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Rewards & Wallet Card */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-emerald-400" />
          Plumber Wallet &amp; Zoho Loyalty Rewards
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">Reward Points Balance</div>
            <div className="text-base font-black text-amber-400 font-mono mt-0.5">
              {plumber?.rewardPoints || 0} pts
            </div>
            <div className="text-[9px] text-slate-500">Scan SKU / verify install</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400">Cash Wallet Balance</div>
            <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
              ₹{(plumber?.walletBalance || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-slate-500">Instant UPI payout</div>
          </div>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout from Plumber Account</span>
      </button>
    </div>
  );
}
