import React, { useState } from 'react';
import {
  Award,
  Wrench,
  ShieldCheck,
  Wallet,
  LogOut,
  CheckCircle2,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Settings,
  Bell,
  Clock,
  Briefcase,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function PlumberProfile({
  plumber,
  onUpdateProfile,
  onUpdateSettings,
  onLogout
}) {
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' | 'settings'
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form State
  const [formData, setFormData] = useState({
    name: plumber?.name || '',
    email: plumber?.email || '',
    address: plumber?.address || '',
    specialization: plumber?.specialization || '',
    serviceArea: plumber?.serviceArea || '',
    skills: Array.isArray(plumber?.skills) ? plumber.skills.join(', ') : ''
  });

  // Settings State
  const [settings, setSettings] = useState({
    jobAlerts: plumber?.settings?.jobAlerts !== false,
    productAlerts: plumber?.settings?.productAlerts !== false,
    rewardAlerts: plumber?.settings?.rewardAlerts !== false,
    isAvailableForJobs: plumber?.settings?.isAvailableForJobs !== false
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile({
          name: formData.name.trim(),
          email: formData.email.trim(),
          address: formData.address.trim(),
          specialization: formData.specialization.trim(),
          serviceArea: formData.serviceArea.trim(),
          skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        });
      }
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setErrorMsg(err.data?.error || err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSetting = async (key) => {
    const nextSettings = { ...settings, [key]: !settings[key] };
    setSettings(nextSettings);
    if (onUpdateSettings) {
      try {
        await onUpdateSettings(nextSettings);
      } catch (err) {
        console.error('Settings update error:', err);
      }
    }
  };

  const isVerified = plumber?.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-4 py-2 pb-6">
      {/* Top Header & Section Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-white">
            {activeSection === 'profile' ? 'Plumber Trade Profile & KYC' : 'Plumber Settings'}
          </h2>
          <p className="text-[11px] text-slate-400">
            {activeSection === 'profile'
              ? 'Verified trade credentials, wallet balance & work area'
              : 'Alerts, availability & account preferences'}
          </p>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-3 py-1 rounded-lg transition ${
              activeSection === 'profile'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveSection('settings')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
              activeSection === 'settings'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: PROFILE & KYC */}
      {activeSection === 'profile' && (
        <div className="space-y-4">
          {/* Main Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {plumber?.avatar ? (
                  <img
                    src={plumber.avatar}
                    alt={plumber.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500/40"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl border border-purple-500/30">
                    <Wrench className="w-7 h-7" />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-white">{plumber?.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isVerified
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> {plumber?.verificationStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {plumber?.id}
                    </span>
                  </div>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Read-Only Credential Details Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-900 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Trade License No:</span>
                <span className="font-mono text-purple-300 font-bold">
                  {plumber?.licenseNo || 'IPA-HYD-2024-0891'}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Registered Mobile (Locked):</span>
                <span className="font-mono text-white">+91 {plumber?.mobile}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Trade Experience:</span>
                <span className="text-slate-200">{plumber?.experienceYears || 9} Years</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Customer Rating:</span>
                <span className="text-amber-400 font-bold">★ {plumber?.rating || 4.9} / 5.0</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Account Status:</span>
                <span className="text-emerald-400 font-bold">{plumber?.status || 'ACTIVE'}</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Form */}
          {isEditing ? (
            <form onSubmit={handleProfileSave} className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3 shadow">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Edit Professional Profile
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Base Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Trade Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  placeholder="e.g. High-Rise CPVC Piping, Booster Pumps"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Assigned Service Area (Zones)
                </label>
                <input
                  type="text"
                  value={formData.serviceArea}
                  onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                  placeholder="e.g. Madhapur, Hitec City, Kondapur, Gachibowli"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="CPVC Piping, Diverters, Booster Pumps"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Non-Editing Detailed Cards */
            <div className="space-y-3">
              {/* Skills Tags */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Certified Skills &amp; Competencies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(plumber?.skills || ['CPVC & UPVC Piping', 'Thermostatic Diverters', 'Booster Pumps', 'Hydro Testing']).map(
                    (skill, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-300 text-[11px] font-semibold border border-purple-500/20"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Service Area & Location */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Service Area &amp; Coverage
                </div>
                <div className="text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{plumber?.serviceArea || 'Madhapur, Hitec City, Kondapur, Gachibowli'}</span>
                </div>
                {plumber?.address && (
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    Address: {plumber.address}
                  </div>
                )}
                {plumber?.email && (
                  <div className="text-[11px] text-slate-400">
                    Email: {plumber.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rewards & Wallet Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Plumber Wallet &amp; Zoho Loyalty Rewards</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Reward Points Balance</div>
                <div className="text-base font-black text-amber-400 font-mono mt-0.5">
                  {plumber?.rewardPoints || 0} pts
                </div>
                <div className="text-[9px] text-slate-500">Scan SKU / verify install</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400">Cash Wallet Balance</div>
                <div className="text-base font-black text-emerald-400 font-mono mt-0.5">
                  ₹{(plumber?.walletBalance || 0).toLocaleString('en-IN')}
                </div>
                <div className="text-[9px] text-slate-500">Instant UPI payout</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SETTINGS */}
      {activeSection === 'settings' && (
        <div className="space-y-4">
          {/* Notification Preferences */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-purple-400" />
              <span>Notification Preferences</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                <div>
                  <div className="font-semibold text-white">Job Assignment Alerts</div>
                  <div className="text-[10px] text-slate-400">Receive SMS and app alerts when new sites are assigned</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.jobAlerts}
                  onChange={() => handleToggleSetting('jobAlerts')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                <div>
                  <div className="font-semibold text-white">Product Requirement Updates</div>
                  <div className="text-[10px] text-slate-400">Notifies when admin reviews or fulfills your material request</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.productAlerts}
                  onChange={() => handleToggleSetting('productAlerts')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900">
                <div>
                  <div className="font-semibold text-white">Reward &amp; Wallet Credits</div>
                  <div className="text-[10px] text-slate-400">Instant alert when +150 points or cash wallet is credited</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.rewardAlerts}
                  onChange={() => handleToggleSetting('rewardAlerts')}
                  className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Account Availability Preference */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              <span>Job Dispatch Availability</span>
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-xs">
              <div>
                <div className="font-semibold text-white">Available for Immediate Dispatch</div>
                <div className="text-[10px] text-slate-400">
                  Allows PlumbMart Admin to assign new customer installation visits
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.isAvailableForJobs}
                onChange={() => handleToggleSetting('isAvailableForJobs')}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Privacy & Trade Compliance */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="font-semibold text-slate-200">Trade License &amp; Privacy Governance</div>
            <p className="text-[11px] leading-relaxed">
              Your registered mobile number and IPA trade license are governed by PlumbMart Partner Terms.
              Direct customer contacts are strictly restricted to assigned active job sites.
            </p>
          </div>
        </div>
      )}

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition shadow"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout from Plumber Account</span>
      </button>
    </div>
  );
}
