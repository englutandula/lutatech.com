'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  RotateCw,
  ArrowDownAZ,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  RotateCcw,
  Layers,
  Edit3,
} from 'lucide-react';
import {
  inspectPdfFile,
  mergePdfFiles,
  formatBytes,
  type PdfFileInfo,
} from '@/lib/pdf';

export function PdfMergerTool() {
  const [pdfFiles, setPdfFiles] = useState<PdfFileInfo[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isAscending, setIsAscending] = useState(true);
  const [outputFileName, setOutputFileName] = useState<string>('');

  // Drag-and-drop card reordering state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [mergedResult, setMergedResult] = useState<{
    url: string;
    fileName: string;
    totalPages: number;
    size: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);
  const addFolderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const validPdfFiles = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (validPdfFiles.length === 0) {
      setError('Please select valid PDF files (.pdf)');
      return;
    }

    setLoading(true);
    try {
      const inspected = await Promise.all(validPdfFiles.map((f) => inspectPdfFile(f)));
      setPdfFiles((prev) => [...prev, ...inspected]);
    } catch (err: any) {
      console.error('Error reading PDF files', err);
      setError('Failed to inspect one or more PDF files. Make sure they are not password protected.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Card reordering drag handlers
  const handleCardDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    setPdfFiles((prev) => {
      const copy = [...prev];
      const draggedItem = copy[draggedIndex];
      copy.splice(draggedIndex, 1);
      copy.splice(index, 0, draggedItem);
      return copy;
    });
    setDraggedIndex(index);
  };

  const handleCardDragEnd = () => {
    setDraggedIndex(null);
  };

  // Rotate individual PDF
  const handleRotate = (id: string) => {
    setPdfFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotation: ((item.rotation || 0) + 90) % 360 } : item
      )
    );
  };

  // Sort files by name A-Z or Z-A
  const handleSortByName = () => {
    setPdfFiles((prev) => {
      const sorted = [...prev].sort((a, b) => {
        return isAscending
          ? a.name.localeCompare(b.name, undefined, { numeric: true })
          : b.name.localeCompare(a.name, undefined, { numeric: true });
      });
      return sorted;
    });
    setIsAscending((prev) => !prev);
  };

  const handleRemove = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClear = () => {
    setPdfFiles([]);
    setMergedResult(null);
    setError(null);
    setProgress(0);
    setOutputFileName('');
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2) {
      setError('Please add at least 2 PDF files to merge.');
      return;
    }

    setMerging(true);
    setProgress(15);
    setError(null);

    try {
      const result = await mergePdfFiles(
        pdfFiles,
        (p) => setProgress(p),
        outputFileName
      );
      const downloadUrl = URL.createObjectURL(result.blob);
      setMergedResult({
        url: downloadUrl,
        fileName: result.fileName,
        totalPages: result.totalPages,
        size: result.size,
      });
    } catch (err: any) {
      console.error('Merge error', err);
      setError(err.message || 'Failed to merge PDF files. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  const totalPagesCount = pdfFiles.reduce((acc, f) => acc + f.pageCount, 0);
  const totalSizeBytes = pdfFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full">
      {/* Error Alert */}
      {error && (
        <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-[rgb(var(--lt-error)/0.3)] bg-[rgb(var(--lt-error)/0.08)] p-4 text-sm text-[rgb(var(--lt-error))] lt-fade-in">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── STATE 1: MERGED SUCCESS STATE ── */}
      {mergedResult ? (
        <div className="rounded-3xl border lt-border-color bg-[rgb(var(--lt-surface))] p-8 sm:p-14 text-center lt-fade-up shadow-sm max-w-2xl mx-auto">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[rgb(var(--lt-primary)/0.2)] to-[rgb(var(--lt-primary)/0.05)] text-[rgb(var(--lt-primary))] border border-[rgb(var(--lt-primary)/0.3)] shadow-md">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="mt-6 text-3xl font-extrabold text-[rgb(var(--lt-text))]">
            PDFs have been merged!
          </h2>
          <p className="mt-2 text-sm lt-text-muted">
            Successfully combined {pdfFiles.length} files into one document ({mergedResult.totalPages} pages).
          </p>

          {/* Editable Filename & Summary */}
          <div className="mx-auto mt-6 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4 text-left text-xs space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-[rgb(var(--lt-text-muted))] flex items-center gap-1.5 mb-1.5">
                <Edit3 className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" /> Output Filename:
              </label>
              <div className="flex items-center rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] px-3 py-2">
                <input
                  type="text"
                  value={mergedResult.fileName.replace(/\.pdf$/i, '')}
                  onChange={(e) => {
                    const val = e.target.value.trim();
                    const updatedName = val ? `${val}.pdf` : 'merged by LutaTech.pdf';
                    setMergedResult((prev) => (prev ? { ...prev, fileName: updatedName } : null));
                  }}
                  placeholder="merged by LutaTech"
                  className="w-full bg-transparent text-xs font-bold text-[rgb(var(--lt-text))] focus:outline-none"
                />
                <span className="font-mono text-xs font-bold text-[rgb(var(--lt-text-muted))] shrink-0 pl-1">
                  .pdf
                </span>
              </div>
            </div>

            <div className="flex justify-between border-t lt-border-color pt-2">
              <span className="lt-text-muted font-medium">Total Pages:</span>
              <span className="font-semibold text-[rgb(var(--lt-text))]">{mergedResult.totalPages} pages</span>
            </div>
            <div className="flex justify-between">
              <span className="lt-text-muted font-medium">Merged Size:</span>
              <span className="font-semibold text-[rgb(var(--lt-text))]">{formatBytes(mergedResult.size)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={mergedResult.url}
              download={mergedResult.fileName}
              className="lt-btn-primary w-full sm:w-auto text-base py-3.5 px-8 shadow-lg shadow-[rgb(var(--lt-primary)/0.3)]"
            >
              <Download className="h-5 w-5" /> Download {mergedResult.fileName}
            </a>
            <button
              onClick={handleClear}
              className="lt-btn-secondary w-full sm:w-auto cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" /> Merge more files
            </button>
          </div>
        </div>
      ) : pdfFiles.length === 0 ? (
        /* ── STATE 2: EMPTY UPLOAD STATE ── */
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-3xl border-2 border-dashed p-12 sm:p-20 text-center cursor-pointer transition-all duration-200 group ${
            isDragging
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.06)] scale-[1.01]'
              : 'lt-border-color hover:border-[rgb(var(--lt-primary)/0.6)] hover:bg-[rgb(var(--lt-surface-2))] bg-[rgb(var(--lt-surface))]'
          }`}
        >
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl transition-all duration-200 ${
              isDragging
                ? 'bg-[rgb(var(--lt-primary))] text-white scale-110 shadow-xl shadow-[rgb(var(--lt-primary)/0.35)]'
                : 'bg-[rgb(var(--lt-primary))] text-white shadow-lg shadow-[rgb(var(--lt-primary)/0.25)] group-hover:scale-105'
            }`}
          >
            <Upload className="h-10 w-10" />
          </div>

          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))]">
            {isDragging ? 'Drop your PDF files here' : 'Merge PDF files'}
          </h2>
          <p className="mt-2 text-sm lt-text-muted max-w-md mx-auto">
            Combine PDFs in the order you want with the easiest PDF merger available.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="lt-btn-primary py-3.5 px-8 text-base font-bold shadow-lg shadow-[rgb(var(--lt-primary)/0.3)] cursor-pointer"
            >
              Select PDF files
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="lt-btn-secondary py-3.5 px-8 text-base font-bold cursor-pointer"
            >
              Upload Folder
            </button>
          </div>
          <p className="mt-3 text-xs lt-text-muted">or drop PDFs here</p>
        </div>
      ) : (
        /* ── STATE 3: ILOVEPDF-STYLE WORKSPACE (MAIN CANVAS + RIGHT SIDEBAR) ── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start lt-fade-in">
          {/* Main Canvas Workspace (Left 8-9 cols) */}
          <div className="lg:col-span-8 xl:col-span-9 relative rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 sm:p-8 min-h-[460px] shadow-xs">
            {/* Top Canvas Bar */}
            <div className="flex items-center justify-between border-b lt-border-color pb-4 mb-6">
              <span className="text-xs font-semibold lt-text-muted uppercase tracking-wider">
                {pdfFiles.length} {pdfFiles.length === 1 ? 'document' : 'documents'} ready to merge
              </span>
              <button
                onClick={handleClear}
                className="text-xs text-[rgb(var(--lt-error))] hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear all
              </button>
            </div>

            {/* Visual PDF Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pdfFiles.map((fileInfo, index) => (
                <div
                  key={fileInfo.id}
                  draggable
                  onDragStart={(e) => handleCardDragStart(e, index)}
                  onDragOver={(e) => handleCardDragOver(e, index)}
                  onDragEnd={handleCardDragEnd}
                  className={`group relative rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-3 flex flex-col items-center justify-between shadow-xs transition-all hover:border-[rgb(var(--lt-primary)/0.6)] hover:shadow-md cursor-grab active:cursor-grabbing ${
                    draggedIndex === index ? 'opacity-40 scale-95 border-dashed border-[rgb(var(--lt-primary))]' : ''
                  }`}
                >
                  {/* Floating Action Buttons on Hover */}
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRotate(fileInfo.id);
                      }}
                      title="Rotate Page"
                      className="h-7 w-7 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(fileInfo.id);
                      }}
                      title="Remove"
                      className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Document Page Visual Preview (with Rotation support) */}
                  <div
                    className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-white border border-gray-200 dark:border-gray-700 shadow-inner flex items-center justify-center transition-transform duration-200"
                    style={{ transform: `rotate(${fileInfo.rotation || 0}deg)` }}
                  >
                    {fileInfo.thumbnailUrl ? (
                      <img
                        src={fileInfo.thumbnailUrl}
                        alt={fileInfo.name}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    ) : (
                      /* Realistic Fallback Document Sheet */
                      <div className="w-full h-full p-3 flex flex-col justify-between bg-white text-slate-700">
                        <div className="space-y-1.5">
                          <div className="h-2 w-12 bg-red-500/80 rounded-xs" />
                          <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
                          <div className="h-1.5 w-4/5 bg-slate-200 rounded-xs" />
                          <div className="h-1.5 w-full bg-slate-200 rounded-xs" />
                          <div className="h-1.5 w-3/4 bg-slate-200 rounded-xs" />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                          <FileText className="h-3 w-3 text-red-500" />
                          <span>PDF</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Name & Page count footer */}
                  <div className="mt-2.5 w-full text-center">
                    <p className="text-xs font-semibold text-[rgb(var(--lt-text))] truncate" title={fileInfo.name}>
                      {fileInfo.name}
                    </p>
                    <p className="text-[10px] lt-text-muted mt-0.5">
                      {fileInfo.pageCount} {fileInfo.pageCount === 1 ? 'page' : 'pages'} • {formatBytes(fileInfo.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Right Action Bubble (Add more & Sort) */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
              {/* Add More Button */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => addFileInputRef.current?.click()}
                  title="Add more files"
                  className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[rgb(var(--lt-primary))] text-white shadow-xl hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                >
                  <Plus className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white border-2 border-[rgb(var(--lt-surface))]">
                    {pdfFiles.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => addFolderInputRef.current?.click()}
                  title="Add folder"
                  className="flex h-12 w-12 items-center justify-center rounded-full border lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] shadow-md hover:bg-[rgb(var(--lt-surface-3))] hover:scale-105 transition-all cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                </button>
              </div>

              {/* Sort A-Z Button */}
              <button
                type="button"
                onClick={handleSortByName}
                title={`Sort by Name (${isAscending ? 'A to Z' : 'Z to A'})`}
                className="flex h-10 w-10 items-center justify-center rounded-full border lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] shadow-md hover:bg-[rgb(var(--lt-surface-3))] hover:scale-105 transition-all cursor-pointer"
              >
                <ArrowDownAZ className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Right Sidebar Action Panel (3-4 cols) */}
          <div className="lg:col-span-4 xl:col-span-3 sticky top-24 space-y-4">
            <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 shadow-xs flex flex-col justify-between min-h-[460px]">
              <div>
                <h3 className="text-xl font-extrabold text-[rgb(var(--lt-text))]">Merge PDF</h3>

                {/* Instruction Alert */}
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>To change the order of your PDFs, drag and drop the files as you want.</span>
                </div>

                {/* Output File Name Option */}
                <div className="mt-5 space-y-1.5">
                  <label className="text-xs font-semibold text-[rgb(var(--lt-text))] flex items-center justify-between">
                    <span>Output File Name (Optional)</span>
                  </label>
                  <div className="relative flex items-center rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] px-3 py-2 focus-within:border-[rgb(var(--lt-primary))] transition-colors">
                    <input
                      type="text"
                      value={outputFileName}
                      onChange={(e) => setOutputFileName(e.target.value)}
                      placeholder="merged by LutaTech"
                      className="w-full bg-transparent text-xs text-[rgb(var(--lt-text))] placeholder:text-[rgb(var(--lt-text-muted)/0.6)] focus:outline-none font-medium"
                    />
                    <span className="font-mono text-xs text-[rgb(var(--lt-text-muted))] shrink-0 pl-1">
                      .pdf
                    </span>
                  </div>
                  <p className="text-[10px] lt-text-muted">
                    Default: <span className="font-semibold text-[rgb(var(--lt-text))]">merged by LutaTech.pdf</span>
                  </p>
                </div>

                {/* Meta details */}
                <div className="mt-6 space-y-3 border-t lt-border-color pt-4 text-xs">
                  <div className="flex justify-between">
                    <span className="lt-text-muted font-medium">Total Files:</span>
                    <span className="font-bold text-[rgb(var(--lt-text))]">{pdfFiles.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="lt-text-muted font-medium">Total Pages:</span>
                    <span className="font-bold text-[rgb(var(--lt-text))]">{totalPagesCount} pages</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="lt-text-muted font-medium">Total Size:</span>
                    <span className="font-bold text-[rgb(var(--lt-text))]">{formatBytes(totalSizeBytes)}</span>
                  </div>
                </div>

                {/* Progress bar during merge */}
                {merging && (
                  <div className="mt-6 space-y-2 lt-fade-in">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[rgb(var(--lt-text))]">Merging files...</span>
                      <span className="text-[rgb(var(--lt-primary))]">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[rgb(var(--lt-surface-2))] overflow-hidden">
                      <div
                        className="h-full bg-[rgb(var(--lt-primary))] transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Huge Primary Red Button at bottom */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={merging || pdfFiles.length < 2}
                  className="w-full flex items-center justify-center gap-3 rounded-xl bg-[rgb(var(--lt-primary))] hover:opacity-95 text-white font-bold py-4 px-6 text-base transition-all shadow-lg shadow-[rgb(var(--lt-primary)/0.3)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {merging ? (
                    <>
                      <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white lt-spin" />
                      Merging PDFs...
                    </>
                  ) : (
                    <>
                      Merge PDF <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        webkitdirectory=""
        accept=".pdf,application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
      <input
        ref={addFileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
      <input
        ref={addFolderInputRef}
        type="file"
        multiple
        webkitdirectory=""
        accept=".pdf,application/pdf"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            e.target.value = '';
          }
        }}
        className="hidden"
      />
    </div>
  );
}

export default PdfMergerTool;
