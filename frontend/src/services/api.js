/**
 * services/api.js
 * ---------------
 * Configured Axios instance for all backend API calls.
 *
 * Features:
 *   - baseURL from REACT_APP_API_URL environment variable
 *   - Request interceptor: attaches JWT from localStorage
 *   - Response interceptor: on 401, clears auth state + redirects to /login
 *
 * All API service files (authService, etc.) import this instance
 * instead of raw axios to ensure consistent headers and error handling.
 */

import axios from 'axios';

const TOKEN_KEY = 'pp_token';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// ------------------------------------------------------------------ //
// Request interceptor — attach JWT token if present
// ------------------------------------------------------------------ //
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------------------ //
// Response interceptor — handle global errors
// ------------------------------------------------------------------ //
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401: expired/revoked token
    // 422: malformed token (Flask-JWT-Extended returns this for invalid JWT structure)
    if (status === 401 || status === 422) {
      const token = localStorage.getItem(TOKEN_KEY);
      // Only redirect if we had a token (avoid redirect loop on login page)
      if (token) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('pp_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
