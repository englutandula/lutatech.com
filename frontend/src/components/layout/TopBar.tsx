'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function TopBar() {
  const pathname = usePathname()
  const [isElectron, setIsElectron] = useState(true)

  useEffect(() => {
    // Detect if running inside Electron or regular browser
    const userAgent = navigator.userAgent.toLowerCase()
    setIsElectron(userAgent.includes(' electron/'))
  }, [])

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard'
    if (pathname.includes('/tools/passport')) return 'Passport Photo Maker'
    if (pathname.includes('/tools/remove-bg')) return 'Background Remover'
    return 'Luta Studio'
  }

  return (
    <header
      className="h-[42px] w-full bg-white dark:bg-[#0B1120] border-b border-gray-200 dark:border-slate-800/80 flex items-center justify-between px-4 z-40 select-none flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left section: Window controls clearance & Breadcrumbs */}
      <div className="flex items-center gap-2">
        {/* macOS traffic light clearance space */}
        <div className="w-[76px] flex-shrink-0 flex items-center">
          {/* If viewed in normal browser without Electron native buttons, show decorative macOS controls */}
          {!isElectron && (
            <div 
              className="flex items-center gap-2 pl-1"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>
          )}
        </div>

        {/* Breadcrumb title */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
          <span className="text-gray-500 dark:text-gray-400">Luta Studio</span>
          <span className="text-gray-300 dark:text-slate-600">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-semibold">{getPageTitle()}</span>
        </div>
      </div>

      {/* Center draggable space */}
      <div className="flex-1 h-full" />

      {/* Right section: Status indicator */}
      <div 
        className="flex items-center gap-3 text-xs"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[11px]">AI Engine Ready</span>
        </div>
      </div>
    </header>
  )
}
