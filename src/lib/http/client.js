function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && url.startsWith('http://')) {
    return url.replace(/^http:\/\//i, 'https://');
  }
  return url;
}

export const API_BASE_URL = getApiBaseUrl();

export const defaultFetchOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Centralized fetch wrapper with automatic JSON parsing and error handling.
 * Replaces the boilerplate `fetch + !ok + json()` pattern across all API files.
 */
export async function fetchAPI(endpoint, { method = 'GET', body, errorMessage = 'Error en la solicitud' } = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...defaultFetchOptions,
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: errorMessage }));
    throw new Error(error.error || error.message || `${errorMessage} (${response.status})`);
  }

  if (response.status === 204) return null;

  return response.json();
}

/** @deprecated Use fetchAPI instead */
export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
});
