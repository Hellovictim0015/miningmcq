// Thin wrapper around fetch that attaches the admin session token.
// Mirrors src/app/lib/fetchWithAuth.js but uses the separate "adminToken" key
// so the content-admin session never mixes with a customer's "authToken".
export const adminFetch = (url, options = {}) => {
  const token = localStorage.getItem("adminToken");
  return fetch(url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
};
