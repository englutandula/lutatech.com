import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import type { Tool } from '@/lib/tools';
import { ToolIcon } from './ToolIcon';

const accentColors: Record<string, string> = {
  emerald: 'from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  sky: 'from-sky-500/15 to-sky-500/5 text-sky-600 dark:text-sky-400',
  rose: 'from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400',
  amber: 'from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400',
  indigo: 'from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400',
  violet: 'from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400',
  teal: 'from-teal-500/15 to-teal-500/5 text-teal-600 dark:text-teal-400',
  orange: 'from-orange-500/15 to-orange-500/5 text-orange-600 dark:text-orange-400',
  pink: 'from-pink-500/15 to-pink-500/5 text-pink-600 dark:text-pink-400',
  cyan: 'from-cyan-500/15 to-cyan-500/5 text-cyan-600 dark:text-cyan-400',
  fuchsia: 'from-fuchsia-500/15 to-fuchsia-500/5 text-fuchsia-600 dark:text-fuchsia-400',
  lime: 'from-lime-500/15 to-lime-500/5 text-lime-600 dark:text-lime-400',
};

export function ToolCard({ tool, index = 0 }: { tool: Tool; index?: number }) {
  const accent = accentColors[tool.accent] ?? accentColors.emerald;
  const isLive = tool.status === 'live';
  const targetHref = tool.href || (isLive ? `/tools/${tool.slug}` : '/tools');

  return (
    <Link
      href={targetHref}
      className="lt-card lt-card-hover group block p-5 lt-fade-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent}`}>
          <ToolIcon name={tool.icon} className="h-6 w-6" />
        </div>
        {!isLive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--lt-surface-2))] px-2.5 py-1 text-xs font-medium lt-text-muted">
            <Clock className="h-3 w-3" /> Soon
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-[rgb(var(--lt-text))]">{tool.name}</h3>
      <p className="mt-1.5 text-sm lt-text-muted line-clamp-2">{tool.description}</p>
      <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[rgb(var(--lt-primary))] opacity-0 transition-opacity group-hover:opacity-100">
        {isLive ? 'Open tool' : 'Coming soon'}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default ToolCard;
