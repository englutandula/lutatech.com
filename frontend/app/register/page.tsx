'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSocialiteAuthUrl } from '@/lib/api';
import PasswordStrengthMeter from '@/components/auth/PasswordStrengthMeter';
import { Logo } from '@/components/layout/Logo';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    window.location.href = getSocialiteAuthUrl('google');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      });

      // If email is already verified (e.g. Google user who just set a password) → dashboard
      // If email needs verification (new normal account) → verify-email page
      if (res?.data?.user?.email_verified) {
        router.push(redirectUrl);
      } else {
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
      }
    } catch (err: any) {
      const resp = err?.response?.data;
      const msg = resp?.message || err?.message || 'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lt-container flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-5 px-4">
      <div className="w-full max-w-[440px] lt-fade-up">
        <div className="text-center mb-3">
          <Link href="/" className="inline-flex items-center justify-center transition-transform hover:opacity-90 select-none">
            <Logo className="h-8 sm:h-9 w-auto" />
          </Link>
        </div>

        <div className="lt-card rounded-3xl p-5 sm:p-6 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[rgb(var(--lt-text))] text-center">Create your account</h1>
          <p className="mt-0.5 text-xs text-[rgb(var(--lt-text-muted))] text-center">Get started for free. No credit card required.</p>

          {/* Google Sign Up */}
          <div className="mt-3.5">
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
              <span>Sign up with Google</span>
            </button>
          </div>

          <div className="relative my-3 flex items-center justify-center">
            <div className="w-full border-t border-[rgb(var(--lt-border))]" />
            <span className="absolute bg-[rgb(var(--lt-surface))] px-2.5 text-[11px] text-[rgb(var(--lt-text-muted))] font-medium">or email</span>
          </div>

          {error && (
            <div className="mb-3 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-2.5 text-xs text-[rgb(var(--lt-error))]">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1 space-y-1">
                  <span>{error}</span>
                  {(error.toLowerCase().includes('already exists') || error.toLowerCase().includes('already registered')) && (
                    <Link
                      href={redirectUrl !== '/dashboard' ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                      className="block font-bold text-[rgb(var(--lt-primary))] hover:underline pt-0.5"
                    >
                      Click here to sign in with this email →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[rgb(var(--lt-text))]">Full Name</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[rgb(var(--lt-text-muted))]">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="lt-input has-left-icon !pl-11"
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[rgb(var(--lt-text))]">Password</label>
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
                    className="lt-input has-both-icons !pl-11 !pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[rgb(var(--lt-text))]">Confirm Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[rgb(var(--lt-text-muted))]">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="lt-input has-both-icons !pl-11 !pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {password && <PasswordStrengthMeter password={password} />}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] hover:opacity-95 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-3.5 text-center text-xs text-[rgb(var(--lt-text-muted))]">
            Already have an account?{' '}
            <Link
              href={redirectUrl !== '/dashboard' ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
              className="font-semibold text-[rgb(var(--lt-primary))] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <RegisterForm />
    </Suspense>
  );
}
