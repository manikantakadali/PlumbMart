import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Phone, Lock, Sparkles, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [role, setRole] = useState('Customer');
  const [error, setError] = useState('');

  const setDemoAccount = (demoMobile, demoRole) => {
    setMobile(demoMobile);
    setRole(demoRole);
    setOtp('123456');
    setError('');
  };

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim(),
          password: otp || '123456'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      const loggedUser = data.user;
      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }

      if (loggedUser.role === 'Dealer') {
        navigate('/dealer');
      } else if (loggedUser.role === 'Plumber') {
        navigate('/plumber');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      const fallbackUser = {
        name: role === 'Dealer' 
          ? 'Sri Venkateswara Traders' 
          : role === 'Plumber' 
          ? 'Ramesh Kumar (Plumber)' 
          : 'Rahul Sharma',
        mobile: mobile.trim(),
        email: `${role.toLowerCase()}@plumbmart-demo.com`,
        role: role,
        rewardPoints: 240
      };
      if (onLoginSuccess) {
        onLoginSuccess(fallbackUser);
      }
      if (role === 'Dealer') {
        navigate('/dealer');
      } else if (role === 'Plumber') {
        navigate('/plumber');
      } else {
        navigate('/customer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      
      {/* Top Header Navigation */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white shadow-sm">
              <Droplets className="w-4.5 h-4.5" />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900">
              Plumb<span className="text-blue-600">Mart</span>
            </span>
          </Link>

          <div className="text-xs text-slate-500 hidden sm:block">
            Need help? <span className="font-semibold text-blue-600">+91 98765 43210</span>
          </div>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Droplets className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Login</h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage plumbing orders, contractor credits &amp; tracking
            </p>
          </div>

          {/* Quick Demo Test Accounts Box */}
          <div className="mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Demo Account:</span>
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setDemoAccount('9876543210', 'Customer')}
                className={`py-2 px-1 rounded-xl border text-center transition font-semibold ${
                  role === 'Customer'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('9000011111', 'Dealer')}
                className={`py-2 px-1 rounded-xl border text-center transition font-semibold ${
                  role === 'Dealer'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Dealer
              </button>
              <button
                type="button"
                onClick={() => setDemoAccount('9111122222', 'Plumber')}
                className={`py-2 px-1 rounded-xl border text-center transition font-semibold ${
                  role === 'Plumber'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Plumber
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>


            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                <span>OTP / Password</span>
                <span className="text-[11px] text-blue-600 font-normal">Demo OTP: 123456</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP (123456)"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98] mt-2"
            >
              Sign In to PlumbMart
            </button>
          </form>

          {/* Switch to Register link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure 256-bit Encrypted Session</span>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2026 PlumbMart Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
