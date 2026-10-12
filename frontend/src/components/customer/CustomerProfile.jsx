import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  LogOut,
  Edit2,
  Check,
  X,
  AlertCircle
} from 'lucide-react';

export default function CustomerProfile({
  customer,
  onUpdateProfile,
  onLogout
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(customer?.name || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        name,
        email,
        address
      });
      setIsEditing(false);
      setMsg('Profile updated successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-white">Customer Account Profile</h2>
        {!isEditing && (
          <button
            onClick={() => {
              setName(customer?.name || '');
              setEmail(customer?.email || '');
              setAddress(customer?.address || '');
              setIsEditing(true);
            }}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <Edit2 className="w-3 h-3" /> Edit Profile
          </button>
        )}
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs">
          {msg}
        </div>
      )}

      {/* Main Profile Info Card */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center gap-3">
          {customer?.avatar ? (
            <img
              src={customer.avatar}
              alt={customer.name}
              className="w-14 h-14 rounded-2xl object-cover border border-blue-500/30"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xl">
              {customer?.name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-white">{customer?.name}</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Verified Retail Customer ({customer?.id})
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 pt-2 border-t border-slate-900 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Primary Site Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                required
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2.5 pt-2 border-t border-slate-900 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Mobile: <strong className="text-white font-mono">+91 {customer?.mobile}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                Email: <strong className="text-slate-200">{customer?.email || 'N/A'}</strong>
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>
                Site Address: <strong className="text-slate-200">{customer?.address}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Role Access Information Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
        <div className="font-bold text-blue-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> Role Access Permissions (RBAC)
        </div>
        <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
          <li>Access to dynamic retail pricing</li>
          <li>Direct Payment only (UPI, Card, NetBanking)</li>
          <li><span className="text-rose-300">Stock quantity hidden</span> per Zoho governance</li>
          <li>Auto-assignment of certified plumber for installation</li>
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
