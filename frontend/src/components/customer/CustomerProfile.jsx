import React from 'react';
import { User, Phone, Mail, MapPin, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

export default function CustomerProfile({ customer, onLogout }) {
  return (
    <div className="space-y-4 py-2">
      <h2 className="text-base font-extrabold text-white">Customer Account Profile</h2>

      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xl">
            {customer?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{customer?.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300">
              Verified Retail Customer
            </span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-slate-500" />
            <span>Mobile: <strong className="text-white font-mono">+91 {customer?.mobile}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-slate-500" />
            <span>Email: <strong className="text-slate-200">{customer?.email || 'user@example.com'}</strong></span>
          </div>
          <div className="flex items-start gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>Site Address: <strong className="text-slate-200">{customer?.address}</strong></span>
          </div>
        </div>
      </div>

      {/* Role Access Information Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
        <div className="font-bold text-blue-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Role Access Permissions (RBAC)
        </div>
        <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
          <li>Access to B2C retail pricing</li>
          <li>Direct Payment options (UPI, Card, NetBanking)</li>
          <li><span className="text-rose-300">Stock quantity is hidden</span> per Zoho security governance</li>
          <li>Assigned certified plumber for on-site installation</li>
        </ul>
      </div>

      <button
        onClick={onLogout}
        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout from Account</span>
      </button>
    </div>
  );
}
