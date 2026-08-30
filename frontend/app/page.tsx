'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  Star,
  Users,
  Search,
  SlidersHorizontal,
  Compass,
  Cpu,
  Globe2,
} from 'lucide-react';
import { tools, categories, ToolCategory, Tool } from '@/lib/tools';
import { ToolCard } from '@/components/ToolCard';
import { ToolIcon } from '@/components/ToolIcon';
import { SearchDialog } from '@/components/SearchDialog';
import { ShowcaseSlider } from '@/components/ShowcaseSlider';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredTools =
    activeCategory === 'All'
      ? tools
      : tools.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());

  const featuredTools = tools.filter((t) => t.popular || t.status === 'live');

  return (
    <div className="flex flex-col">
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full lt-glow blur-3xl opacity-70" />

        <div className="lt-container relative z-10 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border lt-border-color bg-[rgb(var(--lt-surface))] px-3.5 py-1.5 text-xs font-semibold text-[rgb(var(--lt-text))] shadow-xs lt-fade-up">
            <span className="flex h-2 w-2 rounded-full bg-[rgb(var(--lt-primary))] animate-pulse" />
            <span className="text-[rgb(var(--lt-text-muted))]">Next-Gen Tools Suite</span>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <span className="font-bold text-[rgb(var(--lt-primary))]">100% Free & Private</span>
          </div>

          {/* Main Headline */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[rgb(var(--lt-text))] lt-fade-up leading-[1.12]">
            Every tool you need,
            <br />
            in one platform
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg lt-text-muted leading-relaxed lt-fade-up">
            High-performance digital tools for images, documents, developer workflows, and AI.
            Instant, private, and running directly in your browser.
          </p>

          {/* Quick Action Search & Jump Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lt-fade-up">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex w-full sm:w-auto items-center justify-center gap-3 lt-btn-primary cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>Explore All Tools</span>
              <kbd className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
            </button>
            <Link href="/tools/passport" className="flex w-full sm:w-auto items-center justify-center lt-btn-secondary">
              Passport Photo Maker <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Popular Search Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs lt-fade-up">
            <span className="lt-text-muted font-medium">Quick jump:</span>
            {[
              { name: 'Passport Photo', href: '/tools/passport' },
              { name: 'Background Remover', href: '/tools/remove-bg' },
              { name: 'PDF Merge', href: '/tools' },
              { name: 'QR Code', href: '/tools' },
              { name: 'JSON Formatter', href: '/tools' },
            ].map((tag) => (
              <Link
                key={tag.name}
                href={tag.href}
                className="rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] px-2.5 py-1 font-medium text-[rgb(var(--lt-text-muted))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:text-[rgb(var(--lt-primary))] transition-colors"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          {/* 4 Stats Highlights */}
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-5 lt-fade-up">
            {[
              { value: '12+', label: 'Digital Tools', sub: 'Growing weekly' },
              { value: '100%', label: 'Browser-Based', sub: 'Client-side processing' },
              { value: '0 sec', label: 'Server Storage', sub: 'Zero data retention' },
              { value: '8', label: 'Categories', sub: 'Image, PDF, AI, Dev' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="lt-card p-4 sm:p-5 text-center transition-all hover:border-[rgb(var(--lt-primary)/0.4)]"
              >
                <div className="lt-stat-value">{stat.value}</div>
                <div className="mt-1 text-sm font-semibold text-[rgb(var(--lt-text))]">{stat.label}</div>
                <div className="mt-0.5 text-xs lt-text-muted">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOL SHOWCASE 1: PASSPORT PHOTO MAKER ── */}
      <section className="border-t lt-border-color bg-[rgb(var(--lt-surface))] py-20">
        <div className="lt-container">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--lt-primary))] uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Official Standard Compliance
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl text-[rgb(var(--lt-text))]">
                Create compliant passport & visa photos in seconds
              </h2>
              <p className="text-sm lt-text-muted leading-relaxed">
                Automatically aligns, crops, and sizes your photo to official country standards (US 2×2 in, EU/UK 35×45 mm, Tanzania, Kenya, and 15+ countries).
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-[rgb(var(--lt-text))]">
                {[
                  'Automatic face positioning and framing guides',
                  'Single photo download or multi-photo 4×6 print sheets',
                  'Built-in background color replacement (White, Light Blue, etc.)',
                  '100% private — processed directly in your browser',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[rgb(var(--lt-primary))] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/tools/passport" className="lt-btn-primary">
                  Launch Passport Photo Maker <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual preview: Image Slider */}
            <div className="lg:col-span-7">
              <ShowcaseSlider />
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOL SHOWCASE 2: BACKGROUND REMOVER ── */}
      <section className="border-t lt-border-color bg-[rgb(var(--lt-bg))] py-20">
        <div className="lt-container">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--lt-primary))] uppercase tracking-wider">
                <Zap className="h-4 w-4" /> 1-Click Neural Erase
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl text-[rgb(var(--lt-text))]">
                Instant AI Background Removal with zero quality loss
              </h2>
              <p className="text-sm lt-text-muted leading-relaxed">
                Isolate portraits, products, and graphics cleanly. Export transparent PNGs or replace with solid backdrop colors in one click.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-[rgb(var(--lt-text))]">
                {[
                  'Pixel-precise edge detection on hair and outlines',
                  'Color swatch picker for instant custom backdrops',
                  'Full high-resolution export without watermarks',
                  'Zero file upload — processed locally on your machine',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[rgb(var(--lt-primary))] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/tools/remove-bg" className="lt-btn-primary">
                  Launch Background Remover <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Visual preview: Whole Video Banner */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl">
                <video
                  src="/banner.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TOOLS GRID WITH CATEGORY FILTER ── */}
      <section className="py-20">
        <div className="lt-container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <span className="lt-badge">Full Catalog</span>
              <h2 className="mt-2 lt-section-title">Explore All Digital Tools</h2>
              <p className="mt-1 text-sm lt-text-muted">
                Filter by category or click on any live tool to get started immediately.
              </p>
            </div>
            <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[rgb(var(--lt-primary))] hover:underline">
              View full catalog ({tools.length}) <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 lt-scrollbar">
            {['All', ...categories.map((c) => c.name)].map((cat) => {
              const count = cat === 'All' ? tools.length : tools.filter((t) => t.category.toLowerCase() === cat.toLowerCase()).length;
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[rgb(var(--lt-primary))] text-white shadow-sm'
                      : 'border lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tool Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTools.map((tool, index) => (
              <ToolCard key={tool.slug} tool={tool} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 PILLARS: WHY LUTA TECH ── */}
      <section className="border-t lt-border-color bg-[rgb(var(--lt-surface))] py-20">
        <div className="lt-container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="lt-badge">Platform Pillars</span>
            <h2 className="mt-2 lt-section-title">Why choose Luta Tech?</h2>
            <p className="mt-2 text-sm sm:text-base lt-text-muted">
              Built from the ground up for privacy, speed, and modern engineering standards.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                desc: 'WebAssembly and client-side processing execute tasks instantly without server bottlenecks.',
              },
              {
                icon: Shield,
                title: 'Zero Storage Privacy',
                desc: 'Your photos and documents never leave your device. Complete privacy by default.',
              },
              {
                icon: Globe2,
                title: 'Works Everywhere',
                desc: 'Fully responsive and optimized across mobile phones, tablets, Mac, and PC browsers.',
              },
              {
                icon: Layers,
                title: 'Always Expanding',
                desc: 'Regularly updated with new utilities, PDF tools, AI generators, and developer helpers.',
              },
            ].map((pillar, i) => (
              <div key={pillar.title} className="lt-card p-6 transition-all hover:border-[rgb(var(--lt-primary)/0.4)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[rgb(var(--lt-text))]">{pillar.title}</h3>
                <p className="mt-2 text-xs sm:text-sm lt-text-muted leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS / TESTIMONIALS ── */}
      <section className="border-t lt-border-color py-20">
        <div className="lt-container">
          <div className="text-center max-w-2xl mx-auto">
            <span className="lt-badge">Community Trust</span>
            <h2 className="mt-2 lt-section-title">Loved by creators and professionals</h2>
            <p className="mt-2 text-sm lt-text-muted">
              Here is why thousands of users rely on Luta Tech every day.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                name: 'Sarah Jenkins',
                role: 'Digital Nomad & Traveler',
                text: 'The Passport Photo Maker saved me over $30 at the embassy. Auto-cropped to exact specifications and printed in 5 minutes.',
                rating: 5,
              },
              {
                name: 'David Mwangi',
                role: 'Frontend Developer',
                text: 'Having all utilities under one unified, fast interface without popups or paywalls is refreshing. Beautiful UI and zero latency.',
                rating: 5,
              },
              {
                name: 'Elena Rostova',
                role: 'E-commerce Designer',
                text: 'The Background Remover produces cleaner edge cutouts than heavy desktop software. Fast, free, and completely private.',
                rating: 5,
              },
            ].map((testi) => (
              <div key={testi.name} className="lt-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {Array.from({ length: testi.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[rgb(var(--lt-text))] italic leading-relaxed">
                    &ldquo;{testi.text}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t lt-border-color">
                  <p className="text-sm font-bold text-[rgb(var(--lt-text))]">{testi.name}</p>
                  <p className="text-xs lt-text-muted">{testi.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA BANNER ── */}
      <section className="lt-container pb-20">
        <div className="relative overflow-hidden rounded-3xl border lt-border-color bg-gradient-to-b from-[rgb(var(--lt-surface))] to-[rgb(var(--lt-surface-2))] p-10 text-center sm:p-16 shadow-xl">
          <div className="pointer-events-none absolute inset-0 lt-glow opacity-80" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[rgb(var(--lt-text))]">
              Start building & creating with Luta Tech
            </h2>
            <p className="mt-4 text-base lt-text-muted leading-relaxed">
              No installation required. Jump right into our online tools or create a free account to track your usage history.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/tools" className="lt-btn-primary w-full sm:w-auto">
                Explore Tools Catalog <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/register" className="lt-btn-secondary w-full sm:w-auto">
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
