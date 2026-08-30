'use client';

import React, { useState, useRef } from 'react';
import { removeBackground } from '@/lib/api';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { Upload, Download, Sparkles, Check, X, Scissors } from 'lucide-react';

const COLOR_PRESETS = [
  { color: 'transparent', label: 'Transparent', isTransparent: true, isLight: false },
  { color: '#FFFFFF', label: 'White', isTransparent: false, isLight: true },
  { color: '#000000', label: 'Black', isTransparent: false, isLight: false },
  { color: '#2563EB', label: 'Royal Blue', isTransparent: false, isLight: false },
  { color: '#38BDF8', label: 'Sky Blue', isTransparent: false, isLight: true },
  { color: '#DC2626', label: 'Crimson Red', isTransparent: false, isLight: false },
  { color: '#059669', label: 'Emerald Green', isTransparent: false, isLight: false },
  { color: '#475569', label: 'Slate Gray', isTransparent: false, isLight: false },
];

export default function BackgroundRemover() {
  const tool = getTool('background-remover')!;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>('transparent');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('image/') || /\.(png|jpe?g|webp|heic)$/i.test(file.name))) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedUrl(null);
      setBackgroundColor('transparent');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    try {
      const result = await removeBackground(selectedImage, 'transparent');
      if (result) {
        setProcessedUrl(result.startsWith('data:') ? result : `data:image/png;base64,${result}`);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to remove background. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;

    if (backgroundColor === 'transparent') {
      const a = document.createElement('a');
      a.href = processedUrl;
      a.download = 'background-removed.png';
      a.click();
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `photo-bg-${backgroundColor.replace('#', '')}.png`;
      a.click();
    };
    img.src = processedUrl;
  };

  return (
    <ToolPageShell tool={tool}>
      <div className="lt-card overflow-hidden">
        <div className="p-6 sm:p-8">
          {!previewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.05)] scale-[1.01]'
                  : 'lt-border-color hover:border-[rgb(var(--lt-primary)/0.5)] hover:bg-[rgb(var(--lt-surface-2))]'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200 ${
                  isDragging
                    ? 'bg-[rgb(var(--lt-primary))] text-white scale-110'
                    : 'bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] group-hover:scale-110'
                }`}
              >
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[rgb(var(--lt-text))] mb-2">
                {isDragging ? 'Drop your image here!' : 'Upload or Drop an Image'}
              </h3>
              <p className="text-sm lt-text-muted">
                Drag and drop your image here, or click to browse (PNG, JPG or WEBP)
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="space-y-2.5">
                  <h3 className="text-sm font-semibold text-[rgb(var(--lt-text))] text-center">Original Image</h3>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border lt-border-color bg-[rgb(var(--lt-surface-2))] flex items-center justify-center">
                    <img src={previewUrl} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Result */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-sm font-semibold text-[rgb(var(--lt-text))] text-center">Result</h3>
                    {processedUrl && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] border border-[rgb(var(--lt-primary)/0.3)]">
                        {backgroundColor === 'transparent' ? 'Transparent' : backgroundColor.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div
                    className="relative aspect-[4/3] rounded-xl overflow-hidden border lt-border-color flex items-center justify-center transition-all duration-200"
                    style={{
                      backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
                      backgroundImage:
                        backgroundColor === 'transparent'
                          ? 'linear-gradient(45deg, rgb(var(--lt-surface-2)) 25%, transparent 25%), linear-gradient(-45deg, rgb(var(--lt-surface-2)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgb(var(--lt-surface-2)) 75%), linear-gradient(-45deg, transparent 75%, rgb(var(--lt-surface-2)) 75%)'
                          : undefined,
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  >
                    {processedUrl ? (
                      <img src={processedUrl} alt="Result" className="w-full h-full object-contain" />
                    ) : isProcessing ? (
                      <div className="flex flex-col items-center">
                        <span className="h-8 w-8 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin mb-2" />
                        <span className="text-sm font-medium text-[rgb(var(--lt-text))]">Removing Background...</span>
                      </div>
                    ) : (
                      <span className="text-sm lt-text-muted">Click &quot;Remove Background&quot; to see result</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Background Color Palette */}
              {processedUrl && (
                <div className="p-4 sm:p-5 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] space-y-3 lt-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[rgb(var(--lt-text))] uppercase tracking-wider">
                        Background Color
                      </h4>
                      <p className="text-[11px] lt-text-muted mt-0.5">
                        Select a backdrop color for your cutout or keep it transparent
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-[rgb(var(--lt-surface))] border lt-border-color text-[rgb(var(--lt-text))]">
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
                          ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-primary))] shadow-sm'
                          : 'lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] hover:border-[rgb(var(--lt-primary)/0.5)]'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-xs border lt-border-color bg-[repeating-conic-gradient(#94a3b8_0%_25%,#f1f5f9_0%_50%)] bg-[length:6px_6px]" />
                      Transparent
                    </button>

                    {/* Preset colors */}
                    {COLOR_PRESETS.filter((p) => !p.isTransparent).map(({ color, label, isLight }) => {
                      const isSelected = backgroundColor.toUpperCase() === color.toUpperCase();
                      return (
                        <button
                          key={color}
                          type="button"
                          title={label}
                          onClick={() => setBackgroundColor(color)}
                          className={`w-9 h-9 rounded-lg border-2 aspect-square flex-shrink-0 transition-all duration-150 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'border-[rgb(var(--lt-primary))] scale-105 shadow-sm ring-2 ring-[rgb(var(--lt-primary)/0.3)]'
                              : 'lt-border-color hover:scale-105 hover:border-[rgb(var(--lt-primary)/0.5)]'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected && (
                            <Check className={`w-4 h-4 ${isLight ? 'text-gray-900' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}

                    {/* Custom color input */}
                    <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
                      <label
                        title="Pick custom color"
                        className="relative w-9 h-9 rounded-lg border-2 border-dashed lt-border-color overflow-hidden cursor-pointer hover:border-[rgb(var(--lt-primary))] transition-colors flex items-center justify-center flex-shrink-0 bg-[rgb(var(--lt-surface))]"
                      >
                        <input
                          type="color"
                          value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor}
                          onChange={(e) => setBackgroundColor(e.target.value)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer p-0 m-0 border-0"
                        />
                        <Sparkles className="h-4 w-4 text-[rgb(var(--lt-text-muted))] pointer-events-none" />
                      </label>
                      <input
                        type="text"
                        value={backgroundColor === 'transparent' ? '' : backgroundColor}
                        placeholder="#HEX"
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#') || val === '') {
                            setBackgroundColor(val || 'transparent');
                          } else {
                            setBackgroundColor(`#${val}`);
                          }
                        }}
                        className="w-24 text-xs px-2.5 py-2 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] focus:outline-none focus:border-[rgb(var(--lt-primary))] uppercase font-mono font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex justify-center gap-4 pt-4 border-t lt-border-color">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                    setProcessedUrl(null);
                    setBackgroundColor('transparent');
                  }}
                  className="lt-btn-secondary"
                >
                  <X className="h-4 w-4" /> Upload New
                </button>
                {!processedUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="lt-btn-primary"
                  >
                    {isProcessing ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white lt-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scissors className="h-4 w-4" /> Remove Background
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="lt-btn-primary"
                  >
                    <Download className="h-4 w-4" /> Download HD
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
    </ToolPageShell>
  );
}
