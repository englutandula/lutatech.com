'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  Sparkles,
  Code2,
  ArrowRight,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { PRODUCT_SUITES, type ProductSuite } from '@/lib/products';

const SUITE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  creative: Sparkles,
  utilities: Code2,
};

interface Props {
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaMenuPanel({ onClose, onMouseEnter, onMouseLeave }: Props) {
  const pathname = usePathname();

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mega-menu-in flex justify-center mt-1.5 px-4 sm:px-6"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Glass panel */}
      <div className="w-full max-w-[1360px] max-h-[82vh] overflow-y-auto lt-scrollbar rounded-2xl bg-[rgb(var(--lt-surface))] border lt-border-color shadow-[0_24px_60px_-8px_rgb(0_0_0/0.14)] dark:shadow-[0_24px_60px_-8px_rgb(0_0_0/0.45)]">
        <div className="p-6 lg:p-8 flex flex-col">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b lt-border-color">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EB1000] p-1.5 shadow-xs">
                <svg viewBox="0 0 100 86.6" className="h-full w-full fill-white" aria-hidden="true">
                  <path d="M 0 86.6 L 33.33 0 L 49.33 0 L 16 86.6 Z" />
                  <path d="M 100 86.6 L 66.67 0 L 50.67 0 L 84 86.6 Z" />
                  <path d="M 50 28.87 L 68 86.6 L 56 86.6 L 50 67 L 44 86.6 Z" />
                </svg>
              </span>
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[rgb(var(--lt-text))]">
                  LutaTech Products &amp; Studio Suites
                </h3>
                <p className="text-xs text-[rgb(var(--lt-text-muted))]">
                  Fast, private web utilities &bull; 100% browser-based &bull; Zero file uploads
                </p>
              </div>
            </div>

            <Link
              href="/products/"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-bold text-[rgb(var(--lt-primary))] hover:underline"
            >
              All Products &amp; Tools <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Main Content Layout: 3 Live Suite Columns + 1 Spotlight Column */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PRODUCT_SUITES.map((suite) => (
              <SuiteColumn
                key={suite.id}
                suite={suite}
                pathname={pathname}
                onClose={onClose}
              />
            ))}

            {/* Spotlight Card */}
            <div className="hidden xl:flex flex-col justify-between rounded-2xl border lt-border-color bg-gradient-to-b from-[rgb(var(--lt-surface-2))] to-[rgb(var(--lt-surface))] p-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[rgb(var(--lt-primary)/0.15)] text-[rgb(var(--lt-primary))]">
                    Featured Studio
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-[rgb(var(--lt-text))] mb-1.5">
                  Passport Photo Studio
                </h4>
                <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed mb-4">
                  Compliant biometric ID and visa photos for 50+ countries. Automatic face centering and background change.
                </p>

                <div className="space-y-2 mb-5">
                  {[
                    '50+ Country Presets',
                    'Automatic Head Framing',
                    'Custom Background Colors',
                    'Print-Ready 4x6 & A4 Sheets',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[rgb(var(--lt-text))]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t lt-border-color">
                <Link
                  href="/tools/passport/"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <Camera className="h-4 w-4" /> Open Passport Studio
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar Footer */}
          <div className="mt-8 pt-4 border-t lt-border-color flex flex-wrap items-center justify-between gap-4 text-xs text-[rgb(var(--lt-text-muted))]">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-[rgb(var(--lt-text))]">Architecture:</span>
              <span>🔒 100% Client-Side Privacy</span>
              <span>⚡ Zero Latency</span>
              <span>📱 Mobile &amp; Desktop</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/about/" onClick={onClose} className="hover:text-[rgb(var(--lt-text))] font-medium">
                About LutaTech
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuiteColumn({
  suite,
  pathname,
  onClose,
}: {
  suite: ProductSuite;
  pathname: string;
  onClose: () => void;
}) {
  const IconComp = SUITE_ICONS[suite.id] || FileText;

  // Count live tools
  const allItems = suite.groups.flatMap((g) => g.items);

  return (
    <div className="flex flex-col">
      {/* Suite Header */}
      <div className="flex items-center gap-2.5 mb-3 pb-2 border-b lt-border-color">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${suite.accentBg} shrink-0`}>
          <IconComp className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-[rgb(var(--lt-text))] truncate">
            {suite.name}
          </h4>
        </div>
        <span className="text-[9px] font-bold bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))] px-1.5 py-0.5 rounded-full shrink-0">
          {allItems.length} Live
        </span>
      </div>

      {/* Groups & Tool Items */}
      <div className="space-y-4 flex-1">
        {suite.groups.map((group) => (
          <div key={group.id}>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] mb-1 px-2">
              {group.title}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors ${
                        isActive
                          ? 'bg-[rgb(var(--lt-primary)/0.08)] font-semibold text-[rgb(var(--lt-primary))]'
                          : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                      }`}
                    >
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`ml-1.5 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shrink-0 ${
                            item.badge === 'AI'
                              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                              : 'bg-[rgb(var(--lt-primary)/0.12)] text-[rgb(var(--lt-primary))]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
