import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { ToolIcon } from './ToolIcon';
import type { Tool } from '@/lib/tools';

export function ToolPageShell({ tool, children }: { tool: Tool; children: ReactNode }) {
  return (
    <div className="lt-container py-8 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs lt-text-muted mb-6">
        <Link href="/" className="hover:text-[rgb(var(--lt-text))] transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/tools/" className="hover:text-[rgb(var(--lt-text))] transition-colors">
          Tools
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-[rgb(var(--lt-text))] font-semibold">{tool.name}</span>
      </nav>

      {/* Tool Header Card */}
      <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 sm:p-8 lt-fade-up shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <p className="mt-2 max-w-3xl text-sm lt-text-muted leading-relaxed">{tool.longDescription}</p>
            </div>
          </div>
        </div>

        {/* Security & Speed Trust Row */}
        <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 border-t lt-border-color pt-4 text-xs font-medium lt-text-muted">
          <span className="inline-flex items-center gap-1.5 text-[rgb(var(--lt-text))]">
            <ShieldCheck className="h-4 w-4 text-[rgb(var(--lt-primary))]" /> Client-side processing (Zero data stored)
          </span>
          <span className="inline-flex items-center gap-1.5 text-[rgb(var(--lt-text))]">
            <Zap className="h-4 w-4 text-[rgb(var(--lt-primary))]" /> Instant in-browser execution
          </span>
          <span className="inline-flex items-center gap-1.5 text-[rgb(var(--lt-text))]">
            <Sparkles className="h-4 w-4 text-[rgb(var(--lt-primary))]" /> No watermarks & 100% Free
          </span>
        </div>
      </div>

      {/* Tool Main Content */}
      <div className="mt-8">{children}</div>
    </div>
  );
}

export default ToolPageShell;
