import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { guides, getGuide } from '@/lib/guides';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | Luta Tech`,
    description: guide.description,
    alternates: {
      canonical: `/guides/${guide.slug}/`,
    },
    openGraph: {
      title: `${guide.title} | Luta Tech`,
      description: guide.description,
      url: `${SITE_URL}/guides/${guide.slug}/`,
      type: 'article',
      publishedTime: guide.publishedAt,
      authors: [guide.author],
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen py-10 sm:py-14">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Guides', url: '/guides/' },
          { name: guide.title, url: `/guides/${guide.slug}/` },
        ]}
      />

      <article className="lt-container max-w-4xl">
        {/* Back navigation */}
        <Link
          href="/guides/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-primary))] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to all guides
        </Link>

        {/* Header Header */}
        <header className="mb-10 pb-8 border-b lt-border-color">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
              {guide.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs lt-text-muted">
              <Clock className="w-3.5 h-3.5" /> {guide.readTime}
            </span>
            <span className="flex items-center gap-1.5 text-xs lt-text-muted">
              <Calendar className="w-3.5 h-3.5" /> {guide.publishedAt}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[rgb(var(--lt-text))] leading-tight">
            {guide.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg lt-text-muted leading-relaxed">
            {guide.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs lt-text-muted">
            <User className="w-4 h-4 text-[rgb(var(--lt-primary))]" />
            <span>Authored by <strong>{guide.author}</strong></span>
          </div>
        </header>

        {/* Related Tool Banner */}
        <div className="mb-10 p-5 rounded-2xl bg-[rgb(var(--lt-primary)/0.06)] border border-[rgb(var(--lt-primary)/0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary))] text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[rgb(var(--lt-primary))] block">
                Recommended Tool
              </span>
              <p className="text-sm font-bold text-[rgb(var(--lt-text))]">
                Try the free {guide.relatedToolName} online
              </p>
            </div>
          </div>
          <Link
            href={`/tools/${guide.relatedToolSlug}/`}
            className="lt-btn-primary text-xs px-4 py-2 shrink-0 inline-flex items-center gap-1.5"
          >
            Open Tool <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content Body */}
        <div className="space-y-10 text-[rgb(var(--lt-text))] leading-relaxed">
          {guide.sections.map((section, idx) => (
            <section key={section.heading} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[rgb(var(--lt-text))] pt-2">
                {section.heading}
              </h2>

              <div className="space-y-3.5 text-sm sm:text-base lt-text-muted leading-relaxed">
                {section.content.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>

              {section.tips && section.tips.length > 0 && (
                <div className="mt-4 p-5 rounded-2xl bg-[rgb(var(--lt-surface-2))] border lt-border-color space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-primary))] block">
                    Key Takeaways &amp; Best Practices
                  </span>
                  <ul className="space-y-2 text-xs sm:text-sm lt-text-muted">
                    {section.tips.map((tip, tIdx) => (
                      <li key={tIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 pt-8 border-t lt-border-color flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/guides/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-primary))]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Browse more tutorials
          </Link>
          <Link
            href={`/tools/${guide.relatedToolSlug}/`}
            className="font-bold text-xs text-[rgb(var(--lt-primary))] inline-flex items-center gap-1 hover:underline"
          >
            Launch {guide.relatedToolName} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>
    </div>
  );
}
