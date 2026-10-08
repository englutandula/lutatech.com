'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, X, Lock, Unlock, RefreshCw, Layers, Check, ArrowRight } from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';
import ToolContentSection from '@/components/seo/ToolContentSection';

interface Preset {
  name: string;
  category: string;
  width: number;
  height: number;
}

const PRESETS: Preset[] = [
  { name: 'Instagram Square', category: 'Social', width: 1080, height: 1080 },
  { name: 'Instagram Story / Reel', category: 'Social', width: 1080, height: 1920 },
  { name: 'YouTube Thumbnail', category: 'Social', width: 1280, height: 720 },
  { name: 'Twitter / X Header', category: 'Social', width: 1500, height: 500 },
  { name: 'Facebook Cover', category: 'Social', width: 851, height: 315 },
  { name: 'Passport Photo (2×2")', category: 'Photo', width: 600, height: 600 },
  { name: 'Photo Print (4×6")', category: 'Photo', width: 1200, height: 1800 },
  { name: 'Photo Print (5×7")', category: 'Photo', width: 1500, height: 2100 },
  { name: 'Full HD (1080p)', category: 'Screen', width: 1920, height: 1080 },
  { name: '4K Ultra HD', category: 'Screen', width: 3840, height: 2160 },
];

export default function ImageResizerPage() {
  const tool = getTool('image-resizer') || {
    slug: 'image-resizer',
    name: 'Image Resizer',
    shortName: 'Img Resize',
    category: 'Image' as const,
    icon: 'Scaling',
    accent: 'cyan',
    status: 'live' as const,
    description: 'Resize JPG, PNG, and WebP images to exact pixel dimensions or percentage.',
    longDescription: 'Resize any image with pixel precision. Choose exact width and height, lock aspect ratio, pick from standard social media presets, or scale by percentage—all processed securely in your browser.',
  };

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);

  // Resize settings
  const [mode, setMode] = useState<'dimensions' | 'percentage' | 'presets'>('dimensions');
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [percentage, setPercentage] = useState<number>(100);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(92);

  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [resizedSize, setResizedSize] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File) => {
    if (!selected || !selected.type.startsWith('image/')) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setResizedUrl(null);

    const img = new Image();
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setPercentage(100);
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && origWidth > 0) {
      setHeight(Math.round((val / origWidth) * origHeight));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && origHeight > 0) {
      setWidth(Math.round((val / origHeight) * origWidth));
    }
  };

  const handlePercentageChange = (pct: number) => {
    setPercentage(pct);
    if (origWidth > 0 && origHeight > 0) {
      setWidth(Math.round((origWidth * pct) / 100));
      setHeight(Math.round((origHeight * pct) / 100));
    }
  };

  const applyPreset = (p: Preset) => {
    setWidth(p.width);
    setHeight(p.height);
    setLockAspect(false);
  };

  const processResize = async () => {
    if (!previewUrl || width <= 0 || height <= 0) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mime = format;
      const dataUrl = canvas.toDataURL(mime, quality / 100);
      setResizedUrl(dataUrl);
      recordToolUsage('image-resizer');

      // Estimate byte size
      const head = `data:${mime};base64,`;
      const base64Length = dataUrl.length - head.length;
      const approxBytes = Math.round((base64Length * 3) / 4);
      setResizedSize(approxBytes);
    } catch (err) {
      console.error(err);
      alert('Error resizing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Auto re-process when settings change if already resized
  useEffect(() => {
    if (resizedUrl && file) {
      const timer = setTimeout(() => processResize(), 200);
      return () => clearTimeout(timer);
    }
  }, [width, height, format, quality]);

  const handleDownload = () => {
    if (!resizedUrl || !file) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const a = document.createElement('a');
    a.href = resizedUrl;
    a.download = `${baseName}-${width}x${height}.${ext}`;
    a.click();
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <ToolPageShell tool={tool}>
      <div className="lt-card overflow-hidden">
        <div className="p-4 sm:p-8">
          {!previewUrl ? (
            /* Upload Dropzone */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
              }}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 group ${
                isDragging
                  ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.05)] scale-[1.01]'
                  : 'lt-border-color hover:border-[rgb(var(--lt-primary)/0.5)] hover:bg-[rgb(var(--lt-surface-2))]'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--lt-text))] mb-1">
                Upload Image to Resize
              </h3>
              <p className="text-xs sm:text-sm lt-text-muted">
                Drag & drop any JPG, PNG, WebP, or SVG file here, or click to browse
              </p>
            </div>
          ) : (
            /* Workspace */
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Preview Card */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[rgb(var(--lt-text-muted))] uppercase tracking-wider">
                      Preview & Dimensions
                    </span>
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        setResizedUrl(null);
                      }}
                      className="text-xs font-semibold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <X className="h-3.5 w-3.5" /> Choose different image
                    </button>
                  </div>

                  <div className="relative rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-3 flex flex-col items-center justify-center overflow-hidden min-h-[260px] sm:min-h-[320px]">
                    <img
                      src={resizedUrl || previewUrl}
                      alt="Preview"
                      className="max-h-[340px] max-w-full object-contain rounded-xl shadow-xs"
                    />
                  </div>

                  {/* Dimensions badge row */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))]">
                      <span className="text-[11px] lt-text-muted block">Original</span>
                      <span className="text-xs sm:text-sm font-bold text-[rgb(var(--lt-text))] font-mono">
                        {origWidth} × {origHeight} px
                      </span>
                      <span className="text-[10px] lt-text-muted block mt-0.5">
                        {file ? formatBytes(file.size) : ''}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-[rgb(var(--lt-primary)/0.3)] bg-[rgb(var(--lt-primary)/0.05)]">
                      <span className="text-[11px] text-[rgb(var(--lt-primary))] font-semibold block">Target Output</span>
                      <span className="text-xs sm:text-sm font-bold text-[rgb(var(--lt-primary))] font-mono">
                        {width} × {height} px
                      </span>
                      <span className="text-[10px] text-[rgb(var(--lt-primary))] block mt-0.5">
                        {resizedSize > 0 ? `~${formatBytes(resizedSize)}` : 'Ready to resize'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Controls */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Mode Tabs */}
                  <div className="flex rounded-xl bg-[rgb(var(--lt-surface-2))] p-1 border lt-border-color">
                    <button
                      type="button"
                      onClick={() => setMode('dimensions')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'dimensions'
                          ? 'bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] shadow-xs'
                          : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                      }`}
                    >
                      Exact Pixels
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('percentage')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'percentage'
                          ? 'bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] shadow-xs'
                          : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('presets')}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === 'presets'
                          ? 'bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] shadow-xs'
                          : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                      }`}
                    >
                      Presets
                    </button>
                  </div>

                  {/* Mode: Dimensions */}
                  {mode === 'dimensions' && (
                    <div className="space-y-4 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                            Width (px)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={width || ''}
                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                            className="lt-input font-mono font-bold"
                          />
                        </div>

                        {/* Aspect Ratio Lock Toggle */}
                        <div className="pt-6">
                          <button
                            type="button"
                            title={lockAspect ? 'Unlock Aspect Ratio' : 'Lock Aspect Ratio'}
                            onClick={() => setLockAspect(!lockAspect)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              lockAspect
                                ? 'bg-[rgb(var(--lt-primary))] text-white border-[rgb(var(--lt-primary))] shadow-xs'
                                : 'lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                            }`}
                          >
                            {lockAspect ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          </button>
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1">
                            Height (px)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={10000}
                            value={height || ''}
                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                            className="lt-input font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode: Percentage */}
                  {mode === 'percentage' && (
                    <div className="space-y-4 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[rgb(var(--lt-text-muted))]">Scale Image</span>
                        <span className="font-bold text-[rgb(var(--lt-primary))] font-mono text-sm">{percentage}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={200}
                        step={5}
                        value={percentage}
                        onChange={(e) => handlePercentageChange(Number(e.target.value))}
                        className="w-full accent-[rgb(var(--lt-primary))]"
                      />
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[25, 50, 75, 100, 125, 150].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePercentageChange(p)}
                            className={`px-3 py-1 text-xs rounded-lg border font-semibold transition-all cursor-pointer ${
                              percentage === p
                                ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary))] text-white'
                                : 'lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                            }`}
                          >
                            {p}%
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode: Presets */}
                  {mode === 'presets' && (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 lt-scrollbar">
                      {PRESETS.map((preset) => {
                        const isSelected = width === preset.width && height === preset.height;
                        return (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => applyPreset(preset)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] shadow-xs'
                                : 'lt-border-color bg-[rgb(var(--lt-surface))] hover:bg-[rgb(var(--lt-surface-2))]'
                            }`}
                          >
                            <div>
                              <span className="text-xs font-bold text-[rgb(var(--lt-text))] block">{preset.name}</span>
                              <span className="text-[10px] lt-text-muted">{preset.category}</span>
                            </div>
                            <span className="text-xs font-mono font-semibold text-[rgb(var(--lt-primary))]">
                              {preset.width} × {preset.height} px
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Output Format & Quality */}
                  <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4 space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))] mb-1.5">
                        Output Format
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: 'JPG', mime: 'image/jpeg' as const },
                          { label: 'PNG', mime: 'image/png' as const },
                          { label: 'WebP', mime: 'image/webp' as const },
                        ].map((fmt) => (
                          <button
                            key={fmt.mime}
                            type="button"
                            onClick={() => setFormat(fmt.mime)}
                            className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                              format === fmt.mime
                                ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary))] text-white'
                                : 'lt-border-color bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {format !== 'image/png' && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-[rgb(var(--lt-text-muted))]">Quality</span>
                          <span className="font-bold text-[rgb(var(--lt-primary))] font-mono">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={100}
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full accent-[rgb(var(--lt-primary))]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    {!resizedUrl ? (
                      <button
                        type="button"
                        onClick={processResize}
                        disabled={isProcessing || width <= 0 || height <= 0}
                        className="w-full lt-btn-primary py-3 font-bold"
                      >
                        {isProcessing ? 'Processing Image...' : 'Resize Image Now'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="w-full lt-btn-primary py-3 font-bold flex items-center justify-center gap-2 shadow-lg shadow-[rgb(var(--lt-primary)/0.25)]"
                      >
                        <Download className="h-4 w-4" /> Download Resized Image
                      </button>
                    )}
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      <ToolContentSection
        toolName="Image Resizer"
        category="Image"
        tagline="Resize photos and graphics to exact pixel dimensions, percentage scales, or social media aspect ratios with zero loss in sharpness."
        steps={[
          {
            title: 'Upload Your Photo',
            description:
              'Choose or drag and drop any JPG, PNG, or WebP picture from your computer, tablet, or phone.',
          },
          {
            title: 'Set Dimensions or Select Presets',
            description:
              'Enter exact pixel width and height, lock aspect ratios, or pick standard presets for Instagram, YouTube, Twitter, and print photos.',
          },
          {
            title: 'Download Resized Image',
            description:
              'Select your desired output format (JPG, PNG, WebP) and download your optimized, resized picture instantly.',
          },
        ]}
        features={[
          {
            title: 'Pixel-Perfect Aspect Ratio Locking',
            description:
              'Maintain exact original proportions automatically or unlock to apply custom non-uniform width and height dimensions.',
          },
          {
            title: 'Social Media & Print Presets',
            description:
              'One-click dimensions tailored to Instagram Square, Stories, YouTube Thumbnails, Facebook Banners, and 4x6" photo prints.',
          },
          {
            title: 'Multi-Format Export & Quality Tuning',
            description:
              'Easily convert between JPG, PNG, and WebP while fine-tuning image compression quality sliders for optimal file size.',
          },
          {
            title: '100% In-Browser Privacy',
            description:
              'All image decoding and resizing operations run client-side using HTML5 Canvas. Your personal photos are never uploaded to any remote server.',
          },
        ]}
        specs={[
          { label: 'Supported Inputs', value: 'JPG, PNG, WebP, SVG' },
          { label: 'Resize Modes', value: 'Pixels, %, Presets' },
          { label: 'Quality Control', value: 'Granular 1% - 100%' },
          { label: 'Data Privacy', value: 'Zero Server Uploads' },
        ]}
        faqs={[
          {
            question: 'Does resizing an image degrade its visual quality?',
            answer:
              'Downscaling images retains crisp detail through smooth bicubic resampling. When enlarging images beyond their original dimensions, our canvas renderer preserves smooth edges without jagged pixelation.',
          },
          {
            question: 'Can I resize photos for social media without cropping?',
            answer:
              'Yes. You can select standard social media dimensions (like 1080x1080 for Instagram or 1280x720 for YouTube) to ensure your images meet platform requirements before uploading.',
          },
          {
            question: 'What are the benefits of in-browser image resizing?',
            answer:
              'Because images are processed locally on your device, processing is instantaneous with no upload/download wait times, no bandwidth waste, and complete confidentiality for private photos.',
          },
          {
            question: 'Which image format should I export to?',
            answer:
              'JPEG is recommended for photographic images, PNG is ideal for graphics requiring transparency or sharp line art, and WebP offers the best modern compression for fast web loading.',
          },
        ]}
      />
    </ToolPageShell>
  );
}
