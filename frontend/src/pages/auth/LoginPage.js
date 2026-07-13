/**
 * pages/auth/LoginPage.js
 * -----------------------
 * Login page — Email + Password form with JWT authentication.
 *
 * Flow:
 *   1. User submits email + password
 *   2. Calls authService.login() → { access_token, user }
 *   3. Calls AuthContext.login(token, user) → stores to localStorage + state
 *   4. Redirects to the originally intended route (or '/')
 *   5. Shows error toast on failure
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdRocketLaunch } from 'react-icons/md';

import { useAuth } from '../../hooks/useAuth';
import { login as loginApi } from '../../services/authService';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  // Redirect to originally intended path after login (from ProtectedRoute)
  const from = location.state?.from?.pathname || '/';

  // Form state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------------------------------------------------ //
  // Handlers
  // ------------------------------------------------------------------ //
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    // Client-side validation
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { access_token, user } = await loginApi(email.trim(), password);
      login(access_token, user);
      toast.success(`Welcome back, ${user.name}! 🚀`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------ //
  // Render
  // ------------------------------------------------------------------ //
  return (
    <main className={styles.page}>
      <div className={styles.card}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logoIcon}>
            <MdRocketLaunch color="#fff" size={22} />
          </div>
          <span className={styles.brandName}>ProjectPilot</span>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in to continue to your workspace</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="login-email">Email address</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <MdEmail />
              </span>
              <input
                id="login-email"
                className={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                aria-required="true"
              />
            </div>
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="login-password">Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <MdLock />
              </span>
              <input
                id="login-password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                aria-required="true"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className={styles.formExtras}>
            <label className={styles.checkboxLabel}>
              <input
                id="login-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <span className={styles.forgotLink} style={{ cursor: 'default', opacity: 0.5 }}>
              Forgot password?
            </span>
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>

        </form>

        {/* Footer */}
        <p className={styles.footer}>
          Don't have an account?
          <Link to="/register" className={styles.footerLink}>
            Create one free
          </Link>
        </p>

      </div>
    </main>
  );
};

export default LoginPage;
