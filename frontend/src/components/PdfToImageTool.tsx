'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Image,
  Package,
} from 'lucide-react';
import { formatBytes, pdfPagesToImages } from '@/lib/pdf';

interface Props {
  format: 'jpeg' | 'png' | 'webp';
}

const FORMAT_META = {
  jpeg: { label: 'JPG', ext: 'jpg', description: 'High-quality JPEG images, ideal for photos and sharing.', accent: 'orange' },
  png:  { label: 'PNG', ext: 'png', description: 'Lossless PNG images, perfect for text-heavy pages.', accent: 'sky' },
  webp: { label: 'WebP', ext: 'webp', description: 'Modern WebP format — smaller files, great quality.', accent: 'violet' },
};

export default function PdfToImageTool({ format }: Props) {
  const meta = FORMAT_META[format];

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    zipUrl: string;
    zipName: string;
    count: number;
    size: number;
    previews: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConvert = async (f: File) => {
    setFile(f);
    setError(null);
    setResult(null);
    setProcessing(true);
    setProgress(0);
    setProgressText('Starting…');

    try {
      const pages = await pdfPagesToImages(f, format, 2.0, (p, text) => {
        setProgress(p);
        setProgressText(text);
      });

      if (pages.length === 0) throw new Error('No pages could be rendered from this PDF.');

      setProgressText('Building ZIP archive…');

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      for (const page of pages) {
        const base64 = page.dataUrl.split(',')[1];
        zip.file(page.name, base64, { base64: true });
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
        setProgress(Math.round(meta.percent));
      });

      const baseName = f.name.replace(/\.pdf$/i, '');
      const zipName = `${baseName}-${meta.ext}-images.zip`;
      const zipUrl = URL.createObjectURL(zipBlob);

      setResult({
        zipUrl,
        zipName,
        count: pages.length,
        size: zipBlob.size,
        previews: pages.slice(0, 6).map((p) => p.dataUrl),
      });
    } catch (err: any) {
      console.error('PDF to image error:', err);
      setError(err?.message || `Failed to convert PDF to ${meta.label}.`);
    } finally {
      setProcessing(false);
    }
  };

  const processFileInput = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const pdf = Array.from(files).find(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (!pdf) {
      setError('Please upload a valid PDF file.');
      return;
    }
    handleConvert(pdf);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFileInput(e.dataTransfer.files);
  }, []);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setProgressText('');
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => processFileInput(e.target.files)}
      />

      {/* Drop Zone */}
      {!file && !result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-56 px-6 py-10 ${
            isDragging
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.06)]'
              : 'lt-border-color bg-[rgb(var(--lt-surface))] hover:border-[rgb(var(--lt-primary)/0.5)] hover:bg-[rgb(var(--lt-surface-2))]'
          }`}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
            <Upload className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[rgb(var(--lt-text))]">
              Drop PDF here or <span className="text-[rgb(var(--lt-primary))]">browse</span>
            </p>
            <p className="text-xs lt-text-muted mt-1">
              {meta.description}
            </p>
          </div>
        </div>
      )}

      {/* Processing State */}
      {file && processing && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden">
          <div className="px-6 py-5 border-b lt-border-color flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
              <Image className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[rgb(var(--lt-text))] truncate">{file.name}</p>
              <p className="text-xs lt-text-muted">{formatBytes(file.size)}</p>
            </div>
          </div>
          <div className="px-6 py-8 flex flex-col items-center gap-5">
            <span className="h-12 w-12 rounded-full border-4 border-[rgb(var(--lt-primary)/0.2)] border-t-[rgb(var(--lt-primary))] lt-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-[rgb(var(--lt-text))]">{progressText}</p>
              <p className="text-xs lt-text-muted mt-1">Converting to {meta.label} — {progress}%</p>
            </div>
            <div className="w-full max-w-xs bg-[rgb(var(--lt-surface-2))] rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-[rgb(var(--lt-primary))] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-600 dark:text-red-400 font-medium">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={reset} className="ml-auto shrink-0 text-red-400 hover:text-red-600 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden lt-fade-up space-y-0">
          {/* Success header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-6 border-b lt-border-color">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-[rgb(var(--lt-text))]">Conversion Complete!</p>
                <p className="text-xs lt-text-muted mt-0.5">
                  {result.count} {meta.label} image{result.count !== 1 ? 's' : ''} · {formatBytes(result.size)} ZIP
                </p>
              </div>
            </div>
            <a
              href={result.zipUrl}
              download={result.zipName}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--lt-primary))] text-white font-bold text-sm hover:opacity-90 shadow-md shadow-[rgb(var(--lt-primary)/0.2)] cursor-pointer transition-all"
            >
              <Package className="h-4 w-4" />
              Download ZIP ({result.count} files)
            </a>
          </div>

          {/* Preview grid */}
          {result.previews.length > 0 && (
            <div className="px-5 py-4 bg-[rgb(var(--lt-surface-2))]">
              <p className="text-xs font-semibold lt-text-muted mb-3 uppercase tracking-wide">
                Preview{result.count > result.previews.length ? ` (first ${result.previews.length} pages)` : ''}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {result.previews.map((src, i) => (
                  <div
                    key={i}
                    className="aspect-[1/1.4] rounded-lg overflow-hidden border lt-border-color shadow-sm bg-white"
                  >
                    <img src={src} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
                {result.count > result.previews.length && (
                  <div className="aspect-[1/1.4] rounded-lg border-2 border-dashed lt-border-color flex items-center justify-center text-center">
                    <p className="text-xs lt-text-muted font-semibold leading-tight px-1">
                      +{result.count - result.previews.length}<br />more
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-4 border-t lt-border-color flex items-center justify-between">
            <p className="text-xs lt-text-muted truncate max-w-xs">{result.zipName}</p>
            <button
              onClick={reset}
              className="text-xs font-bold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer shrink-0"
            >
              Convert another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
