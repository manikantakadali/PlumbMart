import React, { useState, useEffect } from 'react';
import { 
  PartyPopper, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  CreditCard, 
  Clock, 
  Truck, 
  BadgePercent,
  Building2,
  LockKeyholeOpen,
  Award
} from 'lucide-react';

export default function DealerWelcomeBackModal({ 
  isOpen, 
  onClose,
  dealerName = "Sri Venkateswara Distributors",
  creditLimit = "₹5,00,000",
  availableCredit = "₹5,00,000",
  hubName = "Peenya Central 01",
  onExploreCatalog
}) {
  const [particles, setParticles] = useState([]);

  // Generate lightweight confetti particles on modal open
  useEffect(() => {
    if (isOpen) {
      const colors = ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];
      const newParticles = Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: Math.random() * 94 + 3 + '%',
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 6 + 'px',
        delay: Math.random() * 0.8 + 's',
        duration: Math.random() * 1.5 + 1.2 + 's'
      }));
      setParticles(newParticles);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Floating Confetti Particle Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full animate-bounce opacity-80"
              style={{
                left: p.left,
                top: Math.random() * 60 + '%',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                animationDelay: p.delay,
                animationDuration: p.duration
              }}
            />
          ))}
        </div>

        {/* Top Celebration Header Banner */}
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 px-6 pt-8 pb-9 text-white text-center overflow-hidden">
          {/* Subtle glow circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer z-30"
            title="Close welcome modal"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration Badge Icon with Pulse */}
          <div className="relative inline-flex items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-3xl bg-white text-emerald-600 shadow-2xl shadow-emerald-950/30 flex items-center justify-center ring-8 ring-white/20 animate-in zoom-in-50 duration-300">
              <PartyPopper className="w-10 h-10 animate-bounce" strokeWidth={2.4} />
            </div>
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/25 text-white backdrop-blur-sm shadow-xs border border-white/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Account Approved &amp; Re-Activated</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Welcome Back!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
            Corporate Governance has approved and restored all wholesale B2B privileges for <strong className="text-white underline decoration-amber-400 decoration-2">{dealerName}</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Status highlight message */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <LockKeyholeOpen className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 text-[13px]">All Account Restrictions Lifted</p>
              <p className="text-slate-600 mt-0.5">
                Your B2B account is in good standing. Instant wholesale order checkout, approved credit line utilization, and express dispatches are fully active.
              </p>
            </div>
          </div>

          {/* 4 Unlocked Benefits Grid */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Privileges &amp; Credit Terms:</span>
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Card 1: Credit Line */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-500">Approved Credit</span>
                </div>
                <p className="text-sm font-black text-slate-900">{creditLimit}</p>
                <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>100% Available</span>
                </p>
              </div>

              {/* Card 2: 30D / 90D Terms */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-2 text-indigo-600 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-500">Payment Terms</span>
                </div>
                <p className="text-sm font-black text-slate-900">30D &amp; 90D Credit</p>
                <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">
                  Post-Dated Billing Active
                </p>
              </div>

              {/* Card 3: Tier-1 Pricing */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  <BadgePercent className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-500">Catalog Pricing</span>
                </div>
                <p className="text-sm font-black text-slate-900">Tier-1 Wholesale</p>
                <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                  Direct Factory Rates
                </p>
              </div>

              {/* Card 4: Dispatch Hub */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-2 text-sky-600 mb-1">
                  <Truck className="w-4 h-4" />
                  <span className="text-[11px] font-bold text-slate-500">Express Dispatch</span>
                </div>
                <p className="text-sm font-black text-slate-900 truncate">{hubName}</p>
                <p className="text-[10px] text-sky-700 font-semibold mt-0.5">
                  Priority Warehouse Fleet
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onExploreCatalog) {
                  onExploreCatalog();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-600/30 transition active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explore Wholesale Catalog &amp; Order Now</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition text-center cursor-pointer"
            >
              Continue to Live Inventory Dashboard
            </button>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>PlumbMart Corporate B2B Governance &bull; Verified Partner</span>
          </div>

        </div>
      </div>
    </div>
  );
}
