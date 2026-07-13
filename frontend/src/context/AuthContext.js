/**
 * context/AuthContext.js
 * ----------------------
 * React Context for global authentication state.
 *
 * Provides:
 *   - user        : Authenticated user object (or null)
 *   - token       : JWT access token string (or null)
 *   - isAuthenticated : Boolean derived from token presence
 *   - loading     : True during initial session-restore check
 *   - login(token, user) : Store token + user, update state
 *   - logout()    : Clear state + localStorage
 *
 * Persistence:
 *   Token is stored in localStorage under 'pp_token'.
 *   User is stored under 'pp_user'.
 *   On mount, AuthProvider reads localStorage to restore the session.
 */

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'pp_token';
const USER_KEY  = 'pp_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true); // restoring session

  // ------------------------------------------------------------------ //
  // Restore session from localStorage on initial mount
  // ------------------------------------------------------------------ //
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser  = localStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Corrupted data — clear it
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------ //
  // login — called after successful API auth
  // ------------------------------------------------------------------ //
  const login = useCallback((newToken, newUser) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ------------------------------------------------------------------ //
  // logout — clears all auth state
  // ------------------------------------------------------------------ //
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // ------------------------------------------------------------------ //
  // Stable context value — prevents unnecessary re-renders
  // ------------------------------------------------------------------ //
  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      loading,
      login,
      logout,
    }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
