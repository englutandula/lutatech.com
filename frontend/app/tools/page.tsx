'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, LayoutGrid, List, Sparkles, ArrowRight, Clock, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { tools, categories, type ToolCategory, Tool } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { ToolIcon } from '@/components/ToolIcon';

export default function AllToolsPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'soon'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="lt-container py-10 sm:py-14">
          <div className="max-w-2xl">
            <span className="lt-badge">Full Suite</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl text-[rgb(var(--lt-text))] lt-fade-up">
              All Digital Tools
            </h1>
            <p className="mt-2 text-sm sm:text-base lt-text-muted lt-fade-up">
              Browse our growing catalog of browser-based utilities, image tools, document helpers, and AI models.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and View Controls */}
      <section className="lt-container py-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b lt-border-color pb-6">
          {/* Left Controls: Search + Space-Saving Category & Status Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Inline Search Input */}
            <div className="relative min-w-[220px] flex-1 sm:flex-initial sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--lt-text-muted))]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] py-2.5 pl-9 pr-8 text-xs sm:text-sm font-medium text-[rgb(var(--lt-text))] placeholder-[rgb(var(--lt-text-muted))] shadow-xs transition-all hover:border-[rgb(var(--lt-primary)/0.5)] focus:border-[rgb(var(--lt-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)]"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Custom Dropdown */}
            <div className="relative min-w-[180px] flex-1 sm:flex-initial" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] py-2.5 pl-9 pr-3 text-xs sm:text-sm font-semibold text-[rgb(var(--lt-text))] shadow-xs transition-all hover:border-[rgb(var(--lt-primary)/0.5)] focus:border-[rgb(var(--lt-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] cursor-pointer"
              >
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[rgb(var(--lt-text-muted))]">
                  <Filter className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
                </div>
                <span className="truncate pr-2">
                  {activeCategory === 'all' 
                    ? `All Categories (${tools.length})`
                    : `${activeCategory} (${tools.filter((t) => t.category === activeCategory).length})`
                  }
                </span>
                <ChevronDown className={`h-4 w-4 text-[rgb(var(--lt-text-muted))] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryOpen && (
                <div className="absolute left-0 top-full z-50 mt-1.5 w-full md:w-56 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1.5 shadow-xl lt-fade-in max-h-64 overflow-y-auto lt-scrollbar">
                  <button
                    onClick={() => {
                      setActiveCategory('all');
                      setIsCategoryOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      activeCategory === 'all'
                        ? 'bg-[rgb(var(--lt-primary)/0.08)] text-[rgb(var(--lt-primary))]'
                        : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))]">({tools.length})</span>
                  </button>
                  {categories.map((cat) => {
                    const count = tools.filter((t) => t.category === cat.name).length;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setActiveCategory(cat.name as ToolCategory);
                          setIsCategoryOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer mt-0.5 ${
                          activeCategory === cat.name
                            ? 'bg-[rgb(var(--lt-primary)/0.08)] text-[rgb(var(--lt-primary))]'
                            : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-[10px] text-[rgb(var(--lt-text-muted))]">({count})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Status Custom Dropdown */}
            <div className="relative min-w-[140px] flex-1 sm:flex-initial" ref={statusDropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full flex items-center justify-between rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] py-2.5 pl-3.5 pr-3 text-xs sm:text-sm font-semibold text-[rgb(var(--lt-text))] shadow-xs transition-all hover:border-[rgb(var(--lt-primary)/0.5)] focus:border-[rgb(var(--lt-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.2)] cursor-pointer"
              >
                <span className="truncate pr-2">
                  {statusFilter === 'all' ? 'All Status' : statusFilter === 'live' ? '⚡ Live Ready' : '⏳ Coming Soon'}
                </span>
                <ChevronDown className={`h-4 w-4 text-[rgb(var(--lt-text-muted))] transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusOpen && (
                <div className="absolute right-0 top-full z-50 mt-1.5 w-full md:w-48 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1.5 shadow-xl lt-fade-in">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setIsStatusOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-[rgb(var(--lt-primary)/0.08)] text-[rgb(var(--lt-primary))]'
                        : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                    }`}
                  >
                    <span>All Status</span>
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('live');
                      setIsStatusOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer mt-0.5 ${
                      statusFilter === 'live'
                        ? 'bg-[rgb(var(--lt-primary)/0.08)] text-[rgb(var(--lt-primary))]'
                        : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                    }`}
                  >
                    <span>⚡ Live Ready</span>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))]">({tools.filter((t) => t.status === 'live').length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setStatusFilter('soon');
                      setIsStatusOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors cursor-pointer mt-0.5 ${
                      statusFilter === 'soon'
                        ? 'bg-[rgb(var(--lt-primary)/0.08)] text-[rgb(var(--lt-primary))]'
                        : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                    }`}
                  >
                    <span>⏳ Coming Soon</span>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))]">({tools.filter((t) => t.status === 'soon').length})</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: View Mode Toggle */}
          <div className="flex items-center gap-3 shrink-0 ml-auto lg:ml-0">
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
