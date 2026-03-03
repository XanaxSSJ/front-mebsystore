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

export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};
