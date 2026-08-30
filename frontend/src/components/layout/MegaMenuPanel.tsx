'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  navPdfGroups,
  type NavPdfGroup,
} from '@/lib/nav';

// Map group IDs → image URLs
const GROUP_ICONS: Record<string, string> = {
  ai: '/category-icons/ai.png',
  organize: '/category-icons/organize.png',
  convert: '/category-icons/convert.png',
  edit: '/category-icons/edit.png',
  forms: '/category-icons/forms.png',
};

interface Props {
  onClose: () => void;
  /** Passed from Navbar so moving the cursor into the panel keeps it open */
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaMenuPanel({ onClose, onMouseEnter, onMouseLeave }: Props) {
  const pathname = usePathname();

  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mega-menu-in flex justify-center mt-1.5"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Glass panel */}
      <div className="w-[90vw] max-w-[1600px] h-[75vh] overflow-y-auto lt-scrollbar rounded-2xl bg-[rgb(var(--lt-surface))] border lt-border-color shadow-[0_24px_60px_-8px_rgb(0_0_0/0.14)] dark:shadow-[0_24px_60px_-8px_rgb(0_0_0/0.45)]">
        <div className="p-5 lg:p-6 xl:p-8 min-h-full flex flex-col">
          {/* Main Grid containing all tools (up to 7 columns on wide screens) */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-x-6 gap-y-6">
            {navPdfGroups.map((group) => (
              <PdfGroupColumn
                key={group.id}
                group={group}
                pathname={pathname}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



// ---------------------------------------------------------------------------
// PDF group column
// ---------------------------------------------------------------------------
function PdfGroupColumn({
  group,
  pathname,
  onClose,
}: {
  group: NavPdfGroup;
  pathname: string;
  onClose: () => void;
}) {
  const liveCount = group.items.filter((i) => i.status === 'live').length;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        {GROUP_ICONS[group.id] && (
          <img src={GROUP_ICONS[group.id]} alt="" className="h-6 w-6 shrink-0 object-contain rounded-md" />
        )}
        <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[rgb(var(--lt-text))]">
          {group.label}
        </span>
        {liveCount > 0 && (
          <span className="ml-auto text-[9px] font-bold bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {liveCount} live
          </span>
        )}
      </div>

      {/* Links */}
      <ul className="space-y-px pl-8">
        {group.items.map((item) =>
          item.status === 'live' ? (
            <li key={item.label}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-1.5 rounded-md px-2 py-[4px] text-[12px] font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)]'
                    : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ) : (
            <li
              key={item.label}
              className="flex items-center gap-1.5 px-2 py-[4px]"
            >
              <span className="text-[12px] font-medium text-[rgb(var(--lt-text-muted))] opacity-45 flex-1">
                {item.label}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wide text-[rgb(var(--lt-text-muted))] bg-[rgb(var(--lt-surface-2))] px-1.5 py-0.5 rounded-full ml-auto">
                Soon
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
