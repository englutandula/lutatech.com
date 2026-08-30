'use client'

import type { ProcessOptions, ProcessingStatus } from '@/lib/types'
import Button from './ui/Button'
import { Sparkles, Check, Plus } from 'lucide-react'

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
          <span className="text-xs font-semibold text-[rgb(var(--lt-text))]">Auto enhance</span>
          <button
            type="button"
            onClick={() => set('auto_enhance', !options.auto_enhance)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer ${
              options.auto_enhance ? 'bg-[rgb(var(--lt-primary))]' : 'bg-[rgb(var(--lt-surface-3))]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                options.auto_enhance ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[rgb(var(--lt-text))]">Remove background</span>
          <button
            type="button"
            onClick={() => set('remove_background', !options.remove_background)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 cursor-pointer ${
              options.remove_background ? 'bg-[rgb(var(--lt-primary))]' : 'bg-[rgb(var(--lt-surface-3))]'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                options.remove_background ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-[rgb(var(--lt-text-muted))]">Background color</span>
          <div className="flex flex-wrap gap-2 items-center">
            {bgColors.map(({ color, label }) => {
              const isSelected = options.background_color?.toUpperCase() === color.toUpperCase()
              return (
                <button
                  key={color}
                  type="button"
                  title={label}
                  onClick={() => set('background_color', color)}
                  className={`w-8 h-8 rounded-lg border-2 aspect-square flex-shrink-0 transition-all duration-150 flex items-center justify-center cursor-pointer ${
                    isSelected
                      ? 'border-[rgb(var(--lt-primary))] ring-2 ring-[rgb(var(--lt-primary)/0.3)] scale-105 shadow-sm'
                      : 'lt-border-color hover:border-[rgb(var(--lt-primary)/0.5)]'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${color === '#FFFFFF' ? 'text-gray-900' : 'text-white'}`} />
                  )}
                </button>
              )
            })}
            <label
              title="Pick custom color"
              className="relative w-8 h-8 rounded-lg border-2 border-dashed lt-border-color overflow-hidden cursor-pointer hover:border-[rgb(var(--lt-primary))] transition-colors flex items-center justify-center flex-shrink-0 aspect-square bg-[rgb(var(--lt-surface-2))]"
            >
              <input
                type="color"
                value={options.background_color || '#FFFFFF'}
                onChange={(e) => set('background_color', e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 m-0 border-0"
              />
              <Plus className="h-3.5 w-3.5 text-[rgb(var(--lt-text-muted))] pointer-events-none" />
            </label>
            <input
              type="text"
              value={options.background_color || '#FFFFFF'}
              onChange={(e) => set('background_color', e.target.value)}
              className="ml-1 w-20 text-xs px-2.5 py-1.5 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] focus:outline-none focus:border-[rgb(var(--lt-primary))] uppercase flex-shrink-0 font-mono font-semibold"
              placeholder="#FFFFFF"
            />
          </div>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={onProcess}
        loading={status === 'processing'}
        disabled={!hasFile || status === 'processing'}
        className="w-full py-3.5 font-extrabold shadow-lg shadow-[rgb(var(--lt-primary)/0.25)]"
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
