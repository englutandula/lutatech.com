'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import { ToolIcon } from './ToolIcon';

export function ToolCard({ tool, index = 0 }: { tool: Tool & { rankBadge?: { label: string; badgeStyle: string }; rank?: number }; index?: number }) {
  const router = useRouter();
  const isLive = tool.status === 'live';
  const rawHref = tool.href || (isLive ? `/tools/${tool.slug}` : '/tools');
  const targetHref = rawHref.endsWith('/') ? rawHref : `${rawHref}/`;

  return (
    <Link
      href={targetHref}
      prefetch={false}
      onMouseEnter={() => {
        if (isLive) router.prefetch(targetHref);
      }}
      onTouchStart={() => {
        if (isLive) router.prefetch(targetHref);
      }}
      className="lt-card lt-card-hover group block p-5 lt-fade-up relative overflow-hidden"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Subtle hover glow — same as products page */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[rgb(var(--lt-primary)/0.04)] to-transparent rounded-[inherit]" />

      <div className="relative flex items-start justify-between">
        {/* Icon container — matches products page exactly */}
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-primary))] group-hover:bg-[rgb(var(--lt-primary))] group-hover:text-white transition-all duration-200 shadow-sm">
          <ToolIcon name={tool.icon} className="h-5 w-5" />
        </div>

        {tool.rankBadge ? (
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${tool.rankBadge.badgeStyle}`}>
            {tool.rankBadge.label}
          </span>
        ) : !isLive ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--lt-surface-2))] px-2.5 py-1 text-xs font-medium lt-text-muted">
            <Clock className="h-3 w-3" /> Soon
          </span>
        ) : null}
      </div>

      <h3 className="mt-4 text-base font-semibold text-[rgb(var(--lt-text))] group-hover:text-[rgb(var(--lt-primary))] transition-colors leading-snug">
        {tool.name}
      </h3>
      <p className="mt-1.5 text-sm lt-text-muted line-clamp-2">{tool.description}</p>
      <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--lt-primary))] opacity-0 transition-opacity group-hover:opacity-100">
        {isLive ? 'Open tool' : 'Coming soon'}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default ToolCard;
