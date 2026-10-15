/**
 * PlumbMart Unified API Config & Fetch Helper
 * Handles local development, Vercel deployments, and direct Render backend fallback.
 */

export const BACKEND_URL = 
  import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')
    ? import.meta.env.VITE_API_URL
    : 'https://plumbmart.onrender.com';

/**
 * Intelligent fetch wrapper:
 * 1. Calls endpoint (relative path via Vite in dev / Vercel in production).
 * 2. If endpoint returns non-OK status (502, 503, 504, 405, plain text error, or HTML error):
 *    Automatically retries against the live Render backend directly.
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  try {
    const res = await fetch(cleanPath, options);
    const contentType = res.headers.get('content-type') || '';
    
    // If the response is HTML, 405 Method Not Allowed, or 5xx plain text error from proxy/serverless
    const isBadProxyResponse = 
      res.status === 405 || 
      res.status === 502 || 
      res.status === 503 || 
      res.status === 504 ||
      (res.status >= 500 && contentType.includes('text/plain')) || 
      (res.status === 200 && contentType.includes('text/html'));

    if (isBadProxyResponse) {
      console.warn(`[apiFetch] Endpoint ${cleanPath} returned status ${res.status}. Falling back to Render backend...`);
      return await fetch(`${BACKEND_URL}${cleanPath}`, options);
    }
    return res;
  } catch (err) {
    console.warn(`[apiFetch] Endpoint ${cleanPath} failed with network error. Falling back to Render backend...`, err);
    return await fetch(`${BACKEND_URL}${cleanPath}`, options);
  }
}
