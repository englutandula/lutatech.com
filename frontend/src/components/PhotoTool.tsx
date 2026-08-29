'use client'

import { useState, useEffect, useMemo } from 'react'
import { getRequirements } from '@/lib/api'
import { useImageUpload } from '@/hooks/useImageUpload'
import { usePhotoProcess } from '@/hooks/usePhotoProcess'
import { base64ToObjectUrl } from '@/lib/utils'
import { DEFAULT_DOCUMENT, DEFAULT_SPECS } from '@/constants/photoRequirements'
import type { PhotoSpec, ProcessOptions } from '@/lib/types'
import type { PrintPhotoItem } from '@/lib/printLayout'
import PhotoUploader from '@/components/PhotoUploader'
import CountrySelector from '@/components/CountrySelector'
import ImageEditor from '@/components/ImageEditor'
import BeforeAfter from '@/components/BeforeAfter'
import DownloadButton from '@/components/DownloadButton'
import RequirementsInfo from '@/components/RequirementsInfo'
import ManualCropModal from '@/components/ManualCropModal'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Spinner from '@/components/ui/Spinner'
import PrintSheetSection from '@/components/PrintSheetSection'
import ProcessingStepper from '@/components/ProcessingStepper'

export default function PhotoTool() {
  const [specs, setSpecs] = useState<Record<string, PhotoSpec>>(DEFAULT_SPECS)
  const [specsLoading, setSpecsLoading] = useState(false)
  const [documentType, setDocumentType] = useState(DEFAULT_DOCUMENT)
  const [options, setOptions] = useState<ProcessOptions>({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    remove_background: true,
    background_color: undefined,
    auto_enhance: true,
    custom_width: 50,
    custom_height: 50,
    custom_unit: 'mm',
  })

  const [postBrightness, setPostBrightness] = useState(100)
  const [postContrast, setPostContrast] = useState(100)
  const [postSaturation, setPostSaturation] = useState(100)
  const [showManualCrop, setShowManualCrop] = useState(false)

  // Multi-person photo storage
  const [savedPhotos, setSavedPhotos] = useState<PrintPhotoItem[]>([])
  const [currentCopies, setCurrentCopies] = useState<number>(4)

  const { file, previewUrl, error: uploadError, load, clear } = useImageUpload()
  const { result, setResult, status, error: processError, process, reset } = usePhotoProcess()

  useEffect(() => {
    getRequirements()
      .then((data) => {
        if (data?.countries) setSpecs(data.countries)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (specs[documentType]) {
      setOptions((prev) => ({
        ...prev,
        background_color: specs[documentType].background.color,
      }))
    } else if (documentType === 'CUSTOM_SIZE') {
      setOptions((prev) => ({
        ...prev,
        background_color: '#FFFFFF',
      }))
    }
  }, [documentType, specs])

  function handleProcess() {
    if (file && documentType) process(file, documentType, options)
  }

  function handleClear() {
    clear()
    reset()
    setPostBrightness(100)
    setPostContrast(100)
    setPostSaturation(100)
    setShowManualCrop(false)
  }

  function handleManualCrop() {
    if (!selectedSpec || !result) return
    setShowManualCrop(true)
  }

  function handleManualCropApply(croppedBase64: string) {
    if (!result) return
    setResult({
      ...result,
      processed_image: croppedBase64,
      metadata: {
        ...result.metadata,
        warnings: result.metadata.warnings.filter(w => !w.includes('face')),
      },
    })
    setShowManualCrop(false)
  }

  const processedUrl = result ? base64ToObjectUrl(result.processed_image) : null
  const bgRemovedUrl = useMemo(() => result?.bg_removed_image ? base64ToObjectUrl(result.bg_removed_image) : null, [result?.bg_removed_image])
  const postFilter = `brightness(${postBrightness}%) contrast(${postContrast}%) saturate(${postSaturation}%)`
  const selectedSpec = specs[documentType]
  const hasResult = status === 'done' && result

  // Currently active successfully processed photo item
  const currentPhotoItem: PrintPhotoItem | null = useMemo(() => {
    if (!hasResult || !processedUrl) return null
    const personNum = savedPhotos.length + 1
    const widthMm: number = selectedSpec?.dimensions?.width_mm ?? (options.custom_unit === 'mm' && options.custom_width ? options.custom_width : 35)
    const heightMm: number = selectedSpec?.dimensions?.height_mm ?? (options.custom_unit === 'mm' && options.custom_height ? options.custom_height : 45)
    const docTitle = selectedSpec?.name || (documentType === 'CUSTOM_SIZE' ? `Custom (${widthMm}×${heightMm}mm)` : documentType)

    return {
      id: 'active-photo',
      personNumber: personNum,
      name: `Person ${personNum}`,
      imageUrl: processedUrl,
      filter: postFilter,
      documentType,
      documentTitle: docTitle,
      widthMm,
      heightMm,
      copies: currentCopies,
    }
  }, [hasResult, processedUrl, savedPhotos.length, selectedSpec, documentType, options, postFilter, currentCopies])

  // ONLY photos explicitly committed via "+ Add Another Photo" appear in Print Sheet Section!
  // Neither the 1st nor 2nd, 3rd, etc. photos appear in print preview until "+ Add Another Photo" is clicked.
  const allPrintPhotos: PrintPhotoItem[] = savedPhotos

  // Add Another Photo handler: commits current photo to saved list and resets upload
  function handleAddAnotherPhoto() {
    if (!hasResult || !processedUrl || !currentPhotoItem) return

    const permanentPhoto: PrintPhotoItem = {
      ...currentPhotoItem,
      id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    }

    setSavedPhotos((prev) => [...prev, permanentPhoto])

    // Clear current upload & before/after preview for next photo
    handleClear()
    setCurrentCopies(4)
  }

  // Update copies for a photo
  function handleUpdateCopies(id: string, delta: number) {
    if (id === 'active-photo') {
      setCurrentCopies((prev) => Math.max(1, prev + delta))
    } else {
      setSavedPhotos((prev) =>
        prev.map((photo) => {
          if (photo.id === id) {
            return { ...photo, copies: Math.max(1, photo.copies + delta) }
          }
          return photo
        })
      )
    }
  }

  // Remove photo handler
  function handleRemovePhoto(id: string) {
    if (id === 'active-photo') {
      handleClear()
    } else {
      setSavedPhotos((prev) => prev.filter((p) => p.id !== id))
    }
  }

  if (specsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card title="Upload Photo" step={1}>
            <PhotoUploader
              onFileSelect={load}
              previewUrl={previewUrl}
              error={uploadError}
              onClear={handleClear}
            />
          </Card>

          <Card title="Document Type" step={2}>
            <div className="space-y-3">
              <CountrySelector value={documentType} onChange={setDocumentType} specs={specs} />
              
              {documentType.startsWith('TANZANIA_') && (
                <div className="mt-2 bg-blue-50/50 dark:bg-slate-700/50 p-3 rounded-md border border-blue-100 dark:border-slate-600">
                  <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Select Tanzania Document</label>
                  <Select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    options={Object.keys(specs)
                      .filter(code => code.startsWith('TANZANIA_'))
                      .map(code => ({
                        value: code,
                        label: specs[code].name
                      }))
                    }
                  />
                </div>
              )}
              
              {documentType === 'CUSTOM_SIZE' && (
                <div className="flex space-x-4 bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-100 dark:border-slate-700 mt-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width ({options.custom_unit})</label>
                    <input 
                      type="number" 
                      className="w-full text-sm rounded border-gray-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-2"
                      value={options.custom_width} 
                      onChange={(e) => setOptions(prev => ({...prev, custom_width: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height ({options.custom_unit})</label>
                    <input 
                      type="number" 
                      className="w-full text-sm rounded border-gray-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-2"
                      value={options.custom_height} 
                      onChange={(e) => setOptions(prev => ({...prev, custom_height: Number(e.target.value)}))}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Unit</label>
                    <select
                      className="w-full text-sm rounded border-gray-300 dark:border-slate-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-1.5 px-2"
                      value={options.custom_unit}
                      onChange={(e) => setOptions(prev => ({...prev, custom_unit: e.target.value as 'mm' | 'px' | 'in'}))}
                    >
                      <option value="mm">mm</option>
                      <option value="px">px</option>
                      <option value="in">inch</option>
                    </select>
                  </div>
                </div>
              )}
              
              {selectedSpec && <RequirementsInfo spec={selectedSpec} />}
            </div>
          </Card>

          <Card title="Settings" step={3}>
            <ImageEditor
              options={options}
              onChange={setOptions}
              onProcess={handleProcess}
              status={status}
              hasFile={!!file}
              hasResult={!!result}
            />
            {processError && (
              <p className="mt-3 text-sm text-red-600 rounded-lg bg-red-50 border border-red-100 p-2.5">
                {processError}
              </p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {status === 'idle' && !result && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-12 flex flex-col items-center justify-center text-center min-h-48 sm:min-h-96">
              <svg className="h-12 w-12 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="font-semibold text-gray-400 text-base">Your result will appear here</h3>
              <p className="text-gray-300 mt-1 text-sm">Upload a photo and click &quot;Create Passport Photo&quot;</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/40 p-4 sm:p-8 flex flex-col items-center justify-center min-h-48 sm:min-h-96 animate-fade-in">
              <ProcessingStepper isProcessing={status === 'processing'} />
            </div>
          )}

          {hasResult && processedUrl && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid gap-4 lg:grid-cols-5">
                <Card title="Before / After" className="lg:col-span-3">
                  <BeforeAfter before={previewUrl} after={processedUrl} afterStyle={{ filter: postFilter }} />
                  
                  {/* Manual Crop Button */}
                  <button
                    type="button"
                    onClick={handleManualCrop}
                    className="mt-3 w-full py-2.5 sm:py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-xs font-medium text-gray-700 dark:text-slate-200 active:bg-white dark:active:bg-slate-700 transition-colors shadow-2xs"
                  >
                    AI crop not right? <span className="font-semibold text-primary-600 dark:text-primary-400">Manual crop</span>
                  </button>

                  {/* + Add Another Photo Button (located immediately below Manual crop) */}
                  <button
                    type="button"
                    onClick={handleAddAnotherPhoto}
                    className="mt-2.5 w-full py-2.5 sm:py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] cursor-pointer"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    + Add Another Photo
                  </button>
                </Card>

                <div className="space-y-4 lg:col-span-2">
                  <Card title="Fine-tune">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600 dark:text-slate-300 font-medium">Brightness</span>
                          <span className="text-gray-500 dark:text-slate-400 tabular-nums font-mono">{postBrightness}%</span>
                        </div>
                        <input type="range" min={50} max={150} value={postBrightness} onChange={(e) => setPostBrightness(Number(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600 dark:text-slate-300 font-medium">Contrast</span>
                          <span className="text-gray-500 dark:text-slate-400 tabular-nums font-mono">{postContrast}%</span>
                        </div>
                        <input type="range" min={50} max={150} value={postContrast} onChange={(e) => setPostContrast(Number(e.target.value))} className="w-full" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-600 dark:text-slate-300 font-medium">Saturation</span>
                          <span className="text-gray-500 dark:text-slate-400 tabular-nums font-mono">{postSaturation}%</span>
                        </div>
                        <input type="range" min={50} max={150} value={postSaturation} onChange={(e) => setPostSaturation(Number(e.target.value))} className="w-full" />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPostBrightness(100)
                          setPostContrast(100)
                          setPostSaturation(100)
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                      >
                        Reset to default
                      </button>
                    </div>
                  </Card>

                  <Card title="Download">
                    <DownloadButton base64={result.processed_image} metadata={result.metadata} filter={postFilter} />
                  </Card>
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 flex flex-col items-center text-center min-h-50 justify-center animate-fade-in">
              <span className="text-3xl mb-3">⚠️</span>
              <h3 className="font-semibold text-red-800">Processing failed</h3>
              <p className="text-sm text-red-600 mt-1">{processError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Print Settings & Sheet Preview (Shows all processed photos) */}
      {allPrintPhotos.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <PrintSheetSection
            photos={allPrintPhotos}
            onUpdateCopies={handleUpdateCopies}
            onRemovePhoto={handleRemovePhoto}
          />
        </div>
      )}

      {showManualCrop && bgRemovedUrl && selectedSpec && (
        <ManualCropModal
          imageSrc={bgRemovedUrl}
          spec={selectedSpec}
          bgColor={options.background_color || selectedSpec.background.color}
          onApply={handleManualCropApply}
          onClose={() => setShowManualCrop(false)}
        />
      )}
    </>
  )
}
