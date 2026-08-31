'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2,
  Eye, EyeOff, ArrowRight, Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { forgotPassword, getSocialiteAuthUrl } from '@/lib/api';
import PasswordStrengthMeter from './PasswordStrengthMeter';

export type AuthMode = 'login' | 'register' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: AuthMode;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
}: AuthModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userExists, setUserExists] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Sync mode and state immediately during render (no delayed size jumping/expanding)
  if (isOpen !== prevIsOpen || initialMode !== prevInitialMode) {
    setPrevIsOpen(isOpen);
    setPrevInitialMode(initialMode);
    if (isOpen && !prevIsOpen) {
      setMode(initialMode);
      setError(null);
      setUserExists(false);
      setUserNotFound(false);
      setResetSent(false);
      setName('');
      setPassword('');
      setConfirmPassword('');
      setIsClosing(false);
    } else if (initialMode !== prevInitialMode) {
      setMode(initialMode);
    }
  }

  // Smooth close with macOS exit animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 180);
  }, [onClose]);

  // Lock background body scroll when modal is open (zero layout shift / no shaking)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  if (!isOpen && !isClosing) return null;

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    window.location.href = getSocialiteAuthUrl('google');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUserExists(false);
      setUserNotFound(false);
      const res = await login({ email: email.trim(), password });
      // If email is not verified, close modal and redirect to verify page
      if (!res?.data?.user?.email_verified) {
        handleClose();
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err: any) {
      const resp = err?.response?.data;
      const msg = resp?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      if (resp?.requires_activation || msg.toLowerCase().includes('not been activated')) {
        handleClose();
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }
      if (resp?.user_not_found || err?.response?.status === 404) {
        setUserNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both passwords.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setUserExists(false);
      setUserNotFound(false);
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      // If email already verified (Google account that just set a password) → success as normal
      if (res?.data?.user?.email_verified) {
        if (onSuccess) onSuccess();
        handleClose();
      } else {
        // New account → must verify email first
        handleClose();
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err: any) {
      const resp = err?.response?.data;
      const msg = resp?.message || err?.message || 'Registration failed. Please check your details.';
      setError(msg);
      if (resp?.user_exists || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        setUserExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await forgotPassword({ email: email.trim() });
      setResetSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send reset link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-none select-none">
      {/* Blurred macOS-Style Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/60 dark:bg-black/80 backdrop-blur-md transition-opacity duration-200 ${
          isClosing ? 'opacity-0' : 'mac-backdrop-enter opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* macOS Window Card with Smooth Scale Zoom Animation */}
      <div
        className={`relative w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl border border-white/20 dark:border-white/10 bg-[rgb(var(--lt-surface))] p-4 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)] z-10 my-auto max-h-[92vh] overflow-y-auto ${
          isClosing ? 'mac-modal-exit' : 'mac-modal-enter'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 rounded-full p-1.5 text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-2">
          <span className="text-2xl sm:text-3xl tracking-tight leading-none font-['Century_Gothic',CenturyGothic,AppleGothic,Futura,sans-serif] select-none inline-block">
            <span className="font-bold text-[rgb(var(--lt-text))]">Luta</span>
            <span className="font-normal text-[#E53935]">Tech</span>
          </span>
        </div>

        {/* macOS-Style Segmented Control for Login / Sign Up */}
        {mode !== 'forgot-password' ? (
          <div className="flex rounded-xl bg-[rgb(var(--lt-surface-2))] p-1 mb-4 border border-[rgb(var(--lt-border)/0.6)]">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setUserExists(false); setUserNotFound(false); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] shadow-xs'
                  : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); setUserExists(false); setUserNotFound(false); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] shadow-xs'
                  : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="text-center mb-3.5">
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Reset your password</h2>
            <p className="text-xs lt-text-muted mt-0.5">We&apos;ll send a password recovery link to your email</p>
          </div>
        )}

        {/* Error Alert with Smart Actions */}
        {error && (
          <div className="mb-3 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-2.5 text-xs text-[rgb(var(--lt-error))] animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <span className="block font-medium leading-relaxed">{error}</span>
                {userExists && mode === 'register' && (
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); setUserExists(false); }}
                    className="inline-flex items-center gap-1 font-bold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer pt-0.5"
                  >
                    Switch to Sign in with this email <ArrowRight className="h-3 w-3" />
                  </button>
                )}
                {userNotFound && mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); setUserNotFound(false); }}
                    className="inline-flex items-center gap-1 font-bold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer pt-0.5"
                  >
                    Click here to create a new account <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Mode: Forgot Password ── */}
        {mode === 'forgot-password' ? (
          resetSent ? (
            <div className="text-center py-2 space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-[rgb(var(--lt-text))]">Reset link sent!</h3>
              <p className="text-xs lt-text-muted">
                Check <strong className="text-[rgb(var(--lt-text))]">{email}</strong> for instructions to reset your password.
              </p>
              <button
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="w-full rounded-xl bg-[rgb(var(--lt-primary))] py-2 text-xs font-semibold text-white hover:bg-[rgb(var(--lt-primary-dark))] transition-colors cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-9 pr-3 py-2 text-xs sm:text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[rgb(var(--lt-primary-dark))] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
              </button>

              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )
        ) : (
          /* ── Mode: Sign In or Register ── */
          <div className="space-y-3">
            {/* Google OAuth Button with Explicit Sign Up vs Sign In Label */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary)/0.4)] text-[rgb(var(--lt-text))] py-2 px-3 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>{mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-1.5">
              <div className="w-full border-t lt-border-color" />
              <span className="absolute bg-[rgb(var(--lt-surface))] px-2.5 text-[11px] lt-text-muted font-medium">
                or email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-2.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))]">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-[11px] font-medium text-[rgb(var(--lt-primary))] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-9 pr-9 py-1.5 text-xs sm:text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {mode === 'register' && <PasswordStrengthMeter password={password} />}
              </div>

              {/* Confirm Password field on Register */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-9 pr-9 py-1.5 text-xs sm:text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] p-0.5 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] hover:bg-[rgb(var(--lt-primary-dark))] text-white py-2 px-3 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
