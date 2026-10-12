import React from 'react';
import {
  User,
  Building2,
  Wrench,
  ShieldCheck,
  Phone,
  ArrowRight,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LoginScreen({
  selectedRole,
  onSelectRole,
  mobileInput,
  onChangeMobile,
  nameInput,
  onChangeName,
  authError,
  onSubmit,
  onQuickSelectPersona
}) {
  return (
    <div className="space-y-5 py-2">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30">
          PM
        </div>
        <h2 className="text-lg font-black text-white">Login to PlumbMart</h2>
        <p className="text-xs text-slate-400">
          Select your role and verify mobile number via OTP
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'customer', label: 'Customer', icon: User },
          { id: 'dealer', label: 'Dealer', icon: Building2 },
          { id: 'plumber', label: 'Plumber', icon: Wrench },
          { id: 'admin', label: 'Admin', icon: ShieldCheck }
        ].map((r) => {
          const Icon = r.icon;
          const active = selectedRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRole(r.id)}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                active
                  ? r.id === 'dealer'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : r.id === 'plumber'
                    ? 'bg-purple-600 text-white shadow'
                    : r.id === 'admin'
                    ? 'bg-rose-600 text-white shadow'
                    : 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role Requirement Callout Banner */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
        {selectedRole === 'customer' && (
          <>
            <div className="font-semibold text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Customer Registration &amp; Login
            </div>
            <p className="text-slate-400 text-[11px]">
              Any customer can register/login with their mobile number. Receives OTP directly.
            </p>
          </>
        )}
        {selectedRole === 'dealer' && (
          <>
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Zoho CRM Verification Gate
            </div>
            <p className="text-slate-400 text-[11px]">
              Dealers can login <strong>ONLY if their mobile number is registered and verified in Zoho</strong>.
            </p>
          </>
        )}
        {selectedRole === 'plumber' && (
          <>
            <div className="font-semibold text-purple-300 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" /> Plumber Trade License Verification
            </div>
            <p className="text-slate-400 text-[11px]">
              Plumbers log in via OTP to access assigned activities and technical installation BoM.
            </p>
          </>
        )}
        {selectedRole === 'admin' && (
          <>
            <div className="font-semibold text-rose-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Admin Management Access
            </div>
            <p className="text-slate-400 text-[11px]">
              Full governance over Dealers, Credit Permissions, Zoho Workbook, Orders &amp; Payments.
            </p>
          </>
        )}
      </div>

      {/* Auth Error / Access Denied Alert */}
      {authError && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs space-y-1.5 animate-shake">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {authError.code === 'ZOHO_NOT_VERIFIED'
                ? 'Zoho CRM Verification Required — Login Blocked'
                : 'Access Denied'}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed">{authError.error}</p>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Mobile Number (10 digits)
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              maxLength={10}
              value={mobileInput}
              onChange={(e) => onChangeMobile(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 9876543210"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono tracking-wider focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {selectedRole === 'customer' && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Customer Full Name (for registration)
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => onChangeName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
        >
          <span>Send OTP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
