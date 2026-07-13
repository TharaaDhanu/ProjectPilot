/**
 * hooks/useAuth.js
 * ----------------
 * Convenience hook for consuming AuthContext.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *
 * Throws if used outside of <AuthProvider> to surface misconfiguration
 * early during development.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth must be used within an <AuthProvider>. ' +
      'Wrap your app with <AuthProvider> in index.js.'
    );
  }

  return context;
};
