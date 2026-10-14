import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

// Firebase Web Configuration using environment variables with project plumbmart-88a18 defaults
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD8WIjaQo16bUdmxPPmMSqZBM5_8FxMIq0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "plumbmart-88a18.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "plumbmart-88a18",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "plumbmart-88a18.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "147005947212",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:147005947212:web:7701bd67aac07dc7d7e3e9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HPN9GWWKGC"
};

// Singleton App Initialization - avoids duplicate Firebase initialization
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
try {
  auth.useDeviceLanguage();
} catch (e) {
  // Ignore in SSR/test environments
}

/**
 * Setup Invisible reCAPTCHA verifier for phone authentication
 * @param {string} containerId DOM element ID (defaults to 'recaptcha-container')
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  try {
    // Clear existing verifier if any to prevent stale widget errors
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (err) {
        console.warn('[Firebase] Warning clearing existing recaptchaVerifier:', err);
      }
      window.recaptchaVerifier = null;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[Firebase] reCAPTCHA container #${containerId} not found in DOM.`);
      return null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        console.warn('[Firebase] reCAPTCHA expired, resetting verifier...');
      }
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error('[Firebase] Error initializing RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Clean 10-digit mobile number helper
 * @param {string} rawMobile 
 * @returns {string} 10-digit cleaned mobile
 */
export function cleanMobileNumber(rawMobile) {
  return String(rawMobile || '').replace(/\D/g, '').slice(-10);
}

/**
 * Send real SMS OTP to phone number using Firebase Phone Authentication
 * @param {string} rawMobile 10-digit Indian mobile number
 * @param {string} containerId reCAPTCHA container DOM element ID
 * @param {string} countryCode Country prefix (e.g. '+91' or '+1')
 */
export async function sendFirebaseOtp(rawMobile, containerId = 'recaptcha-container', countryCode = '+91') {
  const clean = cleanMobileNumber(rawMobile);
  if (clean.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  const prefix = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  const formattedPhone = `${prefix}${clean}`;
  const appVerifier = setupRecaptcha(containerId);

  if (!appVerifier) {
    throw new Error('Security verification (reCAPTCHA) container could not be initialized. Please refresh.');
  }

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (error) {
    // If reCAPTCHA fails, clear it so next attempt starts fresh
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }
    throw error;
  }
}

/**
 * Verify OTP entered by customer via Firebase confirmationResult
 * @param {string} otp 6-digit verification code
 */
export async function verifyFirebaseOtp(otp) {
  if (!window.confirmationResult) {
    throw new Error('No active SMS verification session found. Please request an OTP first.');
  }

  const cleanOtp = String(otp || '').trim();
  if (!cleanOtp || cleanOtp.length < 6) {
    throw new Error('Please enter a valid 6-digit verification code.');
  }

  const userCredential = await window.confirmationResult.confirm(cleanOtp);
  const user = userCredential.user;
  const idToken = await user.getIdToken();

  return {
    firebaseUser: user,
    idToken,
    phoneNumber: user.phoneNumber
  };
}

/**
 * Human-friendly error translation for Firebase phone authentication
 * @param {Error|object} error 
 * @returns {string} Readable error message
 */
export function getFirebaseErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  const code = error.code || '';
  const message = error.message || '';

  switch (code) {
    case 'auth/billing-not-enabled':
      return 'Firebase Free (Spark) plan does not permit sending real SMS to non-test numbers. Please add your phone number under "Phone numbers for testing" in Firebase Console (e.g. +91 9876543210 -> 123456) or upgrade to the Blaze plan.';
    case 'auth/invalid-phone-number':
      return 'The mobile number format is invalid. Please enter a valid 10-digit number.';
    case 'auth/missing-phone-number':
      return 'Mobile number is required.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for today. Please contact support or try a registered test number.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a couple of minutes before requesting a new OTP.';
    case 'auth/invalid-verification-code':
      return 'Incorrect OTP code entered. Please check your SMS and try again.';
    case 'auth/code-expired':
      return 'The OTP code has expired. Please click "Resend OTP" to request a new code.';
    case 'auth/captcha-check-failed':
      return 'reCAPTCHA security verification failed. Please refresh the page and try again.';
    case 'auth/network-request-failed':
      return 'Network connection issue. Please check your internet connectivity.';
    case 'auth/app-not-authorized':
      return 'This domain is not authorized in Firebase Console. Please add localhost to Authorized Domains.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact PlumbMart support.';
    default:
      return message || 'Authentication failed. Please verify your number and try again.';
  }
}

