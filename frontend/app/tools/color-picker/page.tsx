'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Pipette,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Palette,
  Eye,
  Sliders,
  Share2,
  Download,
  Info,
} from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';

// Helper color conversion functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const rPrime = r / 255;
  const gPrime = g / 255;
  const bPrime = b / 255;
  const k = 1 - Math.max(rPrime, gPrime, bPrime);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const c = Math.round(((1 - rPrime - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gPrime - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bPrime - k) / (1 - k)) * 100);
  return { c, m, y, k: Math.round(k * 100) };
}

// Relative luminance for contrast ratio
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return parseFloat(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
}

const PRESET_PALETTES = [
  {
    name: 'Vibrant Modern',
    colors: ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'],
  },
  {
    name: 'LutaTech Accents',
    colors: ['#E11D48', '#BE123C', '#0F172A', '#1E293B', '#334155', '#64748B', '#F1F5F9', '#FFFFFF'],
  },
  {
    name: 'Pastel Dream',
    colors: ['#FECDD3', '#FED7AA', '#FEF08A', '#A7F3D0', '#BAE6FD', '#C7D2FE', '#DDD6FE', '#FBCFE8'],
  },
  {
    name: 'Cyberpunk Neon',
    colors: ['#00FF66', '#00F0FF', '#FF0055', '#FFE600', '#BD00FF', '#0038FF', '#FF3B00', '#050505'],
  },
  {
    name: 'Earthy & Warm',
    colors: ['#78350F', '#92400E', '#B45309', '#D97706', '#065F46', '#047857', '#059669', '#10B981'],
  },
];

export default function ColorPickerPage() {
  const tool = getTool('color-picker') || {
    slug: 'color-picker',
    name: 'Color Picker',
    shortName: 'Colors',
    category: 'Utility' as const,
    icon: 'Palette',
    accent: 'pink',
    status: 'live' as const,
    description: 'Pick colors and get HEX, RGB, and HSL values instantly.',
    longDescription:
      'A professional visual color picker and palette studio. Inspect HEX, RGB, HSL, and CMYK formats, generate 10-shade scales, verify WCAG contrast compliance, and copy color values with zero lag.',
  };

  const [hex, setHex] = useState('#E11D48');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  useEffect(() => {
    recordToolUsage('color-picker');
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  const rgb = useMemo(() => hexToRgb(hex) || { r: 225, g: 29, b: 72 }, [hex]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  // Contrast ratios
  const contrastWhite = useMemo(() => getContrastRatio(rgb, { r: 255, g: 255, b: 255 }), [rgb]);
  const contrastBlack = useMemo(() => getContrastRatio(rgb, { r: 0, g: 0, b: 0 }), [rgb]);
  const isLight = useMemo(() => hsl.l > 60, [hsl.l]);

  // Color shades from 50 (lightest) to 950 (darkest)
  const shades = useMemo(() => {
    const lightnessSteps = [
      { name: '50', l: 96 },
      { name: '100', l: 90 },
      { name: '200', l: 80 },
      { name: '300', l: 70 },
      { name: '400', l: 60 },
      { name: '500', l: 50 },
      { name: '600', l: 40 },
      { name: '700', l: 30 },
      { name: '800', l: 20 },
      { name: '900', l: 12 },
      { name: '950', l: 6 },
    ];
    return lightnessSteps.map((step) => {
      const shadeRgb = hslToRgb(hsl.h, hsl.s, step.l);
      const shadeHex = rgbToHex(shadeRgb.r, shadeRgb.g, shadeRgb.b);
      return { step: step.name, hex: shadeHex, l: step.l };
    });
  }, [hsl]);

  // Color harmonies
  const harmonies = useMemo(() => {
    const compH = (hsl.h + 180) % 360;
    const compHex = rgbToHex(hslToRgb(compH, hsl.s, hsl.l).r, hslToRgb(compH, hsl.s, hsl.l).g, hslToRgb(compH, hsl.s, hsl.l).b);

    const ana1H = (hsl.h + 30) % 360;
    const ana2H = (hsl.h + 330) % 360;
    const ana1Hex = rgbToHex(hslToRgb(ana1H, hsl.s, hsl.l).r, hslToRgb(ana1H, hsl.s, hsl.l).g, hslToRgb(ana1H, hsl.s, hsl.l).b);
    const ana2Hex = rgbToHex(hslToRgb(ana2H, hsl.s, hsl.l).r, hslToRgb(ana2H, hsl.s, hsl.l).g, hslToRgb(ana2H, hsl.s, hsl.l).b);

    const tri1H = (hsl.h + 120) % 360;
    const tri2H = (hsl.h + 240) % 360;
    const tri1Hex = rgbToHex(hslToRgb(tri1H, hsl.s, hsl.l).r, hslToRgb(tri1H, hsl.s, hsl.l).g, hslToRgb(tri1H, hsl.s, hsl.l).b);
    const tri2Hex = rgbToHex(hslToRgb(tri2H, hsl.s, hsl.l).r, hslToRgb(tri2H, hsl.s, hsl.l).g, hslToRgb(tri2H, hsl.s, hsl.l).b);

    return [
      { name: 'Base', hex },
      { name: 'Complementary', hex: compHex },
      { name: 'Analogous 1', hex: ana1Hex },
      { name: 'Analogous 2', hex: ana2Hex },
      { name: 'Triadic 1', hex: tri1Hex },
      { name: 'Triadic 2', hex: tri2Hex },
    ];
  }, [hsl, hex]);

  const copyValue = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setHex(result.sRGBHex.toUpperCase());
        }
      } catch (err) {
        // User canceled eyedropper
      }
    }
  };

  const handleRgbChange = (r: number, g: number, b: number) => {
    setHex(rgbToHex(r, g, b));
  };

  const handleHslChange = (h: number, s: number, l: number) => {
    const newRgb = hslToRgb(h, s, l);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lt-fade-up">
        {/* Left Column: Interactive Swatch & Direct Picker */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
              Color Preview
            </h2>

            {/* Main Interactive Swatch */}
            <div
              className="relative h-48 w-full rounded-2xl shadow-inner border border-black/10 flex flex-col justify-between p-4 transition-colors"
              style={{ backgroundColor: hex }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-mono font-bold shadow-xs backdrop-blur-md"
                  style={{
                    backgroundColor: isLight ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)',
                    color: isLight ? '#FFFFFF' : '#0F172A',
                  }}
                >
                  {hex}
                </span>

                {hasEyeDropper && (
                  <button
                    type="button"
                    onClick={handleEyedropper}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)',
                      color: isLight ? '#FFFFFF' : '#0F172A',
                    }}
                  >
                    <Pipette className="h-3.5 w-3.5" /> Pick from Screen
                  </button>
                )}
              </div>

              <div className="flex items-end justify-between">
                <div
                  className="text-xs font-medium backdrop-blur-md px-2.5 py-1 rounded-lg"
                  style={{
                    backgroundColor: isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
                    color: isLight ? '#FFFFFF' : '#0F172A',
                  }}
                >
                  RGB({rgb.r}, {rgb.g}, {rgb.b})
                </div>

                <label className="cursor-pointer">
                  <span
                    className="px-3 py-1.5 rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-1.5 backdrop-blur-md transition-transform hover:scale-105"
                    style={{
                      backgroundColor: isLight ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                      color: isLight ? '#FFFFFF' : '#0F172A',
                    }}
                  >
                    Change Color
                  </span>
                  <input
                    type="color"
                    value={hex}
                    onChange={(e) => setHex(e.target.value.toUpperCase())}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6 space-y-3">
              <label className="text-xs font-semibold text-[rgb(var(--lt-text))] block">Quick Swatches</label>
              <div className="grid grid-cols-8 gap-2">
                {PRESET_PALETTES[0].colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setHex(c)}
                    className={`h-9 w-full rounded-xl border border-black/10 transition-transform hover:scale-110 active:scale-95 cursor-pointer ${
                      hex.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-[rgb(var(--lt-primary))] ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            {/* WCAG Contrast Check */}
            <div className="mt-6 pt-5 border-t border-[rgb(var(--lt-border))]">
              <label className="text-xs font-semibold text-[rgb(var(--lt-text))] mb-3 block flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" /> WCAG Accessibility Contrast
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-3 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="h-4 w-4 rounded-full bg-white border border-slate-300 shadow-xs inline-block" />
                    <span className="text-xs font-semibold text-[rgb(var(--lt-text))]">On White</span>
                  </div>
                  <div className="text-lg font-extrabold text-[rgb(var(--lt-text))]">{contrastWhite}:1</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      contrastWhite >= 4.5
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : contrastWhite >= 3
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {contrastWhite >= 7 ? 'AAA Pass' : contrastWhite >= 4.5 ? 'AA Pass' : 'Low Contrast'}
                  </span>
                </div>

                <div className="rounded-2xl p-3 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="h-4 w-4 rounded-full bg-slate-900 border border-slate-700 shadow-xs inline-block" />
                    <span className="text-xs font-semibold text-[rgb(var(--lt-text))]">On Black</span>
                  </div>
                  <div className="text-lg font-extrabold text-[rgb(var(--lt-text))]">{contrastBlack}:1</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                      contrastBlack >= 4.5
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        : contrastBlack >= 3
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {contrastBlack >= 7 ? 'AAA Pass' : contrastBlack >= 4.5 ? 'AA Pass' : 'Low Contrast'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Values, Sliders, & Scales */}
        <div className="lg:col-span-7 space-y-6">
          {/* Format Values Grid */}
          <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
                Color Formats & Values
              </span>
              <span className="text-xs text-[rgb(var(--lt-text-muted))] font-normal">Click to copy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* HEX */}
              <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
                    HEX
                  </span>
                  <span className="text-sm font-mono font-bold text-[rgb(var(--lt-text))]">{hex}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(hex, 'hex')}
                  className="p-2 rounded-xl hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  {copiedKey === 'hex' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* RGB */}
              <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
                    RGB
                  </span>
                  <span className="text-sm font-mono font-bold text-[rgb(var(--lt-text))]">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                  className="p-2 rounded-xl hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  {copiedKey === 'rgb' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* HSL */}
              <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
                    HSL
                  </span>
                  <span className="text-sm font-mono font-bold text-[rgb(var(--lt-text))]">
                    hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                  className="p-2 rounded-xl hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  {copiedKey === 'hsl' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* CMYK */}
              <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">
                    CMYK
                  </span>
                  <span className="text-sm font-mono font-bold text-[rgb(var(--lt-text))]">
                    cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyValue(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, 'cmyk')}
                  className="p-2 rounded-xl hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  {copiedKey === 'cmyk' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Interactive RGB Sliders */}
            <div className="mt-6 space-y-4 pt-5 border-t border-[rgb(var(--lt-border))]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))]">RGB Channels</h3>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-600 dark:text-rose-400">Red (R)</span>
                  <span className="font-mono text-[rgb(var(--lt-text))]">{rgb.r}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => handleRgbChange(parseInt(e.target.value), rgb.g, rgb.b)}
                  className="w-full h-2 rounded-lg bg-rose-200 dark:bg-rose-950/60 accent-rose-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-600 dark:text-emerald-400">Green (G)</span>
                  <span className="font-mono text-[rgb(var(--lt-text))]">{rgb.g}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => handleRgbChange(rgb.r, parseInt(e.target.value), rgb.b)}
                  className="w-full h-2 rounded-lg bg-emerald-200 dark:bg-emerald-950/60 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-600 dark:text-blue-400">Blue (B)</span>
                  <span className="font-mono text-[rgb(var(--lt-text))]">{rgb.b}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => handleRgbChange(rgb.r, rgb.g, parseInt(e.target.value))}
                  className="w-full h-2 rounded-lg bg-blue-200 dark:bg-blue-950/60 accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 10-Shade Generator (Tailwind style) */}
          <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-2 flex items-center gap-2">
              <Layers className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
              Tailwind Shade Scale
            </h2>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] mb-4">
              Click any shade to inspect or copy its HEX value.
            </p>

            <div className="grid grid-cols-11 gap-1.5">
              {shades.map((s) => (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => setHex(s.hex)}
                  className="group flex flex-col items-center gap-1 cursor-pointer transition-transform hover:-translate-y-1"
                >
                  <div
                    className={`h-12 w-full rounded-xl border border-black/10 shadow-xs ${
                      hex.toUpperCase() === s.hex.toUpperCase() ? 'ring-2 ring-[rgb(var(--lt-primary))] ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: s.hex }}
                  />
                  <span className="text-[10px] font-mono text-[rgb(var(--lt-text-muted))] group-hover:text-[rgb(var(--lt-text))]">
                    {s.step}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Harmonies */}
          <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
              Harmonious Palettes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {harmonies.map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => setHex(h.hex)}
                  className="p-2 rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary)/0.4)] text-left cursor-pointer transition-all active:scale-95"
                >
                  <div className="h-10 w-full rounded-xl border border-black/10 mb-2" style={{ backgroundColor: h.hex }} />
                  <span className="text-[11px] font-bold text-[rgb(var(--lt-text))] block truncate">{h.name}</span>
                  <span className="text-[10px] font-mono text-[rgb(var(--lt-text-muted))]">{h.hex}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
