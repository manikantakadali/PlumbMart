import React from 'react';
import { X, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfileModal({ isOpen, onClose, currentUser, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm p-6 text-slate-900 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white mb-3 shadow-md shadow-blue-500/20">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{currentUser?.name || 'Guest User'}</h3>
          <span className="mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {currentUser?.role || 'Guest'} Role
          </span>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs mb-5">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Mobile</span>
            <span className="font-mono font-medium text-slate-900">{currentUser?.mobile || 'Not signed in'}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-slate-900">{currentUser?.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Loyalty Points</span>
            <span className="font-bold text-amber-600">⭐ {currentUser?.rewardPoints || 0} pts</span>
          </div>
        </div>

        {/* Role Dashboards Quick Links */}
        <div className="mb-4 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Access Dashboards:</span>
          <Link
            to="/customer"
            onClick={onClose}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 transition"
          >
            <span>Customer Dashboard</span>
            <span className="text-[10px] text-blue-600 font-normal">/customer</span>
          </Link>
          <Link
            to="/dealer"
            onClick={onClose}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-700 transition"
          >
            <span>Dealer Dashboard (B2B)</span>
            <span className="text-[10px] text-indigo-600 font-normal">/dealer</span>
          </Link>
          <Link
            to="/plumber"
            onClick={onClose}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition"
          >
            <span>Plumber Dashboard</span>
            <span className="text-[10px] text-emerald-600 font-normal">/plumber</span>
          </Link>
          <Link
            to="/admin"
            onClick={onClose}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 hover:text-slate-900 transition"
          >
            <span className="font-bold">Admin Portal</span>
            <span className="text-[10px] text-purple-600 font-mono font-medium">/admin</span>
          </Link>
        </div>

        {currentUser ? (
          <button
            onClick={() => { onLogout(); onClose(); }}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition"
          >
            Sign Out of Account
          </button>
        ) : (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <Link
              to="/login"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold block text-center transition"
            >
              Sign In to Account
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold block text-center transition"
            >
              Create New Account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
