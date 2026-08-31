import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories, getToolsByCategory } from '@/lib/tools';
import { ToolIcon } from '@/components/ToolIcon';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Tool Categories - Image, PDF, Document, AI & Developer Tools',
  description:
    'Browse Luta Tech collection of free online tools organized by category: Image editing, PDF management, document converters, developer utilities, and AI.',
  alternates: {
    canonical: '/categories/',
  },
  openGraph: {
    title: 'Tool Categories - Image, PDF, Document, AI & Developer Tools | Luta Tech',
    description:
      'Browse Luta Tech digital tools organized by category. Fast, private, and free.',
    url: `${SITE_URL}/categories/`,
    type: 'website',
  },
};


export default function CategoriesPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories/' },
        ]}
      />
      <section className="border-b lt-border-color lt-surface">
        <div className="lt-container py-12">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[rgb(var(--lt-text))] lt-fade-up">Categories</h1>
          <p className="mt-2 text-sm lt-text-muted lt-fade-up">
            Explore tools organized by what they do.
          </p>
        </div>
      </section>

      <div className="lt-container py-10 space-y-16">
        {categories.map((cat, i) => {
          const catTools = getToolsByCategory(cat.name);
          if (catTools.length === 0) return null;
          return (
            <section
              key={cat.name}
              id={cat.name.toLowerCase()}
              className="scroll-mt-20 lt-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                  <ToolIcon name={cat.icon} className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--lt-text))]">{cat.name}</h2>
                  <p className="text-sm lt-text-muted">{cat.description}</p>
                </div>
                <span className="ml-auto rounded-full bg-[rgb(var(--lt-surface-2))] px-3 py-1 text-xs font-medium lt-text-muted">
                  {catTools.length} {catTools.length === 1 ? 'tool' : 'tools'}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {catTools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={tool.href || (tool.status === 'live' ? `/tools/${tool.slug}` : '/tools')}
                    className="lt-card lt-card-hover group flex items-center gap-4 p-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                      <ToolIcon name={tool.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-[rgb(var(--lt-text))]">{tool.name}</h3>
                      <p className="truncate text-xs lt-text-muted">{tool.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[rgb(var(--lt-primary))] opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
