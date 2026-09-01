import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, EyeOff, Server, Cookie, HelpCircle } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Privacy Policy - Luta Tech',
  description:
    'Read the Luta Tech Privacy Policy. We prioritize your privacy with client-side, in-browser file processing and clear data protection practices.',
  alternates: {
    canonical: '/privacy/',
  },
  openGraph: {
    title: 'Privacy Policy | Luta Tech',
    description:
      'Learn how Luta Tech protects your personal data and handles in-browser file processing.',
    url: `${SITE_URL}/privacy/`,
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'September 1, 2026';

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Privacy Policy', url: '/privacy/' },
        ]}
      />

      <div className="lt-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--lt-text))]">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm lt-text-muted">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="lt-card p-5">
            <Lock className="w-5 h-5 text-[rgb(var(--lt-primary))] mb-2" />
            <h2 className="text-sm font-bold text-[rgb(var(--lt-text))]">In-Browser Processing</h2>
            <p className="text-xs lt-text-muted mt-1">
              Your PDFs, images, and files stay on your device whenever possible.
            </p>
          </div>
          <div className="lt-card p-5">
            <EyeOff className="w-5 h-5 text-[rgb(var(--lt-accent))] mb-2" />
            <h2 className="text-sm font-bold text-[rgb(var(--lt-text))]">No File Selling</h2>
            <p className="text-xs lt-text-muted mt-1">
              We never sell, rent, or monetize your uploaded documents or images.
            </p>
          </div>
          <div className="lt-card p-5">
            <Server className="w-5 h-5 text-emerald-500 mb-2" />
            <h2 className="text-sm font-bold text-[rgb(var(--lt-text))]">Ephemeral AI Processing</h2>
            <p className="text-xs lt-text-muted mt-1">
              AI requests are processed in memory and discarded immediately after generation.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="lt-card p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[rgb(var(--lt-text))]">
          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">1. Introduction</h2>
            <p className="lt-text-muted">
              Welcome to <strong>Luta Tech</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), accessible from{' '}
              <Link href="/" className="text-[rgb(var(--lt-primary))] hover:underline">
                https://lutatech.com
              </Link>
              . We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">2. How We Process Files & Documents</h2>
            <p className="lt-text-muted">
              Our core architecture is <strong>privacy-first</strong>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 lt-text-muted">
              <li>
                <strong>Client-Side Tools (PDF & Image Operations):</strong> Tools such as PDF Merger, PDF Splitter, Image Compressor, Image Resizer, and format converters execute entirely within your browser environment via WebAssembly and JavaScript. Your documents do not touch our servers.
              </li>
              <li>
                <strong>Server-Assisted Tools (AI Features):</strong> For specific tools requiring artificial intelligence (such as AI Background Removal or Passport Photo generation), images are transmitted securely over HTTPS to our compute gateway, processed transiently in memory, and returned to you. We do not store or use your photos to train public machine learning models.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">3. Information We Collect</h2>
            <p className="lt-text-muted">
              When you use Luta Tech, we may collect the following categories of information:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2 lt-text-muted">
              <li>
                <strong>Account Information:</strong> If you register an account, we collect your name, email address, and hashed password. If you sign in via Google OAuth, we receive your verified email and display name from Google.
              </li>
              <li>
                <strong>Usage & Device Data:</strong> We automatically log standard server metadata, including browser type, device type, referring URLs, operating system, and general aggregated usage statistics to improve performance.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">4. Cookies & Advertising (Google AdSense)</h2>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color mb-3">
              <Cookie className="w-5 h-5 text-[rgb(var(--lt-primary))] shrink-0 mt-0.5" />
              <p className="text-xs lt-text-muted">
                Third party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites.
              </p>
            </div>
            <p className="lt-text-muted">
              Google&apos;s use of advertising cookies enables it and its partners to serve ads to our visitors based on their visit to Luta Tech and/or other sites on the Internet.
            </p>
            <p className="mt-2 lt-text-muted">
              Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgb(var(--lt-primary))] hover:underline"
              >
                Google Ads Settings
              </a>{' '}
              or by visiting{' '}
              <a
                href="https://www.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[rgb(var(--lt-primary))] hover:underline"
              >
                www.aboutads.info
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">5. Data Retention & Security</h2>
            <p className="lt-text-muted">
              We implement industry-standard encryption protocols (SSL/TLS HTTPS) to secure communication between your browser and our infrastructure. Account data is safely stored in managed databases with strict access controls. You can request deletion of your account and associated data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">6. Your Data Rights (GDPR & CCPA)</h2>
            <p className="lt-text-muted">
              Depending on your location, you have rights under data privacy laws (such as GDPR or California Consumer Privacy Act):
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 lt-text-muted">
              <li>The right to access, update, or delete your personal data.</li>
              <li>The right to withdraw consent for marketing or tracking cookies.</li>
              <li>The right to non-discrimination for exercising your privacy rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">7. Contact Us</h2>
            <p className="lt-text-muted">
              If you have any questions, concerns, or requests regarding this Privacy Policy, please contact our team at{' '}
              <a href="mailto:info@lutatech.com" className="text-[rgb(var(--lt-primary))] font-semibold hover:underline">
                info@lutatech.com
              </a>{' '}
              or visit our{' '}
              <Link href="/contact" className="text-[rgb(var(--lt-primary))] hover:underline">
                Contact Page
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
