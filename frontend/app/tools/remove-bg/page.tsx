'use client'

import { useState, useRef } from 'react'
import { removeBackground } from '@/lib/api'

const COLOR_PRESETS = [
  { color: 'transparent', label: 'Transparent', isTransparent: true, isLight: false },
  { color: '#FFFFFF', label: 'White', isTransparent: false, isLight: true },
  { color: '#000000', label: 'Black', isTransparent: false, isLight: false },
  { color: '#2563EB', label: 'Royal Blue', isTransparent: false, isLight: false },
  { color: '#38BDF8', label: 'Sky Blue', isTransparent: false, isLight: true },
  { color: '#DC2626', label: 'Crimson Red', isTransparent: false, isLight: false },
  { color: '#059669', label: 'Emerald Green', isTransparent: false, isLight: false },
  { color: '#475569', label: 'Slate Gray', isTransparent: false, isLight: false },
]

export default function BackgroundRemover() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/i.test(file.name))) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
      setProcessedUrl(null)
      setBackgroundColor('transparent')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemoveBackground = async () => {
    if (!selectedImage) return

    setIsProcessing(true)
    try {
      const processedBase64 = await removeBackground(selectedImage, 'transparent')
      if (processedBase64) {
        setProcessedUrl(`data:image/png;base64,${processedBase64}`)
      }
    } catch (error) {
      console.error(error)
      alert('Failed to remove background. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedUrl) return

    if (backgroundColor === 'transparent') {
      const a = document.createElement('a')
      a.href = processedUrl
      a.download = 'background-removed.png'
      a.click()
      return
    }

    // High-resolution composite with chosen background color on a Canvas
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL('image/png', 1.0)
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `photo-bg-${backgroundColor.replace('#', '')}.png`
      a.click()
    }
    img.src = processedUrl
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Background Remover</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Instantly remove backgrounds from any image for free.</p>
      </div>

      <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 sm:p-10">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group ${
                isDragging 
                  ? 'border-primary-500 bg-primary-500/10 scale-[1.01] ring-4 ring-primary-500/20' 
                  : 'border-gray-300 dark:border-slate-700 hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200 ${
                isDragging
                  ? 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/30'
                  : 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 group-hover:scale-110'
              }`}>
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {isDragging ? 'Drop your image here!' : 'Upload or Drop an Image'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag and drop your image here, or click to browse (PNG, JPG or WEBP up to 15MB)
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 text-center">Original Image</h3>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                    <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Result */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-200 text-center">Result</h3>
                    {processedUrl && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-slate-700 shadow-2xs">
                        {backgroundColor === 'transparent' ? 'Transparent' : backgroundColor.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div 
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
                      backgroundImage: backgroundColor === 'transparent' 
                        ? 'linear-gradient(45deg, #cbd5e1 25%, transparent 25%), linear-gradient(-45deg, #cbd5e1 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #cbd5e1 75%), linear-gradient(-45deg, transparent 75%, #cbd5e1 75%)' 
                        : undefined,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    {processedUrl ? (
                      <img src={processedUrl} alt="Result" className="w-full h-full object-contain" />
                    ) : (
                      isProcessing ? (
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-primary-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">Removing Background...</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-slate-500">Click &quot;Remove Background&quot; to see result</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Background Color Palette Selection Option */}
              {processedUrl && (
                <div className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 space-y-3 animate-fade-in shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-slate-100 uppercase tracking-wider">
                        Background Color
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                        Select a backdrop color for your cutout or keep it transparent
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-800 dark:text-slate-200">
                      {backgroundColor === 'transparent' ? 'Transparent (PNG)' : backgroundColor.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {/* Transparent button */}
                    <button
                      type="button"
                      title="Transparent"
                      onClick={() => setBackgroundColor('transparent')}
                      className={`h-9 px-3 rounded-lg border-2 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        backgroundColor === 'transparent'
                          ? 'border-primary-500 ring-2 ring-primary-500/40 bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-xs border border-gray-300 dark:border-slate-500 bg-[repeating-conic-gradient(#94a3b8_0%_25%,#f1f5f9_0%_50%)] bg-[length:6px_6px]" />
                      Transparent
                    </button>

                    {/* Preset color swatches */}
                    {COLOR_PRESETS.filter(p => !p.isTransparent).map(({ color, label, isLight }) => {
                      const isSelected = backgroundColor.toUpperCase() === color.toUpperCase()
                      return (
                        <button
                          key={color}
                          type="button"
                          title={label}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-9 h-9 rounded-lg border-2 aspect-square flex-shrink-0 transition-all duration-150 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'border-primary-500 ring-2 ring-primary-500/40 scale-105 shadow-sm'
                              : 'border-gray-200 dark:border-slate-700 hover:scale-105 hover:border-gray-400 dark:hover:border-slate-500'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected && (
                            <svg className={`w-4 h-4 ${isLight ? 'text-gray-900' : 'text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )
                    })}

                    {/* Custom color input */}
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                      <label
                        title="Pick custom color"
                        className="relative w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 overflow-hidden cursor-pointer hover:border-primary-500 transition-colors flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-800"
                      >
                        <input
                          type="color"
                          value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 m-0 border-0"
                        />
                        <svg className="h-4 w-4 text-gray-500 dark:text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </label>
                      <input
                        type="text"
                        value={backgroundColor === 'transparent' ? '' : backgroundColor}
                        placeholder="#HEX"
                        onChange={(e) => {
                          const val = e.target.value
                          if (val.startsWith('#') || val === '') {
                            setBackgroundColor(val || 'transparent')
                          } else {
                            setBackgroundColor(`#${val}`)
                          }
                        }}
                        className="w-22 text-xs px-2.5 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 uppercase font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Buttons */}
              <div className="flex justify-center gap-4 pt-4 border-t border-gray-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null)
                    setPreviewUrl(null)
                    setProcessedUrl(null)
                    setBackgroundColor('transparent')
                  }}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  Upload New
                </button>
                {!processedUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold transition-all shadow-md shadow-primary-500/30 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessing ? 'Processing...' : 'Remove Background'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold transition-all shadow-md shadow-emerald-500/30 flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download HD
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageSelect} 
        accept="image/png, image/jpeg, image/webp" 
        className="hidden" 
      />
    </div>
  )
}
