/**
 * pages/auth/RegisterPage.js
 * --------------------------
 * Registration page — Name, Email, Password, Confirm Password.
 *
 * Features:
 *   - Client-side validation (all fields, min length, password match)
 *   - Real-time password strength indicator
 *   - Loading spinner during API call
 *   - Toast on success → auto-redirect to /login
 *   - Toast on error with backend message
 */

import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdRocketLaunch,
} from 'react-icons/md';

import { register as registerApi } from '../../services/authService';
import styles from './RegisterPage.module.css';

// ------------------------------------------------------------------ //
// Password strength scoring
// ------------------------------------------------------------------ //
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8)  score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: '',          color: '',          width: '0%'   },
    { score: 1, label: 'Very weak', color: '#ef4444',   width: '20%'  },
    { score: 2, label: 'Weak',      color: '#f97316',   width: '40%'  },
    { score: 3, label: 'Fair',      color: '#f59e0b',   width: '60%'  },
    { score: 4, label: 'Strong',    color: '#10b981',   width: '80%'  },
    { score: 5, label: 'Very strong',color: '#06b6d4',  width: '100%' },
  ];

  return levels[score] || levels[0];
};

// ------------------------------------------------------------------ //
// Component
// ------------------------------------------------------------------ //
const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  // ------------------------------------------------------------------ //
  // Password strength (memoised — only recalculates when password changes)
  // ------------------------------------------------------------------ //
  const strength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  // ------------------------------------------------------------------ //
  // Handlers
  // ------------------------------------------------------------------ //
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await registerApi(
        formData.name.trim(),
        formData.email.trim().toLowerCase(),
        formData.password
      );
      toast.success('Account created! Please sign in. 🎉');
      navigate('/login');
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

        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subheading}>
          Join ProjectPilot and start managing projects smarter
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          {/* Full Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="register-name">Full name</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><MdPerson /></span>
              <input
                id="register-name"
                className={`${styles.input} ${fieldErrors.name ? styles.error : ''}`}
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
            </div>
            {fieldErrors.name && (
              <span className={styles.fieldError}>{fieldErrors.name}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="register-email">Email address</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><MdEmail /></span>
              <input
                id="register-email"
                className={`${styles.input} ${fieldErrors.email ? styles.error : ''}`}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <span className={styles.fieldError}>{fieldErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="register-password">Password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><MdLock /></span>
              <input
                id="register-password"
                className={`${styles.input} ${fieldErrors.password ? styles.error : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
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

            {/* Strength indicator */}
            {formData.password && (
              <>
                <div className={styles.strengthBar}>
                  <div
                    className={styles.strengthFill}
                    style={{ width: strength.width, background: strength.color }}
                  />
                </div>
                <span
                  className={styles.strengthLabel}
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              </>
            )}

            {fieldErrors.password && (
              <span className={styles.fieldError}>{fieldErrors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="register-confirm">Confirm password</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}><MdLock /></span>
              <input
                id="register-confirm"
                className={`${styles.input} ${fieldErrors.confirmPassword ? styles.error : ''}`}
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirm((s) => !s)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className={styles.fieldError}>{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className={styles.spinner} />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>

        </form>

        {/* Footer */}
        <p className={styles.footer}>
          Already have an account?
          <Link to="/login" className={styles.footerLink}>
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
};

export default RegisterPage;
