'use client'

import type { ProcessOptions, ProcessingStatus } from '@/lib/types'
import Button from './ui/Button'

interface ImageEditorProps {
  options: ProcessOptions
  onChange: (opts: ProcessOptions) => void
  onProcess: () => void
  status: ProcessingStatus
  hasFile: boolean
  hasResult: boolean
}

export default function ImageEditor({ options, onChange, onProcess, status, hasFile, hasResult }: ImageEditorProps) {
  function set<K extends keyof ProcessOptions>(key: K, val: ProcessOptions[K]) {
    onChange({ ...options, [key]: val })
  }

  const bgColors = [
    { color: '#FFFFFF', label: 'White' },
    { color: '#2563EB', label: 'Blue' },
    { color: '#38BDF8', label: 'Sky Blue' },
    { color: '#DC2626', label: 'Red' },
    { color: '#4B5563', label: 'Gray' },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Auto enhance</span>
          <button
            type="button"
            onClick={() => set('auto_enhance', !options.auto_enhance)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${options.auto_enhance ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white dark:bg-slate-800 shadow-sm transition-transform duration-200 ${options.auto_enhance ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Remove background</span>
          <button
            type="button"
            onClick={() => set('remove_background', !options.remove_background)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${options.remove_background ? 'bg-primary-600' : 'bg-gray-200 dark:bg-slate-700'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white dark:bg-slate-800 shadow-sm transition-transform duration-200 ${options.remove_background ? 'translate-x-4' : ''}`} />
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-xs text-gray-400 font-medium">Background color</span>
          <div className="flex flex-wrap gap-2 items-center">
            {bgColors.map(({ color, label }) => {
              const isSelected = options.background_color?.toUpperCase() === color.toUpperCase()
              return (
                <button
                  key={color}
                  type="button"
                  title={label}
                  onClick={() => set('background_color', color)}
                  className={`w-8 h-8 rounded-lg border-2 aspect-square flex-shrink-0 transition-all duration-150 flex items-center justify-center ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-500/30 scale-105 shadow-sm'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:border-slate-600'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <svg className={`w-3.5 h-3.5 ${color === '#FFFFFF' ? 'text-gray-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              )
            })}
            <label 
              title="Pick custom color"
              className="relative w-8 h-8 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-gray-300 dark:border-slate-600 transition-colors flex items-center justify-center flex-shrink-0 aspect-square"
            >
              <input
                type="color"
                value={options.background_color || '#FFFFFF'}
                onChange={(e) => set('background_color', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 m-0 border-0"
              />
              <svg className="h-3.5 w-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </label>
            <input 
              type="text"
              value={options.background_color || '#FFFFFF'}
              onChange={(e) => set('background_color', e.target.value)}
              className="ml-1 w-20 text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary-500 uppercase flex-shrink-0 font-mono"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={onProcess}
        loading={status === 'processing'}
        disabled={!hasFile || status === 'processing'}
        className="w-full"
        size="lg"
      >
        {status === 'processing'
          ? 'Processing...'
          : hasResult
          ? 'Re-process Photo'
          : 'Create Passport Photo'}
      </Button>
    </div>
  )
}
