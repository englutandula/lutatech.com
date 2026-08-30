'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, Sparkles, Command } from 'lucide-react';
import { tools, Tool } from '@/lib/tools';
import { ToolIcon } from './ToolIcon';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = query.trim() === ''
    ? tools.slice(0, 6)
    : tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredTools.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && filteredTools[selectedIndex]) {
      e.preventDefault();
      handleSelectTool(filteredTools[selectedIndex]);
    }
  };

  const handleSelectTool = (tool: Tool) => {
    onClose();
    if (tool.href) {
      router.push(tool.href);
    } else if (tool.status === 'live') {
      router.push(`/tools/${tool.slug}`);
    } else {
      router.push('/tools');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs lt-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] shadow-2xl overflow-hidden lt-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b lt-border-color px-4 py-3.5">
          <Search className="h-5 w-5 text-[rgb(var(--lt-text-muted))] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, actions, categories (e.g. passport, remove bg, pdf)..."
            className="w-full bg-transparent text-sm text-[rgb(var(--lt-text))] placeholder:text-[rgb(var(--lt-text-muted)/0.6)] outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))] mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[rgb(var(--lt-surface-2))] border lt-border-color px-2 py-0.5 text-[10px] font-mono text-[rgb(var(--lt-text-muted))]">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 lt-scrollbar">
          {filteredTools.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-[rgb(var(--lt-text))]">No tools found</p>
              <p className="mt-1 text-xs lt-text-muted">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[rgb(var(--lt-text-muted))] uppercase tracking-wider">
                {query.trim() === '' ? 'Popular Tools' : 'Matching Tools'}
              </div>
              {filteredTools.map((tool, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={tool.slug}
                    onClick={() => handleSelectTool(tool)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]'
                        : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-[rgb(var(--lt-primary))] text-white'
                            : 'bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                        }`}
                      >
                        <ToolIcon name={tool.icon} className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate text-[rgb(var(--lt-text))]">
                            {tool.name}
                          </span>
                          <span className="rounded bg-[rgb(var(--lt-surface-3))] px-1.5 py-0.5 text-[10px] font-medium text-[rgb(var(--lt-text-muted))]">
                            {tool.category}
                          </span>
                        </div>
                        <p className="text-xs lt-text-muted truncate">{tool.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {tool.status === 'live' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] px-2 py-0.5 text-[10px] font-semibold border border-[rgb(var(--lt-primary)/0.2)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--lt-primary))]" /> Live
                        </span>
                      ) : (
                        <span className="rounded bg-[rgb(var(--lt-surface-2))] px-2 py-0.5 text-[10px] font-medium lt-text-muted">
                          Soon
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-[rgb(var(--lt-text-muted))]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t lt-border-color bg-[rgb(var(--lt-surface-2))] px-4 py-2 text-[11px] lt-text-muted">
          <span>Navigate with <kbd className="font-mono font-semibold">↑</kbd> <kbd className="font-mono font-semibold">↓</kbd></span>
          <span>Select with <kbd className="font-mono font-semibold">↵ Enter</kbd></span>
        </div>
      </div>
    </div>
  );
}

export default SearchDialog;
