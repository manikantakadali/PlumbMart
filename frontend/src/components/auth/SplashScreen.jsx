import React from 'react';
import { Smartphone, ShieldCheck, ArrowRight, FileSpreadsheet } from 'lucide-react';

export default function SplashScreen({ onStart }) {
  return (
    <div className="min-h-[620px] flex flex-col justify-between p-6 text-center">
      <div className="my-auto space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/40 text-white font-black text-3xl tracking-tight">
          PM
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <FileSpreadsheet className="w-3.5 h-3.5" /> Zoho Workbook Connected
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">
            PlumbMart Platform
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Multi-Role Plumbing Commerce with Zoho CRM Dealer Verification &amp; 30/90-Day Credit Governance.
          </p>
        </div>

        {/* 3 Core Roles pill highlights */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-blue-400">CUSTOMER</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Retail Price • No Stock Qty</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-amber-400">DEALER</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Wholesale • 30/90D Credit</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-purple-400">PLUMBER</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Jobs • Points Guide</div>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition"
      >
        <span>Get Started via OTP Login</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
