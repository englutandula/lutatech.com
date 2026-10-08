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
              className="inline-flex items-center transition-transform hover:opacity-90 select-none"
            >
              <Logo className="h-9 sm:h-10 w-auto shrink-0" />
            </Link>
            <p className="mt-4 max-w-xs text-sm lt-text-muted">
              A world-class digital tools platform. Fast, private, and built for everyone.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="mailto:info@lutatech.com"
                aria-label="Email"
                className="inline-flex items-center gap-2 rounded-lg border lt-border-color px-3 py-1.5 text-xs font-semibold text-[rgb(var(--lt-text-muted))] transition-colors hover:border-[rgb(var(--lt-primary))] hover:text-[rgb(var(--lt-primary))]"
              >
                <Mail className="h-4 w-4" />
                <span>info@lutatech.com</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/products/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">All Products</Link></li>
              <li><Link href="/guides/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Guides &amp; Tutorials</Link></li>
              <li><Link href="/about/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">About Us</Link></li>
              <li><Link href="/contact/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">Legal & Privacy</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/privacy/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Privacy Policy</Link></li>
              <li><Link href="/terms/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Terms of Service</Link></li>
              <li><Link href="/contact/" className="lt-text-muted hover:text-[rgb(var(--lt-text))]">Help & Support</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t lt-border-color pt-6 sm:flex-row">
          <p className="text-xs lt-text-muted">© 2026 Luta Tech. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs lt-text-muted">
            <Link href="/privacy/" className="hover:text-[rgb(var(--lt-text))]">Privacy</Link>
            <Link href="/terms/" className="hover:text-[rgb(var(--lt-text))]">Terms</Link>
            <Link href="/contact/" className="hover:text-[rgb(var(--lt-text))]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
