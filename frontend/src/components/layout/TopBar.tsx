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
            Luta Tech
          </span>
        </Link>
        <span className="text-gray-300 dark:text-slate-700">/</span>
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded-md border border-primary-100 dark:border-primary-900/40">
          {getPageTitle()}
        </span>
      </div>

      {/* Right section: AI Engine Status */}
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
      </div>
    </header>
  )
}
