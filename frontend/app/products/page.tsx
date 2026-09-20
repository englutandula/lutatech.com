'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';
import { PRODUCT_SUITES, ALL_PRODUCTS, type ProductItem, type ProductSuite } from '@/lib/products';
import { ToolIcon } from '@/components/ToolIcon';


/** Maps a suite id to a subtle accent colour for the sidebar icon pill */
const SUITE_ACCENT: Record<string, string> = {
  pdf: 'bg-red-500/10 text-red-500',
  creative: 'bg-violet-500/10 text-violet-500',
  utilities: 'bg-sky-500/10 text-sky-500',
};

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSuite = searchParams.get('suite') || 'all';
  const [activeSuiteId, setActiveSuiteId] = useState<string>(initialSuite);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const s = searchParams.get('suite');
    if (s) setActiveSuiteId(s);
  }, [searchParams]);

  const filteredSuites = useMemo(() => {
    let suites = PRODUCT_SUITES;

    if (activeSuiteId !== 'all') {
      suites = suites.filter((s) => s.id === activeSuiteId);
    }

    if (!searchQuery.trim()) {
      return suites;
    }

    const q = searchQuery.toLowerCase().trim();
    return suites
      .map((suite) => {
        const matchingGroups = suite.groups
          .map((group) => {
            const matchingItems = group.items.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q)
            );
            return { ...group, items: matchingItems };
          })
          .filter((group) => group.items.length > 0);

        return { ...suite, groups: matchingGroups };
      })
      .filter((suite) => suite.groups.length > 0);
  }, [activeSuiteId, searchQuery]);

  const totalToolCount = ALL_PRODUCTS.length;

  // Visible count based on current filter+search
  const visibleCount = filteredSuites.reduce(
    (acc, suite) => acc + suite.groups.reduce((a, g) => a + g.items.length, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--lt-bg))] py-8 md:py-12">
      <div className="lt-container">
        {/* ── Page Hero ── */}
        <div className="mx-auto max-w-3xl text-center mb-8 md:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[rgb(var(--lt-text))] mb-4">
            All Products &amp; Studio Suites
          </h1>
          <p className="text-sm sm:text-base text-[rgb(var(--lt-text-muted))] leading-relaxed max-w-xl mx-auto">
            {totalToolCount} browser-native utilities engineered for maximum performance and privacy.
            Zero server file storage — everything runs 100% locally.
          </p>
        </div>

        {/* ── Responsive Layout ── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              DESKTOP SIDEBAR CARD
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <aside className="hidden lg:block w-72 shrink-0">

            {/* ── Card: Browse by Suite ── */}
            <div className="sticky top-24 mt-[90px] rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden shadow-sm">

              {/* Search */}
              <div className="px-4 pt-4 pb-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[rgb(var(--lt-text-muted))]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] pl-8 pr-8 py-2 text-xs text-[rgb(var(--lt-text))] placeholder:text-[rgb(var(--lt-text-muted))] focus:border-[rgb(var(--lt-primary))] focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation list */}
              <nav className="px-3 pb-4 space-y-0.5" aria-label="Product suites">

                {/* All Products row */}
                <button
                  type="button"
                  onClick={() => { setActiveSuiteId('all'); setSearchQuery(''); }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    activeSuiteId === 'all'
                      ? 'bg-[rgb(var(--lt-primary))] text-white shadow-sm'
                      : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-colors ${
                      activeSuiteId === 'all'
                        ? 'bg-white/20'
                        : 'bg-[rgb(var(--lt-surface-2))] group-hover:bg-[rgb(var(--lt-border))]'
                    }`}>
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </div>
                    <span>All Products</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    activeSuiteId === 'all'
                      ? 'bg-white/20 text-white'
                      : 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                  }`}>
                    {totalToolCount}
                  </span>
                </button>


                {/* Suite rows */}
                {PRODUCT_SUITES.map((suite) => {
                  const suiteToolCount = suite.groups.flatMap((g) => g.items).length;
                  const isSelected = activeSuiteId === suite.id;
                  const accent = SUITE_ACCENT[suite.id] ?? 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-primary))]';

                  return (
                    <button
                      key={suite.id}
                      type="button"
                      onClick={() => setActiveSuiteId(suite.id)}
                      className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[rgb(var(--lt-primary))] text-white shadow-sm'
                          : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                      }`}
                    >
                      <span className="truncate">{suite.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>


          </aside>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              MOBILE FILTER BAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="lg:hidden w-full space-y-3 mb-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-9 py-2.5 text-xs text-[rgb(var(--lt-text))] placeholder:text-[rgb(var(--lt-text-muted))] shadow-xs focus:border-[rgb(var(--lt-primary))] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Mobile Suite Selector Dropdown */}
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[rgb(var(--lt-text-muted))]">
                <LayoutGrid className="h-4 w-4" />
              </div>
              <select
                value={activeSuiteId}
                onChange={(e) => setActiveSuiteId(e.target.value)}
                aria-label="Select suite or category"
                className="w-full appearance-none rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] pl-10 pr-10 py-2.5 text-xs font-semibold text-[rgb(var(--lt-text))] shadow-xs focus:border-[rgb(var(--lt-primary))] focus:outline-none cursor-pointer transition-colors"
              >
                <option value="all" className="bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))]">
                  All Products ({totalToolCount})
                </option>
                {PRODUCT_SUITES.map((suite) => {
                  const suiteToolCount = suite.groups.flatMap((g) => g.items).length;
                  return (
                    <option
                      key={suite.id}
                      value={suite.id}
                      className="bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))]"
                    >
                      {suite.name} ({suiteToolCount})
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[rgb(var(--lt-text-muted))]">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              MAIN CONTENT GRID
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <main className="flex-1 min-w-0 w-full">

            {/* Search results notice */}
            {searchQuery && (
              <div className="pb-4 mb-6 border-b lt-border-color">
                <p className="text-xs font-semibold text-[rgb(var(--lt-text-muted))]">
                  {visibleCount} result{visibleCount !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                </p>
              </div>
            )}

            {/* Products by Suite */}
            {filteredSuites.length > 0 ? (
              <div className="space-y-12">
                {filteredSuites.map((suite) => (
                  <section key={suite.id} id={suite.id} className="space-y-6 scroll-mt-24">

                    {/* Suite subheader */}
                    <div className="flex items-center justify-between pb-2.5 border-b lt-border-color">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full bg-[rgb(var(--lt-primary))]" />
                          <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--lt-text))]">
                            {suite.name}
                          </h3>
                        </div>
                        <span className="text-xs font-semibold text-[rgb(var(--lt-text-muted))]">
                          {suite.groups.flatMap((g) => g.items).length} tools
                        </span>
                      </div>

                    {/* Tool groups */}
                    <div className="space-y-8">
                      {suite.groups.map((group) => (
                        <div key={group.id} className="space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[rgb(var(--lt-text-muted))]">
                            {group.title}
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {group.items.map((item) => (
                                <Link
                                  key={item.id}
                                  href={item.href}
                                  className="group relative flex flex-col justify-between rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-5 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-[rgb(var(--lt-primary)/0.35)] hover:shadow-lg cursor-pointer overflow-hidden"
                                >
                                  {/* Subtle hover glow */}
                                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[rgb(var(--lt-primary)/0.04)] to-transparent rounded-2xl" />

                                  <div className="relative">
                                    {/* Top: Icon + Badge */}
                                    <div className="flex items-start justify-between mb-3.5">
                                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-primary))] group-hover:bg-[rgb(var(--lt-primary))] group-hover:text-white transition-all duration-200 shadow-sm">
                                        <ToolIcon name={item.icon} className="h-5 w-5" />
                                      </div>
                                      {item.badge && (
                                        <span
                                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                            item.badge === 'AI'
                                              ? 'bg-violet-500/12 text-violet-600 dark:text-violet-400'
                                              : item.badge === 'Pro'
                                              ? 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
                                              : 'bg-[rgb(var(--lt-primary)/0.10)] text-[rgb(var(--lt-primary))]'
                                          }`}
                                        >
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>

                                    {/* Title + Description */}
                                    <h4 className="text-sm font-bold text-[rgb(var(--lt-text))] group-hover:text-[rgb(var(--lt-primary))] transition-colors leading-snug">
                                      {item.name}
                                    </h4>
                                    <p className="text-[11px] text-[rgb(var(--lt-text-muted))] line-clamp-2 mt-1 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>

                                  {/* Action row */}
                                  <div className="mt-4 pt-3 border-t lt-border-color flex items-center justify-between">
                                    <span className="text-xs font-bold text-[rgb(var(--lt-primary))]">
                                      Open Tool
                                    </span>
                                    <ArrowRight className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))] transition-transform group-hover:translate-x-1 duration-200" />
                                  </div>
                                </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))]">
                <div className="flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-2xl bg-[rgb(var(--lt-surface-2))]">
                  <Search className="h-6 w-6 text-[rgb(var(--lt-text-muted))]" />
                </div>
                <p className="text-base font-bold text-[rgb(var(--lt-text))]">
                  No results for &ldquo;{searchQuery}&rdquo;
                </p>
                <p className="text-xs text-[rgb(var(--lt-text-muted))] mt-1 max-w-xs mx-auto">
                  Try keywords like <em>pdf</em>, <em>compress</em>, <em>passport</em>, or <em>qr</em>.
                </p>
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setActiveSuiteId('all'); }}
                  className="mt-5 rounded-xl bg-[rgb(var(--lt-primary))] px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                >
                  Clear Search
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[rgb(var(--lt-bg))] flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[rgb(var(--lt-primary))] border-t-transparent" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
