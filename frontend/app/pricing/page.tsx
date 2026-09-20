import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles, ShieldCheck, Zap, HelpCircle } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Pricing Plans - Free & Pro Subscriptions | Luta Tech',
  description:
    'Simple, transparent pricing for Luta Tech digital tools. Enjoy free unlimited in-browser processing, or upgrade for enhanced cloud features.',
  alternates: {
    canonical: '/pricing/',
  },
  openGraph: {
    title: 'Pricing Plans - Free & Pro Subscriptions | Luta Tech',
    description:
      'Simple, transparent pricing for Luta Tech digital tools. Start free forever.',
    url: `${SITE_URL}/pricing/`,
    type: 'website',
  },
};


const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for trying out our tools',
    features: [
      'Access to all live tools',
      'Up to 10 uses per day',
      'Standard export quality',
      'Basic tool history',
    ],
    cta: 'Get started',
    ctaLink: '/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    desc: 'For regular users and professionals',
    features: [
      'Unlimited tool usage',
      'High-quality exports',
      'Full tool history',
      'Priority processing',
      'Early access to new tools',
      'No watermarks',
    ],
    cta: 'Upgrade to Pro',
    ctaLink: '/register',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$29',
    period: 'per month',
    desc: 'For teams and commercial use',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared tool history',
      'Commercial license',
      'API access (coming soon)',
      'Priority support',
    ],
    cta: 'Get Business',
    ctaLink: '/register',
    highlight: false,
  },
];

const faqs = [
  {
    q: 'Can I use Luta Tech tools for free?',
    a: 'Yes. The Free plan gives you access to all live tools with up to 10 uses per day. No credit card required.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Absolutely. You can cancel or downgrade your plan at any time from your dashboard. You will keep access until the end of your billing period.',
  },
  {
    q: 'Do my files get uploaded to a server?',
    a: 'No. All tools run directly in your browser. Your files never leave your device, regardless of which plan you are on.',
  },
  {
    q: 'What is the difference between Pro and Business?',
    a: 'Pro is for individual professionals with unlimited usage and high-quality exports. Business adds team seats, shared history, a commercial license, and priority support.',
  },
  {
    q: 'Is there a student discount?',
    a: 'We are working on it. For now, the Free plan has no time limit and no credit card required, so you can use it as long as you need.',
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="relative overflow-hidden border-b lt-border-color">
        <div className="absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 lt-glow pointer-events-none" />
        <div className="lt-container relative py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border lt-border-color lt-surface px-4 py-1.5 text-sm font-medium lt-fade-up">
            <Sparkles className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
            <span>Pricing</span>
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl text-[rgb(var(--lt-text))] lt-fade-up">
            Choose the plan that fits
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg lt-text-muted lt-fade-up">
            Start free, upgrade when you need more. Every plan includes our privacy guarantee — your files never leave your browser.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="lt-container py-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`lt-card relative p-7 lt-fade-up ${plan.highlight ? 'lt-card-elevated border-[rgb(var(--lt-primary)/0.5)]' : ''}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[rgb(var(--lt-primary))] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-xl font-bold text-[rgb(var(--lt-text))]">{plan.name}</h3>
              <p className="mt-1 text-sm lt-text-muted">{plan.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-[rgb(var(--lt-text))]">{plan.price}</span>
                <span className="text-sm lt-text-muted">/{plan.period}</span>
              </div>
              <div className="mt-5 h-px lt-divider" />
              <ul className="mt-5 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--lt-primary)/0.1)]">
                      <Check className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" />
                    </div>
                    <span className="lt-text-muted">{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaLink}
                className={`mt-7 w-full ${plan.highlight ? 'lt-btn-primary' : 'lt-btn-secondary'}`}
              >
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Guarantees */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, title: 'Privacy guaranteed', desc: 'Your files never leave your browser on any plan.' },
            { icon: Zap, title: 'No setup required', desc: 'All tools work instantly — no installs or plugins.' },
            { icon: Sparkles, title: 'Always improving', desc: 'New tools and features added every month.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 lt-card p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">{item.title}</h4>
                <p className="mt-0.5 text-xs lt-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="lt-container py-16">
        <div className="text-center">
          <h2 className="lt-section-title">Frequently asked questions</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm lt-text-muted">
            Everything you need to know about Luta Tech pricing.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl space-y-3">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="lt-card p-5 lt-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start gap-3">
                <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-[rgb(var(--lt-primary))]" />
                <div>
                  <h4 className="text-sm font-semibold text-[rgb(var(--lt-text))]">{faq.q}</h4>
                  <p className="mt-1.5 text-sm lt-text-muted leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="lt-container pb-16">
        <div className="relative overflow-hidden rounded-3xl border lt-border-color lt-surface p-10 text-center sm:p-16">
          <div className="absolute inset-0 lt-glow pointer-events-none" />
          <div className="relative">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[rgb(var(--lt-text))]">
              Still deciding?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm lt-text-muted">
              Try every tool for free. No credit card, no time limit.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/products/" className="lt-btn-primary">
                Browse all tools <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register/" className="lt-btn-secondary">
                Create free account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
