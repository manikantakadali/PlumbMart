import React from 'react';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function OtpVerificationScreen({
  mobile,
  role,
  otpInput,
  onChangeOtp,
  demoOtp = '123456',
  error,
  onBack,
  onVerify
}) {
  return (
    <div className="space-y-5 py-4">
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-white">Enter OTP Verification</h2>
        <p className="text-xs text-slate-400">
          One-Time Password sent to <span className="text-white font-mono font-bold">+91 {mobile}</span>
        </p>
      </div>

      {/* Demo helper badge */}
      <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Demo OTP Generated:</span>
        </span>
        <span className="font-mono font-black text-sm text-emerald-300 bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-500/50">
          {demoOtp}
        </span>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={onVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            6-Digit Verification Code
          </label>
          <input
            type="text"
            maxLength={6}
            value={otpInput}
            onChange={(e) => onChangeOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full text-center py-3 rounded-xl bg-slate-950 border border-blue-500 text-white text-xl font-mono tracking-widest focus:outline-none shadow-inner"
            autoFocus
          />
        </div>

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition"
          >
            Verify &amp; Continue
          </button>
        </div>
      </form>
    </div>
  );
}
