'use client'

import { useState, useMemo, useRef } from 'react'
import type { PhotoSpec } from '@/lib/types'
import {
  SUPPORTED_PAPER_SIZES,
  DEFAULT_PAPER_SIZE_ID,
  OrientationSetting,
  LayoutMode,
  PrintPhotoItem,
  calculatePrintLayout,
} from '@/lib/printLayout'
import Button from './ui/Button'
import Card from './ui/Card'

interface PrintSheetSectionProps {
  photos?: PrintPhotoItem[]
  onUpdateCopies?: (id: string, delta: number) => void
  onRemovePhoto?: (id: string) => void
  // Legacy / fallback props
  imageUrl?: string
  spec?: PhotoSpec
  filter?: string
}

export default function PrintSheetSection({
  photos: propPhotos,
  onUpdateCopies,
  onRemovePhoto,
  imageUrl,
  spec,
  filter,
}: PrintSheetSectionProps) {
  // Local fallback photos if none passed via props
  const [internalPhotos, setInternalPhotos] = useState<PrintPhotoItem[]>([])

  // Normalize photos list
  const activePhotos: PrintPhotoItem[] = useMemo(() => {
    if (propPhotos && propPhotos.length > 0) {
      return propPhotos
    }
    if (internalPhotos.length > 0) {
      return internalPhotos
    }
    if (imageUrl) {
      const widthMm = spec?.dimensions?.width_mm || 35
      const heightMm = spec?.dimensions?.height_mm || 45
      const docName = spec?.name || 'Passport Photo'
      return [
        {
          id: 'single-photo-fallback',
          personNumber: 1,
          name: 'Person 1',
          imageUrl,
          filter: filter || 'none',
          documentType: spec?.name || 'PASSPORT',
          documentTitle: docName,
          widthMm,
          heightMm,
          copies: 4,
        },
      ]
    }
    return []
  }, [propPhotos, internalPhotos, imageUrl, spec, filter])

  // 1. Paper Size selection (Default: 5 × 7 in)
  const [selectedPaperId, setSelectedPaperId] = useState<string>(DEFAULT_PAPER_SIZE_ID)

  // 2. Orientation (Default: Auto)
  const [orientation, setOrientation] = useState<OrientationSetting>('auto')

  // 3. Layout Mode (Custom vs Maximum)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('custom')

  // Multi-sheet pagination index (0-indexed)
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0)

  // State for high-res download
  const [isExporting, setIsExporting] = useState(false)
  const printContainerRef = useRef<HTMLDivElement>(null)

  const selectedPaper = useMemo(() => {
    return SUPPORTED_PAPER_SIZES.find((p) => p.id === selectedPaperId) || SUPPORTED_PAPER_SIZES[0]
  }, [selectedPaperId])

  // Recalculate layout dynamically (Document Type is the Source of Truth)
  const layout = useMemo(() => {
    return calculatePrintLayout({
      paper: selectedPaper,
      photos: activePhotos,
      orientationSetting: orientation,
      layoutMode,
    })
  }, [selectedPaper, activePhotos, orientation, layoutMode])

  // Ensure active sheet index doesn't exceed total sheets
  const safeSheetIndex = Math.min(activeSheetIndex, Math.max(0, layout.totalSheetsRequired - 1))
  const currentPage = layout.pages[safeSheetIndex] || layout.pages[0] || {
    positions: [],
    actualPhotos: 0,
    gridColumns: layout.gridColumns,
    gridRows: layout.gridRows,
    boundingBox: layout.boundingBox,
  }

  // Handle copies modification
  const handleCopiesChange = (id: string, delta: number) => {
    if (onUpdateCopies) {
      onUpdateCopies(id, delta)
    } else {
      setInternalPhotos((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextCopies = Math.max(1, item.copies + delta)
            return { ...item, copies: nextCopies }
          }
          return item
        })
      )
    }
    if (layoutMode === 'maximum') setLayoutMode('custom')
  }

  // Handle remove photo
  const handleRemove = (id: string) => {
    if (onRemovePhoto) {
      onRemovePhoto(id)
    } else {
      setInternalPhotos((prev) => prev.filter((item) => item.id !== id))
    }
  }

  // High-Resolution 300 DPI Canvas Generation for a specific sheet page
  const generatePageCanvas = async (pageIndex: number): Promise<HTMLCanvasElement> => {
    const DPI = 300
    const MM_TO_INCH = 1 / 25.4
    const canvasWidth = Math.round(layout.paperWidthMm * MM_TO_INCH * DPI)
    const canvasHeight = Math.round(layout.paperHeightMm * MM_TO_INCH * DPI)

    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')!

    // Fill white paper background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    const pageToDraw = layout.pages[pageIndex] || currentPage
    if (!pageToDraw || pageToDraw.positions.length === 0) return canvas

    // Cache preloaded images to prevent redundant loads
    const imageCache = new Map<string, HTMLImageElement>()

    for (const pos of pageToDraw.positions) {
      const photoItem = pos.photoItem
      const photoSrc = photoItem?.imageUrl || imageUrl
      if (!photoSrc) continue

      let img = imageCache.get(photoSrc)
      if (!img) {
        img = new Image()
        img.crossOrigin = 'anonymous'
        await new Promise((resolve, reject) => {
          img!.onload = resolve
          img!.onerror = reject
          img!.src = photoSrc
        })
        imageCache.set(photoSrc, img)
      }

      const pxX = Math.round(pos.xMm * MM_TO_INCH * DPI)
      const pxY = Math.round(pos.yMm * MM_TO_INCH * DPI)
      const pxW = Math.round(pos.widthMm * MM_TO_INCH * DPI)
      const pxH = Math.round(pos.heightMm * MM_TO_INCH * DPI)

      const photoFilter = photoItem?.filter || filter
      if (photoFilter && photoFilter !== 'none') {
        ctx.filter = photoFilter
      } else {
        ctx.filter = 'none'
      }

      ctx.drawImage(img, pxX, pxY, pxW, pxH)

      // Light cut-line border
      ctx.filter = 'none'
      ctx.strokeStyle = '#D1D5DB'
      ctx.lineWidth = Math.max(1, Math.round(DPI / 300))
      ctx.strokeRect(pxX, pxY, pxW, pxH)
    }

    return canvas
  }

  // Handle Download High-Res Print Sheet
  const handleDownloadSheet = async () => {
    try {
      setIsExporting(true)
      const canvas = await generatePageCanvas(safeSheetIndex)
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/jpeg', 0.98)
      const paperSlug = selectedPaper.name.split('—')[0].trim().toLowerCase().replace(/\s+/g, '-')
      link.download = `print-sheet-${paperSlug}-sheet${safeSheetIndex + 1}-${layout.totalRequestedPhotos}photos.jpg`
      link.click()
    } catch (err) {
      console.error('Failed to export print sheet:', err)
      alert('Failed to generate high-resolution print sheet.')
    } finally {
      setIsExporting(false)
    }
  }

  // Handle Physical Print Dialog (prints all required sheets)
  const handlePrint = async () => {
    try {
      setIsExporting(true)
      const sheetDataUrls: string[] = []

      for (let p = 0; p < layout.totalSheetsRequired; p++) {
        const canvas = await generatePageCanvas(p)
        sheetDataUrls.push(canvas.toDataURL('image/jpeg', 0.98))
      }

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        alert('Please allow popups to open the print dialog.')
        return
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Print Photos - ${selectedPaper.name}</title>
          <style>
            @page {
              size: ${layout.paperWidthMm}mm ${layout.paperHeightMm}mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              background: #fff;
            }
            img {
              width: ${layout.paperWidthMm}mm;
              height: ${layout.paperHeightMm}mm;
              display: block;
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${sheetDataUrls.map((url) => `<img src="${url}" />`).join('')}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
        </html>
      `)
      printWindow.document.close()
    } catch (err) {
      console.error('Print failed:', err)
      alert('Failed to launch print dialog.')
    } finally {
      setIsExporting(false)
    }
  }

  // Primary document dimension information
  const primaryDimensions = activePhotos[0]
    ? `${activePhotos[0].widthMm} × ${activePhotos[0].heightMm} mm`
    : `${layout.photo.widthMm} × ${layout.photo.heightMm} mm`


  return (
    <Card title="Photo Print Settings & Sheet Preview" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Configuration Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Paper Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              1. Paper Size
            </label>
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {SUPPORTED_PAPER_SIZES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Orientation (Default: Auto) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
                2. Orientation
              </label>
              <span className="text-[11px] px-2.5 py-0.5 rounded-md font-semibold bg-primary-50 dark:bg-slate-800 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-slate-600 shadow-2xs">
                {orientation === 'auto'
                  ? `Auto: ${layout.resolvedOrientation === 'portrait' ? 'Portrait' : 'Landscape'}`
                  : `${orientation.charAt(0).toUpperCase() + orientation.slice(1)}`}
              </span>
            </div>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as OrientationSetting)}
              className="w-full text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 p-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="auto">Auto (Smart Quantity-Aware)</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          {/* 3. Layout Mode (Custom vs Maximum) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
              3. Layout Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLayoutMode('custom')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  layoutMode === 'custom'
                    ? 'border-primary-600 bg-primary-600 text-white shadow-xs'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full border-2 ${
                    layoutMode === 'custom' ? 'border-white bg-white' : 'border-gray-400 dark:border-slate-500'
                  }`}
                />
                Custom
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('maximum')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  layoutMode === 'maximum'
                    ? 'border-primary-600 bg-primary-600 text-white shadow-xs'
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full border-2 ${
                    layoutMode === 'maximum' ? 'border-white bg-white' : 'border-gray-400 dark:border-slate-500'
                  }`}
                />
                Maximum ({layout.maxPhotos} / sheet)
              </button>
            </div>
          </div>

          {/* 4. Photos Section (Multi-Person saved list) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
                4. Photos ({activePhotos.length} {activePhotos.length === 1 ? 'person' : 'people'})
              </label>
              <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                Total Photos: {layout.totalRequestedPhotos}
              </span>
            </div>

            {/* Photos Table / Card List */}
            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-700/80 bg-white dark:bg-slate-800 shadow-2xs">
              {activePhotos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-gray-50/70 dark:hover:bg-slate-700/40 transition-colors"
                >
                  {/* Photo Thumbnail + Name + Spec */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-11 h-11 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden bg-gray-100 dark:bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-2xs"
                      style={{ aspectRatio: `${photo.widthMm} / ${photo.heightMm}` }}
                    >
                      <img
                        src={photo.imageUrl}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                        style={{ filter: photo.filter || 'none' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-gray-900 dark:text-slate-100 truncate">
                          {photo.name || `Person ${idx + 1}`}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 font-mono font-medium">
                          {photo.widthMm}×{photo.heightMm}mm
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                        {photo.documentTitle}
                      </p>
                    </div>
                  </div>

                  {/* Copy Quantity Stepper */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      title="Decrease copies"
                      onClick={() => handleCopiesChange(photo.id, -1)}
                      disabled={photo.copies <= 1}
                      className="w-7 h-7 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-sm transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-slate-100 tabular-nums">
                      {photo.copies}
                    </span>
                    <button
                      type="button"
                      title="Increase copies"
                      onClick={() => handleCopiesChange(photo.id, 1)}
                      className="w-7 h-7 rounded-md border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 font-bold hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center justify-center text-sm transition-colors"
                    >
                      +
                    </button>

                    {/* Remove photo button if multiple photos */}
                    {activePhotos.length > 1 && (
                      <button
                        type="button"
                        title="Remove person"
                        onClick={() => handleRemove(photo.id)}
                        className="ml-1 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Sheets required indicator */}
            <div className="flex items-center justify-between text-[11px] pt-0.5 px-0.5">
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                ✓ {layout.maxPhotos} photos fit per sheet ({selectedPaper.inchesLabel || selectedPaper.name.split('—')[0].trim()})
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                {layout.totalSheetsRequired} {layout.totalSheetsRequired === 1 ? 'Sheet' : 'Sheets'} required
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={handlePrint} loading={isExporting} className="w-full" size="md">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print Sheet (100% Actual Size)
            </Button>
            <button
              type="button"
              onClick={handleDownloadSheet}
              disabled={isExporting}
              className="w-full py-2 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download 300 DPI Print Image
            </button>
          </div>
        </div>

        {/* Right Side: Dynamic Print Preview representing Actual Paper */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-[#070D18] rounded-xl border border-gray-200 dark:border-slate-800/80">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-gray-600 dark:text-slate-300">
            <span className="font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              Sheet Preview ({currentPage.actualPhotos} photos on this sheet)
              {layout.totalSheetsRequired > 1 && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-100 dark:bg-slate-800 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200 dark:border-slate-700 shadow-2xs">
                  Sheet {safeSheetIndex + 1} of {layout.totalSheetsRequired}
                </span>
              )}
            </span>
            <span className="text-[11px] font-mono text-gray-500 dark:text-slate-400">
              {layout.paperWidthMm} × {layout.paperHeightMm} mm
            </span>
          </div>

          {/* Sheet Pagination Controls (if > 1 sheet) */}
          {layout.totalSheetsRequired > 1 && (
            <div className="w-full flex items-center justify-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => setActiveSheetIndex((prev) => Math.max(0, prev - 1))}
                disabled={safeSheetIndex === 0}
                className="px-2.5 py-1 text-xs rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold transition-colors"
              >
                ◀ Previous Sheet
              </button>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300 px-2">
                Sheet {safeSheetIndex + 1} of {layout.totalSheetsRequired}
              </span>
              <button
                type="button"
                onClick={() => setActiveSheetIndex((prev) => Math.min(layout.totalSheetsRequired - 1, prev + 1))}
                disabled={safeSheetIndex >= layout.totalSheetsRequired - 1}
                className="px-2.5 py-1 text-xs rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 font-semibold transition-colors"
              >
                Next Sheet ▶
              </button>
            </div>
          )}

          {/* Physical Sheet Container with Accurate Aspect Ratio */}
          <div className="w-full flex items-center justify-center py-2">
            <div
              ref={printContainerRef}
              className="relative bg-white shadow-2xl rounded-xs border border-gray-300 overflow-hidden transition-all duration-300"
              style={{
                aspectRatio: `${layout.paperWidthMm} / ${layout.paperHeightMm}`,
                width: layout.resolvedOrientation === 'portrait' ? '68%' : '92%',
                maxWidth: '480px',
              }}
            >
              {/* Printable Safe Boundary guide (subtle dashed line) */}
              <div
                className="absolute inset-[3%] border border-dashed border-gray-200 pointer-events-none"
                title="Printer Safe Margin"
              />

              {/* Photos placed at exact physical percentage coordinates */}
              {currentPage.positions.map((pos) => {
                const photoItem = pos.photoItem
                const photoSrc = photoItem?.imageUrl || imageUrl
                const photoFilter = photoItem?.filter || filter || 'none'
                const leftPercent = (pos.xMm / layout.paperWidthMm) * 100
                const topPercent = (pos.yMm / layout.paperHeightMm) * 100
                const widthPercent = (pos.widthMm / layout.paperWidthMm) * 100
                const heightPercent = (pos.heightMm / layout.paperHeightMm) * 100

                return (
                  <div
                    key={pos.index}
                    className="absolute overflow-hidden border border-gray-300 shadow-2xs group"
                    style={{
                      left: `${leftPercent}%`,
                      top: `${topPercent}%`,
                      width: `${widthPercent}%`,
                      height: `${heightPercent}%`,
                    }}
                  >
                    {photoSrc && (
                      <img
                        src={photoSrc}
                        alt={photoItem?.name || `Photo ${pos.index + 1}`}
                        className="w-full h-full object-contain"
                        style={{ filter: photoFilter }}
                      />
                    )}
                    {/* Subtle label badge on photo for identification */}
                    {photoItem && (
                      <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[8px] font-bold px-1 rounded-xs pointer-events-none">
                        {photoItem.name}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Layout Summary Table / Metadata */}
          <div className="w-full mt-4 pt-3 border-t border-gray-200 dark:border-slate-800 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2 text-gray-500 dark:text-gray-400">
            <div>
              <span className="block text-gray-400 dark:text-gray-400">Paper</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {selectedPaper.name.split('—')[0].trim()}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 dark:text-gray-400">Document Size</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {primaryDimensions}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 dark:text-gray-400">Orientation</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {orientation === 'auto' ? `Auto → ${layout.resolvedOrientation}` : layout.resolvedOrientation}
              </span>
            </div>
            <div>
              <span className="block text-gray-400 dark:text-gray-400">Total Output</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {layout.totalRequestedPhotos} photos ({layout.totalSheetsRequired}{' '}
                {layout.totalSheetsRequired === 1 ? 'sheet' : 'sheets'})
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
