'use client'

import { UpdateInfo } from '../lib/updateService'

interface UpdateModalProps {
  isOpen: boolean
  onClose: () => void
  updateInfo: UpdateInfo | null
}

export default function UpdateModal({ isOpen, onClose, updateInfo }: UpdateModalProps) {
  if (!isOpen || !updateInfo) return null

  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.includes('Macintosh')
  const isWin = typeof navigator !== 'undefined' && navigator.userAgent.includes('Windows')
  const platformLabel = isMac ? 'macOS (.dmg)' : isWin ? 'Windows (.exe)' : 'Desktop'

  const formattedDate = updateInfo.publishedAt
    ? new Date(updateInfo.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 dark:bg-black/70 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient accent */}
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100 dark:border-slate-800 bg-gradient-to-br from-primary-50/50 via-transparent to-indigo-50/30 dark:from-primary-950/20 dark:to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/30 flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Update Available!
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  A newer version of Luta Studio is ready to download.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Version comparison pill */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md font-mono font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
              v{updateInfo.currentVersion} (Current)
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="px-2.5 py-1 rounded-md font-mono font-bold bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
              v{updateInfo.latestVersion} (New)
            </span>
            {formattedDate && (
              <span className="ml-auto text-gray-400 dark:text-slate-500">
                Released {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Release Notes Body */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
              What&apos;s New
            </h4>
            <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
              {updateInfo.releaseName || `Release v${updateInfo.latestVersion}`}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/60 text-xs text-gray-700 dark:text-slate-300 leading-relaxed space-y-1.5 whitespace-pre-wrap font-sans">
            {updateInfo.releaseNotes || 'Includes performance improvements, bug fixes, and updated photo guidelines.'}
          </div>

          {/* Platform note */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-slate-400 pt-1">
            <span>Target Platform: <strong className="text-gray-700 dark:text-slate-300">{platformLabel}</strong></span>
            <a
              href={updateInfo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              View on GitHub
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Remind Me Later
          </button>
          <a
            href={updateInfo.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white text-xs font-bold transition-all shadow-md shadow-primary-600/30 flex items-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Update
          </a>
        </div>
      </div>
    </div>
  )
}
