import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { zohoDealerService } from '../../services/zoho';

export default function DealerCheckout({
  cart = [],
  dealer,
  paymentMethod = 'UPFRONT',
  onChangePaymentMethod,
  shippingAddress = '',
  onChangeShippingAddress,
  error = '',
  isSubmitting = false,
  onPlaceOrder,
  onBackToCart
}) {
  const [eligibility, setEligibility] = useState(null);
  const [isLoadingEligibility, setIsLoadingEligibility] = useState(true);
  const [localError, setLocalError] = useState('');

  const total = cart.reduce(
    (sum, item) => sum + (item.product.price || item.product.dealerPrice || 0) * item.qty,
    0
  );
  const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);

  // Fetch live credit eligibility from backend API
  useEffect(() => {
    let isMounted = true;
    const loadEligibility = async () => {
      if (!dealer?.id) return;
      setIsLoadingEligibility(true);
      try {
        const res = await zohoDealerService.getCreditEligibility(dealer.id, total);
        if (isMounted) {
          setEligibility(res);
        }
      } catch (err) {
        console.error('Error loading credit eligibility:', err);
      } finally {
        if (isMounted) setIsLoadingEligibility(false);
      }
    };

    loadEligibility();
    return () => {
      isMounted = false;
    };
  }, [dealer?.id, total]);

  const availableCredit = eligibility
    ? eligibility.availableCredit
    : Math.max(0, (dealer?.creditLimit || 0) - (dealer?.creditUsed || 0));

  const credit30Option = eligibility?.options?.find((o) => o.id === 'CREDIT_30_DAYS');
  const credit90Option = eligibility?.options?.find((o) => o.id === 'CREDIT_90_DAYS');

  const isCredit30Allowed = eligibility ? eligibility.credit30Days : Boolean(dealer?.credit30DaysAllowed);
  const isCredit90Allowed = eligibility ? eligibility.credit90Days : Boolean(dealer?.credit90DaysAllowed);

  const is30DayExceeded = total > availableCredit;
  const is90DayExceeded = total > availableCredit;

  const due30Str = eligibility?.due30Date || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const due90Str = eligibility?.due90Date || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  const handleConfirm = () => {
    setLocalError('');
    if (!shippingAddress.trim()) {
      setLocalError('Please provide a delivery warehouse address for bulk dispatch.');
      return;
    }

    if (paymentMethod === 'CREDIT_30_DAYS') {
      if (!isCredit30Allowed) {
        setLocalError('30-Day Credit is not permitted for your dealership.');
        return;
      }
      if (total > availableCredit) {
        setLocalError(`Order total (₹${total.toLocaleString('en-IN')}) exceeds available credit (₹${availableCredit.toLocaleString('en-IN')}).`);
        return;
      }
    }

    if (paymentMethod === 'CREDIT_90_DAYS') {
      if (!isCredit90Allowed) {
        setLocalError('90-Day Credit is restricted to selected/approved Platinum dealers.');
        return;
      }
      if (total > availableCredit) {
        setLocalError(`Order total (₹${total.toLocaleString('en-IN')}) exceeds available credit (₹${availableCredit.toLocaleString('en-IN')}).`);
        return;
      }
    }

    onPlaceOrder();
  };

  const displayError = error || localError;

  return (
    <div className="space-y-4 py-2">
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-white">
          Dealer Bulk Checkout &amp; Credit Line
        </h2>
        <p className="text-xs text-slate-400">
          Revalidated against Zoho CRM, live Workbook stock &amp; Zoho Books ledger
        </p>
      </div>

      {displayError && (
        <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{displayError}</span>
        </div>
      )}

      {/* Dealer Identity Verification Pill */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            {dealer?.name}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Zoho Verified ({dealer?.zohoContactId})
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          GSTIN: <span className="font-mono text-slate-300">{dealer?.gstin}</span> • City: <span className="text-slate-300">{dealer?.city}</span>
        </div>
      </div>

      {/* Warehouse Destination */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
        <label className="block text-xs font-bold text-slate-300">
          Delivery Warehouse / Destination Premise
        </label>
        <textarea
          rows={2}
          value={shippingAddress}
          onChange={(e) => onChangeShippingAddress(e.target.value)}
          placeholder="Enter dealer warehouse address or site location..."
          className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-amber-500 focus:outline-none"
        />
      </div>

      {/* Credit Balance Card */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
        <div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-amber-400" /> Available Zoho Books Credit
          </div>
          <div className="text-sm font-black font-mono text-emerald-400">
            ₹{availableCredit.toLocaleString('en-IN')}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-400">Wholesale Total ({totalUnits} Units)</div>
          <div className="text-sm font-black font-mono text-amber-400">
            ₹{total.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Credit Limit Alert if Exceeded */}
      {total > availableCredit && (
        <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Wholesale order total (₹{total.toLocaleString('en-IN')}) exceeds available credit limit (₹{availableCredit.toLocaleString('en-IN')}). Credit options are locked for this order amount.
          </span>
        </div>
      )}

      {/* 3 Payment Options (Strictly governed by Backend Zoho Rules) */}
      <div className="space-y-2.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
          Dealer Payment Options (Dynamically Determined)
        </label>

        {/* Option 1: Upfront Payment */}
        <button
          type="button"
          onClick={() => onChangePaymentMethod('UPFRONT')}
          className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
            paymentMethod === 'UPFRONT'
              ? 'bg-emerald-950/60 border-emerald-500 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">1. Upfront Payment</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Available
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Immediate online corporate settlement via RTGS / NEFT / NetBanking.
            </p>
          </div>
          <CheckCircle2
            className={`w-4 h-4 shrink-0 mt-0.5 ${
              paymentMethod === 'UPFRONT' ? 'text-emerald-400' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Option 2: Credit Payment – 30 Days */}
        <button
          type="button"
          disabled={!isCredit30Allowed || is30DayExceeded}
          onClick={() => onChangePaymentMethod('CREDIT_30_DAYS')}
          className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
            !isCredit30Allowed || is30DayExceeded
              ? 'bg-slate-950/40 border-slate-800 opacity-60 cursor-not-allowed text-slate-500'
              : paymentMethod === 'CREDIT_30_DAYS'
              ? 'bg-amber-950/60 border-amber-500 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">2. Credit Payment – 30 Days</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  !isCredit30Allowed
                    ? 'bg-slate-800 text-slate-500'
                    : is30DayExceeded
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {!isCredit30Allowed
                  ? 'Locked by Admin'
                  : is30DayExceeded
                  ? 'Exceeds Credit Limit'
                  : 'Eligible'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Zoho Books 30-Day net credit line. Payment due on{' '}
              <strong className="text-amber-300 font-mono">{due30Str}</strong>.
            </p>
          </div>
          {isCredit30Allowed && !is30DayExceeded ? (
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                paymentMethod === 'CREDIT_30_DAYS' ? 'text-amber-400' : 'text-slate-600'
              }`}
            />
          ) : (
            <Lock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          )}
        </button>

        {/* Option 3: Credit Payment – 90 Days (ONLY for Selected / Approved Platinum Dealers) */}
        <button
          type="button"
          disabled={!isCredit90Allowed || is90DayExceeded}
          onClick={() => onChangePaymentMethod('CREDIT_90_DAYS')}
          className={`w-full p-3.5 rounded-2xl border text-left transition flex items-start justify-between ${
            !isCredit90Allowed || is90DayExceeded
              ? 'bg-slate-950/40 border-rose-500/20 opacity-75 cursor-not-allowed text-slate-400'
              : paymentMethod === 'CREDIT_90_DAYS'
              ? 'bg-purple-950/60 border-purple-500 text-white shadow'
              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold flex items-center gap-1.5">
                3. Credit Payment – 90 Days
              </span>
              {isCredit90Allowed ? (
                <span className="px-2 py-0.5 rounded bg-purple-500/25 text-purple-300 text-[10px] font-bold border border-purple-500/40">
                  {is90DayExceeded ? 'Exceeds Limit' : '★ Approved Platinum Dealer'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold flex items-center gap-1 border border-rose-500/30">
                  <Lock className="w-3 h-3" /> Not Approved
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Available <strong>ONLY for selected/approved dealers</strong>. Payment due on{' '}
              <strong className="text-purple-300 font-mono">{due90Str}</strong>.
            </p>
          </div>
          {isCredit90Allowed && !is90DayExceeded ? (
            <CheckCircle2
              className={`w-4 h-4 shrink-0 mt-0.5 ${
                paymentMethod === 'CREDIT_90_DAYS' ? 'text-purple-400' : 'text-slate-600'
              }`}
            />
          ) : (
            <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
        </button>
      </div>

      {/* Confirmation & Return to Cart */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition disabled:opacity-60"
        >
          <span>
            {isSubmitting
              ? 'Verifying Stock & Creating Order...'
              : `Confirm Dealer Order (${paymentMethod.replace(/_/g, ' ')})`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onBackToCart}
          className="w-full text-center text-xs text-slate-400 hover:text-white"
        >
          ← Return to Bulk Cart
        </button>
      </div>
    </div>
  );
}
