import React, { useState } from 'react';
import { 
  Lock, 
  ShieldAlert, 
  PhoneCall, 
  Mail, 
  X, 
  AlertTriangle, 
  Building2, 
  Copy, 
  Check, 
  ArrowRight,
  Headphones
} from 'lucide-react';

export default function DealerSuspendedModal({ 
  isOpen, 
  onClose,
  title = "Wholesale Order Placement Locked",
  message = "Your B2B dealer account has been suspended by administration. Direct wholesale purchasing, cart checkout, and credit line utilization are temporarily restricted.",
  dealerName = "Sri Venkateswara Distributors",
  supportPhone = "1800-2026-PLUM",
  supportEmail = "b2b-support@plumbmart.com"
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPhone = () => {
    try {
      navigator.clipboard.writeText(supportPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Background Banner */}
        <div className="relative bg-gradient-to-br from-rose-600 via-rose-500 to-amber-600 px-6 pt-7 pb-8 text-white text-center overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/10 rounded-full blur-xl pointer-events-none" />

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            title="Close popup"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-rose-600 shadow-xl shadow-rose-900/20 mb-3 ring-4 ring-white/20">
            <Lock className="w-8 h-8" strokeWidth={2.4} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-rose-200 animate-ping" />
              Dealer Account Suspended
            </span>
          </div>

          <h3 className="text-xl font-black tracking-tight text-white mt-1">
            {title}
          </h3>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed text-center font-medium">
            {message}
          </p>

          {/* Dealer Info Box */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-rose-600 flex items-center justify-center shadow-xs border border-rose-200 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 truncate max-w-[200px]">{dealerName}</p>
                <p className="text-[10px] font-semibold text-rose-700 font-mono">Status: Suspended by Governance</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide bg-rose-600 text-white">
              Locked
            </span>
          </div>

          {/* Quick Support Contact Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Headphones className="w-4 h-4 text-indigo-600" />
                Dedicated Corporate Desk
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Available 24x7
              </span>
            </div>

            {/* Toll-Free Number */}
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Toll-Free Helpline</p>
                  <a 
                    href={`tel:${supportPhone}`} 
                    className="text-sm font-black text-slate-900 hover:text-indigo-600 transition"
                  >
                    {supportPhone}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                title="Copy phone number"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Email Support */}
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Resolution Email</p>
                  <a 
                    href={`mailto:${supportEmail}`} 
                    className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition truncate max-w-[220px] block"
                  >
                    {supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <a
              href={`tel:${supportPhone}`}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2 text-center"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Corporate Support Now</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition text-center cursor-pointer"
            >
              Close & Browse Catalog in View-Only Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
