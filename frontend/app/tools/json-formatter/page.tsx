'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Braces,
  Copy,
  Check,
  Download,
  Trash2,
  Minimize2,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRightLeft,
  Sparkles,
  ClipboardPaste,
} from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';

const SAMPLE_JSON = `{
  "platform": "LutaTech",
  "version": 3.0,
  "status": "operational",
  "features": [
    "Client-side processing",
    "Zero data retention",
    "Instant in-browser execution"
  ],
  "author": {
    "name": "Luta Tech Team",
    "role": "Core Engineering",
    "verified": true
  },
  "metrics": {
    "speed": "instant",
    "activeUsers": 125000,
    "uptimePercent": 99.98
  }
}`;

function sortJsonKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortJsonKeys);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result: any, key: string) => {
        result[key] = sortJsonKeys(obj[key]);
        return result;
      }, {});
  }
  return obj;
}

export default function JsonFormatterPage() {
  const tool = getTool('json-formatter') || {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortName: 'JSON',
    category: 'Developer' as const,
    icon: 'Braces',
    accent: 'orange',
    status: 'live' as const,
    description: 'Format, validate, and minify JSON data with syntax highlighting.',
    longDescription:
      'A powerful in-browser JSON formatter, validator, and minifier. Prettify messy JSON, sort object keys, minify payloads, escape/unescape strings, and pinpoint syntax errors instantly.',
  };

  const [input, setInput] = useState(SAMPLE_JSON);
  const [indent, setIndent] = useState<'2' | '4' | 'tab'>('2');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    recordToolUsage('json-formatter');
  }, []);

  // Validation & Parse
  const { parsed, isValid, error, byteSize, keyCount, lineCount } = useMemo(() => {
    const raw = input.trim();
    if (!raw) {
      return {
        parsed: null,
        isValid: true,
        error: null,
        byteSize: 0,
        keyCount: 0,
        lineCount: 0,
      };
    }

    try {
      const data = JSON.parse(raw);

      // Count keys recursively
      let keys = 0;
      const countKeys = (node: any) => {
        if (node && typeof node === 'object') {
          if (Array.isArray(node)) {
            node.forEach(countKeys);
          } else {
            const k = Object.keys(node);
            keys += k.length;
            k.forEach((key) => countKeys(node[key]));
          }
        }
      };
      countKeys(data);

      return {
        parsed: data,
        isValid: true,
        error: null,
        byteSize: new Blob([raw]).size,
        keyCount: keys,
        lineCount: raw.split('\n').length,
      };
    } catch (err: any) {
      return {
        parsed: null,
        isValid: false,
        error: err.message || 'Invalid JSON syntax',
        byteSize: new Blob([raw]).size,
        keyCount: 0,
        lineCount: raw.split('\n').length,
      };
    }
  }, [input]);

  // Formatted Output
  const formattedOutput = useMemo(() => {
    if (!isValid || parsed === null) return '';
    const space = indent === 'tab' ? '\t' : indent === '4' ? 4 : 2;
    return JSON.stringify(parsed, null, space);
  }, [parsed, isValid, indent]);

  // Actions
  const handlePrettify = () => {
    if (!isValid || parsed === null) return;
    const space = indent === 'tab' ? '\t' : indent === '4' ? 4 : 2;
    setInput(JSON.stringify(parsed, null, space));
  };

  const handleMinify = () => {
    if (!isValid || parsed === null) return;
    setInput(JSON.stringify(parsed));
  };

  const handleSortKeys = () => {
    if (!isValid || parsed === null) return;
    const sorted = sortJsonKeys(parsed);
    const space = indent === 'tab' ? '\t' : indent === '4' ? 4 : 2;
    setInput(JSON.stringify(sorted, null, space));
  };

  const handleEscape = () => {
    if (!input.trim()) return;
    setInput(JSON.stringify(input));
  };

  const handleUnescape = () => {
    if (!input.trim()) return;
    try {
      const unescaped = JSON.parse(input);
      if (typeof unescaped === 'string') {
        setInput(unescaped);
      }
    } catch (e) {
      // Ignore
    }
  };

  const handleCopy = () => {
    const textToCopy = formattedOutput || input;
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
    const blob = new Blob([formattedOutput || input], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageShell tool={tool}>
      {/* Top Status & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-xs lt-fade-up">
        <div className="flex items-center gap-3">
          {isValid && input.trim() ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Valid JSON
            </span>
          ) : !isValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4" /> Syntax Error
            </span>
          ) : (
            <span className="text-xs text-[rgb(var(--lt-text-muted))]">Paste or type JSON below</span>
          )}

          {error && (
            <span className="text-xs text-rose-500 font-mono truncate max-w-md">
              {error}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs lt-text-muted font-mono">
          <span>{byteSize.toLocaleString()} bytes</span>
          <span>•</span>
          <span>{keyCount.toLocaleString()} keys</span>
          <span>•</span>
          <span>{lineCount.toLocaleString()} lines</span>
        </div>
      </div>

      {/* Main Grid: Input and Formatted Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lt-fade-up">
        {/* Left Pane: Input Editor */}
        <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[rgb(var(--lt-border))]">
            <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] flex items-center gap-1.5">
              <FileCode className="h-4 w-4 text-orange-500" /> JSON Input
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInput(SAMPLE_JSON)}
                className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
              >
                Sample
              </button>
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
              >
                <ClipboardPaste className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-rose-500/10 text-rose-500 cursor-pointer transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <textarea
            rows={18}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your unformatted JSON here..."
            className="w-full flex-1 bg-transparent resize-y outline-none font-mono text-xs text-[rgb(var(--lt-text))] leading-relaxed placeholder:text-[rgb(var(--lt-text-muted)/0.4)]"
            spellCheck={false}
          />
        </div>

        {/* Right Pane: Actions & Formatted Output */}
        <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[rgb(var(--lt-border))]">
            {/* Toolbar Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value={indent}
                onChange={(e) => setIndent(e.target.value as any)}
                className="px-2 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer"
              >
                <option value="2">2 Spaces</option>
                <option value="4">4 Spaces</option>
                <option value="tab">Tab</option>
              </select>

              <button
                type="button"
                onClick={handlePrettify}
                disabled={!isValid || !input.trim()}
                className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Prettify
              </button>
              <button
                type="button"
                onClick={handleMinify}
                disabled={!isValid || !input.trim()}
                className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Minify
              </button>
              <button
                type="button"
                onClick={handleSortKeys}
                disabled={!isValid || !input.trim()}
                className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Sort Keys
              </button>
              <button
                type="button"
                onClick={handleEscape}
                disabled={!input.trim()}
                className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Escape
              </button>
              <button
                type="button"
                onClick={handleUnescape}
                disabled={!input.trim()}
                className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                Unescape
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!input.trim()}
                title="Copy output"
                className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!input.trim() || !isValid}
                title="Download .json"
                className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] disabled:opacity-40 cursor-pointer transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 rounded-2xl bg-[rgb(var(--lt-surface-2))] border border-[rgb(var(--lt-border))] p-4 overflow-auto max-h-[500px]">
            {isValid && formattedOutput ? (
              <pre className="font-mono text-xs text-[rgb(var(--lt-text))] leading-relaxed select-text">
                <code>{formattedOutput}</code>
              </pre>
            ) : !isValid ? (
              <div className="text-xs text-rose-500 font-mono py-8 text-center space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto opacity-70" />
                <p className="font-bold">Syntax Error in JSON</p>
                <p className="text-[11px] opacity-80">{error}</p>
              </div>
            ) : (
              <div className="text-xs text-[rgb(var(--lt-text-muted))] py-12 text-center">
                Formatted output will display here
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
