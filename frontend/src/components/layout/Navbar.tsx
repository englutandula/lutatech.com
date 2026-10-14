'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Sun, Moon, Menu, X, LogOut, User as UserIcon, LayoutGrid,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Logo } from './Logo';
import { SearchDialog } from '../SearchDialog';
import { AppLauncher } from './AppLauncher';

// Feature flags: set to true when ready to activate Pricing and Auth
const SHOW_PRICING = false;
const SHOW_AUTH = false;

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Close all menus on navigation
  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
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
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSignOut = async () => {
    await logout();
    setUserMenu(false);
    router.push('/');
  };

  return (
    <>
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b lt-border-color bg-[rgb(var(--lt-surface)/0.85)] backdrop-blur-xl transition-colors">
        <nav className="lt-container flex h-16 items-center justify-between">

          {/* Logo + desktop nav */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-5 xl:gap-7 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center transition-opacity hover:opacity-90 select-none shrink-0"
            >
              <Logo className="h-8 sm:h-9 md:h-9.5 w-auto shrink-0" />
            </Link>

            {/* Desktop links — Fluidly Scalable & Non-wrapping */}
            <div className="hidden items-center gap-0.5 md:flex shrink-0">
              {/* Home */}
              <Link
                href="/"
                prefetch={false}
                className={`rounded-lg px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 text-[11px] md:text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  pathname === '/'
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Home
              </Link>

              {/* Products (Direct Link - Opens Full Directory) */}
              <Link
                href="/products/"
                prefetch={false}
                className={`rounded-lg px-2 lg:px-3 py-1.5 text-xs lg:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
                  pathname.startsWith('/products')
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Products
              </Link>


              {/* Pricing / Guides / About */}
              {[
                { label: 'Download', href: '/download/' },
                ...(SHOW_PRICING ? [{ label: 'Pricing', href: '/pricing/' }] : []),
                { label: 'Guides',  href: '/guides/'  },
                { label: 'About',   href: '/about/'   },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={`rounded-lg px-1.5 md:px-2 lg:px-2.5 xl:px-3 py-1.5 text-[11px] md:text-xs xl:text-sm font-medium whitespace-nowrap shrink-0 transition-all ${
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
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 shrink-0">
            {/* 9-Dot App Switcher (Adobe/Google Waffle Menu) */}
            <AppLauncher />

            {/* Theme */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-1.5 md:p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors hover:bg-[rgb(var(--lt-surface-2))] cursor-pointer"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || 'User'}
                      className="h-6 w-6 lg:h-7 lg:w-7 rounded-full object-cover shadow-xs"
                    />
                  ) : (
                    <div className="flex h-6 w-6 lg:h-7 lg:w-7 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] text-[10px] lg:text-xs font-bold text-white shadow-sm">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="max-w-[90px] lg:max-w-[120px] truncate text-[rgb(var(--lt-text))] text-[11px] lg:text-xs font-semibold">
                    {user.name || user.email?.split('@')[0]}
                  </span>
                </button>
                {userMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1.5 shadow-xl lt-fade-in">
                      <div className="border-b lt-border-color px-3 py-2">
                        <p className="text-xs font-bold text-[rgb(var(--lt-text))] truncate">{user.name || 'Account'}</p>
                        <p className="text-[11px] lt-text-muted truncate">{user.email}</p>
                        {!user.email_verified && (
                          <Link
                            href="/verify-email"
                            onClick={() => setUserMenu(false)}
                            className="mt-1 inline-block text-[10px] font-bold text-amber-500 hover:underline"
                          >
                            ⚠️ Email unverified (Verify now)
                          </Link>
                        )}
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
            ) : SHOW_AUTH ? (
              <div className="hidden items-center gap-1.5 md:flex shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] hover:border-[rgb(var(--lt-primary)/0.4)] text-[rgb(var(--lt-text))] py-1.5 px-2 md:px-2.5 lg:px-3 text-[11px] md:text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <UserIcon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] hover:opacity-95 text-white py-1.5 px-2.5 md:px-3 lg:px-3.5 text-[11px] md:text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span>Sign Up</span>
                </Link>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] md:hidden cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

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

              {/* Products (Direct Link) */}
              <Link
                href="/products/"
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  pathname.startsWith('/products')
                    ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)]'
                    : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                }`}
              >
                Products
              </Link>

              {/* Pricing / Guides / About */}
              {[
                { label: 'Download', href: '/download/' },
                ...(SHOW_PRICING ? [{ label: 'Pricing', href: '/pricing/' }] : []),
                { label: 'Guides',  href: '/guides/'  },
                { label: 'About',   href: '/about/'   },
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
              ) : SHOW_AUTH ? (
                <div className="mt-3 flex flex-col gap-2 pt-3 border-t lt-border-color">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] py-2.5 px-4 text-sm font-semibold text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-3))] cursor-pointer transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] py-2.5 px-4 text-sm font-bold text-white shadow-xs hover:opacity-95 cursor-pointer transition-opacity"
                  >
                    <span>Sign Up</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </header>

      {/* ── Global Search Modal ─────────────────────────────────────────── */}
      {searchOpen && <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}

export default Navbar;
