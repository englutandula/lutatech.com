'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, Shield, Check, X } from 'lucide-react';

const CONSENT_KEY = 'luta_cookie_consent';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        // Small delay so page renders smoothly before sliding in
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors (e.g. strict privacy mode)
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      window.dispatchEvent(new CustomEvent('luta_cookie_consent_updated', { detail: 'accepted' }));
    } catch {
      // Ignore
    }
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'essential');
      window.dispatchEvent(new CustomEvent('luta_cookie_consent_updated', { detail: 'essential' }));
    } catch {
      // Ignore
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-lg lt-scale-in"
    >
      <div className="lt-card p-5 sm:p-6 shadow-2xl border lt-border-strong bg-[rgb(var(--lt-surface)/0.98)] backdrop-blur-xl rounded-2xl">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.12)] text-[rgb(var(--lt-primary))]">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-bold text-[rgb(var(--lt-text))] flex items-center gap-1.5">
              We value your privacy
            </h2>
            <p className="mt-1.5 text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and display relevant advertising via Google AdSense. You can read our full{' '}
              <Link
                href="/privacy/"
                className="font-medium text-[rgb(var(--lt-primary))] underline underline-offset-2 hover:opacity-80"
              >
                Privacy &amp; Cookie Policy
              </Link>
              .
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="lt-btn-primary text-xs py-2 px-3.5 rounded-lg font-semibold cursor-pointer shadow-sm"
              >
                <Check className="h-3.5 w-3.5" /> Accept All
              </button>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="lt-btn-secondary text-xs py-2 px-3.5 rounded-lg font-medium cursor-pointer"
              >
                Essential Only
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEssentialOnly}
            aria-label="Close cookie consent banner"
            className="text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CookieConsent;
