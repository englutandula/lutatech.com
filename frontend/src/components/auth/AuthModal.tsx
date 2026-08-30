'use client';

import React, { useState, useEffect } from 'react';
import {
  X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle2,
  Eye, EyeOff, ArrowRight, Sparkles, Loader2
} from 'lucide-react';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { getFriendlyAuthErrorMessage } from '@/lib/auth-errors';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { Logo } from '@/components/layout/Logo';

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
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  // Sync mode with initialMode prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setResetSent(false);
    }
  }, [isOpen, initialMode]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
      await signInWithEmailAndPassword(auth, email.trim(), password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (userCredential.user && name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive the password reset link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 sm:p-8 shadow-2xl z-10 lt-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-5">
          <Logo className="h-6 w-auto" />
          <span className="text-lg font-black tracking-tight text-[#0F172A] dark:text-white">
            Luta<span className="text-[rgb(var(--lt-primary))]">Tech</span>
          </span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[rgb(var(--lt-text))]">
            {mode === 'login' && 'Welcome back'}
            {mode === 'register' && 'Create your free account'}
            {mode === 'forgot-password' && 'Reset your password'}
          </h2>
          <p className="mt-1 text-xs sm:text-sm lt-text-muted">
            {mode === 'login' && 'Sign in to access your tools and saved history.'}
            {mode === 'register' && 'Get started in seconds. No credit card required.'}
            {mode === 'forgot-password' && "Enter your email and we'll send you a reset link."}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-3 text-xs sm:text-sm text-[rgb(var(--lt-error))]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── Mode: Forgot Password ── */}
        {mode === 'forgot-password' ? (
          resetSent ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[rgb(var(--lt-text))]">Check your inbox</h3>
              <p className="text-xs sm:text-sm lt-text-muted">
                We sent a password reset link to <strong className="text-[rgb(var(--lt-text))]">{email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); }}
                className="w-full rounded-xl bg-[rgb(var(--lt-primary))] py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--lt-primary-dark))] transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-4 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] py-2.5 text-sm font-semibold text-white hover:bg-[rgb(var(--lt-primary-dark))] transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-[rgb(var(--lt-primary))] hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )
        ) : (
          /* ── Mode: Sign In or Register ── */
          <div className="space-y-5">
            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary)/0.4)] text-[rgb(var(--lt-text))] py-2.5 px-4 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t lt-border-color" />
              <span className="absolute bg-[rgb(var(--lt-surface))] px-3 text-xs lt-text-muted font-medium">
                or continue with email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-4 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-4 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
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
                      className="text-xs font-medium text-[rgb(var(--lt-primary))] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-10 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === 'register' && <PasswordStrengthMeter password={password} />}
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-10 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] hover:bg-[rgb(var(--lt-primary-dark))] text-white py-2.5 px-4 text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Footer */}
            <div className="pt-2 text-center text-xs sm:text-sm text-[rgb(var(--lt-text-muted))]">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(null); }}
                    className="font-bold text-[rgb(var(--lt-primary))] hover:underline"
                  >
                    Sign up for free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(null); }}
                    className="font-bold text-[rgb(var(--lt-primary))] hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
