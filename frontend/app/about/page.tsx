import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Target, Eye, Heart, Zap, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'About Luta Tech - Our Mission for Fast, Private Digital Tools',
  description:
    'Learn about Luta Tech mission to build high-performance, private, and accessible browser-based tools for creators, developers, and businesses worldwide.',
  alternates: {
    canonical: '/about/',
  },
  openGraph: {
    title: 'About Luta Tech - Our Mission for Fast, Private Digital Tools',
    description:
      'Discover the vision and technology behind Luta Tech private, browser-first digital studio.',
    url: `${SITE_URL}/about/`,
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about/' },
        ]}
      />

      <section className="border-b lt-border-color lt-surface">
        <div className="lt-container py-16 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[rgb(var(--lt-text))] lt-fade-up">About Luta Tech</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg lt-text-muted lt-fade-up">
            We&apos;re building the world&apos;s most accessible digital tools platform — powerful,
            private, and beautifully simple.
          </p>
        </div>
      </section>

      <section className="lt-container py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="lt-fade-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[rgb(var(--lt-text))]">Our mission</h2>
            <p className="mt-3 text-sm lt-text-muted leading-relaxed">
              Digital tools should be fast, private, and accessible to everyone. Too many
              platforms require uploads, accounts, and subscriptions for basic tasks. Luta Tech
              flips that model — our tools run directly in your browser, processing your files
              locally without sending them to a server.
            </p>
            <p className="mt-3 text-sm lt-text-muted leading-relaxed">
              We started with tools like Passport Photo Maker and Background Remover — and we&apos;re
              rapidly expanding to cover image editing, PDF management, document conversion,
              developer utilities, and AI-powered workflows.
            </p>
          </div>
          <div className="lt-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--lt-accent)/0.1)] text-[rgb(var(--lt-accent))]">
              <Eye className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[rgb(var(--lt-text))]">Our vision</h2>
            <p className="mt-3 text-sm lt-text-muted leading-relaxed">
              A single platform where every digital tool you need lives — from cropping a passport
              photo to formatting JSON, from removing a background to converting a PDF. No juggling
              ten different websites, no browser extensions, no desktop installs.
            </p>
            <p className="mt-3 text-sm lt-text-muted leading-relaxed">
              Every tool shares the same clean interface, the same commitment to privacy, and the
              same instant performance. That&apos;s the platform we&apos;re building.
            </p>
          </div>
        </div>
      </section>

      <section className="lt-container py-16">
        <h2 className="lt-section-title text-center">What we value</h2>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Zap, title: 'Speed', desc: 'Tools that respond instantly. No spinners, no waiting, no friction.' },
            { icon: ShieldCheck, title: 'Privacy', desc: 'Your files stay on your device. We process everything in-browser.' },
            { icon: Heart, title: 'Quality', desc: 'Every tool is crafted with care — polished, tested, and reliable.' },
            { icon: Users, title: 'Accessibility', desc: 'Free to use, works on any device, no installs required.' },
            { icon: Target, title: 'Focus', desc: 'One thing done well beats ten things done poorly. Each tool has one job.' },
            { icon: ArrowRight, title: 'Progress', desc: 'We ship new tools regularly and improve existing ones continuously.' },
          ].map((val, i) => (
            <div key={val.title} className="lt-card p-6 lt-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lt-primary)/0.15)] to-[rgb(var(--lt-accent)/0.1)] text-[rgb(var(--lt-primary))]">
                <val.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-[rgb(var(--lt-text))]">{val.title}</h3>
              <p className="mt-1.5 text-sm lt-text-muted">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lt-container pb-16">
        <div className="relative overflow-hidden rounded-3xl border lt-border-color lt-surface p-10 text-center sm:p-16">
          <div className="absolute inset-0 lt-glow pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[rgb(var(--lt-text))]">Start using Luta Tech</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm lt-text-muted">
              Jump straight into our tools — no account required to try them.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/products/" className="lt-btn-primary">
                Browse tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register/" className="lt-btn-secondary">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
