'use client'

import type { ProcessMetadata } from '@/lib/types'
import { base64ToObjectUrl, formatFileSize } from '@/lib/utils'
import Button from './ui/Button'

interface DownloadButtonProps {
  base64: string
  metadata: ProcessMetadata
  processingTimeMs?: number
  filter?: string
}

export default function DownloadButton({ base64, metadata, processingTimeMs, filter }: DownloadButtonProps) {
  function handleDownload() {
    const filename = `${metadata.document_type.toLowerCase().replace('_', '-')}-photo.jpg`
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      if (filter) ctx.filter = filter
      ctx.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.download = filename
      link.click()
    }
    img.src = base64ToObjectUrl(base64)
  }

  return (
    <div className="space-y-3">
      <div className={`rounded-lg p-3 text-sm ${
        metadata.compliant
          ? 'bg-emerald-50 dark:bg-slate-800/90 border border-emerald-200 dark:border-emerald-500/40'
          : 'bg-amber-50 dark:bg-slate-800/90 border border-amber-200 dark:border-amber-500/40'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">{metadata.compliant ? '✅' : '⚠️'}</span>
          <div>
            <p className={`font-semibold text-sm ${metadata.compliant ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'}`}>
              {metadata.compliant ? 'Meets requirements' : 'Review recommendations'}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5 font-medium">
              {metadata.dimensions.width}x{metadata.dimensions.height}px · {formatFileSize(metadata.file_size_kb)}{processingTimeMs ? ` · ${processingTimeMs.toFixed(0)}ms` : ''}
            </p>
          </div>
        </div>
      </div>

      {metadata.warnings.length > 0 && (
        <ul className="space-y-1">
          {metadata.warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
              <span className="mt-0.5 shrink-0">⚠</span>
              {w}
            </li>
          ))}
        </ul>
      )}

      <Button onClick={handleDownload} className="w-full" size="lg">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download Photo
      </Button>

      <p className="text-[11px] text-gray-300 text-center">
        {metadata.document_name} · {metadata.country}
      </p>
    </div>
  )
}
