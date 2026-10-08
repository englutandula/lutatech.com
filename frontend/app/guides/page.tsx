import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, ShieldCheck, Sparkles, FileText } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { guides } from '@/lib/guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Guides & Tutorials - Digital Tools Knowledge Base | Luta Tech',
  description:
    'Comprehensive guides and tutorials on passport photo standards, client-side data privacy, PDF compression techniques, image formats, and developer utilities.',
  alternates: {
    canonical: '/guides/',
  },
  openGraph: {
    title: 'Guides & Tutorials - Digital Tools Knowledge Base | Luta Tech',
    description:
      'Learn how modern digital tools, client-side encryption, and official document standards work.',
    url: `${SITE_URL}/guides/`,
    type: 'website',
  },
};

export default function GuidesIndexPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Guides', url: '/guides/' },
        ]}
      />

      <div className="lt-container max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[rgb(var(--lt-text))]">
            Guides &amp; Knowledge Base
          </h1>
          <p className="mt-3 text-base lt-text-muted">
            In-depth tutorials, technical breakdowns, and best practices for document handling,
            image processing, and client-side web security.
          </p>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <article
              key={guide.slug}
              className="lt-card p-6 sm:p-7 flex flex-col justify-between group hover:border-[rgb(var(--lt-primary)/0.4)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                    {guide.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs lt-text-muted">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{guide.readTime}</span>
                  </div>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-[rgb(var(--lt-text))] group-hover:text-[rgb(var(--lt-primary))] transition-colors leading-snug">
                  <Link href={`/guides/${guide.slug}/`}>
                    {guide.title}
                  </Link>
                </h2>

                <p className="mt-2.5 text-xs sm:text-sm lt-text-muted leading-relaxed line-clamp-3">
                  {guide.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t lt-border-color flex items-center justify-between text-xs">
                <span className="lt-text-muted">By {guide.author}</span>
                <Link
                  href={`/guides/${guide.slug}/`}
                  className="font-bold text-[rgb(var(--lt-primary))] inline-flex items-center gap-1 group-hover:underline"
                >
                  Read Guide <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
