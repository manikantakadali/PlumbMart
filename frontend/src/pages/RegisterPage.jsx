import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Droplets, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle2, 
  Lock, 
  Loader2, 
  RotateCw 
} from 'lucide-react';
import { 
  sendFirebaseOtp, 
  verifyFirebaseOtp, 
  cleanMobileNumber, 
  getFirebaseErrorMessage 
} from '../firebase';

export default function RegisterPage({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect'); // e.g. 'checkout'
  const { verifiedMobile, idToken: stateIdToken } = location.state || {};

  const urlRole = searchParams.get('role');
  const validRoles = ['Customer', 'Dealer', 'Plumber'];
  const initialRole = validRoles.includes(urlRole) ? urlRole : 'Customer';

  const [formData, setFormData] = useState({
    name: '',
    mobile: verifiedMobile || '',
    email: '',
    role: initialRole,
    city: 'Bengaluru'
  });

  const [idToken, setIdToken] = useState(stateIdToken || null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(Boolean(verifiedMobile));
  const [otpStepActive, setOtpStepActive] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    verifiedMobile ? `Mobile number +91 ${verifiedMobile} verified! Please complete your profile.` : ''
  );
  const [loading, setLoading] = useState(false);

  // Resend cooldown timer
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

  // Send Email OTP for registration verification
  const handleSendRegisterOtp = async () => {
    const clean = cleanMobileNumber(formData.mobile);
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!clean || clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number to verify');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address to receive your verification code');
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
          name: formData.name.trim(),
          mobile: clean,
          email: formData.email.trim().toLowerCase(),
          role: formData.role
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to dispatch verification code to email');
        setLoading(false);
        return;
      }

      setOtpStepActive(true);
      setResendCooldown(30);
      setOtpCode('');
      setSuccessMsg(`Verification code sent to ${data.email}. Please check your inbox.`);
    } catch (err) {
      console.error('[Registration Send OTP Error]:', err);
      setError('Network error while dispatching verification email.');
    } finally {
      setLoading(false);
    }
  };

  // Verify the Email OTP on registration page
  const handleVerifyRegisterOtp = async () => {
    if (!otpCode || otpCode.trim().length < 6) {
      setError('Please enter the 6-digit OTP code received on email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clean = cleanMobileNumber(formData.mobile);
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          otp: otpCode.trim(),
          name: formData.name.trim(),
          mobile: clean,
          role: formData.role,
          isRegistration: true
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Invalid or expired OTP code');
        setLoading(false);
        return;
      }

      setIsPhoneVerified(true);
      setOtpStepActive(false);
      const roleName = formData.role;
      setSuccessMsg(
        roleName === 'Dealer'
          ? `Email verified! Dealer registration saved with status PENDING. Redirecting to Login...`
          : `Email verified! ${roleName} account created for ${data.user.name}. Redirecting to Login...`
      );

      const queryParams = new URLSearchParams({
        registered: 'true',
        mobile: clean,
        name: data.user.name || formData.name.trim(),
        email: formData.email.trim(),
        role: roleName
      });
      if (redirectTarget) {
        queryParams.set('redirect', redirectTarget);
      }

      setTimeout(() => {
        navigate(`/login?${queryParams.toString()}`);
      }, 900);

    } catch (err) {
      console.error('[Verify OTP Error]:', err);
      setError('Verification failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };


  // Submit complete customer, dealer, or plumber profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name or business name');
      return;
    }

    const clean = cleanMobileNumber(formData.mobile);
    if (!clean || clean.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!['Customer', 'Dealer', 'Plumber'].includes(formData.role)) {
      setError('Only Customer, Dealer, and Plumber accounts are eligible to register.');
      return;
    }

    // Require email verification via 6-digit OTP code before creating profile
    if (!isPhoneVerified) {
      setError('Please verify your email via 6-digit OTP code to complete registration.');
      handleSendRegisterOtp();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          mobile: clean,
          email: formData.email.trim(),
          role: formData.role,
          city: formData.city.trim(),
          idToken
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || 'Registration failed. Mobile may already be registered.');
        setLoading(false);
        return;
      }

      const registeredUser = data.user;
      setSuccessMsg(
        formData.role === 'Dealer'
          ? `Dealer registration submitted with status PENDING! Redirecting to Login...`
          : `${formData.role} account created for ${registeredUser.name}! Redirecting to Login...`
      );

      const queryParams = new URLSearchParams({
        registered: 'true',
        mobile: clean,
        name: registeredUser.name || formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role
      });
      if (redirectTarget) {
        queryParams.set('redirect', redirectTarget);
      }

      setTimeout(() => {
        navigate(`/login?${queryParams.toString()}`);
      }, 900);
    } catch (err) {
      setError(err.message || 'Connection error. Please try again.');
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
            Need help? <a href="tel:9347486117" className="font-semibold text-blue-600 hover:underline">+91 93474 86117</a>
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
              {isPhoneVerified 
                ? 'Email verified! Please fill in your name and details to finish setup' 
                : 'Join PlumbMart with Email OTP verification for wholesale catalog access'}
            </p>
          </div>

          {/* Invisible container for Firebase reCAPTCHA */}
          <div id="register-recaptcha-container"></div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in duration-200">
              {error}
            </div>
          )}

          {/* Checkout Banner for New Customers */}
          {redirectTarget === 'checkout' && (
            <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-2xs">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-xs">New Customer Registration</p>
                <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                  Register your account to buy. Once registered, you will log in to complete checkout with your saved cart items!
                </p>
              </div>
            </div>
          )}

          {/* Success / Status Banner */}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name / Business Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoFocus={isPhoneVerified}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Hardware Mart / Rahul Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>Mobile Number *</span>
                  {isPhoneVerified && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 focus-within:bg-white transition">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-200 select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    disabled={isPhoneVerified}
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="9876543210"
                    className={`w-full px-3 py-2.5 bg-transparent text-sm text-slate-900 focus:outline-none font-medium ${
                      isPhoneVerified ? 'cursor-not-allowed opacity-80' : ''
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>Email Address *</span>
                  {isPhoneVerified && (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* OTP Verification Prompt */}
            {!isPhoneVerified && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900">Email Verification Required ({formData.role})</span>
                  {!otpStepActive ? (
                    <button
                      type="button"
                      onClick={handleSendRegisterOtp}
                      disabled={loading || formData.mobile.length !== 10 || !formData.email}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] transition disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send OTP to Email'}
                    </button>
                  ) : null}
                </div>

                {otpStepActive && (
                  <div className="space-y-2 pt-1 border-t border-amber-200">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter 6-digit OTP"
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyRegisterOtp}
                        disabled={loading || otpCode.length < 6}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-amber-800">
                      <span>Didn&apos;t receive code?</span>
                      <button
                        type="button"
                        onClick={handleSendRegisterOtp}
                        disabled={resendCooldown > 0 || loading}
                        className="font-bold underline disabled:opacity-50"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Account Type</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {formData.role}
                  </span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    if (['Customer', 'Dealer', 'Plumber'].includes(chosen)) {
                      setFormData({ ...formData, role: chosen });
                      setIsPhoneVerified(false);
                      setOtpStepActive(false);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition font-medium"
                >
                  <option value="Customer">Customer (Retail Buyer)</option>
                  <option value="Dealer">Dealer (B2B Wholesale & Credit)</option>
                  <option value="Plumber">Plumber (Contractor Rewards)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  {formData.role === 'Dealer' && 'B2B wholesale pricing, credit approval & live stock tracking.'}
                  {formData.role === 'Plumber' && 'Loyalty points, cashback rewards & technician discounts.'}
                  {formData.role === 'Customer' && 'Retail plumbing catalog, quick checkout & doorstep delivery.'}
                </p>
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
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering {formData.role} Account...</span>
                </>
              ) : (
                <span>Register {formData.role} Account &amp; Proceed to Login</span>
              )}
            </button>
          </form>

          {/* Switch to Login link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link 
              to={redirectTarget ? `/login?redirect=${redirectTarget}&role=${formData.role}` : `/login?role=${formData.role}`} 
              className="text-emerald-700 font-bold hover:underline"
            >
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
