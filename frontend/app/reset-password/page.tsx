'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { forgotPassword, resetPassword } from '@/lib/api';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/lib/auth-context';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const tokenParam = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // 1. If user doesn't have a token, show "Request Reset Link" form
  const handleRequestLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await forgotPassword({ email: email.trim() });
      setForgotSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. If user has a token, submit new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword({
        token,
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      setResetSuccess(true);
      await refreshUser();
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lt-container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md lt-fade-up">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center transition-transform hover:opacity-90 select-none">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>

        <div className="lt-card p-6 sm:p-8">
          {resetSuccess ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--lt-success)/0.15)] text-[rgb(var(--lt-success))]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--lt-text))]">Password Reset Successful!</h2>
              <p className="text-sm lt-text-muted">
                Your password has been securely updated. Redirecting to your dashboard...
              </p>
            </div>
          ) : tokenParam ? (
            /* Set New Password Form */
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--lt-text))]">Create New Password</h1>
              <p className="mt-1.5 text-xs sm:text-sm lt-text-muted">
                Enter your new password below for <strong className="text-[rgb(var(--lt-text))]">{emailParam}</strong>.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-3 text-xs sm:text-sm text-[rgb(var(--lt-error))]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--lt-text))] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 lt-text-muted pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] pl-10 pr-10 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={password} />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--lt-text))] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 lt-text-muted pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] pl-10 pr-10 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] py-2.5 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md mt-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Update Password</span>}
                </button>
              </form>
            </div>
          ) : forgotSent ? (
            /* Forgot Request Sent */
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--lt-success)/0.15)] text-[rgb(var(--lt-success))]">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-[rgb(var(--lt-text))]">Check Your Email</h2>
              <p className="text-sm lt-text-muted">
                If an account exists for <strong className="text-[rgb(var(--lt-text))]">{email}</strong>, we have sent instructions to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-block text-sm text-[rgb(var(--lt-primary))] hover:underline font-semibold mt-4"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            /* Request Password Reset Link Form */
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--lt-text))]">Forgot Password?</h1>
              <p className="mt-1.5 text-xs sm:text-sm lt-text-muted">
                Enter your email address and we will send you a link to reset your password.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-3 text-xs sm:text-sm text-[rgb(var(--lt-error))]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestLink} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[rgb(var(--lt-text))] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 lt-text-muted pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] pl-10 pr-4 py-2.5 text-sm text-[rgb(var(--lt-text))] focus:border-[rgb(var(--lt-primary))] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] py-2.5 px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-md mt-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Send Reset Link</span>}
                </button>

                <div className="text-center mt-4">
                  <Link href="/login" className="text-xs text-[rgb(var(--lt-primary))] hover:underline">
                    &larr; Back to Sign In
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--lt-primary))]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
