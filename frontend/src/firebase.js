import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Your web app's Firebase configuration from Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyD8WIjaQo16bUdmxPPmMSqZBM5_8FxMIq0",
  authDomain: "plumbmart-88a18.firebaseapp.com",
  projectId: "plumbmart-88a18",
  storageBucket: "plumbmart-88a18.firebasestorage.app",
  messagingSenderId: "147005947212",
  appId: "1:147005947212:web:7701bd67aac07dc7d7e3e9",
  measurementId: "G-HPN9GWWKGC"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
auth.useDeviceLanguage();

/**
 * Setup Invisible reCAPTCHA verifier for phone authentication
 * @param {string} containerId DOM element ID (defaults to 'recaptcha-container')
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (typeof window === 'undefined') return null;

  try {
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved - allow signInWithPhoneNumber
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired, resetting...');
      }
    });

    return window.recaptchaVerifier;
  } catch (err) {
    console.error('Error initializing RecaptchaVerifier:', err);
    return null;
  }
}

/**
 * Send real SMS OTP to phone number using Firebase
 * @param {string} rawMobile 10-digit Indian mobile number
 * @param {string} containerId reCAPTCHA container DOM element ID
 */
export async function sendFirebaseOtp(rawMobile, containerId = 'recaptcha-container') {
  const cleanMobile = String(rawMobile).replace(/\D/g, '');
  if (cleanMobile.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  const formattedPhone = `+91${cleanMobile}`;
  const appVerifier = setupRecaptcha(containerId);

  if (!appVerifier) {
    throw new Error('reCAPTCHA verifier could not be initialized.');
  }

  const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
  window.confirmationResult = confirmationResult;
  return confirmationResult;
}

/**
 * Verify OTP entered by customer via Firebase
 * @param {string} otp 6-digit verification code
 */
export async function verifyFirebaseOtp(otp) {
  if (!window.confirmationResult) {
    throw new Error('No active SMS verification session found. Please click "Send OTP" first.');
  }

  const userCredential = await window.confirmationResult.confirm(otp);
  const user = userCredential.user;
  const idToken = await user.getIdToken();

  return {
    firebaseUser: user,
    idToken,
    phoneNumber: user.phoneNumber
  };
}

export {
  app,
  RecaptchaVerifier,
  signInWithPhoneNumber
};
