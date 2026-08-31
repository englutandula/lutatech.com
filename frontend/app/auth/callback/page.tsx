'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setErrorMessage(decodeURIComponent(error));
      return;
    }

    if (token) {
      localStorage.setItem('auth_token', token);
      import('@/lib/api').then(({ getUserProfile }) => {
        getUserProfile()
          .then((res) => {
            refreshUser();
            setStatus('success');
            const isVerified = res?.data?.user?.email_verified;
            setTimeout(() => {
              if (!isVerified) {
                router.replace('/verify-email');
              } else {
                router.replace('/dashboard');
              }
            }, 600);
          })
          .catch((err) => {
            console.error('Error refreshing user with social token:', err);
            setStatus('error');
            setErrorMessage('Failed to initialize session. Please try logging in again.');
          });
      });
    } else {
      setStatus('error');
      setErrorMessage('No authentication token returned by provider.');
    }
  }, [searchParams, router, refreshUser]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="lt-card max-w-md w-full p-8 shadow-xl">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[rgb(var(--lt-primary))]" />
            <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">Completing authentication...</h2>
            <p className="text-sm lt-text-muted">Please wait while we verify your credentials.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-[rgb(var(--lt-success))]" />
            <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">Successfully Authenticated!</h2>
            <p className="text-sm lt-text-muted">Redirecting you to your dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-10 w-10 text-[rgb(var(--lt-error))]" />
            <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">Authentication Failed</h2>
            <p className="text-sm text-[rgb(var(--lt-error))]">{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 rounded-xl bg-[rgb(var(--lt-primary))] px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--lt-primary))]" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
