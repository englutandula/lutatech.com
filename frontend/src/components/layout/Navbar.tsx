'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Menu, X, LogOut, User as UserIcon, LayoutGrid,
  Search, ChevronDown, ChevronRight, FileText,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Logo } from './Logo';
import { SearchDialog } from '../SearchDialog';
import { MegaMenuPanel } from './MegaMenuPanel';
import { navPdfGroups } from '@/lib/nav';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, openAuthModal } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Hover-delay timer (shared between trigger button and panel)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openTools = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setToolsOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimerRef.current = setTimeout(() => setToolsOpen(false), 180);
  }, []);

  // Mobile accordion states
  const [mobilePdfOpen, setMobilePdfOpen] = useState(false);
  const [mobilePdfGroup, setMobilePdfGroup] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Clear timer on unmount
  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  // Close all menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
    setToolsOpen(false);
  }, [pathname]);

  // Prevent body scroll only when mobile menu drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === 'Escape') {
        setToolsOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isToolsActive = pathname.startsWith('/tools');

  const handleSignOut = async () => {
    await signOut(auth);
    setUserMenu(false);
    router.push('/');
  };

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b lt-border-color bg-[rgb(var(--lt-surface)/0.85)] backdrop-blur-xl transition-colors">
        <nav className="lt-container flex h-16 items-center justify-between">

          {/* Logo + desktop nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="inline-flex items-center text-xl font-black tracking-tight leading-none text-[#0F172A] dark:text-white transition-opacity hover:opacity-90 select-none"
            >
              <Logo className="h-[1.3em] w-auto shrink-0" />
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-0.5 md:flex">
              {/* Home */}
              <Link
                href="/"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  pathname === '/'
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Home
              </Link>

              {/* ── Categories mega-menu trigger ── */}
              <button
                id="tools-menu-btn"
                onMouseEnter={openTools}
                onMouseLeave={scheduleClose}
                onClick={() => setToolsOpen((v) => !v)}
                className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                  toolsOpen
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
                aria-expanded={toolsOpen}
                aria-haspopup="true"
              >
                Categories
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* All Tools */}
              <Link
                href="/tools"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                  isToolsActive
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                All Tools
              </Link>

              {/* Pricing / About */}
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'About',   href: '/about'   },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    pathname === link.href
                      ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                      : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] px-2.5 py-1.5 text-xs text-[rgb(var(--lt-text-muted))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:text-[rgb(var(--lt-text))] transition-colors cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search tools...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded bg-[rgb(var(--lt-surface))] border lt-border-color px-1.5 py-0.5 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Theme */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--lt-surface-2))] cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] text-xs font-bold text-white shadow-sm">
                    {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate text-[rgb(var(--lt-text))] text-xs font-semibold">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1.5 shadow-xl lt-fade-in">
                      <div className="border-b lt-border-color px-3 py-2">
                        <p className="text-xs font-bold text-[rgb(var(--lt-text))] truncate">{user.displayName || 'Account'}</p>
                        <p className="text-[11px] lt-text-muted truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenu(false)}
                        className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[rgb(var(--lt-text))] transition-colors hover:bg-[rgb(var(--lt-surface-2))]"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" /> My Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[rgb(var(--lt-error))] transition-colors hover:bg-[rgb(var(--lt-error)/0.08)] cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <button
                  onClick={() => openAuthModal('login')}
                  className="lt-btn-secondary py-1.5 px-3 text-xs cursor-pointer"
                >
                  <UserIcon className="h-3.5 w-3.5" /> Login
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="lt-btn-primary py-1.5 px-3 text-xs cursor-pointer font-bold shadow-xs"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => { setMobileOpen((v) => !v); setToolsOpen(false); }}
              className="rounded-lg p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] md:hidden cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* ── Desktop Mega Menu panel (absolute, sits below the header) ── */}
        {toolsOpen && (
          <MegaMenuPanel
            onClose={() => setToolsOpen(false)}
            onMouseEnter={openTools}
            onMouseLeave={scheduleClose}
          />
        )}

        {/* ── Mobile Drawer ──────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="border-t lt-border-color bg-[rgb(var(--lt-surface))] md:hidden overflow-y-auto max-h-[80vh]">
            <div className="px-4 py-3 space-y-0.5">

              {/* Home */}
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname === '/'
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)]'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Home
              </Link>

              {/* All Tools */}
              <Link
                href="/tools"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isToolsActive
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)]'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                All Tools
              </Link>

              {/* Categories accordion */}
              <div className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setMobilePdfOpen((v) => !v)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    mobilePdfOpen
                      ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)]'
                      : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  Categories
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobilePdfOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobilePdfOpen && (
                  <div className="ml-4 pl-3 border-l-2 border-[rgb(var(--lt-border))] my-1 space-y-0.5 pb-1">

                    {/* Subcategories (AI, PDF, etc.) */}
                    {navPdfGroups.map((group) => (
                      <div key={group.id}>
                        <button
                          onClick={() => setMobilePdfGroup((v) => v === group.id ? null : group.id)}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm font-semibold text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`flex h-5 w-5 items-center justify-center rounded ${group.iconBg} ${group.iconText}`}>
                              <FileText className="h-3 w-3" />
                            </div>
                            {group.label}
                          </div>
                          <ChevronRight
                            className={`h-3.5 w-3.5 text-[rgb(var(--lt-text-muted))] transition-transform duration-200 ${mobilePdfGroup === group.id ? 'rotate-90' : ''}`}
                          />
                        </button>

                        {mobilePdfGroup === group.id && (
                          <div className="ml-7 mt-0.5 space-y-px pb-1">
                            {group.items.map((item) =>
                              item.status === 'live' ? (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                                    pathname === item.href
                                      ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.07)]'
                                      : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                                  }`}
                                >
                                  <span className="h-1 w-1 rounded-full bg-current opacity-40 shrink-0" />
                                  {item.label}
                                </Link>
                              ) : (
                                <div
                                  key={item.label}
                                  className="flex items-center justify-between rounded-md px-2 py-1.5"
                                >
                                  <div className="flex items-center gap-1.5">
                                    <span className="h-1 w-1 rounded-full bg-[rgb(var(--lt-border))] shrink-0" />
                                    <span className="text-xs font-medium text-[rgb(var(--lt-text-muted))] opacity-50">
                                      {item.label}
                                    </span>
                                  </div>
                                  <span className="text-[9px] font-bold text-[rgb(var(--lt-text-muted))]">
                                    Soon
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* View all */}
                    <Link
                      href="/tools"
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 flex items-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-[rgb(var(--lt-primary))] hover:bg-[rgb(var(--lt-primary)/0.07)] transition-colors"
                    >
                      View all tools →
                    </Link>
                  </div>
                )}
              </div>

              {/* Pricing / About */}
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'About',   href: '/about'   },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)]'
                      : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Auth */}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] transition-colors"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgb(var(--lt-error))] hover:bg-[rgb(var(--lt-error)/0.08)] cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="mt-3 flex flex-col gap-2 pt-3 border-t lt-border-color">
                  <button
                    onClick={() => { setMobileOpen(false); openAuthModal('login'); }}
                    className="lt-btn-secondary w-full cursor-pointer justify-center"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); openAuthModal('register'); }}
                    className="lt-btn-primary w-full cursor-pointer justify-center font-bold"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Page dimmer — dims content behind the mega menu (Apple style) ── */}
      {toolsOpen && (
        <div
          className="fixed inset-0 z-[35] page-dimmer"
          style={{ background: 'rgba(0,0,0,0.08)', backdropFilter: 'blur(1px)' }}
          aria-hidden="true"
          onClick={() => setToolsOpen(false)}
        />
      )}

      {/* ── Global Search Modal ─────────────────────────────────────────── */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;
