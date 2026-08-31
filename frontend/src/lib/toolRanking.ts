'use client';

import { Tool } from './tools';

// Baseline platform usage counts (realistic initial seed weights)
const BASELINE_TOOL_SCORES: Record<string, number> = {
  'passport-photo-maker': 15420,
  'passport': 15420,
  'remove-bg': 12380,
  'background-remover': 12380,
  'pdf-compressor': 9850,
  'image-compressor': 8920,
  'image-resizer': 7640,
  'pdf-merger': 6510,
  'pdf-splitter': 5430,
  'pdf-to-jpg': 4890,
  'images-to-pdf': 4210,
  'pdf-organizer': 3820,
  'pdf-extract-pages': 2940,
  'pdf-delete-pages': 2450,
  'pdf-reorder-pages': 2180,
  'pdf-to-png': 1950,
  'pdf-to-webp': 1420,
  'jpg-to-pdf': 1380,
  'png-to-pdf': 1120,
};

const STORAGE_KEY = 'luta_tool_analytics_usage';

/**
 * Get the total usage score for a tool (Baseline + Local User Clicks)
 */
export function getToolUsageScore(slug: string): number {
  if (typeof window === 'undefined') {
    return BASELINE_TOOL_SCORES[slug] || 100;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const localUsage: Record<string, number> = raw ? JSON.parse(raw) : {};
    const localClicks = localUsage[slug] || 0;
    const base = BASELINE_TOOL_SCORES[slug] || 250;
    return base + localClicks * 15; // Local actions give weighted boost
  } catch {
    return BASELINE_TOOL_SCORES[slug] || 100;
  }
}

/**
 * Record a usage event for a tool
 */
export function recordToolUsage(slug: string): void {
  if (typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const localUsage: Record<string, number> = raw ? JSON.parse(raw) : {};
    localUsage[slug] = (localUsage[slug] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(localUsage));

    // Dispatch a custom event so UI updates immediately
    window.dispatchEvent(new CustomEvent('luta_tool_usage_updated', { detail: { slug } }));
  } catch (err) {
    console.warn('Could not record tool usage:', err);
  }
}

export interface RankedTool extends Tool {
  rank: number;
  score: number;
  rankBadge?: {
    label: string;
    badgeStyle: string;
  };
}

/**
 * Sort tools by popularity algorithm
 */
export function getRankedTools(tools: Tool[]): RankedTool[] {
  // Sort: Live tools with highest scores first, then remaining live tools, then soon tools
  const sorted = [...tools].sort((a, b) => {
    // 1. Live status precedence
    const aLive = a.status === 'live';
    const bLive = b.status === 'live';
    if (aLive && !bLive) return -1;
    if (!aLive && bLive) return 1;

    // 2. Score precedence
    const scoreA = getToolUsageScore(a.slug);
    const scoreB = getToolUsageScore(b.slug);
    return scoreB - scoreA;
  });

  return sorted.map((tool, index) => {
    const rank = index + 1;
    const score = getToolUsageScore(tool.slug);

    let rankBadge: { label: string; badgeStyle: string } | undefined = undefined;

    if (tool.status === 'live') {
      if (rank === 1) {
        rankBadge = {
          label: '#1 Most Popular',
          badgeStyle: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        };
      } else if (rank === 2) {
        rankBadge = {
          label: '#2 Trending',
          badgeStyle: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        };
      } else if (rank === 3) {
        rankBadge = {
          label: '#3 Top Pick',
          badgeStyle: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30',
        };
      }
    }

    return {
      ...tool,
      rank,
      score,
      rankBadge,
    };
  });
}
