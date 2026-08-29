'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getApiBaseUrl } from '../../lib/api'

export default function TopBar() {
  const pathname = usePathname()
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  useEffect(() => {
    let isMounted = true
    const checkHealth = async () => {
      try {
        const baseUrl = getApiBaseUrl()
        const res = await fetch(`${baseUrl}/api/health`, { method: 'GET' })
        if (res.ok) {
          if (isMounted) setBackendStatus('online')
        } else {
          if (isMounted) setBackendStatus('offline')
        }
      } catch {
        if (isMounted) setBackendStatus('offline')
      }
    }

    checkHealth()
    const interval = setInterval(checkHealth, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.includes('/tools/passport')) return 'Passport Photo Maker'
    if (pathname.includes('/tools/remove-bg')) return 'Background Remover'
    return 'Studio'
  }

  return (
    <header className="h-14 w-full bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-slate-800/80 flex items-center justify-between px-4 sm:px-6 z-30 select-none flex-shrink-0 transition-colors">
      {/* Left section: Breadcrumb & App Context */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 group text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            Luta Studio Web
          </span>
        </Link>
        <span className="text-gray-300 dark:text-slate-700">/</span>
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-900/40">
          {getPageTitle()}
        </span>
      </div>

      {/* Right section: AI Engine Status & Links */}
      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <div
          title={backendStatus === 'online' ? 'FastAPI AI Engine is running and ready' : backendStatus === 'offline' ? 'AI Backend is connecting or offline' : 'Checking AI status...'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${
            backendStatus === 'online'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : backendStatus === 'offline'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'online'
                ? 'bg-emerald-500 animate-pulse'
                : backendStatus === 'offline'
                ? 'bg-amber-500'
                : 'bg-gray-400 animate-pulse'
            }`}
          />
          <span className="hidden sm:inline text-[11px]">
            {backendStatus === 'online'
              ? 'AI Engine Ready'
              : backendStatus === 'offline'
              ? 'AI Backend Connecting'
              : 'Checking AI...'}
          </span>
        </div>

        {/* GitHub repository link */}
        <a
          href="https://github.com/englutandula/Luta-studio-window-"
          target="_blank"
          rel="noopener noreferrer"
          title="View Source on GitHub"
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        </a>
      </div>
    </header>
  )
}
