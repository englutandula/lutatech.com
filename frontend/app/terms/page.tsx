import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, CheckCircle, AlertTriangle, Shield, Scale } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Terms of Service - Luta Tech',
  description:
    'Read the Terms of Service for using Luta Tech digital tools, AI converters, and online utilities.',
  alternates: {
    canonical: '/terms/',
  },
  openGraph: {
    title: 'Terms of Service | Luta Tech',
    description: 'Terms and conditions governing the use of Luta Tech website and services.',
    url: `${SITE_URL}/terms/`,
    type: 'website',
  },
};

export default function TermsPage() {
  const lastUpdated = 'September 1, 2026';

  return (
    <div className="min-h-screen py-12 sm:py-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms/' },
        ]}
      />

      <div className="lt-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
            <Scale className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--lt-text))]">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm lt-text-muted">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="lt-card p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-[rgb(var(--lt-text))]">
          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">1. Agreement to Terms</h2>
            <p className="lt-text-muted">
              By accessing or using <strong>Luta Tech</strong> (the &quot;Service&quot;) available at{' '}
              <Link href="/" className="text-[rgb(var(--lt-primary))] hover:underline">
                https://lutatech.com
              </Link>
              , you agree to be bound by these Terms of Service. If you do not agree to all terms and conditions, you must not use or access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">2. Use of Digital Tools</h2>
            <p className="lt-text-muted">
              Luta Tech provides client-side and server-assisted utilities (including PDF organizers, image converters, background removers, and passport photo formatting).
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5 lt-text-muted">
              <li>You may use these tools for personal, educational, or commercial projects.</li>
              <li>You must not use the tools for illegal purposes or to process infringing, defamatory, or harmful content.</li>
              <li>You retain 100% full intellectual property ownership of all files and media you process on the platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">3. User Accounts</h2>
            <p className="lt-text-muted">
              Certain features may require creating an account. You are responsible for safeguarding your login credentials and notifying us immediately of any unauthorized access. We reserve the right to suspend or terminate accounts that violate our usage policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">4. Intellectual Property</h2>
            <p className="lt-text-muted">
              The Luta Tech platform code, user interface, brand assets, logos, and original software are the intellectual property of Luta Tech. You may not reverse-engineer, replicate, or resell our website services as a standalone product without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">5. Disclaimer of Warranties</h2>
            <p className="lt-text-muted">
              The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied. While we strive for maximum accuracy in all tools (such as official passport dimension templates), official acceptance by government agencies or third parties remains the responsibility of the applicant.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">6. Limitation of Liability</h2>
            <p className="lt-text-muted">
              In no event shall Luta Tech or its contributors be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">7. Changes to Terms</h2>
            <p className="lt-text-muted">
              We reserve the right to modify these Terms at any time. Continued use of the platform following any modifications constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-3">8. Contact Information</h2>
            <p className="lt-text-muted">
              Questions regarding these Terms should be sent to{' '}
              <a href="mailto:info@lutatech.com" className="text-[rgb(var(--lt-primary))] font-semibold hover:underline">
                info@lutatech.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
