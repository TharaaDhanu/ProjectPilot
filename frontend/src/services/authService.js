/**
 * services/authService.js
 * -----------------------
 * Typed API call functions for authentication endpoints.
 *
 * All functions return the `data` field from the response envelope:
 *   { success, message, data }
 *
 * Errors are re-thrown as Error objects with the backend's message,
 * so callers can catch them and show toasts without parsing themselves.
 */

import api from './api';

/**
 * Register a new user account.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object }>}
 */
export const register = async (name, email, password) => {
  try {
    console.log('[authService] POST /api/auth/register', { name, email });
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data.data; // { user }
  } catch (error) {
    const message =
      error.response?.data?.message || 'Registration failed. Please try again.';
    throw new Error(message);
  }
};

/**
 * Log in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, user: object }>}
 */
export const login = async (email, password) => {
  try {
    console.log('[authService] POST /api/auth/login', { email });
    const response = await api.post('/api/auth/login', { email, password });
    return response.data.data; // { access_token, user }
  } catch (error) {
    const message =
      error.response?.data?.message || 'Login failed. Please try again.';
    throw new Error(message);
  }
};

/**
 * Fetch the currently authenticated user's profile.
 * Requires a valid JWT in localStorage (attached by api.js interceptor).
 * @returns {Promise<object>} user object
 */
export const getMe = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data.data;
  } catch (error) {
    const message =
      error.response?.data?.message || 'Failed to fetch user profile.';
    throw new Error(message);
  }
};
