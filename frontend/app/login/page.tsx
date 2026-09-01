'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { forgotPassword, getSocialiteAuthUrl } from '@/lib/api';
import { Logo } from '@/components/layout/Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const statusParam = searchParams.get('status');
  const emailParam = searchParams.get('email') || '';

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    window.location.href = getSocialiteAuthUrl('google');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      // If email is not yet verified → send to verify-email page
      if (!res?.data?.user?.email_verified) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      } else {
        router.push(redirectUrl);
      }
    } catch (err: any) {
      const resp = err?.response?.data;
      const msg = resp?.message || err?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      if (resp?.requires_activation || msg.toLowerCase().includes('not been activated')) {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address to receive the password reset link.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await forgotPassword({ email: email.trim() });
      setResetSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send password reset link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lt-container flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-6 px-4">
      <div className="w-full max-w-[420px] lt-fade-up">
        <div className="text-center mb-3 sm:mb-4">
          <Link href="/" className="inline-flex items-center justify-center transition-transform hover:opacity-90 select-none">
            <Logo className="h-9 sm:h-10 w-auto" />
          </Link>
        </div>

        <div className="lt-card rounded-3xl p-6 sm:p-7 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[rgb(var(--lt-text))] text-center">
            {isForgotPassword ? 'Reset your password' : 'Sign in to your account'}
          </h1>
          <p className="mt-1 text-xs text-[rgb(var(--lt-text-muted))] text-center">
            {isForgotPassword
              ? "Enter your email and we'll send a password reset link."
              : 'Enter your details to access your account.'}
          </p>

          {/* Pending Activation Banner */}
          {statusParam === 'pending_activation' && (
            <div className="mt-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-1">
                  <strong className="block font-semibold">Account Activation Required</strong>
                  <p className="leading-relaxed">
                    We&apos;ve sent an activation link to{' '}
                    <strong className="break-all">{emailParam || 'your email'}</strong>. Please check your inbox and click the button to activate.
                  </p>
                  <Link
                    href={`/verify-email?email=${encodeURIComponent(emailParam)}`}
                    className="inline-flex items-center gap-1 font-bold text-[rgb(var(--lt-primary))] hover:underline pt-0.5"
                  >
                    Go to Activation Page / Resend Link →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mt-3.5 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-3 text-xs text-[rgb(var(--lt-error))]">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-1">
                  <span>{error}</span>
                  {error.toLowerCase().includes('not been activated') && (
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(email)}`}
                      className="block font-bold text-[rgb(var(--lt-primary))] hover:underline pt-0.5"
                    >
                      Click here to activate your account or resend email →
                    </Link>
                  )}
                  {error.toLowerCase().includes('no account found') && (
                    <Link
                      href={redirectUrl !== '/dashboard' ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                      className="block font-bold text-[rgb(var(--lt-primary))] hover:underline pt-0.5"
                    >
                      Click here to create a new account →
                    </Link>
                  )}
                  {(error.toLowerCase().includes('sign in with google') || error.toLowerCase().includes('created using google')) && (
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="block font-bold text-[rgb(var(--lt-primary))] hover:underline pt-0.5 text-left cursor-pointer"
                    >
                      Click here to sign in with Google →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Forgot Password Flow */}
          {isForgotPassword ? (
            resetSent ? (
              <div className="text-center py-5 space-y-3 mt-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-[rgb(var(--lt-text))]">Check your inbox</h3>
                <p className="text-xs text-[rgb(var(--lt-text-muted))]">
                  We&apos;ve sent password reset instructions to{' '}
                  <strong className="text-[rgb(var(--lt-text))]">{email}</strong>.
                  <br />
                  <span className="text-amber-500 text-xs">Link expires in 60 minutes.</span>
                </p>
                <button
                  type="button"
                  onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-3 mt-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[rgb(var(--lt-text))]">Email Address</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[rgb(var(--lt-text-muted))]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="lt-input has-left-icon !pl-11"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                </button>
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setError(null); }}
                    className="text-xs font-semibold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )
          ) : (
            <>
              {/* Google Sign In */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface))] hover:border-[rgb(var(--lt-primary)/0.4)] text-[rgb(var(--lt-text))] py-2.25 px-4 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              </div>

              <div className="relative my-3.5 flex items-center justify-center">
                <div className="w-full border-t border-[rgb(var(--lt-border))]" />
                <span className="absolute bg-[rgb(var(--lt-surface))] px-2.5 text-[11px] text-[rgb(var(--lt-text-muted))] font-medium">or email</span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[rgb(var(--lt-text))]">Email Address</label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[rgb(var(--lt-text-muted))]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="lt-input has-left-icon !pl-11"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))]">Password</label>
                    <button
                      type="button"
                      onClick={() => { setIsForgotPassword(true); setError(null); }}
                      className="text-xs font-semibold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[rgb(var(--lt-text-muted))]">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="lt-input has-both-icons !pl-11 !pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Sign In <ArrowRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-[rgb(var(--lt-text-muted))]">
                Don&apos;t have an account?{' '}
                <Link
                  href={redirectUrl !== '/dashboard' ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                  className="font-semibold text-[rgb(var(--lt-primary))] hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  );
}
