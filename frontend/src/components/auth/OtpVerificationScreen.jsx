import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  RotateCw,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function OtpVerificationScreen({
  mobile,
  role = 'customer',
  otpInput,
  onChangeOtp,
  demoOtp = null,
  error,
  smsNotice,
  isVerifying = false,
  onBack,
  onVerify,
  onResendOtp
}) {
  // Resend cooldown timer (30s)
  const [cooldown, setCooldown] = useState(30);
  // Expiry countdown timer (5 mins = 300s)
  const [expiresIn, setExpiresIn] = useState(300);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      setExpiresIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    setResendMessage('');
    try {
      if (onResendOtp) {
        await onResendOtp();
        setCooldown(30);
        setExpiresIn(300);
        setResendMessage('Fresh OTP sent via SMS!');
      }
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isCustomer = role === 'customer';

  return (
    <div className="space-y-4 py-3">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center font-bold text-lg shadow-inner">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-black text-white">Enter OTP Verification</h2>
        <p className="text-xs text-slate-400">
          6-digit verification code sent to{' '}
          <span className="text-white font-mono font-bold">+91 {mobile}</span>
        </p>
      </div>

      {/* Real SMS Dispatch Notice */}
      <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-200 text-xs flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="leading-tight">
          {smsNotice || `A secure 6-digit OTP was sent via SMS to your mobile phone.`}
        </span>
      </div>

      {/* Demo helper badge - ONLY for non-customer roles (Dealer, Plumber, Admin) */}
      {!isCustomer && demoOtp && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-[11px] font-semibold">{role.toUpperCase()} Demo Code:</span>
          </span>
          <span className="font-mono font-black text-sm text-amber-300 bg-amber-900/80 px-2 py-0.5 rounded border border-amber-500/50">
            {demoOtp}
          </span>
        </div>
      )}

      {/* Expiry countdown */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Code expires in:</span>
        </span>
        <span className={`font-mono font-bold ${expiresIn < 60 ? 'text-rose-400' : 'text-slate-300'}`}>
          {formatTime(expiresIn)}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-tight">{typeof error === 'string' ? error : error.error || 'Verification failed.'}</span>
        </div>
      )}

      {/* Resend success notice */}
      {resendMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{resendMessage}</span>
        </div>
      )}

      {/* OTP Form */}
      <form onSubmit={onVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
            Enter 6-Digit Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpInput}
            onChange={(e) => onChangeOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="······"
            className="w-full text-center py-3.5 rounded-xl bg-slate-950 border border-blue-500 text-white text-2xl font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            autoFocus
          />
        </div>

        {/* Resend OTP button with cooldown */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || isResending}
            className={`text-xs font-medium inline-flex items-center gap-1.5 transition ${
              cooldown > 0 || isResending
                ? 'text-slate-500 cursor-not-allowed'
                : 'text-blue-400 hover:text-blue-300 underline'
            }`}
          >
            <RotateCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {cooldown > 0
                ? `Resend OTP in ${cooldown}s`
                : isResending
                ? 'Sending fresh OTP...'
                : 'Resend OTP via SMS'}
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-1">
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
            disabled={isVerifying || otpInput.length !== 6 || expiresIn <= 0}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify &amp; Continue</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
