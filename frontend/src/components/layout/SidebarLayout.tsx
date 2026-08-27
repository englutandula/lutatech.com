'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import TopBar from './TopBar'
import { checkForAppUpdates, UpdateInfo, CURRENT_APP_VERSION } from '../../lib/updateService'
import UpdateModal from '../UpdateModal'

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
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)

  useEffect(() => {
    // Check for updates in the background after launch
    const timer = setTimeout(() => {
      checkForAppUpdates(false).then((info) => {
        setUpdateInfo(info)
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleManualCheck = async () => {
    setIsCheckingUpdate(true)
    try {
      const info = await checkForAppUpdates(true)
      setUpdateInfo(info)
      if (info.hasUpdate) {
        setIsUpdateModalOpen(true)
      }
    } finally {
      setIsCheckingUpdate(false)
    }
  }

  const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Passport Photo', href: '/tools/passport', icon: PassportIcon },
    { name: 'Background Remover', href: '/tools/remove-bg', icon: RemoveBgIcon },
  ]

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0B1120] overflow-hidden">
      {/* Top Bar for Desktop Window Controls */}
      <TopBar />

      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {/* Sidebar (Desktop) */}
        <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-slate-800 flex-shrink-0">
          <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Luta Studio" className="w-8 h-8 object-contain" />
              <div className="flex flex-col">
                <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500 leading-tight">
                  Luta Studio
                </span>
                <span className="text-[10px] text-gray-400 font-medium">AI Photo Studio</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer: Version & Update Indicator */}
          <div className="p-3 border-t border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
            {updateInfo?.hasUpdate ? (
              <div className="p-3 rounded-xl border border-primary-500/40 bg-gradient-to-br from-primary-50/80 to-indigo-50/50 dark:from-primary-950/40 dark:to-slate-900/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-bold text-primary-700 dark:text-primary-300">
                      Update Available
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary-100 dark:bg-primary-900/60 text-primary-800 dark:text-primary-200">
                    v{updateInfo.latestVersion}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="w-full py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-[0.99]"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Update
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2 py-1 text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-gray-700 dark:text-slate-300 font-medium">v{CURRENT_APP_VERSION}</span>
                  <span className="text-gray-400 dark:text-slate-500">• Up to date</span>
                </div>
                <button
                  type="button"
                  title="Check for updates"
                  onClick={handleManualCheck}
                  disabled={isCheckingUpdate}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${isCheckingUpdate ? 'animate-spin text-primary-500' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Header */}
        <div 
          className="md:hidden fixed top-[42px] left-0 right-0 h-16 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-slate-800 z-50 flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Luta Studio" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-indigo-500">
              Luta Studio
            </span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm top-[42px]" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-slate-800 shadow-xl" onClick={e => e.stopPropagation()}>
              <nav className="px-4 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Update Status */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-800">
                {updateInfo?.hasUpdate ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      setIsUpdateModalOpen(true)
                    }}
                    className="w-full py-2 rounded-lg bg-primary-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    ⚡ Update Available: v{updateInfo.latestVersion}
                  </button>
                ) : (
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                    <span>v{CURRENT_APP_VERSION} (Up to date)</span>
                    <button
                      type="button"
                      onClick={handleManualCheck}
                      className="text-primary-600 dark:text-primary-400 font-medium"
                    >
                      Check for updates
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden pt-16 md:pt-0">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>

      {/* In-App Update Modal */}
      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        updateInfo={updateInfo}
      />
    </div>
  )
}
