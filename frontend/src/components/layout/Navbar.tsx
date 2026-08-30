'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Menu, X, LogOut, User as UserIcon, LayoutGrid, Search, Command } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Logo } from './Logo';
import { SearchDialog } from '../SearchDialog';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenu(false);
  }, [pathname]);

  // Global shortcut (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'All Tools', href: '/tools' },
    { label: 'Categories', href: '/categories' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
  ];

  const handleSignOut = async () => {
    await signOut(auth);
    setUserMenu(false);
    router.push('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b lt-border-color bg-[rgb(var(--lt-surface)/0.8)] backdrop-blur-xl transition-colors">
        <nav className="lt-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-black tracking-tight leading-none text-[#0F172A] dark:text-white transition-transform hover:opacity-90 select-none"
            >
              <Logo className="h-[1.05em] w-auto shrink-0" />
              <span className="leading-none flex items-center">
                Luta<span className="text-[rgb(var(--lt-primary))]">Tech</span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                        : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
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

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
              aria-label="Toggle theme"
            >
              {mounted && theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* User Auth actions */}
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors hover:bg-[rgb(var(--lt-surface-2))] cursor-pointer"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] text-xs font-bold text-white shadow-xs">
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
                        <p className="text-xs font-bold text-[rgb(var(--lt-text))] truncate">
                          {user.displayName || 'Account'}
                        </p>
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
                <Link href="/login" className="lt-btn-secondary py-1.5 px-3 text-xs">
                  <UserIcon className="h-3.5 w-3.5" /> Login
                </Link>
                <Link href="/register" className="lt-btn-primary py-1.5 px-3 text-xs">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="rounded-lg p-2 text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] md:hidden cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div className="border-t lt-border-color bg-[rgb(var(--lt-surface))] px-4 py-4 md:hidden lt-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] font-semibold'
                      : 'text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-[rgb(var(--lt-text-muted))] transition-colors hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))]"
                  >
                    My Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[rgb(var(--lt-error))] hover:bg-[rgb(var(--lt-error)/0.08)] cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="lt-btn-secondary w-full">
                    Login
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="lt-btn-primary w-full">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchDialog isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Navbar;
