import React from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

export default function ZohoVerificationScreen({
  dealer,
  onProceed,
  onBackToLogin,
  onOpenAdminToVerify
}) {
  const isVerified = dealer?.zohoVerified;

  return (
    <div className="space-y-5 py-3">
      {/* Header */}
      <div className="text-center space-y-1">
        <div
          className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-bold ${
            isVerified
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/20 text-rose-400'
          }`}
        >
          {isVerified ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>
        <h2 className="text-lg font-black text-white">
          {isVerified ? 'Zoho CRM Verification Passed' : 'Zoho Verification Failed — Access Denied'}
        </h2>
        <p className="text-xs text-slate-400">
          Dealers can login <strong className="text-white">ONLY if verified in Zoho CRM</strong>.
        </p>
      </div>

      {/* Verification Card */}
      <div
        className={`p-4 rounded-2xl border text-xs space-y-3 ${
          isVerified
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100'
            : 'bg-rose-950/50 border-rose-500/40 text-rose-100'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-semibold text-slate-300">Zoho CRM Registry Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              isVerified ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}
          >
            {isVerified ? 'VERIFIED' : 'UNVERIFIED / PENDING'}
          </span>
        </div>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-400">Dealership Name:</span>
            <span className="font-bold text-white text-right">{dealer?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Zoho Contact ID:</span>
            <span className="font-mono text-emerald-300">{dealer?.zohoContactId || 'PENDING'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Registered Mobile:</span>
            <span className="font-mono text-white">+91 {dealer?.mobile}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GSTIN:</span>
            <span className="font-mono text-slate-300">{dealer?.gstin}</span>
          </div>
          {isVerified && (
            <div className="flex justify-between pt-1 border-t border-emerald-800/40">
              <span className="text-emerald-300">Credit Line Status:</span>
              <span className="font-semibold text-white">
                {dealer?.credit90DaysAllowed
                  ? '30 & 90 Days Approved'
                  : dealer?.credit30DaysAllowed
                  ? '30 Days Allowed (90D Locked)'
                  : 'Upfront Settlement Only'}
              </span>
            </div>
          )}
        </div>
      </div>

      {isVerified ? (
        <button
          onClick={onProceed}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
        >
          <span>Continue to Dealer Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
            <p className="font-semibold text-rose-300 mb-1">Why was access blocked?</p>
            PlumbMart business policy strictly requires dealers to be verified in Zoho CRM before wholesale access or inventory visibility is granted.
          </div>
          <button
            onClick={onOpenAdminToVerify}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition"
          >
            Approve Verification in Admin Panel →
          </button>
          <button
            onClick={onBackToLogin}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Try Another Mobile Number
          </button>
        </div>
      )}
    </div>
  );
}
