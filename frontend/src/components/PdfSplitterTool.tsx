'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Scissors,
  Download,
  Trash2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Layers,
  SplitSquareHorizontal,
} from 'lucide-react';

import { formatBytes, inspectPdfFile, type PdfFileInfo } from '@/lib/pdf';

type SplitMode = 'individual' | 'range';

interface PageRange {
  id: string;
  label: string;
  from: string;
  to: string;
}

interface SplitResult {
  name: string;
  url: string;
  size: number;
  pages: number;
}

function parseRanges(input: string, totalPages: number): Array<{ from: number; to: number }> {
  const ranges: Array<{ from: number; to: number }> = [];
  const parts = input.split(',').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      const from = Math.max(1, Math.min(a || 1, totalPages));
      const to = Math.max(1, Math.min(b || totalPages, totalPages));
      if (!isNaN(from) && !isNaN(to) && from <= to) ranges.push({ from, to });
    } else {
      const n = Number(part);
      if (!isNaN(n) && n >= 1 && n <= totalPages) ranges.push({ from: n, to: n });
    }
  }
  return ranges;
}

export default function PdfSplitterTool() {
  const [pdfFile, setPdfFile] = useState<PdfFileInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<SplitMode>('individual');
  const [rangeInput, setRangeInput] = useState('');
  const [customRanges, setCustomRanges] = useState<PageRange[]>([
    { id: 'initial-1', label: 'Part 1', from: '1', to: '' },
  ]);
  const [results, setResults] = useState<SplitResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF file.');
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const info = await inspectPdfFile(file);
      setPdfFile(info);
    } catch {
      setError('Failed to read PDF. The file may be corrupted or password-protected.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const addRange = () => {
    setCustomRanges((prev) => [
      ...prev,
      { id: `range-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: `Part ${prev.length + 1}`, from: '', to: '' },
    ]);
  };

  const removeRange = (id: string) => {
    setCustomRanges((prev) => prev.filter((r) => r.id !== id));
  };

  const updateRange = (id: string, field: 'label' | 'from' | 'to', value: string) => {
    setCustomRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const splitPdf = async () => {
    if (!pdfFile) return;
    setSplitting(true);
    setError(null);
    setResults([]);

    try {
      const arrayBuffer = await pdfFile.file.arrayBuffer();
      const { PDFDocument } = await import('pdf-lib');
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();

      const segments: Array<{ name: string; pages: number[] }> = [];

      if (mode === 'individual') {
        for (let i = 0; i < totalPages; i++) {
          segments.push({
            name: `${pdfFile.name.replace(/\.pdf$/i, '')}-page-${i + 1}.pdf`,
            pages: [i],
          });
        }
      } else {
        // Custom ranges
        const activeParsed = customRanges
          .map((r) => ({
            label: r.label.trim() || `Part`,
            from: parseInt(r.from, 10),
            to: parseInt(r.to, 10) || parseInt(r.from, 10),
          }))
          .filter((r) => !isNaN(r.from) && r.from >= 1 && r.from <= totalPages);

        if (activeParsed.length === 0) {
          setError('Please define at least one valid page range.');
          setSplitting(false);
          return;
        }

        activeParsed.forEach((r, idx) => {
          const from = Math.max(1, Math.min(r.from, totalPages)) - 1;
          const to = Math.max(0, Math.min(r.to, totalPages)) - 1;
          const pages: number[] = [];
          for (let i = from; i <= to && i < totalPages; i++) pages.push(i);
          if (pages.length > 0) {
            segments.push({
              name: `${pdfFile.name.replace(/\.pdf$/i, '')}-${r.label.replace(/\s+/g, '-')}.pdf`,
              pages,
            });
          }
        });
      }

      const newResults: SplitResult[] = [];
      for (const seg of segments) {
        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, seg.pages);
        copied.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([bytes as any], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        newResults.push({ name: seg.name, url, size: bytes.byteLength, pages: seg.pages.length });
      }

      setResults(newResults);
    } catch (err: any) {
      setError(err?.message || 'Failed to split PDF. Please try again.');
    } finally {
      setSplitting(false);
    }
  };

  const downloadAll = () => {
    results.forEach((r, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = r.url;
        a.download = r.name;
        a.click();
      }, i * 150);
    });
  };

  const reset = () => {
    setPdfFile(null);
    setResults([]);
    setError(null);
    setRangeInput('');
    setCustomRanges([{ id: 'initial-1', label: 'Part 1', from: '1', to: '' }]);
  };

  // ── UI ──────────────────────────────────────────────────────────
  const totalPages = pdfFile?.pageCount ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Drop Zone ── */}
      {!pdfFile && (
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
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={handleFileInput}
          />
          {loading ? (
            <span className="h-9 w-9 rounded-full border-2 border-[rgb(var(--lt-primary)/0.3)] border-t-[rgb(var(--lt-primary))] lt-spin" />
          ) : (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <Upload className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-[rgb(var(--lt-text))]">
                  Drop your PDF here or{' '}
                  <span className="text-[rgb(var(--lt-primary))]">browse</span>
                </p>
                <p className="text-xs lt-text-muted mt-1">Supports any PDF up to 200MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── File Loaded State ── */}
      {pdfFile && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden">
          {/* File Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b lt-border-color">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[rgb(var(--lt-text))] truncate max-w-[240px] sm:max-w-sm">{pdfFile.name}</p>
                <p className="text-xs lt-text-muted mt-0.5">
                  {totalPages} {totalPages === 1 ? 'page' : 'pages'} · {formatBytes(pdfFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="p-2 rounded-xl lt-text-muted hover:text-[rgb(var(--lt-primary))] hover:bg-[rgb(var(--lt-surface-2))] transition-colors cursor-pointer"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="px-5 py-5 space-y-5">
            <div className="flex rounded-xl overflow-hidden border lt-border-color divide-x divide-[rgb(var(--lt-border))]">
              <button
                type="button"
                onClick={() => setMode('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  mode === 'individual'
                    ? 'bg-[rgb(var(--lt-primary))] text-white'
                    : 'bg-[rgb(var(--lt-surface-2))] lt-text-muted hover:bg-[rgb(var(--lt-surface-3))]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Individual Pages
              </button>
              <button
                type="button"
                onClick={() => setMode('range')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                  mode === 'range'
                    ? 'bg-[rgb(var(--lt-primary))] text-white'
                    : 'bg-[rgb(var(--lt-surface-2))] lt-text-muted hover:bg-[rgb(var(--lt-surface-3))]'
                }`}
              >
                <SplitSquareHorizontal className="h-3.5 w-3.5" />
                Page Ranges
              </button>
            </div>

            {/* ── Individual Mode Info ── */}
            {mode === 'individual' && (
              <div className="rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color px-4 py-3">
                <p className="text-xs font-semibold text-[rgb(var(--lt-text))]">
                  Each page will be saved as a separate PDF file.
                </p>
                <p className="text-xs lt-text-muted mt-0.5">
                  This will produce <span className="font-bold text-[rgb(var(--lt-primary))]">{totalPages}</span> PDF{totalPages === 1 ? '' : 's'} — one per page.
                </p>
              </div>
            )}

            {/* ── Range Mode ── */}
            {mode === 'range' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-[rgb(var(--lt-text))]">
                    Define page ranges <span className="lt-text-muted">(pages 1–{totalPages})</span>
                  </p>
                  <button
                    type="button"
                    onClick={addRange}
                    className="flex items-center gap-1 text-xs font-bold text-[rgb(var(--lt-primary))] hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Range
                  </button>
                </div>

                <div className="space-y-2">
                  {customRanges.map((range, idx) => (
                    <div key={range.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={range.label}
                        onChange={(e) => updateRange(range.id, 'label', e.target.value)}
                        placeholder="Label"
                        className="w-24 text-xs px-2.5 py-2 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] focus:outline-none focus:border-[rgb(var(--lt-primary))] placeholder:lt-text-muted font-semibold"
                      />
                      <span className="text-xs lt-text-muted font-semibold">Pages</span>
                      <input
                        type="number"
                        value={range.from}
                        onChange={(e) => updateRange(range.id, 'from', e.target.value)}
                        min={1}
                        max={totalPages}
                        placeholder="1"
                        className="w-16 text-xs px-2.5 py-2 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] focus:outline-none focus:border-[rgb(var(--lt-primary))] font-mono font-bold text-center"
                      />
                      <span className="text-xs lt-text-muted">–</span>
                      <input
                        type="number"
                        value={range.to}
                        onChange={(e) => updateRange(range.id, 'to', e.target.value)}
                        min={1}
                        max={totalPages}
                        placeholder={String(totalPages)}
                        className="w-16 text-xs px-2.5 py-2 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text))] focus:outline-none focus:border-[rgb(var(--lt-primary))] font-mono font-bold text-center"
                      />
                      {customRanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRange(range.id)}
                          className="p-1.5 rounded-lg lt-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Split Button */}
            <button
              type="button"
              onClick={splitPdf}
              disabled={splitting}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[rgb(var(--lt-primary))] hover:opacity-95 disabled:opacity-60 text-white font-extrabold text-sm shadow-md shadow-[rgb(var(--lt-primary)/0.25)] active:scale-[0.99] transition-all cursor-pointer"
            >
              {splitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white lt-spin" />
                  Splitting...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4" />
                  Split PDF
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {results.length > 0 && (
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] overflow-hidden lt-fade-up">
          <div className="flex items-center justify-between px-5 py-4 border-b lt-border-color">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-sm font-bold text-[rgb(var(--lt-text))]">Split Complete!</p>
                <p className="text-xs lt-text-muted mt-0.5">{results.length} file{results.length !== 1 ? 's' : ''} ready to download</p>
              </div>
            </div>
            {results.length > 1 && (
              <button
                type="button"
                onClick={downloadAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgb(var(--lt-primary))] text-white font-bold text-xs hover:opacity-90 shadow-md shadow-[rgb(var(--lt-primary)/0.2)] cursor-pointer transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                Download All
              </button>
            )}
          </div>

          <div className="divide-y divide-[rgb(var(--lt-border))] max-h-[420px] overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-[rgb(var(--lt-surface-2))] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[rgb(var(--lt-text))] truncate">{r.name}</p>
                    <p className="text-[11px] lt-text-muted mt-0.5">
                      {r.pages} page{r.pages !== 1 ? 's' : ''} · {formatBytes(r.size)}
                    </p>
                  </div>
                </div>
                <a
                  href={r.url}
                  download={r.name}
                  className="ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border lt-border-color text-xs font-bold lt-text-muted hover:text-[rgb(var(--lt-primary))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:bg-[rgb(var(--lt-primary)/0.05)] transition-all cursor-pointer shrink-0"
                >
                  <Download className="h-3.5 w-3.5" />
                  Save
                </a>
              </div>
            ))}
          </div>

          {/* Split another */}
          <div className="px-5 py-4 border-t lt-border-color">
            <button
              type="button"
              onClick={reset}
              className="w-full py-2.5 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-xs font-bold text-[rgb(var(--lt-text))] transition-colors cursor-pointer"
            >
              Split Another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
