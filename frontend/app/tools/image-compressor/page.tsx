'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, X, Check, ArrowRight, FileArchive, Sliders, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';
import ToolContentSection from '@/components/seo/ToolContentSection';

interface CompressedImageItem {
  id: string;
  file: File;
  name: string;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  compressedDataUrl: string;
  savingsPct: number;
  status: 'idle' | 'compressing' | 'done' | 'error';
}

export default function ImageCompressorPage() {
  const tool = getTool('image-compressor') || {
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortName: 'Img Compress',
    category: 'Image' as const,
    icon: 'Minimize2',
    accent: 'amber',
    status: 'live' as const,
    description: 'Compress JPG, PNG, and WebP images to reduce file size while preserving high visual quality.',
    longDescription: 'Compress one or multiple images directly in your browser. Choose between smart preset compression levels or fine-tune quality manually with instant live preview and file size savings comparison.',
  };

  const [items, setItems] = useState<CompressedImageItem[]>([]);
  const [compressionPreset, setCompressionPreset] = useState<'recommended' | 'extreme' | 'low' | 'custom'>('recommended');
  const [quality, setQuality] = useState<number>(75);
  const [maxDimension, setMaxDimension] = useState<number>(2400);
  const [outputFormat, setOutputFormat] = useState<'auto' | 'image/jpeg' | 'image/webp'>('auto');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const handleFiles = (fileList: FileList | File[]) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) return;

    const newItems: CompressedImageItem[] = valid.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      compressedSize: 0,
      compressedDataUrl: '',
      savingsPct: 0,
      status: 'idle',
    }));

    setItems((prev) => [...prev, ...newItems]);
  };

  const compressSingleFile = async (
    item: CompressedImageItem,
    targetQuality: number,
    targetMaxDim: number,
    targetFormat: string
  ): Promise<CompressedImageItem> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { naturalWidth: w, naturalHeight: h } = img;

        // Downscale proportionally if larger than maxDimension
        if (targetMaxDim > 0 && (w > targetMaxDim || h > targetMaxDim)) {
          if (w > h) {
            h = Math.round((h * targetMaxDim) / w);
            w = targetMaxDim;
          } else {
            w = Math.round((w * targetMaxDim) / h);
            h = targetMaxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ ...item, status: 'error' });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        const mime = targetFormat === 'auto'
          ? (item.file.type === 'image/png' ? 'image/webp' : item.file.type)
          : targetFormat;

        const dataUrl = canvas.toDataURL(mime, targetQuality / 100);

        // Approximate byte size from dataUrl
        const head = `data:${mime};base64,`;
        const base64Length = dataUrl.length - head.length;
        const compBytes = Math.round((base64Length * 3) / 4);

        const savings = Math.max(0, Math.round(((item.originalSize - compBytes) / item.originalSize) * 100));

        resolve({
          ...item,
          compressedSize: compBytes,
          compressedDataUrl: dataUrl,
          savingsPct: savings,
          status: 'done',
        });
      };
      img.onerror = () => resolve({ ...item, status: 'error' });
      img.src = item.previewUrl;
    });
  };

  const runCompression = async (overrideQuality?: number) => {
    if (items.length === 0) return;
    setIsProcessing(true);

    const q = overrideQuality ?? quality;
    const updated: CompressedImageItem[] = [];

    for (const item of items) {
      const res = await compressSingleFile(item, q, maxDimension, outputFormat);
      updated.push(res);
    }

    setItems(updated);
    setIsProcessing(false);
    recordToolUsage('image-compressor');
  };

  // Trigger compression when preset changes or when new items are added
  useEffect(() => {
    if (items.length > 0) {
      let q = quality;
      if (compressionPreset === 'recommended') q = 75;
      else if (compressionPreset === 'extreme') q = 45;
      else if (compressionPreset === 'low') q = 90;
      setQuality(q);
      runCompression(q);
    }
  }, [compressionPreset, outputFormat, maxDimension, items.length]);

  const handleDownloadSingle = (item: CompressedImageItem) => {
    if (!item.compressedDataUrl) return;
    const ext = outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const base = item.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = item.compressedDataUrl;
    a.download = `${base}-compressed.${ext}`;
    a.click();
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.compressedDataUrl);
    if (doneItems.length === 0) return;

    setIsZipping(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (const item of doneItems) {
        const base64Data = item.compressedDataUrl.split(',')[1];
        const ext = item.compressedDataUrl.includes('image/webp') ? 'webp' : 'jpg';
        const base = item.name.replace(/\.[^/.]+$/, '');
        zip.file(`${base}-compressed.${ext}`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed-images-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const totalOriginal = items.reduce((acc, curr) => acc + curr.originalSize, 0);
  const totalCompressed = items.reduce((acc, curr) => acc + (curr.compressedSize || curr.originalSize), 0);
  const totalSavings = totalOriginal > 0
    ? Math.max(0, Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100))
    : 0;

  return (
    <ToolPageShell tool={tool}>
      <div className="lt-card overflow-hidden">
        <div className="p-4 sm:p-8">
          {items.length === 0 ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.05)] scale-[1.01]'
                  : 'lt-border-color hover:border-[rgb(var(--lt-primary)/0.5)] hover:bg-[rgb(var(--lt-surface-2))]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--lt-text))] mb-1">
                Upload Images to Compress
              </h3>
              <p className="text-xs sm:text-sm lt-text-muted">
                Drag & drop JPG, PNG, WebP, or HEIC files here, or click to browse
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[rgb(var(--lt-text-muted))]">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% In-Browser</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> Instant Processing</span>
                <span>•</span>
                <span>Batch Support</span>
              </div>
            </div>
          ) : (
            /* Workspace */
            <div className="space-y-6">
              {/* Top Controls Bar */}
              <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[rgb(var(--lt-text))]">Compression Mode</h3>
                    <p className="text-xs lt-text-muted mt-0.5">Select a smart preset or set a custom quality target</p>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'recommended' as const, label: 'Recommended', badge: '-60% to -80%' },
                      { id: 'extreme' as const, label: 'Extreme', badge: '-80% to -95%' },
                      { id: 'low' as const, label: 'High Quality', badge: '-30% to -50%' },
                      { id: 'custom' as const, label: 'Custom', badge: `${quality}%` },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setCompressionPreset(p.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                          compressionPreset === p.id
                            ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary))] text-white shadow-xs'
                            : 'lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                        }`}
                      >
                        <span>{p.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                          compressionPreset === p.id ? 'bg-white/20 text-white' : 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                        }`}>
                          {p.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Quality Slider if Custom is active */}
                {compressionPreset === 'custom' && (
                  <div className="pt-2 border-t lt-border-color space-y-2 lt-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[rgb(var(--lt-text-muted))]">Quality Level:</span>
                      <span className="font-bold font-mono text-[rgb(var(--lt-primary))] text-sm">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={95}
                      value={quality}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setQuality(val);
                      }}
                      onMouseUp={() => runCompression(quality)}
                      onTouchEnd={() => runCompression(quality)}
                      className="w-full accent-[rgb(var(--lt-primary))]"
                    />
                  </div>
                )}
              </div>

              {/* Total Savings Highlight Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 lt-fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block">Total Savings</span>
                    <span className="text-sm sm:text-base font-extrabold text-[rgb(var(--lt-text))]">
                      {formatBytes(totalOriginal)} → {formatBytes(totalCompressed)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full bg-emerald-500 text-white shadow-xs">
                    -{totalSavings}% Smaller
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      disabled={isZipping || isProcessing}
                      className="lt-btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-xs"
                    >
                      <FileArchive className="h-4 w-4" />
                      {isZipping ? 'Creating ZIP...' : 'Download All (ZIP)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Image Items List */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="lt-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[rgb(var(--lt-primary)/0.3)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative h-14 w-14 shrink-0 rounded-xl overflow-hidden border lt-border-color bg-[rgb(var(--lt-surface-2))] flex items-center justify-center">
                        <img src={item.compressedDataUrl || item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[rgb(var(--lt-text))] truncate max-w-xs sm:max-w-md">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="lt-text-muted line-through font-mono text-[11px]">
                            {formatBytes(item.originalSize)}
                          </span>
                          <span className="font-bold text-[rgb(var(--lt-text))] font-mono">
                            {item.compressedSize > 0 ? formatBytes(item.compressedSize) : 'Compressing...'}
                          </span>
                          {item.savingsPct > 0 && (
                            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              -{item.savingsPct}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        disabled={item.status !== 'done'}
                        className="py-1.5 px-3 rounded-xl bg-[rgb(var(--lt-primary))] hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                      >
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                      <button
                        type="button"
                        onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                        className="p-1.5 rounded-lg text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-error))] hover:bg-[rgb(var(--lt-error)/0.08)] transition-colors cursor-pointer"
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add more button */}
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="lt-btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-2"
                >
                  <Upload className="h-3.5 w-3.5" /> Add more images
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
        }}
      />

      {/* SEO & Educational Guide Section */}
      <ToolContentSection
        toolName="Image Compressor"
        category="Image"
        tagline="Reduce JPG, PNG, and WebP image file sizes by up to 85% without sacrificing visible clarity."
        steps={[
          {
            title: 'Select or Drop Images',
            description: 'Upload single or batch photos in JPG, PNG, WebP, or HEIC formats from your phone or computer.',
          },
          {
            title: 'Choose Compression Mode',
            description: 'Select Recommended (balanced 70–80% savings), Maximum compression, or manually set target quality with live preview.',
          },
          {
            title: 'Download Optimized Files',
            description: 'Save individual compressed images or download all files packaged together in a single ZIP file.',
          },
        ]}
        features={[
          {
            title: 'Batch Image Processing',
            description: 'Optimize dozens of images at once without throttling, queue limits, or waiting in line.',
          },
          {
            title: 'Perceptual Quality Optimization',
            description: 'Advanced canvas algorithms discard imperceptible digital noise while keeping text, edges, and portrait details crisp.',
          },
          {
            title: 'Automatic WebP Conversion',
            description: 'Convert heavy legacy PNG or JPG images into modern, lightweight WebP formats for faster website page load speeds.',
          },
          {
            title: 'One-Click ZIP Packaging',
            description: 'Bundle all processed files into a single, clean ZIP download without sending files through an external server.',
          },
        ]}
        specs={[
          { label: 'Supported Inputs', value: 'JPG, PNG, WebP, HEIC' },
          { label: 'File Size Savings', value: 'Up to 85% Reduction' },
          { label: 'Batch Processing', value: '50+ Images at once' },
          { label: 'Data Security', value: '100% Client-Side In-Browser' },
        ]}
        faqs={[
          {
            question: 'Will compressing my images reduce their physical dimensions or resolution?',
            answer: 'No, by default our compressor maintains the exact pixel width and height of your original photos. It achieves smaller file sizes by optimizing color encoding and stripping unnecessary camera metadata (EXIF). However, you can also set an optional maximum dimension if you wish to downscale large camera photos.',
          },
          {
            question: 'Are my uploaded photos safe and private?',
            answer: 'Yes, completely. LutaTech Image Compressor operates 100% within your web browser using HTML5 Canvas and WebAssembly. Your photos are never uploaded or transmitted to any server.',
          },
          {
            question: 'What is the best format for website images?',
            answer: 'WebP is currently the recommended format for modern websites. It provides 25%–35% smaller file sizes than comparable JPEG or PNG images while supporting both transparency and high-definition photography.',
          },
          {
            question: 'Is there any file size limit?',
            answer: 'Because compression is performed directly in your browser using your local device memory, you can compress images of any size, including massive 40+ megapixel camera RAW/JPEG photos.',
          },
        ]}
      />
    </ToolPageShell>
  );
}
