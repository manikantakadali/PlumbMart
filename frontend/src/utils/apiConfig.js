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
 * 1. Calls relative `/api/...` (proxied by Vite in dev and by vercel.json in production).
 * 2. If Vercel rewrote to index.html (405 or 200 HTML), or network error occurs on Vercel:
 *    Automatically retries against the live Render backend directly.
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isLocal = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );

  // If local, use Vite proxy directly
  if (isLocal) {
    return fetch(cleanPath, options);
  }

  // In production on Vercel/live web:
  try {
    const res = await fetch(cleanPath, options);
    const contentType = res.headers.get('content-type') || '';
    
    // If the response is HTML or 405 Method Not Allowed, Vercel served index.html instead of the API
    if (res.status === 405 || (res.status === 200 && contentType.includes('text/html'))) {
      console.warn(`[apiFetch] Relative endpoint ${cleanPath} returned ${res.status} HTML. Retrying against Render backend...`);
      return await fetch(`${BACKEND_URL}${cleanPath}`, options);
    }
    return res;
  } catch (err) {
    console.warn(`[apiFetch] Relative endpoint ${cleanPath} failed with network error. Retrying against Render backend...`, err);
    return await fetch(`${BACKEND_URL}${cleanPath}`, options);
  }
}
