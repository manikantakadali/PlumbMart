/**
 * Authentication and Session Management Utility for PlumbMart
 * Ensures robust storage, retrieval, and complete purging of tokens and session data.
 */

export const AUTH_KEYS = {
  USER: 'plumbmart_user',
  TOKEN: 'plumbmart_token',
  LEGACY_TOKEN: 'token',
  AUTH_TOKEN: 'authToken',
  SESSION_TOKEN: 'sessionToken',
  PLUMBMART_SESSION: 'plumbmart_session',
  WELCOME_BACK_SHOW: 'plumbmart_show_welcome_back',
  WELCOME_BACK_DATA: 'plumbmart_dealer_welcome_back',
  LOGOUT_BROADCAST: 'plumbmart_auth_logout_broadcast',
  LAST_ACTIVITY: 'plumbmart_auth_last_activity',
  LOGIN_TIME: 'plumbmart_auth_login_time',
};

// Inactivity timeout configuration
export const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes for normal users
export const ADMIN_INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes for Admin

let lastThrottledRecord = 0;

/**
 * Records user activity timestamp (throttled to once every 4 seconds)
 */
export function recordUserActivity() {
  const now = Date.now();
  if (now - lastThrottledRecord < 4000) return;
  lastThrottledRecord = now;
  try {
    localStorage.setItem(AUTH_KEYS.LAST_ACTIVITY, now.toString());
  } catch {}
}

/**
 * Checks if the current authenticated session has exceeded inactivity timeout
 */
export function isSessionExpired() {
  try {
    const userStr = localStorage.getItem(AUTH_KEYS.USER) || sessionStorage.getItem(AUTH_KEYS.USER);
    if (!userStr) return false;

    const user = JSON.parse(userStr);
    const lastActivityStr = localStorage.getItem(AUTH_KEYS.LAST_ACTIVITY);
    if (!lastActivityStr) return false;

    const lastActivity = parseInt(lastActivityStr, 10);
    if (isNaN(lastActivity)) return false;

    const timeout = user.role === 'Admin' ? ADMIN_INACTIVITY_TIMEOUT_MS : INACTIVITY_TIMEOUT_MS;
    return (Date.now() - lastActivity) > timeout;
  } catch {
    return false;
  }
}

/**
 * Checks and automatically purges expired sessions
 */
export function checkAndPurgeExpiredSession() {
  if (isSessionExpired()) {
    clearAuthSession();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('plumbmart_session_expired', {
        detail: { message: 'Session expired due to inactivity. Signed out for your security.' }
      }));
    }
    return true;
  }
  return false;
}

/**
 * Persists user and authentication token to both localStorage and sessionStorage
 */
export function setAuthSession(user, token = null) {
  if (!user) return;
  const resolvedToken = token || user.token || `plumbmart-session-${user.id || user.mobile || 'user'}-${Date.now()}`;
  const now = Date.now().toString();
  
  try {
    const userStr = JSON.stringify(user);
    localStorage.setItem(AUTH_KEYS.USER, userStr);
    sessionStorage.setItem(AUTH_KEYS.USER, userStr);
    localStorage.setItem(AUTH_KEYS.LAST_ACTIVITY, now);
    localStorage.setItem(AUTH_KEYS.LOGIN_TIME, now);

    if (resolvedToken) {
      localStorage.setItem(AUTH_KEYS.TOKEN, resolvedToken);
      localStorage.setItem(AUTH_KEYS.LEGACY_TOKEN, resolvedToken);
      localStorage.setItem(AUTH_KEYS.AUTH_TOKEN, resolvedToken);
      sessionStorage.setItem(AUTH_KEYS.TOKEN, resolvedToken);
      sessionStorage.setItem(AUTH_KEYS.LEGACY_TOKEN, resolvedToken);
      sessionStorage.setItem(AUTH_KEYS.AUTH_TOKEN, resolvedToken);
      sessionStorage.setItem(AUTH_KEYS.PLUMBMART_SESSION, resolvedToken);
    }
  } catch (err) {
    console.warn('[authSession] Error saving auth session:', err);
  }
}

/**
 * Retrieves the currently authenticated user from localStorage or sessionStorage
 */
export function getStoredUser() {
  try {
    if (checkAndPurgeExpiredSession()) {
      return null;
    }
    const local = localStorage.getItem(AUTH_KEYS.USER);
    if (local) return JSON.parse(local);
    const session = sessionStorage.getItem(AUTH_KEYS.USER);
    if (session) return JSON.parse(session);
  } catch {
    // fallback
  }
  return null;
}

/**
 * Retrieves the current authentication token
 */
export function getStoredToken() {
  try {
    return (
      localStorage.getItem(AUTH_KEYS.TOKEN) ||
      sessionStorage.getItem(AUTH_KEYS.TOKEN) ||
      localStorage.getItem(AUTH_KEYS.LEGACY_TOKEN) ||
      sessionStorage.getItem(AUTH_KEYS.LEGACY_TOKEN) ||
      localStorage.getItem(AUTH_KEYS.AUTH_TOKEN) ||
      sessionStorage.getItem(AUTH_KEYS.AUTH_TOKEN) ||
      null
    );
  } catch {
    return null;
  }
}

/**
 * Completely purges all authentication tokens, credentials, and session caches from:
 * 1. localStorage (all auth tokens & session states)
 * 2. sessionStorage (all keys completely cleared)
 * 3. In-memory / JS cookies
 * 4. Multi-tab synchronization broadcast
 */
export function clearAuthSession() {
  try {
    // 1. Remove all token & user keys from localStorage
    const keysToRemove = [
      AUTH_KEYS.USER,
      AUTH_KEYS.TOKEN,
      AUTH_KEYS.LEGACY_TOKEN,
      AUTH_KEYS.AUTH_TOKEN,
      AUTH_KEYS.SESSION_TOKEN,
      AUTH_KEYS.PLUMBMART_SESSION,
      AUTH_KEYS.WELCOME_BACK_SHOW,
      AUTH_KEYS.WELCOME_BACK_DATA,
      AUTH_KEYS.LAST_ACTIVITY,
      AUTH_KEYS.LOGIN_TIME,
      'currentUser',
      'user',
      'token',
      'authToken',
      'idToken',
      'jwt',
      'jwt_token',
      'access_token',
      'accessToken'
    ];

    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });

    // 2. Clear all sessionStorage
    try {
      sessionStorage.clear();
    } catch {}

    // 3. Clear any session cookies accessible to Javascript
    try {
      if (typeof document !== 'undefined' && document.cookie) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          if (
            name.toLowerCase().includes('token') ||
            name.toLowerCase().includes('session') ||
            name.toLowerCase().includes('auth') ||
            name.toLowerCase().includes('user')
          ) {
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
          }
        }
      }
    } catch {}

    // 4. Dispatch in-window event for active React state listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('plumbmart_auth_logout'));
      
      // Multi-tab logout broadcast
      try {
        localStorage.setItem(AUTH_KEYS.LOGOUT_BROADCAST, Date.now().toString());
        setTimeout(() => {
          try {
            localStorage.removeItem(AUTH_KEYS.LOGOUT_BROADCAST);
          } catch {}
        }, 1500);
      } catch {}
    }
  } catch (err) {
    console.warn('[authSession] Error during clearAuthSession:', err);
  }
}

/**
 * Sets up global activity tracking and auto-logout timer
 */
export function setupInactivityAutoLogout(onSessionExpired) {
  if (typeof window === 'undefined') return () => {};

  const handleActivity = () => {
    recordUserActivity();
  };

  const activityEvents = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
  activityEvents.forEach((evt) => {
    window.addEventListener(evt, handleActivity, { passive: true });
  });

  const checkExpiry = () => {
    if (checkAndPurgeExpiredSession()) {
      if (onSessionExpired) {
        onSessionExpired();
      }
    }
  };

  // Periodic check every 10 seconds
  const interval = setInterval(checkExpiry, 10000);

  // Check on tab focus or visibility change
  const handleVisibility = () => {
    if (!document.hidden) {
      checkExpiry();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('focus', checkExpiry);

  return () => {
    activityEvents.forEach((evt) => {
      window.removeEventListener(evt, handleActivity);
    });
    clearInterval(interval);
    document.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('focus', checkExpiry);
  };
}
