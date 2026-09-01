'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Binary,
  Copy,
  Check,
  RotateCcw,
  ArrowRightLeft,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ClipboardPaste,
  Trash2,
} from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';

// UTF-8 safe Base64 encoding
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// UTF-8 safe Base64 decoding
function base64ToUtf8(str: string): string {
  // Normalize URL-safe base64 if needed
  let normalized = str.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) {
    normalized += '=';
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

const SAMPLE_TEXT = 'LutaTech is a fast, modern, and private in-browser digital tools platform.';

export default function Base64ConverterPage() {
  const tool = getTool('base64-converter') || {
    slug: 'base64-converter',
    name: 'Base64 Converter',
    shortName: 'Base64',
    category: 'Developer' as const,
    icon: 'Binary',
    accent: 'lime',
    status: 'live' as const,
    description: 'Encode and decode Base64 strings instantly.',
    longDescription:
      'Convert text and binary files to Base64 strings and decode Base64 back into text or downloadable files. Features full UTF-8 Unicode support, URL-safe Base64 mode, and Data URL generation.',
  };

  const [tab, setTab] = useState<'text' | 'file'>('text');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState(SAMPLE_TEXT);
  const [urlSafe, setUrlSafe] = useState(false);
  const [copied, setCopied] = useState(false);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    recordToolUsage('base64-converter');
  }, []);

  // Text Conversion
  const { output, error } = useMemo(() => {
    const raw = input.trim();
    if (!raw) return { output: '', error: null };

    try {
      if (mode === 'encode') {
        let encoded = utf8ToBase64(input);
        if (urlSafe) {
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        return { output: encoded, error: null };
      } else {
        const decoded = base64ToUtf8(raw);
        return { output: decoded, error: null };
      }
    } catch (err: any) {
      return { output: '', error: 'Invalid Base64 string. Please verify the input characters.' };
    }
  }, [input, mode, urlSafe]);

  const handleSwapMode = () => {
    if (output && !error) {
      setInput(output);
    }
    setMode((prev) => (prev === 'encode' ? 'decode' : 'encode'));
  };

  const handleCopy = () => {
    const textToCopy = tab === 'file' ? fileBase64 : output;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setInput(clip);
    } catch (e) {
      // Ignore
    }
  };

  const handleDownload = () => {
    const textToDownload = tab === 'file' ? fileBase64 : output;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base64-${mode}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // File to Base64
  const handleFileUpload = (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <ToolPageShell tool={tool}>
      {/* Top Tab Switcher */}
      <div className="flex items-center gap-2 mb-6 lt-fade-up">
        <button
          type="button"
          onClick={() => setTab('text')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            tab === 'text'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" /> Text Base64
          </span>
        </button>

        <button
          type="button"
          onClick={() => setTab('file')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            tab === 'file'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4" /> File / Image to Base64
          </span>
        </button>
      </div>

      {tab === 'text' ? (
        <div className="space-y-6 lt-fade-up">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-xs">
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-1">
                <button
                  type="button"
                  onClick={() => setMode('encode')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'encode'
                      ? 'bg-[rgb(var(--lt-primary))] text-white shadow-xs'
                      : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  Encode (Text → Base64)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('decode')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mode === 'decode'
                      ? 'bg-[rgb(var(--lt-primary))] text-white shadow-xs'
                      : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                  }`}
                >
                  Decode (Base64 → Text)
                </button>
              </div>

              <button
                type="button"
                onClick={handleSwapMode}
                title="Swap Input and Output"
                className="p-1.5 rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {mode === 'encode' && (
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-[rgb(var(--lt-text))] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                    className="rounded border-[rgb(var(--lt-border))] text-[rgb(var(--lt-primary))]"
                  />
                  URL-Safe Base64 (- and _)
                </label>
              )}

              <span className="text-xs text-[rgb(var(--lt-text-muted))] font-mono">
                UTF-8 & Emoji Safe
              </span>
            </div>
          </div>

          {/* Dual Input/Output Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgb(var(--lt-border))]">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))]">
                  {mode === 'encode' ? 'Plain Text Input' : 'Base64 Input'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInput(SAMPLE_TEXT)}
                    className="px-2 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                  >
                    Sample
                  </button>
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                  >
                    <ClipboardPaste className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    title="Clear input"
                    className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-rose-500/10 text-rose-500 cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <textarea
                rows={12}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string to decode...'}
                className="w-full flex-1 bg-transparent resize-y outline-none font-mono text-xs text-[rgb(var(--lt-text))] leading-relaxed placeholder:text-[rgb(var(--lt-text-muted)/0.4)]"
              />

              <div className="pt-2 text-right text-[11px] text-[rgb(var(--lt-text-muted))] font-mono">
                {input.length.toLocaleString()} characters
              </div>
            </div>

            {/* Output */}
            <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgb(var(--lt-border))]">
                <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))]">
                  {mode === 'encode' ? 'Base64 Result' : 'Decoded Text Result'}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!output}
                    className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={!output}
                    className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 rounded-2xl bg-[rgb(var(--lt-surface-2))] border border-[rgb(var(--lt-border))] p-3 overflow-auto max-h-[300px]">
                {error ? (
                  <div className="text-xs text-rose-500 font-mono py-8 text-center space-y-1">
                    <AlertCircle className="h-6 w-6 mx-auto opacity-70" />
                    <p className="font-semibold">{error}</p>
                  </div>
                ) : output ? (
                  <pre className="font-mono text-xs text-[rgb(var(--lt-text))] leading-relaxed break-all whitespace-pre-wrap select-text">
                    {output}
                  </pre>
                ) : (
                  <div className="text-xs text-[rgb(var(--lt-text-muted))] py-12 text-center">
                    Converted output will appear here
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-between text-[11px] text-[rgb(var(--lt-text-muted))] font-mono">
                <span>{output ? `${output.length.toLocaleString()} characters` : ''}</span>
                {mode === 'encode' && input && (
                  <span className="text-lime-600 dark:text-lime-400 font-bold">+33% Base64 overhead</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* File to Base64 Section */
        <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] max-w-2xl mx-auto space-y-6 lt-fade-up">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.05)]'
                : 'border-[rgb(var(--lt-border))] hover:border-[rgb(var(--lt-primary)/0.4)] bg-[rgb(var(--lt-surface-2))]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <Upload className="h-10 w-10 text-[rgb(var(--lt-primary))] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[rgb(var(--lt-text))]">
              {file ? file.name : 'Drop file here, or browse'}
            </h3>
            <p className="mt-1 text-xs text-[rgb(var(--lt-text-muted))]">
              Supports images, documents, PDFs, or any file type.
            </p>
          </div>

          {fileBase64 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[rgb(var(--lt-text))]">
                  Data URL String ({fileBase64.length.toLocaleString()} chars)
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] text-white text-xs font-bold cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied Data URL!' : 'Copy Data URL'}
                </button>
              </div>

              <textarea
                rows={5}
                readOnly
                value={fileBase64}
                className="w-full rounded-2xl bg-[rgb(var(--lt-surface-2))] border border-[rgb(var(--lt-border))] p-3 font-mono text-[11px] text-[rgb(var(--lt-text))] outline-none break-all"
              />

              {file?.type.startsWith('image/') && (
                <div className="pt-2 text-center">
                  <span className="text-xs text-[rgb(var(--lt-text-muted))] block mb-2">Image Preview</span>
                  <img
                    src={fileBase64}
                    alt="Preview"
                    className="max-h-48 rounded-xl mx-auto border border-[rgb(var(--lt-border))] shadow-xs"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </ToolPageShell>
  );
}
