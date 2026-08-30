'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  FileText,
  GripVertical,
  Image as ImageIcon,
} from 'lucide-react';
import { formatBytes, imagesToPdf } from '@/lib/pdf';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface Props {
  accept: string;        // e.g. "image/jpeg,.jpg,.jpeg"
  formatLabel: string;   // e.g. "JPG", "PNG", "JPG / PNG / WebP"
}

export default function ImagesToPdfTool({ accept, formatLabel }: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);
  const [customFileName, setCustomFileName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | File[], append = false) => {
    const valid = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) {
      setError('No valid image files found. Please upload images.');
      return;
    }
    setError(null);

    const newItems: ImageItem[] = valid.map((f) => ({
      id: `${f.name}-${f.lastModified}-${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      previewUrl: URL.createObjectURL(f),
    }));

    if (append) {
      setImages((prev) => [...prev, ...newItems]);
    } else {
      setImages(newItems);
      setResult(null);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files, images.length > 0);
    },
    [images.length]
  );

  const handleInitialInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { addFiles(e.target.files, false); e.target.value = ''; }
  };

  const handleAddMoreInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { addFiles(e.target.files, true); e.target.value = ''; }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const files = images.map((i) => i.file);
      const res = await imagesToPdf(files, customFileName || undefined, (p) => setProgress(p));
      setResult({
        url: URL.createObjectURL(res.blob),
        name: res.fileName,
        size: res.size,
      });
    } catch (err: any) {
      console.error('Images to PDF error:', err);
      setError(err?.message || 'Failed to convert images to PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setImages([]);
    setResult(null);
    setError(null);
    setProgress(0);
    setCustomFileName('');
  };

  const totalSize = images.reduce((a, i) => a + i.file.size, 0);

  return (
    <div className="space-y-5">
      {/* Hidden inputs */}
      <input ref={addFileInputRef} type="file" multiple accept={accept} className="hidden" onChange={handleAddMoreInput} />

      {/* Drop Zone (empty state) */}
      {images.length === 0 && !result && (
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
          <input ref={fileInputRef} type="file" multiple accept={accept} className="hidden" onChange={handleInitialInput} />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
            <Upload className="h-7 w-7" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-[rgb(var(--lt-text))]">
              Drop {formatLabel} images here or <span className="text-[rgb(var(--lt-primary))]">browse</span>
            </p>
            <p className="text-xs lt-text-muted mt-1">
              All selected images will become pages in a single PDF document.
            </p>
          </div>
        </div>
      )}

      {/* Workspace */}
      {images.length > 0 && !result && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden">
          {/* Workspace header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b lt-border-color">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[rgb(var(--lt-text))] truncate">
                  {images.length} Image{images.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-xs lt-text-muted mt-0.5">
                  Total: {formatBytes(totalSize)} · Drag rows to reorder pages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => addFileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary)/0.4)] text-xs font-bold text-[rgb(var(--lt-text))] transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" />
                Add Images
              </button>
              <button
                onClick={reset}
                className="p-2 rounded-xl lt-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                title="Clear all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Image list */}
          <div
            className="divide-y lt-border-color overflow-y-auto max-h-[50vh] custom-scrollbar"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {images.map((item, idx) => (
              <ImageRow
                key={item.id}
                item={item}
                index={idx}
                total={images.length}
                onRemove={() => removeImage(item.id)}
                onMoveUp={idx > 0 ? () => moveImage(idx, idx - 1) : undefined}
                onMoveDown={idx < images.length - 1 ? () => moveImage(idx, idx + 1) : undefined}
              />
            ))}
          </div>

          {/* Footer: filename + convert */}
          <div className="px-5 py-4 border-t lt-border-color bg-[rgb(var(--lt-surface))] space-y-3">
            {/* Custom filename */}
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 lt-text-muted shrink-0" />
              <input
                type="text"
                placeholder="Output filename (optional)"
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                className="flex-1 bg-[rgb(var(--lt-surface-2))] border lt-border-color rounded-xl px-3 py-2 text-sm text-[rgb(var(--lt-text))] placeholder:lt-text-muted focus:outline-none focus:border-[rgb(var(--lt-primary)/0.5)] transition-colors"
              />
              <span className="text-xs lt-text-muted shrink-0">.pdf</span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            {/* Progress bar (while processing) */}
            {processing && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[rgb(var(--lt-primary))] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin" />
                    Embedding images…
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-[rgb(var(--lt-surface-2))] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[rgb(var(--lt-primary))] rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleConvert}
              disabled={processing || images.length === 0}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[rgb(var(--lt-primary))] hover:opacity-95 disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-[rgb(var(--lt-primary)/0.25)] transition-all cursor-pointer"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white lt-spin" />
                  Converting…
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4" />
                  Convert {images.length} Image{images.length !== 1 ? 's' : ''} to PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden lt-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-6 border-b lt-border-color">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-base font-bold text-[rgb(var(--lt-text))]">PDF Created!</p>
                <p className="text-xs lt-text-muted mt-0.5">
                  {images.length} page{images.length !== 1 ? 's' : ''} · {formatBytes(result.size)}
                </p>
              </div>
            </div>
            <a
              href={result.url}
              download={result.name}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[rgb(var(--lt-primary))] text-white font-bold text-sm hover:opacity-90 shadow-md shadow-[rgb(var(--lt-primary)/0.2)] cursor-pointer transition-all"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          </div>
          <div className="px-5 py-4 bg-[rgb(var(--lt-surface-2))] flex items-center justify-between">
            <button
              onClick={() => setResult(null)}
              className="text-xs font-bold text-[rgb(var(--lt-primary))] hover:underline cursor-pointer"
            >
              ← Back to editing
            </button>
            <button
              onClick={reset}
              className="text-xs font-bold lt-text-muted hover:text-[rgb(var(--lt-text))] cursor-pointer"
            >
              Convert different images
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ImageRow sub-component
// ---------------------------------------------------------------------------

interface ImageRowProps {
  item: ImageItem;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function ImageRow({ item, index, onRemove, onMoveUp, onMoveDown }: ImageRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[rgb(var(--lt-surface))] hover:bg-[rgb(var(--lt-surface-2))] transition-colors group">
      {/* Page number */}
      <span className="text-xs font-mono font-bold lt-text-muted w-5 text-right shrink-0">{index + 1}</span>

      {/* Thumbnail */}
      <div className="h-12 w-9 rounded-md overflow-hidden border lt-border-color bg-white shrink-0">
        <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
      </div>

      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[rgb(var(--lt-text))] truncate">{item.file.name}</p>
        <p className="text-xs lt-text-muted">{formatBytes(item.file.size)}</p>
      </div>

      {/* Order controls */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onMoveUp}
          disabled={!onMoveUp}
          className="p-1.5 rounded-lg lt-text-muted hover:text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Move up"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 15l-6-6-6 6" /></svg>
        </button>
        <button
          onClick={onMoveDown}
          disabled={!onMoveDown}
          className="p-1.5 rounded-lg lt-text-muted hover:text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Move down"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg lt-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        title="Remove"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
