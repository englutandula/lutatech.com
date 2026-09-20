'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera,
  Scissors,
  LayoutGrid,
  Minimize2,
  Layers,
  Scaling,
  QrCode,
  Code,
  Film,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { LAUNCHER_APPS, type ProductItem } from '@/lib/products';

// Dynamic Icon Mapping
const ICON_MAP: Record<string, React.ElementType> = {
  Camera,
  Scissors,
  LayoutGrid,
  Minimize2,
  Layers,
  Scaling,
  QrCode,
  Code,
  Film,
  Sparkles,
};

export function AppLauncher() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  const handleAppClick = () => {
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 9-Dot Waffle Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="LutaTech Apps Launcher"
        title="LutaTech Apps & Studios"
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all cursor-pointer ${
          open
            ? 'bg-[rgb(var(--lt-primary)/0.15)] text-[rgb(var(--lt-primary))]'
            : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
        }`}
      >
        {/* Custom 3x3 Grid Dots */}
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="4" cy="4" r="2" />
          <circle cx="10" cy="4" r="2" />
          <circle cx="16" cy="4" r="2" />
          <circle cx="4" cy="10" r="2" />
          <circle cx="10" cy="10" r="2" />
          <circle cx="16" cy="10" r="2" />
          <circle cx="4" cy="16" r="2" />
          <circle cx="10" cy="16" r="2" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      </button>

      {/* Popover Menu (Adobe / Google 9-dot style) */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-4 shadow-2xl z-50 lt-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b lt-border-color">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#EB1000] p-1 shadow-xs">
                <svg viewBox="0 0 100 86.6" className="h-full w-full fill-white" aria-hidden="true">
                  <path d="M 0 86.6 L 33.33 0 L 49.33 0 L 16 86.6 Z" />
                  <path d="M 100 86.6 L 66.67 0 L 50.67 0 L 84 86.6 Z" />
                  <path d="M 50 28.87 L 68 86.6 L 56 86.6 L 50 67 L 44 86.6 Z" />
                </svg>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text))]">
                LutaTech Apps &amp; Studios
              </span>
            </div>
            <Link
              href="/products/"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-[rgb(var(--lt-primary))] hover:underline flex items-center gap-0.5"
            >
              All Products <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-3 gap-2">
            {LAUNCHER_APPS.map((app) => {
              const IconComp = ICON_MAP[app.icon] || LayoutGrid;

              return (
                <Link
                  key={app.id}
                  href={app.href}
                  onClick={handleAppClick}
                  className="group flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all hover:bg-[rgb(var(--lt-surface-2))] border border-transparent hover:border-[rgb(var(--lt-border))] cursor-pointer relative"
                >
                  {/* Badge */}
                  {app.badge && (
                    <span
                      className={`absolute top-1 right-1 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                        app.badge === 'AI'
                          ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                          : app.badge === 'Pro'
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'bg-[rgb(var(--lt-primary)/0.15)] text-[rgb(var(--lt-primary))]'
                      }`}
                    >
                      {app.badge}
                    </span>
                  )}

                  {/* Icon Box */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-surface-2))] group-hover:bg-[rgb(var(--lt-primary)/0.12)] group-hover:text-[rgb(var(--lt-primary))] transition-all text-[rgb(var(--lt-text))] mb-2 shadow-2xs">
                    <IconComp className="h-5 w-5" />
                  </div>

                  {/* App Title */}
                  <span className="text-[11px] font-bold text-[rgb(var(--lt-text))] truncate max-w-full leading-tight">
                    {app.name}
                  </span>
                  <span className="text-[9px] text-[rgb(var(--lt-text-muted))] truncate max-w-full mt-0.5">
                    {app.description}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Quick Footer Link */}
          <div className="mt-3 pt-3 border-t lt-border-color flex items-center justify-between text-[11px] text-[rgb(var(--lt-text-muted))]">
            <span>Client-side, 100% Private</span>
            <Link
              href="/products/"
              onClick={() => setOpen(false)}
              className="font-medium text-[rgb(var(--lt-text))] hover:text-[rgb(var(--lt-primary))] transition-colors"
            >
              All Products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
