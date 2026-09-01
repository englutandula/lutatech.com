import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, Clock, Globe, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Contact Us - Luta Tech Support',
  description:
    'Get in touch with the Luta Tech team for tool inquiries, feedback, business partnerships, or technical support.',
  alternates: {
    canonical: '/contact/',
  },
  openGraph: {
    title: 'Contact Us | Luta Tech',
    description: 'Reach out to Luta Tech team for support, questions, or feedback.',
    url: `${SITE_URL}/contact/`,
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Contact Us', url: '/contact/' },
        ]}
      />

      <div className="lt-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--lt-text))]">
            Get in Touch
          </h1>
          <p className="mt-3 text-base lt-text-muted max-w-xl mx-auto">
            Have questions, feedback, or need help with a tool? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <div className="lt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Email Support</h2>
              <p className="text-sm lt-text-muted mt-2">
                For general questions, bug reports, and partnership inquiries.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t lt-border-color">
              <a
                href="mailto:info@lutatech.com"
                className="inline-flex items-center text-sm font-semibold text-[rgb(var(--lt-primary))] hover:underline"
              >
                info@lutatech.com <ArrowRight className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          <div className="lt-card p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[rgb(var(--lt-accent)/0.1)] text-[rgb(var(--lt-accent))] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[rgb(var(--lt-text))]">Response Times</h2>
              <p className="text-sm lt-text-muted mt-2">
                Our support team typically reviews and replies to all inquiries within <strong>24 to 48 hours</strong>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t lt-border-color">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Support Active
              </span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lt-card p-6 sm:p-10 space-y-6">
          <h2 className="text-xl font-bold text-[rgb(var(--lt-text))] border-b lt-border-color pb-4">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-[rgb(var(--lt-text))]">Are Luta Tech tools free to use?</h3>
              <p className="text-xs lt-text-muted mt-1">
                Yes! All core tools including PDF manipulation, format conversions, and image compression are completely free without hidden limits.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[rgb(var(--lt-text))]">How do you ensure my files are secure?</h3>
              <p className="text-xs lt-text-muted mt-1">
                Document and image tools run entirely on your browser using WebAssembly. Your files never leave your computer for local operations.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[rgb(var(--lt-text))]">Can I request a new tool?</h3>
              <p className="text-xs lt-text-muted mt-1">
                Absolutely! Send us an email with your requested tool idea and our engineering team will review it for upcoming releases.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
