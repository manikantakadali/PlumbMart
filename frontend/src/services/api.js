/**
 * Base API Client for PlumbMart Frontend
 */

export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || 'API Request failed');
    error.data = data;
    error.status = response.status;
    throw error;
  }

  return data;
}
