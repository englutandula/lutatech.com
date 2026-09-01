import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from './Logo';
import { categories } from '@/lib/tools';

export function Footer() {
  return (
    <footer className="border-t lt-border-color lt-surface mt-20">
      <div className="lt-container py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center text-xl font-black tracking-tight leading-none text-[#0F172A] dark:text-white transition-transform hover:opacity-90 select-none"
            >
              <Logo className="h-[1.3em] w-auto shrink-0" />
            </Link>
            <p className="mt-4 max-w-xs text-sm lt-text-muted">
              A world-class digital tools platform. Fast, private, and built for everyone.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="rounded-lg border lt-border-color p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:border-[rgb(var(--lt-primary))] hover:text-[rgb(var(--lt-primary))]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="rounded-lg border lt-border-color p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:border-[rgb(var(--lt-primary))] hover:text-[rgb(var(--lt-primary))]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="mailto:info@lutatech.com"
                aria-label="Email"
                className="rounded-lg border lt-border-color p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:border-[rgb(var(--lt-primary))] hover:text-[rgb(var(--lt-primary))]"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/tools" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">All Tools</Link></li>
              <li><Link href="/categories" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Categories</Link></li>
              <li><Link href="/pricing" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Pricing</Link></li>
              <li><Link href="/about" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">About Us</Link></li>
              <li><Link href="/contact" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">Legal & Privacy</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/privacy" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Privacy Policy</Link></li>
              <li><Link href="/terms" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Terms of Service</Link></li>
              <li><Link href="/contact" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Help & Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">Account</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/login" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Login</Link></li>
              <li><Link href="/register" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Sign Up</Link></li>
              <li><Link href="/dashboard" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t lt-border-color pt-6 sm:flex-row">
          <p className="text-xs lt-text-muted">© 2026 Luta Tech. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs lt-text-muted">
            <Link href="/privacy" className="hover:text-[rgb(var(--lt-text))]">Privacy</Link>
            <Link href="/terms" className="hover:text-[rgb(var(--lt-text))]">Terms</Link>
            <Link href="/contact" className="hover:text-[rgb(var(--lt-text))]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
