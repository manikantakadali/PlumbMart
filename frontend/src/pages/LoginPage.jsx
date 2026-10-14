import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Droplets, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  RotateCw, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { cleanMobileNumber } from '../firebase';

export default function LoginPage({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTarget = searchParams.get('redirect'); // 'checkout' or null
  const isRegisteredParam = searchParams.get('registered') === 'true';
  const paramMobile = searchParams.get('mobile') || '';
  const paramName = searchParams.get('name') || '';
  const paramEmail = searchParams.get('email') || '';
  const paramRole = searchParams.get('role') || '';

  // Form State: Person Name, Phone Number, Email
  const [name, setName] = useState(paramName || 'Rahul Sharma');
  const [mobile, setMobile] = useState(paramMobile || '9876543210');
  const [email, setEmail] = useState(paramEmail || (paramMobile ? `user_${paramMobile}@example.com` : 'rahul.sharma@example.com'));
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState(paramRole || 'Customer');
  const [authStep, setAuthStep] = useState('INPUT'); // 'INPUT' | 'OTP'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    isRegisteredParam ? 'Account created successfully! Please verify to login.' : ''
  );
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const setDemoAccount = (demoName, demoMobile, demoEmail, demoRole) => {
    setName(demoName);
    setMobile(demoMobile);
    setEmail(demoEmail);
    setRole(demoRole);
    setOtp('');
    setAuthStep('INPUT');
    setError('');
    setSuccessMsg('');
  };

  // Step 1: Submit Person Name, Phone, and Email to receive Email OTP
  const handleSendEmailOtp = async (e) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    const cleanPhone = cleanMobileNumber(mobile);
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanPhone,
          email: email.trim().toLowerCase(),
          role
        })
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (e) {
        data = { success: false, message: 'Unable to communicate with authentication server.' };
      }

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to dispatch verification code to email');
        setLoading(false);
        return;
      }

      setAuthStep('OTP');
      setResendCooldown(30);
      setOtp('');
      setSuccessMsg(`Verification code sent to ${data.email}. Please check your inbox.`);
    } catch (err) {
      console.error('[Send Email OTP Error]:', err);
      setError(err.message || 'Network error while sending verification email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend Email OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          mobile: cleanMobileNumber(mobile),
          email: email.trim().toLowerCase(),
          role
        })
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (e) {
        data = { success: false, message: 'Failed to parse response.' };
      }

      if (data.success) {
        setResendCooldown(30);
        setOtp('');
        setSuccessMsg(`A fresh verification code was sent to ${data.email}. Please check your inbox.`);
      } else {
        setError(data.message || 'Failed to resend code.');
      }
    } catch (err) {
      setError('Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Validate Email OTP and Redirect to Dashboard
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = String(otp || '').trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the 6-digit OTP received on your email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
          name: name.trim(),
          mobile: cleanMobileNumber(mobile),
          role
        })
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch (e) {
        data = { success: false, message: 'Server communication error. Please try again.' };
      }

      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid or expired OTP code');
        setLoading(false);
        return;
      }

      // Verification TRUE! Set user session and redirect to dashboard immediately
      const loggedUser = data.user;
      try {
        localStorage.setItem('plumbmart_user', JSON.stringify(loggedUser));
      } catch (e) {}

      setSuccessMsg(`Verification successful! Welcome, ${loggedUser.name}!`);

      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }

      // Redirect to target or role dashboard
      if (redirectTarget === 'checkout') {
        navigate('/customer/checkout');
      } else if (redirectTarget === 'cart') {
        navigate('/customer/cart');
      } else if (loggedUser.role === 'Dealer') {
        navigate('/dealer');
      } else if (loggedUser.role === 'Plumber') {
        navigate('/plumber');
      } else {
        navigate('/customer');
      }

    } catch (err) {
      console.error('[Verify Email OTP Error]:', err);
      setError(err.message || 'Verification connection failed.');
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
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email OTP Verification</h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your name, phone and email to receive a secure login code
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
                onClick={() => setDemoAccount('Rahul Sharma', '9876543210', 'rahul.sharma@example.com', 'Customer')}
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
                onClick={() => setDemoAccount('Sri Venkateswara Traders', '9000011111', 'dealer@plumbmart-demo.com', 'Dealer')}
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
                onClick={() => setDemoAccount('Ramesh Kumar', '9111122222', 'plumber@plumbmart-demo.com', 'Plumber')}
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

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in duration-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Person Name, Phone Number, and Email Input */}
          {authStep === 'INPUT' ? (
            <form onSubmit={handleSendEmailOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Person Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number *
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white transition">
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 bg-transparent text-sm text-slate-900 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  We will send a 6-digit OTP code to this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP to Email...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Send OTP to Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: Enter & Validate Email OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{name}</span>
                  <button
                    type="button"
                    onClick={() => { setAuthStep('INPUT'); setOtp(''); setError(''); setSuccessMsg(''); setDevOtpHint(''); }}
                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 underline"
                  >
                    Edit Details
                  </button>
                </div>
                <div className="text-[11px] text-slate-600">
                  Phone: <span className="font-mono font-medium text-slate-900">+91 {mobile}</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium">
                  OTP sent to: <span className="font-bold text-blue-950 underline">{email}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>Enter 6-Digit Email OTP</span>
                  <span className="text-[11px] text-blue-600 font-normal">Check your inbox</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition text-center"
                  />
                </div>
              </div>

              {/* Resend OTP button with countdown timer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Didn&apos;t receive email?</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className={`font-semibold flex items-center gap-1 transition ${
                    resendCooldown > 0 || loading
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-800 hover:underline'
                  }`}
                >
                  <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-blue-600/25 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validating OTP...</span>
                  </>
                ) : (
                  <span>Validate OTP &amp; Go to Dashboard</span>
                )}
              </button>
            </form>
          )}

          {/* Switch to Register link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            Need a contractor account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Create an account
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Email OTP Verification &bull; Encrypted Session</span>
          </div>

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        &copy; 2026 PlumbMart Technologies Pvt. Ltd. All rights reserved.
      </footer>
    </div>
  );
}
