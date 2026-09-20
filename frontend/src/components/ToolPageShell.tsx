import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ToolIcon } from './ToolIcon';
import type { Tool } from '@/lib/tools';

export function ToolPageShell({ tool, children }: { tool: Tool; children: ReactNode }) {
  return (
    <div className="w-full min-h-screen">
      <div className="lt-tool-ad-grid">

        {/* ── Left ad gutter — Google Auto Ads fills this ── */}
        <div className="lt-ad-col-left" aria-hidden="true" />

        {/* ── Tool content column ── */}
        <div className="lt-tool-content py-8 sm:py-10">

          {/* Back to Products */}
          <Link
            href="/products/"
            className="inline-flex items-center gap-1.5 text-sm lt-text-muted hover:text-[rgb(var(--lt-primary))] transition-colors mb-6 group"
          >
            <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
            Back to Products
          </Link>

          {/* Tool Header */}
          <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 sm:p-8 lt-fade-up shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lt-primary)/0.15)] to-[rgb(var(--lt-primary)/0.05)] text-[rgb(var(--lt-primary))] border border-[rgb(var(--lt-primary)/0.2)] shadow-xs">
                <ToolIcon name={tool.icon} className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[rgb(var(--lt-text))]">
                    {tool.name}
                  </h1>
                  <span className="lt-badge">
                    <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--lt-primary))]" /> Live
                  </span>
                  <span className="rounded-md bg-[rgb(var(--lt-surface-2))] border lt-border-color px-2 py-0.5 text-[11px] font-semibold text-[rgb(var(--lt-text-muted))]">
                    {tool.category}
                  </span>
                </div>
                <p className="mt-2 text-sm lt-text-muted leading-relaxed">{tool.longDescription}</p>
              </div>
            </div>
          </div>

          {/* ── Hero ad slot — Google Auto Ads fills this automatically ── */}
          <div className="lt-ad-hero" aria-hidden="true" />

          {/* Tool Content */}
          <div className="mt-6">{children}</div>

        </div>

        {/* ── Right ad gutter — Google Auto Ads fills this ── */}
        <div className="lt-ad-col-right" aria-hidden="true" />

      </div>
    </div>
  );
}

export default ToolPageShell;
