'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  LayoutGrid,
  Download,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Copy,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  Files,
} from 'lucide-react';
import {
  formatBytes,
  loadPagesFromPdf,
  exportOrganizedPdf,
  type PdfPageItem,
} from '@/lib/pdf';

export default function PdfOrganizerTool() {
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [initialPages, setInitialPages] = useState<PdfPageItem[]>([]);
  const [sourceFiles, setSourceFiles] = useState<{ name: string; size: number }[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Loading pages...');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (fileList: FileList | File[], append = false) => {
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfs.length === 0) {
      setError('Please upload valid PDF files.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const newItems: PdfPageItem[] = [];
      const newSourceList = append ? [...sourceFiles] : [];

      for (let i = 0; i < pdfs.length; i++) {
        const file = pdfs[i];
        setLoadingText(`Loading ${file.name} (${i + 1}/${pdfs.length})...`);
        setLoadingProgress(Math.round((i / pdfs.length) * 100));

        const loadedPages = await loadPagesFromPdf(file, 0.4, (p) => {
          const overall = Math.round(((i + p / 100) / pdfs.length) * 100);
          setLoadingProgress(overall);
        });

        newItems.push(...loadedPages);
        if (!newSourceList.some((s) => s.name === file.name && s.size === file.size)) {
          newSourceList.push({ name: file.name, size: file.size });
        }
      }

      if (append) {
        setPages((prev) => [...prev, ...newItems]);
        setInitialPages((prev) => [...prev, ...newItems]);
        setSourceFiles(newSourceList);
      } else {
        setPages(newItems);
        setInitialPages(newItems);
        setSourceFiles(newSourceList);
      }
    } catch (err: any) {
      console.error('Error processing PDF files:', err);
      setError(err?.message || 'Failed to read PDF files. Some files may be corrupted or protected.');
    } finally {
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files, pages.length > 0);
      }
    },
    [pages.length]
  );

  const handleInitialFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, false);
      e.target.value = '';
    }
  };

  const handleAddFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, true);
      e.target.value = '';
    }
  };

  // Drag and drop sorting
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const onDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      setPages((prev) => {
        const next = [...prev];
        const itemToMove = next.splice(draggedIndex, 1)[0];
        next.splice(dragOverIndex, 0, itemToMove);
        return next;
      });
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Per-page actions
  const removePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rotation: (next[index].rotation + 90) % 360,
      };
      return next;
    });
  };

  const duplicatePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      const copy: PdfPageItem = {
        ...next[index],
        id: `${next[index].fileId}-p${next[index].sourceIndex}-${Math.random().toString(36).substring(2, 7)}`,
      };
      next.splice(index + 1, 0, copy);
      return next;
    });
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;
    setPages((prev) => {
      const next = [...prev];
      const item = next.splice(index, 1)[0];
      next.splice(target, 0, item);
      return next;
    });
  };

  const rotateAll = () => {
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        rotation: (p.rotation + 90) % 360,
      }))
    );
  };

  const resetAll = () => {
    setPages([...initialPages]);
  };

  const handleOrganize = async () => {
    if (pages.length === 0) return;
    setProcessing(true);
    setError(null);

    try {
      const exportInputs = pages.map((p) => ({
        file: p.file,
        sourceIndex: p.sourceIndex,
        rotation: p.rotation,
      }));

      const res = await exportOrganizedPdf(exportInputs);
      setResult({
        url: URL.createObjectURL(res.blob),
        name: res.fileName,
        size: res.size,
      });
    } catch (err: any) {
      console.error('Failed to organize pages:', err);
      setError(err?.message || 'Failed to organize pages.');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setPages([]);
    setInitialPages([]);
    setSourceFiles([]);
    setResult(null);
    setError(null);
  };

  const totalSourceSize = sourceFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="space-y-6">
      {/* Hidden Add File Input */}
      <input
        ref={addFileInputRef}
        type="file"
        multiple
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleAddFileInput}
      />

      {/* Drop Zone (Initial) */}
      {pages.length === 0 && !result && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 min-h-56 px-6 py-10 ${
            isDragging
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.06)]'
              : 'lt-border-color bg-[rgb(var(--lt-surface))] hover:border-[rgb(var(--lt-primary)/0.5)] hover:bg-[rgb(var(--lt-surface-2))]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleInitialFileInput}
          />
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <span className="h-9 w-9 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin" />
              <p className="text-sm font-semibold text-[rgb(var(--lt-text))]">
                {loadingText} {loadingProgress}%
              </p>
            </div>
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <Upload className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-[rgb(var(--lt-text))]">
                  Drop PDF file(s) here or <span className="text-[rgb(var(--lt-primary))]">browse</span>
                </p>
                <p className="text-xs lt-text-muted mt-1">
                  Upload one or multiple PDFs to reorder, rotate, delete, duplicate, or replace pages
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Workspace */}
      {pages.length > 0 && !result && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b lt-border-color">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <Files className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[rgb(var(--lt-text))] truncate">
                  {pages.length} Page{pages.length !== 1 ? 's' : ''} from {sourceFiles.length} Document
                  {sourceFiles.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs lt-text-muted mt-0.5 truncate">
                  {sourceFiles.map((f) => f.name).join(', ')} · Total: {formatBytes(totalSourceSize)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Add More PDFs Button */}
              <button
                onClick={() => addFileInputRef.current?.click()}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary)/0.4)] text-xs font-bold text-[rgb(var(--lt-text))] transition-all cursor-pointer"
                title="Add pages from another PDF file"
              >
                <Plus className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" />
                Add More PDFs
              </button>

              <button
                onClick={rotateAll}
                className="px-2.5 py-1.5 rounded-xl border lt-border-color hover:bg-[rgb(var(--lt-surface-2))] text-xs font-semibold text-[rgb(var(--lt-text))] transition-colors cursor-pointer"
                title="Rotate all pages 90°"
              >
                Rotate All
              </button>

              <button
                onClick={resetAll}
                className="text-xs font-semibold text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] px-2 py-1 cursor-pointer"
                title="Reset order and rotation"
              >
                Reset All
              </button>

              <button
                onClick={reset}
                className="p-2 rounded-xl lt-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ml-1 cursor-pointer"
                title="Clear workspace"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Loading Banner when appending files */}
          {loading && (
            <div className="px-5 py-2.5 bg-[rgb(var(--lt-primary)/0.08)] border-b lt-border-color flex items-center justify-between text-xs font-medium text-[rgb(var(--lt-primary))]">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin" />
                <span>{loadingText}</span>
              </div>
              <span>{loadingProgress}%</span>
            </div>
          )}

          {/* Grid */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={handleDrop}
            className="p-5 bg-[rgb(var(--lt-surface-2))] overflow-y-auto max-h-[65vh] custom-scrollbar"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {pages.map((item, currentIndex) => {
                const isDraggingItem = draggedIndex === currentIndex;
                const isDragOver = dragOverIndex === currentIndex;

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col gap-2 transition-all group ${
                      isDraggingItem ? 'opacity-40 scale-95' : ''
                    } ${isDragOver && !isDraggingItem ? 'scale-105 z-10' : ''}`}
                  >
                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, currentIndex)}
                      onDragOver={(e) => onDragOver(e, currentIndex)}
                      onDragEnd={onDragEnd}
                      className={`relative aspect-[1/1.4] rounded-xl border-2 overflow-hidden cursor-grab active:cursor-grabbing bg-white transition-all ${
                        isDragOver && !isDraggingItem
                          ? 'border-[rgb(var(--lt-primary))] shadow-xl ring-2 ring-[rgb(var(--lt-primary)/0.3)]'
                          : 'border-transparent shadow-sm hover:border-[rgb(var(--lt-primary)/0.4)]'
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={`Page ${item.sourceIndex + 1}`}
                        className="w-full h-full object-cover pointer-events-none transition-transform duration-200"
                        style={{ transform: `rotate(${item.rotation}deg)` }}
                      />

                      {/* New Output Page Number Badge */}
                      <div className="absolute top-2 left-2 bg-[rgb(var(--lt-primary))] text-white h-5 min-w-[20px] rounded-md px-1.5 flex items-center justify-center text-[10px] font-extrabold shadow-sm z-10">
                        {currentIndex + 1}
                      </div>

                      {/* Source Document & Page indicator */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-2 pt-4 pointer-events-none">
                        <p className="text-[10px] font-bold text-white truncate drop-shadow-sm leading-tight">
                          {item.fileName}
                        </p>
                        <p className="text-[9px] text-white/80 font-medium">
                          Page {item.sourceIndex + 1}
                        </p>
                      </div>
                    </div>

                    {/* Toolbar per page */}
                    <div className="flex items-center justify-between gap-1 px-1 py-1 rounded-xl bg-[rgb(var(--lt-surface))] border lt-border-color shadow-xs opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => movePage(currentIndex, 'left')}
                          disabled={currentIndex === 0}
                          className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-2))] disabled:opacity-30 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] transition-colors cursor-pointer"
                          title="Move left"
                        >
                          <ArrowLeft className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => movePage(currentIndex, 'right')}
                          disabled={currentIndex === pages.length - 1}
                          className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-2))] disabled:opacity-30 text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] transition-colors cursor-pointer"
                          title="Move right"
                        >
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="w-px h-3 bg-[rgb(var(--lt-border))] mx-0.5" />

                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => rotatePage(currentIndex)}
                          className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-primary))] transition-colors cursor-pointer"
                          title="Rotate 90° clockwise"
                        >
                          <RotateCw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => duplicatePage(currentIndex)}
                          className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-primary))] transition-colors cursor-pointer"
                          title="Duplicate page"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removePage(currentIndex)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[rgb(var(--lt-text-muted))] hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete page"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-5 border-t lt-border-color bg-[rgb(var(--lt-surface))]">
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-semibold mb-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <button
              onClick={handleOrganize}
              disabled={processing || pages.length === 0}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[rgb(var(--lt-primary))] hover:opacity-95 disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-[rgb(var(--lt-primary)/0.25)] transition-all cursor-pointer"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white lt-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" /> Apply Changes & Download ({pages.length} Pages)
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
                <p className="text-base font-bold text-[rgb(var(--lt-text))]">Organization Complete!</p>
                <p className="text-xs lt-text-muted mt-0.5">
                  Created new PDF ({pages.length} pages · {formatBytes(result.size)})
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
              className="text-xs font-bold text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer"
            >
              Organize new documents
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
