'use client';

import React, { useState, useRef } from 'react';
import { Upload, Download, Sparkles, X, FileText, Check, ArrowRight, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { compressPdfFile, inspectPdfFile, formatBytes, PdfFileInfo } from '@/lib/pdf';
import { recordToolUsage } from '@/lib/toolRanking';
import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfCompressorPage() {
  const tool = getTool('pdf-compressor') || {
    slug: 'pdf-compressor',
    name: 'PDF Compressor',
    shortName: 'Compress PDF',
    category: 'PDF' as const,
    icon: 'Minimize2',
    accent: 'emerald',
    status: 'live' as const,
    description: 'Compress PDF files to reduce file size while preserving document and image quality.',
    longDescription: 'Compress your PDF documents directly in your browser. Choose between extreme, balanced, or high-quality presets with live page-by-page progress and instant download.',
  };

  const [pdfInfo, setPdfInfo] = useState<PdfFileInfo | null>(null);
  const [preset, setPreset] = useState<'recommended' | 'extreme' | 'low' | 'custom'>('recommended');
  const [customQuality, setCustomQuality] = useState<number>(75);
  const [customScale, setCustomScale] = useState<number>(1.25);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');

  const [result, setResult] = useState<{
    blob: Blob;
    fileName: string;
    originalSize: number;
    compressedSize: number;
    savingsPct: number;
    pageCount: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file || file.type !== 'application/pdf') {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Please select a valid PDF document.');
        return;
      }
    }

    try {
      const info = await inspectPdfFile(file);
      setPdfInfo(info);
      setResult(null);
      setProgress(0);
      setStatusText('');
    } catch (err) {
      console.error('Error reading PDF:', err);
      alert('Could not parse PDF file. Please ensure it is not password-protected.');
    }
  };

  const handleCompress = async () => {
    if (!pdfInfo) return;
    setIsProcessing(true);
    setProgress(0);
    setStatusText('Preparing PDF for compression...');

    try {
      const res = await compressPdfFile(
        pdfInfo.file,
        {
          preset,
          quality: customQuality / 100,
          scale: customScale,
        },
        (pct, text) => {
          setProgress(pct);
          if (text) setStatusText(text);
        }
      );

      setResult(res);
      recordToolUsage('pdf-compressor');
    } catch (err: any) {
      console.error(err);
      alert(err?.message || 'Failed to compress PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageShell tool={tool}>
      <div className="lt-card overflow-hidden">
        <div className="p-4 sm:p-8">
          {!pdfInfo ? (
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
                Upload PDF to Compress
              </h3>
              <p className="text-xs sm:text-sm lt-text-muted">
                Drag & drop any PDF document here, or click to browse
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-[rgb(var(--lt-text-muted))]">
                <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> 100% Private (Runs In-Browser)</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> Fast Optimization</span>
                <span>•</span>
                <span>Unlimited Files</span>
              </div>
            </div>
          ) : (
            /* Workspace */
            <div className="space-y-6">
              
              {/* Document Overview Card */}
              <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative h-14 w-12 shrink-0 rounded-lg overflow-hidden border lt-border-color bg-white dark:bg-slate-800 shadow-2xs flex items-center justify-center">
                    {pdfInfo.thumbnailUrl ? (
                      <img src={pdfInfo.thumbnailUrl} alt="Cover preview" className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-6 w-6 text-[rgb(var(--lt-primary))]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[rgb(var(--lt-text))] truncate max-w-xs sm:max-w-md">
                      {pdfInfo.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs lt-text-muted font-mono">
                      <span>{formatBytes(pdfInfo.size)}</span>
                      <span>•</span>
                      <span>{pdfInfo.pageCount} {pdfInfo.pageCount === 1 ? 'page' : 'pages'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPdfInfo(null);
                    setResult(null);
                  }}
                  className="text-xs font-semibold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer flex items-center gap-1 self-end sm:self-center"
                >
                  <X className="h-3.5 w-3.5" /> Choose different PDF
                </button>
              </div>

              {/* Compression Preset Selection */}
              <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4 sm:p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[rgb(var(--lt-text))]">Choose Compression Level</h3>
                  <p className="text-xs lt-text-muted mt-0.5">Select how aggressively you want to compress this document</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'extreme' as const,
                      title: 'Extreme Compression',
                      desc: 'Smallest file size, lower DPI. Ideal for email limits and web uploads.',
                      reduction: '-70% to -90%',
                      badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
                    },
                    {
                      id: 'recommended' as const,
                      title: 'Recommended',
                      desc: 'Balanced compression. Crisp text, sharp graphics, great reduction.',
                      reduction: '-50% to -75%',
                      badgeColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    },
                    {
                      id: 'low' as const,
                      title: 'Less Compression',
                      desc: 'High quality output. Minimal compression, maximum high-res detail.',
                      reduction: '-20% to -40%',
                      badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
                    },
                  ].map((p) => {
                    const isSelected = preset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPreset(p.id);
                          setResult(null);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] shadow-xs ring-1 ring-[rgb(var(--lt-primary))]'
                            : 'lt-border-color bg-[rgb(var(--lt-surface))] hover:bg-[rgb(var(--lt-surface-2))]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-[rgb(var(--lt-text))]">{p.title}</span>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${p.badgeColor}`}>
                              {p.reduction}
                            </span>
                          </div>
                          <p className="text-[11px] lt-text-muted leading-relaxed">{p.desc}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-[rgb(var(--lt-primary))]">
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary))] text-white' : 'border-gray-300 dark:border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-2.5 h-2.5" />}
                          </span>
                          <span>{isSelected ? 'Selected' : 'Select'}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress Bar (when compressing) */}
              {isProcessing && (
                <div className="p-5 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface-2))] space-y-3 lt-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[rgb(var(--lt-text))] flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))] lt-spin" />
                      {statusText || 'Compressing PDF...'}
                    </span>
                    <span className="font-bold text-[rgb(var(--lt-primary))] font-mono">{progress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[rgb(var(--lt-surface))] border lt-border-color">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-accent))] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Result Comparison Card */}
              {result && (
                <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4 lt-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[rgb(var(--lt-text))]">
                          Compression Complete!
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="lt-text-muted line-through font-mono text-[11px]">
                            {formatBytes(result.originalSize)}
                          </span>
                          <span className="font-extrabold text-[rgb(var(--lt-text))] font-mono text-sm">
                            {formatBytes(result.compressedSize)}
                          </span>
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-2xs">
                            -{result.savingsPct}% Saved
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="lt-btn-primary py-3 px-6 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[rgb(var(--lt-primary)/0.25)]"
                    >
                      <Download className="h-4 w-4" /> Download Compressed PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!result && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompress}
                    disabled={isProcessing}
                    className="w-full lt-btn-primary py-3 font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isProcessing ? 'Compressing PDF Pages...' : 'Compress PDF Now'}
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
      />

      {/* SEO & Educational Guide Section */}
      <ToolContentSection
        toolName="PDF Compressor"
        category="PDF"
        tagline="Shrink heavy PDF documents for email attachments, online job portals, and web publishing without losing legibility."
        steps={[
          {
            title: 'Upload Your PDF Document',
            description: 'Drag & drop or browse your computer or mobile device for any multi-page PDF file.',
          },
          {
            title: 'Choose Compression Strength',
            description: 'Select Recommended (ideal balance for email & portals), Extreme, or High Quality according to your document requirements.',
          },
          {
            title: 'Download Optimized PDF',
            description: 'Inspect exact file size savings and download your optimized document immediately.',
          },
        ]}
        features={[
          {
            title: 'Preserve Document Quality',
            description: 'Optimizes embedded high-DPI imagery and stream data while maintaining clear, legible text for reading and printing.',
          },
          {
            title: 'Bypass Email Attachment Limits',
            description: 'Easily reduce bloated scans and slide decks from 40MB down to under 10MB to fit within Gmail and Outlook limits.',
          },
          {
            title: 'Live Page-by-Page Progress',
            description: 'Watch real-time visual progress as each page is evaluated and optimized without sudden browser freezes.',
          },
          {
            title: 'Confidential & Private',
            description: 'Financial reports, contracts, and legal documents are processed entirely in your browser without ever hitting a third-party server.',
          },
        ]}
        specs={[
          { label: 'Page Limit', value: '500+ Pages' },
          { label: 'File Type', value: 'Standard PDF (.pdf)' },
          { label: 'Engine', value: 'pdf-lib & PDF.js' },
          { label: 'Confidentiality', value: '100% In-Browser Execution' },
        ]}
        faqs={[
          {
            question: 'Will compressing my PDF make the text blurry or unreadable?',
            answer: 'No. Our compression engine selectively re-encodes oversized embedded photographs and scans while keeping vector fonts and text definitions crisp and completely readable at standard zoom levels.',
          },
          {
            question: 'Are my confidential documents uploaded to your servers?',
            answer: 'Never. LutaTech operates on a strict zero-knowledge, client-side architecture. The PDF is parsed and rebuilt directly in your browser memory using WebAssembly. We do not store or transmit your documents.',
          },
          {
            question: 'Can I compress password-protected PDF files?',
            answer: 'If a PDF has an open password, please unlock it before compressing. For security reasons, encrypted PDF files cannot be processed without the original decryption key.',
          },
          {
            question: 'Why did my PDF only shrink by a small percentage?',
            answer: 'If your PDF consists primarily of plain text, vector line art, or was already optimized by professional desktop software, there are fewer redundant image pixels to compress. Scanned documents with high-resolution photos typically experience the greatest size reduction (up to 70–80%).',
          },
        ]}
      />
    </ToolPageShell>
  );
}
