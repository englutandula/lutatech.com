'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Type,
  Copy,
  Check,
  RotateCcw,
  ClipboardPaste,
  Download,
  BookOpen,
  Mic,
  Clock,
  BarChart2,
  Sparkles,
  AlignLeft,
  Trash2,
} from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as',
  'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t',
  'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having',
  'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its',
  'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d',
  'they\'ll', 'they\'re', 'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
  'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when',
  'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t',
  'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

const SAMPLE_TEXT = `Artificial intelligence is rapidly transforming the digital landscape, enabling creators, engineers, and businesses to automate repetitive tasks and unleash new forms of creativity.

With modern browser capabilities, heavy computation that previously required dedicated servers can now run entirely client-side. This ensures absolute data privacy, instantaneous response times, and an enjoyable user experience without compromising quality.`;

export default function WordCounterPage() {
  const tool = getTool('word-counter') || {
    slug: 'word-counter',
    name: 'Word Counter',
    shortName: 'Word Count',
    category: 'Productivity' as const,
    icon: 'Type',
    accent: 'teal',
    status: 'live' as const,
    description: 'Count words, characters, sentences, and reading time instantly.',
    longDescription:
      'A real-time writing assistant and text statistics analyzer. Track word count, character density, estimated reading & speaking time, readability score, and keyword frequency with instant 1-click case transformations.',
  };

  const [text, setText] = useState(SAMPLE_TEXT);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    recordToolUsage('word-counter');
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const raw = text.trim();
    if (!raw) {
      return {
        words: 0,
        chars: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTimeMin: 0,
        speakingTimeMin: 0,
        avgWordLength: 0,
        readingLevel: 'N/A',
      };
    }

    const wordsArray = raw.split(/\s+/).filter(Boolean);
    const words = wordsArray.length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    // Sentences
    const sentenceMatches = raw.match(/[^.!?]+[.!?]+(\s|$)/g);
    const sentences = sentenceMatches ? sentenceMatches.length : words > 0 ? 1 : 0;

    // Paragraphs
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0).length;

    // Reading & Speaking times
    const readingTimeMin = Math.ceil(words / 200);
    const speakingTimeMin = Math.ceil(words / 130);

    // Avg word length
    const totalLetters = wordsArray.reduce((acc, w) => acc + w.length, 0);
    const avgWordLength = words > 0 ? (totalLetters / words).toFixed(1) : 0;

    // Flesch Reading Ease
    // 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
    let readingLevel = 'Standard';
    if (words > 10 && sentences > 0) {
      const wordsPerSentence = words / sentences;
      if (wordsPerSentence < 12) readingLevel = 'Very Easy (5th Grade)';
      else if (wordsPerSentence < 18) readingLevel = 'Easy (6th - 8th Grade)';
      else if (wordsPerSentence < 24) readingLevel = 'Fairly Easy (High School)';
      else if (wordsPerSentence < 30) readingLevel = 'Standard (College)';
      else readingLevel = 'Difficult (Academic)';
    }

    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
      avgWordLength,
      readingLevel,
    };
  }, [text]);

  // Keyword density
  const keywords = useMemo(() => {
    if (!text.trim()) return [];
    const tokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\s'-]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const freq: Record<string, number> = {};
    for (const word of tokens) {
      if (filterStopWords && STOP_WORDS.has(word)) continue;
      freq[word] = (freq[word] || 0) + 1;
    }

    const totalCount = tokens.length || 1;
    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({
        word,
        count,
        density: ((count / totalCount) * 100).toFixed(1),
      }));

    return sorted;
  }, [text, filterStopWords]);

  // Text Transformations
  const transformCase = (type: 'upper' | 'lower' | 'title' | 'sentence' | 'cleanSpaces') => {
    if (!text) return;
    switch (type) {
      case 'upper':
        setText(text.toUpperCase());
        break;
      case 'lower':
        setText(text.toLowerCase());
        break;
      case 'title':
        setText(
          text.replace(
            /\w\S*/g,
            (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          )
        );
        break;
      case 'sentence':
        setText(
          text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
        );
        break;
      case 'cleanSpaces':
        setText(text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim());
        break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) setText(clip);
    } catch (e) {
      // Ignore
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageShell tool={tool}>
      {/* Top Real-time Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 lt-fade-up">
        <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
            Words
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-primary))] mt-1">
            {stats.words.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
            Characters
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] mt-1">
            {stats.chars.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
            No Spaces
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] mt-1">
            {stats.charsNoSpaces.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
            Sentences
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] mt-1">
            {stats.sentences.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
            Paragraphs
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] mt-1">
            {stats.paragraphs.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] p-4 text-center shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
            Reading Time
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">
            ~{stats.readingTimeMin}m
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lt-fade-up">
        {/* Main Editor Section */}
        <div className="lg:col-span-8 space-y-4">
          <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-[rgb(var(--lt-border))]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => transformCase('sentence')}
                  className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  Sentence case
                </button>
                <button
                  type="button"
                  onClick={() => transformCase('lower')}
                  className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  lowercase
                </button>
                <button
                  type="button"
                  onClick={() => transformCase('upper')}
                  className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  UPPERCASE
                </button>
                <button
                  type="button"
                  onClick={() => transformCase('title')}
                  className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  Title Case
                </button>
                <button
                  type="button"
                  onClick={() => transformCase('cleanSpaces')}
                  className="px-2.5 py-1 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[11px] font-semibold text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  Trim Spaces
                </button>
              </div>

              <div className="flex items-center gap-1.5">
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
                  onClick={handleCopy}
                  title="Copy text"
                  className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download .txt"
                  className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setText('')}
                  title="Clear text"
                  className="p-1.5 rounded-lg border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-rose-500/10 text-rose-500 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={14}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here to begin instant word and character count..."
              className="w-full bg-transparent resize-y outline-none text-sm text-[rgb(var(--lt-text))] leading-relaxed placeholder:text-[rgb(var(--lt-text-muted)/0.5)] font-sans"
            />
          </div>
        </div>

        {/* Sidebar: Readability & Keyword Density */}
        <div className="lg:col-span-4 space-y-6">
          {/* Readability Score */}
          <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] mb-3 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              Reading & Speaking
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-[rgb(var(--lt-border))]">
                <span className="text-[rgb(var(--lt-text-muted))]">Reading Time (200 wpm)</span>
                <span className="font-bold text-[rgb(var(--lt-text))]">~{stats.readingTimeMin} min</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[rgb(var(--lt-border))]">
                <span className="text-[rgb(var(--lt-text-muted))]">Speaking Time (130 wpm)</span>
                <span className="font-bold text-[rgb(var(--lt-text))]">~{stats.speakingTimeMin} min</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[rgb(var(--lt-border))]">
                <span className="text-[rgb(var(--lt-text-muted))]">Avg Word Length</span>
                <span className="font-bold text-[rgb(var(--lt-text))]">{stats.avgWordLength} chars</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-[rgb(var(--lt-text-muted))]">Readability Level</span>
                <span className="font-bold text-[rgb(var(--lt-primary))]">{stats.readingLevel}</span>
              </div>
            </div>
          </div>

          {/* Keyword Density */}
          <div className="lt-card rounded-3xl p-5 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Keyword Density
              </h3>
              <label className="inline-flex items-center gap-1.5 text-[11px] text-[rgb(var(--lt-text-muted))] cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterStopWords}
                  onChange={(e) => setFilterStopWords(e.target.checked)}
                  className="rounded text-[rgb(var(--lt-primary))]"
                />
                Filter common words
              </label>
            </div>

            {keywords.length === 0 ? (
              <p className="text-xs text-[rgb(var(--lt-text-muted))] text-center py-4">
                Type more text to see keyword frequency.
              </p>
            ) : (
              <div className="space-y-2.5">
                {keywords.map((k) => (
                  <div key={k.word} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-[rgb(var(--lt-text))] capitalize">{k.word}</span>
                      <span className="text-[rgb(var(--lt-text-muted))]">
                        {k.count} ({k.density}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[rgb(var(--lt-surface-2))] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, parseFloat(k.density) * 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
