'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { resendVerificationEmail, verifyEmailBySignedUrl } from '@/lib/api';
import { Logo } from '@/components/layout/Logo';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, refreshUser } = useAuth();

  const emailParam = searchParams.get('email') || '';
  const [targetEmail, setTargetEmail] = useState<string>(emailParam || user?.email || '');

  type VerifyState = 'pending' | 'verifying' | 'success' | 'expired';
  const [state, setState] = useState<VerifyState>('pending');
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (user?.email && !targetEmail) {
      setTargetEmail(user.email);
    }
  }, [user, targetEmail]);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }

    const verifyUrl = searchParams.get('verify_url');
    const activateUrl = searchParams.get('activate_url');
    const status = searchParams.get('status');

    if (status === 'success' || status === 'already_verified' || status === 'already_active' || status === 'activated') {
      setState('success');
      refreshUser();
      return;
    }

    if (status === 'invalid') {
      setState('expired');
      setError('This activation link is invalid or has expired.');
      return;
    }

    const actionUrl = activateUrl || verifyUrl;

    if (actionUrl) {
      let targetUrl = decodeURIComponent(actionUrl);
      if (targetUrl.startsWith('https://lutatech.com/v1/') || targetUrl.startsWith('http://lutatech.com/v1/')) {
        targetUrl = targetUrl.replace('lutatech.com/v1/', 'lutatech.com/api/v1/');
      }

      setState('verifying');
      verifyEmailBySignedUrl(targetUrl)
        .then((res: any) => {
          if (res?.data?.token && typeof window !== 'undefined') {
            localStorage.setItem('auth_token', res.data.token);
          }
          setState('success');
          refreshUser();
        })
        .catch((err) => {
          setState('expired');
          setError(err?.response?.data?.message || 'The activation link is invalid or has expired. Please request a new one.');
        });
    }
  }, [searchParams, refreshUser]);

  // Redirect to dashboard if already verified and authenticated
  useEffect(() => {
    if (user?.email_verified && user?.account_status === 'active') {
      setState('success');
    }
  }, [user]);

  const handleResend = async () => {
    const emailToSend = targetEmail.trim() || user?.email || emailParam;
    if (!emailToSend) {
      setError('Please enter your email address to resend the activation link.');
      return;
    }

    try {
      setResending(true);
      setResendSuccess(false);
      setError(null);
      await resendVerificationEmail({ email: emailToSend });
      setResendSuccess(true);
      setState('pending');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to resend activation email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    router.push('/login');
  };

  const displayEmail = targetEmail || user?.email || emailParam || 'your email';

  return (
    <div className="lt-container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
      <div className="w-full max-w-md lt-fade-up">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center transition-transform hover:opacity-90 select-none">
            <Logo className="h-10 w-auto" />
          </Link>
        </div>

        <div className="lt-card p-6 sm:p-8 text-center">

          {/* STATE: Verifying */}
          {state === 'verifying' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-12 w-12 animate-spin text-[rgb(var(--lt-primary))]" />
              <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">Activating your account…</h2>
              <p className="text-sm lt-text-muted">Please wait while we confirm your activation link.</p>
            </div>
          )}

          {/* STATE: Success */}
          {state === 'success' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-9 w-9" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[rgb(var(--lt-text))]">Account Activated!</h2>
                <span className="inline-block mt-1.5 rounded-full bg-emerald-500/15 text-emerald-500 text-xs font-semibold px-3 py-0.5">
                  Ready to Use
                </span>
              </div>
              <p className="text-sm lt-text-muted">
                Your <strong className="text-[rgb(var(--lt-text))]">Luta Tech</strong> account is now fully active. You can sign in and start using all tools.
              </p>
              <Link
                href={user || (typeof window !== 'undefined' && localStorage.getItem('auth_token')) ? '/dashboard' : '/login'}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 cursor-pointer shadow-md"
              >
                <span>{user || (typeof window !== 'undefined' && localStorage.getItem('auth_token')) ? 'Proceed to Dashboard' : 'Sign In to Continue'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* STATE: Expired / Invalid Link */}
          {state === 'expired' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--lt-error)/0.1)] text-[rgb(var(--lt-error))]">
                <AlertCircle className="h-9 w-9" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">Link Expired or Invalid</h2>
              </div>
              <p className="text-sm lt-text-muted">
                {error || 'Activation links expire after 24 hours. Request a new one below.'}
              </p>

              {!displayEmail || displayEmail === 'your email' ? (
                <div className="w-full text-left">
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="lt-input mb-2"
                  />
                </div>
              ) : null}

              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] py-2.5 px-4 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span>Request New Activation Link</span>
              </button>

              <Link
                href="/login"
                className="text-xs lt-text-muted hover:text-[rgb(var(--lt-text))] flex items-center gap-1 cursor-pointer mt-1"
              >
                Back to Sign In
              </Link>
            </div>
          )}

          {/* STATE: Pending (default) */}
          {state === 'pending' && (
            <div className="flex flex-col items-center gap-4 py-4">
              {/* Envelope icon with animated glow */}
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--lt-primary)/0.12)] text-[rgb(var(--lt-primary))]">
                  <Mail className="h-8 w-8" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-ping rounded-full bg-[rgb(var(--lt-primary)/0.4)]" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">Check your inbox</h2>
                <p className="text-xs text-[rgb(var(--lt-primary))] font-semibold mt-1 flex items-center justify-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Activation link sent
                </p>
              </div>

              <p className="text-sm lt-text-muted leading-relaxed">
                We sent an account activation link to{' '}
                <strong className="text-[rgb(var(--lt-text))] break-all">{displayEmail}</strong>.
                <br />
                Please open your email and click the button to activate your account.
              </p>

              {/* Amber expiry note */}
              <div className="w-full rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-500 font-medium">
                ⏱ Link expires in 24 hours
              </div>

              {/* Resend success */}
              {resendSuccess && (
                <div className="w-full flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>A new activation link has been sent to your email!</span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="w-full flex items-center gap-2 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.1)] p-3 text-xs text-[rgb(var(--lt-error))] text-left">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-2.5 w-full mt-2">
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary)/0.4)] text-[rgb(var(--lt-text))] py-2.5 px-4 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span>Resend Activation Email</span>
                </button>

                <div className="flex items-center justify-center gap-4 pt-1">
                  <Link
                    href="/login"
                    className="text-xs lt-text-muted hover:text-[rgb(var(--lt-text))] hover:underline"
                  >
                    Back to Sign In
                  </Link>
                  {user && (
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={signingOut}
                      className="text-xs lt-text-muted hover:text-[rgb(var(--lt-text))] flex items-center gap-1 cursor-pointer"
                    >
                      {signingOut ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--lt-primary))]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
