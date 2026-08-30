'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, LayoutGrid, List, Sparkles, ArrowRight, Clock, CheckCircle2, X } from 'lucide-react';
import { tools, categories, type ToolCategory, Tool } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { ToolIcon } from '@/components/ToolIcon';

export default function AllToolsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'soon'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      const matchesQuery =
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'live' ? t.status === 'live' : t.status === 'soon';
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [query, activeCategory, statusFilter]);

  return (
    <div>
      {/* Header */}
      <section className="border-b lt-border-color bg-[rgb(var(--lt-surface))]">
        <div className="lt-container py-12 sm:py-16">
          <div className="max-w-2xl">
            <span className="lt-badge">Full Suite</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-[rgb(var(--lt-text))] lt-fade-up">
              All Digital Tools
            </h1>
            <p className="mt-2 text-sm sm:text-base lt-text-muted lt-fade-up">
              Browse our growing catalog of browser-based utilities, image tools, document helpers, and AI models.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mt-8 max-w-xl lt-fade-up">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[rgb(var(--lt-text-muted))]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools by name, description, or category..."
              className="lt-input pl-12 pr-10 shadow-xs"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters and View Controls */}
      <section className="lt-container py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b lt-border-color pb-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto lt-scrollbar pb-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[rgb(var(--lt-primary))] text-white shadow-xs'
                  : 'border lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:text-[rgb(var(--lt-text))]'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeCategory === cat.name
                    ? 'bg-[rgb(var(--lt-primary))] text-white shadow-xs'
                    : 'border lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Right Controls: Status filter & View mode */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Selector */}
            <div className="inline-flex rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] shadow-xs'
                    : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('live')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'live'
                    ? 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-primary))] shadow-xs'
                    : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Live Ready
              </button>
              <button
                onClick={() => setStatusFilter('soon')}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === 'soon'
                    ? 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] shadow-xs'
                    : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Coming Soon
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="inline-flex rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-primary))] shadow-xs'
                    : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-primary))] shadow-xs'
                    : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex items-center justify-between text-xs lt-text-muted">
          <span>
            Showing <strong className="text-[rgb(var(--lt-text))]">{filtered.length}</strong> of {tools.length} tools
          </span>
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
                setStatusFilter('all');
              }}
              className="text-[rgb(var(--lt-primary))] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Tools Display */}
        {filtered.length === 0 ? (
          <div className="mt-16 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-12 text-center">
            <p className="text-base font-bold text-[rgb(var(--lt-text))]">No tools match your criteria</p>
            <p className="mt-1.5 text-xs lt-text-muted">Try adjusting your search query or selected category filter.</p>
            <button
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
                setStatusFilter('all');
              }}
              className="mt-4 lt-btn-secondary py-1.5 px-3 text-xs"
            >
              Clear filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool, i) => (
              <ToolCard key={tool.slug} tool={tool} index={i} />
            ))}
          </div>
        ) : (
          /* List View */
          <div className="mt-6 space-y-3">
            {filtered.map((tool) => {
              const isLive = tool.status === 'live';
              const targetHref = tool.href || (isLive ? `/tools/${tool.slug}` : '/tools');
              return (
                <Link
                  key={tool.slug}
                  href={targetHref}
                  className="lt-card lt-card-hover group flex items-center justify-between p-4 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lt-primary)/0.15)] to-[rgb(var(--lt-primary)/0.05)] text-[rgb(var(--lt-primary))]">
                      <ToolIcon name={tool.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-sm font-bold text-[rgb(var(--lt-text))] truncate">{tool.name}</h3>
                        <span className="rounded-md bg-[rgb(var(--lt-surface-2))] border lt-border-color px-2 py-0.5 text-[10px] font-semibold text-[rgb(var(--lt-text-muted))]">
                          {tool.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs lt-text-muted truncate">{tool.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] px-2.5 py-0.5 text-xs font-semibold border border-[rgb(var(--lt-primary)/0.2)]">
                        <CheckCircle2 className="h-3 w-3" /> Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))] px-2.5 py-0.5 text-xs font-medium">
                        <Clock className="h-3 w-3" /> Soon
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-[rgb(var(--lt-text-muted))] transition-transform group-hover:translate-x-1 group-hover:text-[rgb(var(--lt-primary))]" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
