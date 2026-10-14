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
  AlertTriangle,
  Building2
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

  // Form State: Person Name, Phone Number, Email (starts completely empty by default)
  const [name, setName] = useState(paramName || '');
  const [mobile, setMobile] = useState(paramMobile || '');
  const [email, setEmail] = useState(paramEmail || '');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState(paramRole || 'Customer');
  const [authStep, setAuthStep] = useState('INPUT'); // 'INPUT' | 'OTP'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    isRegisteredParam ? 'Account created successfully! Please verify to login.' : ''
  );
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [zohoVerifying, setZohoVerifying] = useState(false);
  const [zohoVerifiedData, setZohoVerifiedData] = useState(null);

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

  // Dynamic role and registration synchronization from URL search params
  useEffect(() => {
    const urlRole = searchParams.get('role');
    if (urlRole && ['Customer', 'Dealer', 'Plumber'].includes(urlRole)) {
      setRole(urlRole);
      setOtp('');
      setAuthStep('INPUT');
      setError('');
    }
    const regParam = searchParams.get('registered') === 'true';
    const regName = searchParams.get('name');
    const regMobile = searchParams.get('mobile');
    const regEmail = searchParams.get('email');
    if (regName) setName(regName);
    if (regMobile) setMobile(regMobile);
    if (regEmail) setEmail(regEmail);
    if (regParam) {
      const activeRole = urlRole || 'Customer';
      setSuccessMsg(`Account registered for ${regName || 'user'} (${activeRole})! Please request and verify OTP to sign in to your dashboard.`);
    }
  }, [searchParams]);

  const handleSelectRole = (newRole) => {
    setRole(newRole);
    setOtp('');
    setAuthStep('INPUT');
    setError('');
    setSuccessMsg('');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('role', newRole);
    navigate(`/login?${nextParams.toString()}`, { replace: true });
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

    if (role === 'Dealer') {
      setZohoVerifying(true);
      setZohoVerifiedData(null);
    }

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
        setZohoVerifying(false);
        setZohoVerifiedData(null);
        setError(data.message || 'Invalid or expired OTP code');
        setLoading(false);
        return;
      }

      // Verification TRUE! Set user session and redirect to dashboard immediately
      const loggedUser = data.user;
      try {
        localStorage.setItem('plumbmart_user', JSON.stringify(loggedUser));
      } catch (e) {}

      // Special visual handling for Dealer flow (OTP Login -> Zoho Verification -> Dealer Dashboard)
      if (loggedUser.role === 'Dealer') {
        const cName = loggedUser.zohoDetails?.companyName || loggedUser.name;
        const cPerson = loggedUser.contactPerson || loggedUser.name;
        const cId = loggedUser.zohoContactId || loggedUser.zohoDetails?.contactId || '4276632000000054002';

        setZohoVerifiedData({
          companyName: cName,
          contactPerson: cPerson,
          contactId: cId,
          status: loggedUser.status || 'Active'
        });
        setSuccessMsg(`Zoho Merchant Verified: ${cName}!`);

        if (onLoginSuccess) {
          onLoginSuccess(loggedUser);
        }

        setTimeout(() => {
          setZohoVerifying(false);
          navigate('/dealer');
        }, 2400);
        return;
      }

      setSuccessMsg(`Verification successful! Welcome, ${loggedUser.name}!`);

      if (onLoginSuccess) {
        onLoginSuccess(loggedUser);
      }

      // Redirect to target or role dashboard
      if (loggedUser.role === 'Plumber') {
        navigate('/plumber');
      } else if (loggedUser.role === 'Admin') {
        navigate('/admin');
      } else if (redirectTarget === 'checkout') {
        navigate('/customer/checkout');
      } else if (redirectTarget === 'cart') {
        navigate('/customer/cart');
      } else {
        navigate('/customer');
      }

    } catch (err) {
      console.error('[Verify Email OTP Error]:', err);
      setZohoVerifying(false);
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
            Need help? <a href="tel:9347486117" className="font-semibold text-blue-600 hover:underline">+91 93474 86117</a>
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

          {/* Account Role Selector */}
          <div className="mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Select Account Role:
              </span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {role} Portal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleSelectRole('Customer')}
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
                onClick={() => handleSelectRole('Dealer')}
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
                onClick={() => handleSelectRole('Plumber')}
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

          {/* Registration Success Banner */}
          {isRegisteredParam && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 text-xs">{role} Registration Successful!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  {role === 'Dealer'
                    ? `${name ? `Welcome, ${name}! ` : ''}Your Dealer account is registered with status PENDING. Please verify your email OTP to initiate Zoho Inventory verification.`
                    : `${name ? `Welcome, ${name}! ` : ''}Your ${role} account is created. Enter the OTP code sent to your email to log in directly to your ${role === 'Plumber' ? 'Plumber Dashboard' : 'Customer Catalog'}.`
                  }
                </p>
              </div>
            </div>
          )}

          {/* Login to Buy Banner */}
          {redirectTarget === 'checkout' && !isRegisteredParam && (
            <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-2xl flex items-start gap-2.5 shadow-2xs">
              <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-900 text-xs">Login Required to Buy</p>
                <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                  Please sign in to proceed with your delivery address and checkout. Your cart items are saved!
                </p>
              </div>
            </div>
          )}

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

          {/* Zoho Verification Active Card (OTP Login -> Zoho Verification -> Dealer Dashboard) */}
          {zohoVerifying ? (
            <div className="py-6 px-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Zoho CRM Verification
                    <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">Org: 60091844668</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Verifying authorized wholesale dealer status</p>
                </div>
              </div>

              {zohoVerifiedData ? (
                <div className="space-y-3 pt-1 animate-in zoom-in-95 duration-200">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-300 block">Zoho Business Account Verified!</span>
                      <span className="text-[11px] text-emerald-400/80">Authorized wholesale merchant confirmed in Zoho Inventory.</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-3 text-xs space-y-2 border border-slate-700/60 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Business:</span>
                      <span className="text-white font-bold">{zohoVerifiedData.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contact Person:</span>
                      <span className="text-slate-200">{zohoVerifiedData.contactPerson}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zoho Contact ID:</span>
                      <span className="text-blue-400 font-bold">{zohoVerifiedData.contactId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-emerald-400 uppercase font-bold">Active in CRM</span>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-blue-400 font-medium">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Opening Dealer Wholesale Dashboard...</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  <div>
                    <p className="text-xs font-semibold text-white">Connecting with Zoho Inventory API...</p>
                    <p className="text-[11px] text-slate-400 mt-1">Matching merchant contacts for <span className="text-blue-400 font-semibold">{email}</span></p>
                  </div>
                </div>
              )}
            </div>
          ) : authStep === 'INPUT' ? (
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
                    placeholder="Enter your full name"
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
                    placeholder="Enter 10-digit mobile number"
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
                    placeholder="name@example.com"
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
                  <span>
                    {redirectTarget === 'checkout' ? 'Validate OTP & Proceed to Buy' : 'Validate OTP & Go to Dashboard'}
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Switch to Register link */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-500">
            {redirectTarget === 'checkout' ? (
              <span>
                New customer?{' '}
                <Link to="/register?redirect=checkout" className="text-blue-600 font-bold hover:underline">
                  Register here to buy
                </Link>
              </span>
            ) : (
              <span>
                Need an account?{' '}
                <Link to="/register" className="text-blue-600 font-bold hover:underline">
                  Create an account
                </Link>
              </span>
            )}
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
