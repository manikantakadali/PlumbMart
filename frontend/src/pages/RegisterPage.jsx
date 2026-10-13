import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplets, User, Phone, Mail, MapPin, ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';

export default function RegisterPage({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    role: 'Customer',
    city: 'Bengaluru'
  });
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.mobile || formData.mobile.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: formData.mobile.trim(),
          email: formData.email.trim(),
          role: formData.role,
          city: formData.city
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      const registeredUser = data.user;
      if (onRegisterSuccess) {
        onRegisterSuccess(registeredUser);
      }

      if (registeredUser.role === 'Dealer') {
        navigate('/dealer');
      } else if (registeredUser.role === 'Plumber') {
        navigate('/plumber');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      const fallbackUser = {
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim() || `${formData.role.toLowerCase()}@plumbmart-demo.com`,
        role: formData.role,
        city: formData.city,
        rewardPoints: 100
      };
      if (onRegisterSuccess) {
        onRegisterSuccess(fallbackUser);
      }
      if (formData.role === 'Dealer') {
        navigate('/dealer');
      } else if (formData.role === 'Plumber') {
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

      {/* Main Registration Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl">
          
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
            <p className="text-xs text-slate-500 mt-1">
              Join PlumbMart for wholesale catalog access, trade discounts &amp; fast site delivery
            </p>
          </div>

          {error && (
            <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name / Business Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Hardware Mart"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Type
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition font-medium"
                >
                  <option value="Customer">Customer</option>
                  <option value="Dealer">Dealer</option>
                  <option value="Plumber">Plumber</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Bengaluru, Hyderabad"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] mt-2"
            >
              Register Account &amp; Unlock Wholesale Rates
            </button>
          </form>

          {/* Switch to Login link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-bold hover:underline">
              Sign in to your account
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Instant Registration • Bonus 100 PlumbMart Reward Points</span>
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
