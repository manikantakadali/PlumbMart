import React, { useState, useEffect } from 'react';
import { 
  PartyPopper, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  Wrench, 
  Clock, 
  Award,
  LockKeyholeOpen,
  CalendarCheck,
  Package
} from 'lucide-react';

export default function PlumberWelcomeBackModal({ 
  isOpen, 
  onClose,
  plumberName = "Ramesh Kumar",
  license = "PLUMB-KA-2024-884",
  rating = 4.9,
  onStartWork
}) {
  const [particles, setParticles] = useState([]);

  // Generate lightweight celebration confetti particles on modal open
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
      className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-100 my-auto flex flex-col max-h-[92vh] overflow-hidden transform animate-in zoom-in-95 duration-200"
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
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-6 text-white text-center shrink-0 overflow-hidden">
          {/* Glow circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer z-30"
            title="Close welcome modal"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebration Badge Icon */}
          <div className="relative inline-flex items-center justify-center mb-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-emerald-600 shadow-2xl shadow-emerald-950/30 flex items-center justify-center ring-6 ring-white/20 animate-in zoom-in-50 duration-300">
              <PartyPopper className="w-7 h-7 sm:w-8 sm:h-8 animate-bounce" strokeWidth={2.4} />
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md animate-pulse">
              <Sparkles className="w-3 h-3" />
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-white/25 text-white backdrop-blur-sm shadow-xs border border-white/20">
              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
              <span>Account Approved &amp; Re-Activated</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
            Welcome Back!
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-sm mx-auto mt-0.5 leading-relaxed">
            PlumbMart Corporate Administration has approved and restored all field service &amp; job execution privileges for <strong className="text-white underline decoration-amber-400 decoration-2">{plumberName}</strong>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-3.5 overflow-y-auto flex-1 overscroll-contain">
          
          {/* Status highlight message */}
          <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <LockKeyholeOpen className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 text-xs sm:text-[13px]">All Account Restrictions Lifted</p>
              <p className="text-slate-600 mt-0.5 text-[11px] sm:text-xs">
                Your plumber account is in good standing. Job task execution, on-site checklist sign-offs, and materials collection are fully unlocked.
              </p>
            </div>
          </div>

          {/* 4 Unlocked Benefits Grid */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Restored Privileges &amp; Field Status:</span>
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Card 1: License */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Trade License</span>
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{license}</p>
                <p className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Verified Pro ({rating} ★)</span>
                </p>
              </div>

              {/* Card 2: Job Execution */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-1.5 text-indigo-600 mb-0.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Job Execution</span>
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-900">Active &amp; Unlocked</p>
                <p className="text-[9px] sm:text-[10px] text-indigo-700 font-semibold mt-0.5">
                  Start &amp; Complete Jobs
                </p>
              </div>

              {/* Card 3: Material Requests */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-1.5 text-amber-600 mb-0.5">
                  <Package className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Material Pickups</span>
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-900">Pre-Approved</p>
                <p className="text-[9px] sm:text-[10px] text-amber-700 font-semibold mt-0.5">
                  Direct Hub Priority
                </p>
              </div>

              {/* Card 4: Telemetry Sign-Off */}
              <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition">
                <div className="flex items-center gap-1.5 text-sky-600 mb-0.5">
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-500">Digital Sign-Off</span>
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-900 truncate">Live Telemetry</p>
                <p className="text-[9px] sm:text-[10px] text-sky-700 font-semibold mt-0.5">
                  Admin Verification Ready
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onStartWork) {
                  onStartWork();
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-xl shadow-emerald-600/30 transition active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Explore Assigned Jobs &amp; Start Work</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition text-center cursor-pointer"
            >
              Continue to Activities Dashboard
            </button>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>PlumbMart Field Services &bull; Verified Trade License</span>
          </div>

        </div>
      </div>
    </div>
  );
}
