'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import TopBar from './TopBar'

const HomeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const PassportIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const RemoveBgIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Passport Photo', href: '/tools/passport', icon: PassportIcon },
    { name: 'Background Remover', href: '/tools/remove-bg', icon: RemoveBgIcon },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100">
      {/* Web Top Header */}
      <TopBar />

      <div className="flex flex-1 min-h-[calc(100vh-3.5rem)]">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-slate-800 flex-shrink-0">
          {/* Logo & Brand Header */}
          <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-slate-800">
            <Link href="/" className="flex items-center gap-3 group">
              <img src="/logo.png" alt="Luta Studio" className="w-8 h-8 object-contain transition-transform group-hover:scale-105" />
              <div className="flex flex-col">
                <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 leading-tight">
                  Luta Studio
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">Web AI Studio</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 shadow-2xs font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer: Web Info */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium text-gray-700 dark:text-slate-300">Luta Studio Web</span>
              </div>
              <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">v1.0.0</span>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400 dark:text-slate-500 leading-tight">
              AI Passport Photo & Studio Suite
            </p>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-slate-800 z-50 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Luta Studio" className="w-7 h-7 object-contain" />
            <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">
              Luta Studio
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-xs top-14" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-slate-800 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <nav className="px-4 py-4 space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Page Content */}
        <main className="flex-1 flex flex-col min-w-0 w-full pt-14 md:pt-0 overflow-y-auto">
          <div className="flex-1 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
