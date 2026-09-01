'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  Download,
  Upload,
  Dice5,
  Lock,
  Unlock,
  Maximize2,
  Code,
  FileCode,
  Image as ImageIcon,
  Share2,
  Contrast,
  Compass,
} from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';

// --- Color Conversion Helpers ---

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

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
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
    v: Math.round(v * 100),
  };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
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

// Color blindness simulations
function simulateColorBlindness(r: number, g: number, b: number, type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'): { r: number; g: number; b: number } {
  let nr = r, ng = g, nb = b;
  if (type === 'protanopia') {
    nr = 0.56667 * r + 0.43333 * g;
    ng = 0.55833 * r + 0.44167 * g;
    nb = 0.24167 * g + 0.75833 * b;
  } else if (type === 'deuteranopia') {
    nr = 0.625 * r + 0.375 * g;
    ng = 0.7 * r + 0.3 * g;
    nb = 0.3 * g + 0.7 * b;
  } else if (type === 'tritanopia') {
    nr = 0.95 * r + 0.05 * g;
    ng = 0.43333 * g + 0.56667 * b;
    nb = 0.475 * g + 0.525 * b;
  } else if (type === 'achromatopsia') {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    nr = gray;
    ng = gray;
    nb = gray;
  }
  return {
    r: Math.round(Math.min(255, Math.max(0, nr))),
    g: Math.round(Math.min(255, Math.max(0, ng))),
    b: Math.round(Math.min(255, Math.max(0, nb))),
  };
}

const PRESET_PALETTES = [
  { name: 'Modern Crimson', colors: ['#E11D48', '#BE123C', '#9F1239', '#881337', '#4C0519'] },
  { name: 'Cyber Neon', colors: ['#00FF66', '#00F0FF', '#BD00FF', '#FF0055', '#FFE600'] },
  { name: 'Emerald Forest', colors: ['#064E3B', '#047857', '#10B981', '#34D399', '#A7F3D0'] },
  { name: 'Ocean Sunset', colors: ['#0F172A', '#1E3A8A', '#2563EB', '#F59E0B', '#EF4444'] },
  { name: 'Pastel Dream', colors: ['#FBCFE8', '#DDD6FE', '#BAE6FD', '#A7F3D0', '#FEF08A'] },
];

export default function AdvancedColorPickerPage() {
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

  const [activeTab, setActiveTab] = useState<'studio' | 'palette' | 'extractor' | 'gradient' | 'vision'>('studio');

  // Core color state: Hue (0-360), Saturation (0-100), Value (0-100), Alpha (0-100)
  const [hue, setHue] = useState<number>(347);
  const [sat, setSat] = useState<number>(87);
  const [val, setVal] = useState<number>(88);
  const [alpha, setAlpha] = useState<number>(100);

  const [hexInput, setHexInput] = useState<string>('#E11D48');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [hasEyeDropper, setHasEyeDropper] = useState<boolean>(false);

  // Palette generator states
  const [paletteColors, setPaletteColors] = useState<Array<{ hex: string; locked: boolean }>>([
    { hex: '#E11D48', locked: false },
    { hex: '#FB7185', locked: false },
    { hex: '#1E293B', locked: false },
    { hex: '#3B82F6', locked: false },
    { hex: '#F59E0B', locked: false },
  ]);
  const [harmonyRule, setHarmonyRule] = useState<'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'split'>('analogous');

  // Image color extraction states
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gradient states
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');
  const [gradAngle, setGradAngle] = useState<number>(90);
  const [gradColor1, setGradColor1] = useState<string>('#E11D48');
  const [gradColor2, setGradColor2] = useState<string>('#4F46E5');

  // 2D Sat/Val canvas ref
  const satValCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingSatVal = useRef<boolean>(false);

  useEffect(() => {
    recordToolUsage('color-picker');
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      setHasEyeDropper(true);
    }
  }, []);

  // Compute RGB, HEX, HSL, CMYK from HSV
  const rgb = useMemo(() => hsvToRgb(hue, sat, val), [hue, sat, val]);
  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);
  const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);
  const cmyk = useMemo(() => rgbToCmyk(rgb.r, rgb.g, rgb.b), [rgb]);

  // Sync hexInput when HSV changes
  useEffect(() => {
    setHexInput(hex);
  }, [hex]);

  // Draw 2D Sat/Val canvas
  const drawSatValCanvas = useCallback(() => {
    const canvas = satValCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Base color of the hue
    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
    ctx.fillRect(0, 0, width, height);

    // Horizontal gradient: white to transparent
    const whiteGrad = ctx.createLinearGradient(0, 0, width, 0);
    whiteGrad.addColorStop(0, '#FFFFFF');
    whiteGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = whiteGrad;
    ctx.fillRect(0, 0, width, height);

    // Vertical gradient: transparent to black
    const blackGrad = ctx.createLinearGradient(0, 0, 0, height);
    blackGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    blackGrad.addColorStop(1, '#000000');
    ctx.fillStyle = blackGrad;
    ctx.fillRect(0, 0, width, height);

    // Draw picker indicator handle
    const handleX = (sat / 100) * width;
    const handleY = (1 - val / 100) * height;

    ctx.beginPath();
    ctx.arc(handleX, handleY, 7, 0, 2 * Math.PI);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [hue, sat, val]);

  useEffect(() => {
    drawSatValCanvas();
  }, [drawSatValCanvas]);

  const updateSatValFromEvent = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent) => {
    const canvas = satValCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const newSat = Math.round((x / rect.width) * 100);
    const newVal = Math.round((1 - y / rect.height) * 100);

    setSat(newSat);
    setVal(newVal);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingSatVal.current = true;
    updateSatValFromEvent(e);

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDraggingSatVal.current) {
        updateSatValFromEvent(moveEvent);
      }
    };

    const onMouseUp = () => {
      isDraggingSatVal.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Contrast ratios
  const contrastWhite = useMemo(() => getContrastRatio(rgb, { r: 255, g: 255, b: 255 }), [rgb]);
  const contrastBlack = useMemo(() => getContrastRatio(rgb, { r: 0, g: 0, b: 0 }), [rgb]);
  const isLight = useMemo(() => hsl.l > 60, [hsl.l]);

  // Color shades scale (50-950)
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

  const copyValue = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Apply a hex color from any source
  const applyHex = (newHex: string) => {
    const parsed = hexToRgb(newHex);
    if (parsed) {
      const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      setHue(hsv.h);
      setSat(hsv.s);
      setVal(hsv.v);
      setHexInput(newHex.toUpperCase());
    }
  };

  // Eyedropper API
  const handleEyedropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          applyHex(result.sRGBHex);
        }
      } catch (err) {
        // Canceled
      }
    }
  };

  // Randomize Palette generator
  const randomizePalette = () => {
    setPaletteColors((prev) =>
      prev.map((item) => {
        if (item.locked) return item;
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return { hex: rgbToHex(r, g, b), locked: false };
      })
    );
  };

  const toggleLockPalette = (index: number) => {
    setPaletteColors((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, locked: !item.locked } : item))
    );
  };

  // Image color extraction
  const handleImageUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);

        const imgData = ctx.getImageData(0, 0, 100, 100).data;
        const colorCounts: Record<string, number> = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = Math.round(imgData[i] / 32) * 32;
          const g = Math.round(imgData[i + 1] / 32) * 32;
          const b = Math.round(imgData[i + 2] / 32) * 32;
          const hex = rgbToHex(r, g, b);
          colorCounts[hex] = (colorCounts[hex] || 0) + 1;
        }

        const sorted = Object.entries(colorCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([hex]) => hex);

        setExtractedColors(sorted);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Gradient CSS string
  const gradientCss = useMemo(() => {
    if (gradType === 'linear') {
      return `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`;
    }
    return `radial-gradient(circle, ${gradColor1}, ${gradColor2})`;
  }, [gradType, gradAngle, gradColor1, gradColor2]);

  return (
    <ToolPageShell tool={tool}>
      {/* Top Mode Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 lt-fade-up">
        <button
          type="button"
          onClick={() => setActiveTab('studio')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'studio'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="h-4 w-4" /> Color Studio & 2D Canvas
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('palette')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'palette'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Palette className="h-4 w-4" /> 5-Color Palette Studio
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('extractor')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'extractor'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4" /> Extract from Photo
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gradient')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gradient'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Compass className="h-4 w-4" /> Gradient Generator
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vision')}
          className={`px-4 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'vision'
              ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] shadow-xs'
              : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Eye className="h-4 w-4" /> Color Blindness Vision
          </span>
        </button>
      </div>

      {/* --- TAB 1: STUDIO (2D Canvas, Sliders, Formats & Scale) --- */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lt-fade-up">
          {/* Left Column: 2D Sat/Val Canvas, Hue & Alpha sliders, Quick Swatches */}
          <div className="lg:col-span-5 space-y-6">
            <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[rgb(var(--lt-text))] flex items-center gap-2">
                  <Palette className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
                  2D Saturation / Value Picker
                </h2>

                {hasEyeDropper && (
                  <button
                    type="button"
                    onClick={handleEyedropper}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] border border-[rgb(var(--lt-border))] cursor-pointer transition-transform hover:scale-105"
                  >
                    <Pipette className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" /> Eyedropper
                  </button>
                )}
              </div>

              {/* 2D Canvas */}
              <div className="relative rounded-2xl overflow-hidden shadow-inner border border-black/10 cursor-crosshair">
                <canvas
                  ref={satValCanvasRef}
                  width={340}
                  height={200}
                  onMouseDown={handleMouseDown}
                  className="w-full h-48 block"
                />
              </div>

              {/* Hue Rainbow Slider (0-360) */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[rgb(var(--lt-text))]">
                  <span>Hue</span>
                  <span className="font-mono text-[rgb(var(--lt-text-muted))]">{hue}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background:
                      'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                  }}
                />
              </div>

              {/* Alpha / Opacity Slider (0-100%) */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-[rgb(var(--lt-text))]">
                  <span>Opacity (Alpha)</span>
                  <span className="font-mono text-[rgb(var(--lt-text-muted))]">{alpha}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={alpha}
                  onChange={(e) => setAlpha(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
                  style={{
                    backgroundImage: `linear-gradient(to right, transparent, ${hex})`,
                  }}
                />
              </div>

              {/* Live Preview Bar */}
              <div className="mt-5 p-3 rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-12 rounded-xl border border-black/10 shadow-xs"
                    style={{ backgroundColor: hex, opacity: alpha / 100 }}
                  />
                  <div>
                    <input
                      type="text"
                      value={hexInput}
                      onChange={(e) => {
                        setHexInput(e.target.value);
                        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                          applyHex(e.target.value);
                        }
                      }}
                      className="text-sm font-mono font-bold bg-transparent outline-none w-24 uppercase text-[rgb(var(--lt-text))]"
                    />
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))] block">
                      HSV({hue}°, {sat}%, {val}%)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyValue(hex, 'previewHex')}
                  className="p-2 rounded-xl hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
                >
                  {copiedKey === 'previewHex' ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Quick Swatches */}
              <div className="mt-6 space-y-2.5">
                <label className="text-xs font-semibold text-[rgb(var(--lt-text))] block">Quick Swatches</label>
                <div className="grid grid-cols-8 gap-2">
                  {['#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => applyHex(c)}
                      className="h-8 w-full rounded-xl border border-black/10 transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: All Color Formats, WCAG Contrast & UI Preview */}
          <div className="lg:col-span-7 space-y-6">
            {/* Color Formats */}
            <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
              <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-[rgb(var(--lt-primary))]" /> Color Codes & Formats
                </span>
                <span className="text-xs text-[rgb(var(--lt-text-muted))] font-normal">1-click copy</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* HEX */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">HEX</span>
                    <span className="text-xs font-mono font-bold text-[rgb(var(--lt-text))]">{hex}</span>
                  </div>
                  <button type="button" onClick={() => copyValue(hex, 'hex')} className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer">
                    {copiedKey === 'hex' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* RGB / RGBA */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">RGBA</span>
                    <span className="text-xs font-mono font-bold text-[rgb(var(--lt-text))]">
                      rgba({rgb.r}, {rgb.g}, {rgb.b}, {alpha / 100})
                    </span>
                  </div>
                  <button type="button" onClick={() => copyValue(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha / 100})`, 'rgba')} className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer">
                    {copiedKey === 'rgba' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* HSL */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">HSL</span>
                    <span className="text-xs font-mono font-bold text-[rgb(var(--lt-text))]">
                      hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                    </span>
                  </div>
                  <button type="button" onClick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')} className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer">
                    {copiedKey === 'hsl' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* CMYK */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">CMYK</span>
                    <span className="text-xs font-mono font-bold text-[rgb(var(--lt-text))]">
                      cmyk({cmyk.c}%, {cmyk.m}%, {cmyk.y}%, {cmyk.k}%)
                    </span>
                  </div>
                  <button type="button" onClick={() => copyValue(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`, 'cmyk')} className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer">
                    {copiedKey === 'cmyk' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* CSS Variable */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">CSS Variable</span>
                    <span className="text-xs font-mono font-bold text-[rgb(var(--lt-text))]">--color-primary: {hex};</span>
                  </div>
                  <button type="button" onClick={() => copyValue(`--color-primary: ${hex};`, 'cssVar')} className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer">
                    {copiedKey === 'cssVar' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Tailwind Config */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] block">Tailwind Config</span>
                    <span className="text-xs font-mono font-bold text-[rgb(var(--lt-text))]">'brand': '{hex}'</span>
                  </div>
                  <button type="button" onClick={() => copyValue(`'brand': '${hex}'`, 'twConfig')} className="p-1.5 rounded-lg hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] cursor-pointer">
                    {copiedKey === 'twConfig' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live UI Component Mockups */}
            <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
              <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-3 flex items-center gap-2">
                <Eye className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
                Live UI Component Testing
              </h2>
              <p className="text-xs text-[rgb(var(--lt-text-muted))] mb-4">
                Preview how your chosen color renders on buttons, badges, and cards with automated text contrast.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Button & Badge */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 space-y-3">
                  <span className="text-xs font-semibold text-[rgb(var(--lt-text-muted))] block">Buttons & Badges</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-105"
                      style={{
                        backgroundColor: hex,
                        color: isLight ? '#0F172A' : '#FFFFFF',
                      }}
                    >
                      Primary Action
                    </button>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-bold shadow-xs"
                      style={{
                        backgroundColor: `${hex}25`,
                        color: hex,
                      }}
                    >
                      Active Status
                    </span>
                  </div>
                </div>

                {/* Card Banner */}
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-[rgb(var(--lt-text-muted))] block">Card Accent</span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-10 w-1.5 rounded-full" style={{ backgroundColor: hex }} />
                    <div>
                      <h4 className="text-xs font-bold text-[rgb(var(--lt-text))]">Clean Typography</h4>
                      <p className="text-[11px] text-[rgb(var(--lt-text-muted))]">Subtext looks balanced with accent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tailwind 10-Shade Scale */}
            <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
              <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1 flex items-center gap-2">
                <Layers className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
                Tailwind 10-Shade Color Ramp
              </h2>
              <p className="text-xs text-[rgb(var(--lt-text-muted))] mb-4">Click any shade to apply.</p>

              <div className="grid grid-cols-11 gap-1.5">
                {shades.map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => applyHex(s.hex)}
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
          </div>
        </div>
      )}

      {/* --- TAB 2: 5-COLOR PALETTE STUDIO --- */}
      {activeTab === 'palette' && (
        <div className="space-y-6 lt-fade-up">
          <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-bold text-[rgb(var(--lt-text))] flex items-center gap-2">
                  <Palette className="h-5 w-5 text-[rgb(var(--lt-primary))]" /> 5-Color Harmonic Palette
                </h2>
                <p className="text-xs text-[rgb(var(--lt-text-muted))] mt-0.5">
                  Roll the dice to generate new harmonious palettes. Lock colors you love.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={randomizePalette}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95 active:scale-95"
                >
                  <Dice5 className="h-4 w-4" /> Roll Random
                </button>
              </div>
            </div>

            {/* 5 Swatches Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 h-80">
              {paletteColors.map((color, idx) => {
                const colRgb = hexToRgb(color.hex) || { r: 0, g: 0, b: 0 };
                const isColLight = rgbToHsl(colRgb.r, colRgb.g, colRgb.b).l > 60;
                return (
                  <div
                    key={idx}
                    className="rounded-3xl shadow-md flex flex-col justify-between p-4 transition-all duration-300 relative group overflow-hidden"
                    style={{ backgroundColor: color.hex }}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleLockPalette(idx)}
                        className="p-2 rounded-full backdrop-blur-md cursor-pointer transition-transform hover:scale-110"
                        style={{
                          backgroundColor: isColLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                          color: isColLight ? '#000000' : '#FFFFFF',
                        }}
                      >
                        {color.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4 opacity-70" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => copyValue(color.hex, `palette-${idx}`)}
                        className="p-2 rounded-full backdrop-blur-md cursor-pointer transition-transform hover:scale-110"
                        style={{
                          backgroundColor: isColLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)',
                          color: isColLight ? '#000000' : '#FFFFFF',
                        }}
                      >
                        {copiedKey === `palette-${idx}` ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="text-center">
                      <span
                        className="text-sm font-mono font-bold block"
                        style={{ color: isColLight ? '#000000' : '#FFFFFF' }}
                      >
                        {color.hex}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          applyHex(color.hex);
                          setActiveTab('studio');
                        }}
                        className="mt-2 px-2.5 py-1 rounded-lg text-[10px] font-bold backdrop-blur-md cursor-pointer transition-opacity hover:opacity-100 opacity-80"
                        style={{
                          backgroundColor: isColLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)',
                          color: isColLight ? '#000000' : '#FFFFFF',
                        }}
                      >
                        Inspect in Studio
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Presets Row */}
            <div className="mt-8 pt-6 border-t border-[rgb(var(--lt-border))]">
              <span className="text-xs font-semibold text-[rgb(var(--lt-text))] block mb-3">Curated Themes</span>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {PRESET_PALETTES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setPaletteColors(preset.colors.map((c) => ({ hex: c, locked: false })))
                    }
                    className="p-3 rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:border-[rgb(var(--lt-primary))] text-left cursor-pointer transition-all active:scale-95"
                  >
                    <div className="flex h-6 rounded-lg overflow-hidden mb-2">
                      {preset.colors.map((c) => (
                        <div key={c} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[rgb(var(--lt-text))] truncate block">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: EXTRACT FROM IMAGE --- */}
      {activeTab === 'extractor' && (
        <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] max-w-3xl mx-auto space-y-6 lt-fade-up">
          <div className="text-center">
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] flex items-center justify-center gap-2">
              <ImageIcon className="h-5 w-5 text-[rgb(var(--lt-primary))]" /> Image Color Palette Extractor
            </h2>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] mt-1">
              Upload any photo, illustration, or UI mockup to extract its dominant color palette client-side.
            </p>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer border-[rgb(var(--lt-border))] hover:border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-surface-2))] transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
              className="hidden"
            />
            <Upload className="h-10 w-10 text-[rgb(var(--lt-primary))] mx-auto mb-3 opacity-80" />
            <h3 className="text-sm font-bold text-[rgb(var(--lt-text))]">
              {imagePreview ? 'Click to upload a different image' : 'Click to select or drop an image here'}
            </h3>
            <p className="text-[11px] text-[rgb(var(--lt-text-muted))] mt-1">PNG, JPG, WebP supported</p>
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <div className="max-h-64 rounded-2xl overflow-hidden border border-[rgb(var(--lt-border))] shadow-xs flex items-center justify-center bg-black/5">
                <img src={imagePreview} alt="Uploaded" className="max-h-64 object-contain" />
              </div>

              {extractedColors.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[rgb(var(--lt-text))] block">
                    Extracted Palette (Click color to inspect)
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {extractedColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          applyHex(c);
                          setActiveTab('studio');
                        }}
                        className="group flex flex-col items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                      >
                        <div
                          className="h-12 w-full rounded-xl border border-black/10 shadow-xs"
                          style={{ backgroundColor: c }}
                        />
                        <span className="text-[10px] font-mono text-[rgb(var(--lt-text-muted))] group-hover:text-[rgb(var(--lt-text))]">
                          {c}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: GRADIENT GENERATOR --- */}
      {activeTab === 'gradient' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lt-fade-up">
          <div className="lg:col-span-5 space-y-6">
            <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
              <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center gap-2">
                <Compass className="h-4 w-4 text-[rgb(var(--lt-primary))]" /> Gradient Controls
              </h2>

              <div className="space-y-4">
                {/* Gradient Type */}
                <div>
                  <label className="text-xs font-semibold text-[rgb(var(--lt-text))] block mb-1.5">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGradType('linear')}
                      className={`py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        gradType === 'linear'
                          ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]'
                          : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                      }`}
                    >
                      Linear Gradient
                    </button>
                    <button
                      type="button"
                      onClick={() => setGradType('radial')}
                      className={`py-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        gradType === 'radial'
                          ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]'
                          : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                      }`}
                    >
                      Radial Gradient
                    </button>
                  </div>
                </div>

                {/* Angle (Linear only) */}
                {gradType === 'linear' && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                      <span>Angle</span>
                      <span className="font-mono text-[rgb(var(--lt-text-muted))]">{gradAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradAngle}
                      onChange={(e) => setGradAngle(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg bg-[rgb(var(--lt-surface-2))] accent-[rgb(var(--lt-primary))] cursor-pointer"
                    />
                  </div>
                )}

                {/* Color Stops */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-[rgb(var(--lt-text))] block mb-1.5">Start Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradColor1}
                        onChange={(e) => setGradColor1(e.target.value.toUpperCase())}
                        className="h-9 w-10 rounded-xl cursor-pointer bg-transparent border border-[rgb(var(--lt-border))]"
                      />
                      <input
                        type="text"
                        value={gradColor1}
                        onChange={(e) => setGradColor1(e.target.value.toUpperCase())}
                        className="lt-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[rgb(var(--lt-text))] block mb-1.5">End Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={gradColor2}
                        onChange={(e) => setGradColor2(e.target.value.toUpperCase())}
                        className="h-9 w-10 rounded-xl cursor-pointer bg-transparent border border-[rgb(var(--lt-border))]"
                      />
                      <input
                        type="text"
                        value={gradColor2}
                        onChange={(e) => setGradColor2(e.target.value.toUpperCase())}
                        className="lt-input text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
              <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center justify-between">
                <span>Gradient Preview</span>
                <button
                  type="button"
                  onClick={() => copyValue(`background: ${gradientCss};`, 'gradCss')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-xs font-bold border border-[rgb(var(--lt-border))] cursor-pointer transition-colors"
                >
                  {copiedKey === 'gradCss' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === 'gradCss' ? 'Copied CSS!' : 'Copy CSS'}
                </button>
              </h2>

              <div
                className="h-64 rounded-2xl shadow-inner border border-black/10 flex items-center justify-center p-6 text-center transition-all"
                style={{ background: gradientCss }}
              >
                <div className="p-4 rounded-2xl backdrop-blur-md bg-white/20 dark:bg-black/30 text-white font-bold text-sm shadow-md border border-white/20">
                  {gradientCss}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: COLOR BLINDNESS VISION SIMULATOR --- */}
      {activeTab === 'vision' && (
        <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] space-y-6 lt-fade-up">
          <div>
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] flex items-center gap-2">
              <Eye className="h-5 w-5 text-[rgb(var(--lt-primary))]" /> Color Vision Deficiency Simulator
            </h2>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] mt-1">
              Verify how your current color ({hex}) appears to individuals with different types of color vision deficiencies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Normal Vision */}
            <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 text-center space-y-3">
              <div className="h-20 rounded-xl shadow-xs border border-black/10" style={{ backgroundColor: hex }} />
              <div>
                <h4 className="text-xs font-bold text-[rgb(var(--lt-text))]">Normal Vision</h4>
                <span className="text-[11px] font-mono text-[rgb(var(--lt-text-muted))]">{hex}</span>
              </div>
            </div>

            {/* Protanopia (Red-Blind) */}
            {(() => {
              const sim = simulateColorBlindness(rgb.r, rgb.g, rgb.b, 'protanopia');
              const simHex = rgbToHex(sim.r, sim.g, sim.b);
              return (
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 text-center space-y-3">
                  <div className="h-20 rounded-xl shadow-xs border border-black/10" style={{ backgroundColor: simHex }} />
                  <div>
                    <h4 className="text-xs font-bold text-[rgb(var(--lt-text))]">Protanopia</h4>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))] block">Red-blind (~1% males)</span>
                    <span className="text-[11px] font-mono text-[rgb(var(--lt-text-muted))]">{simHex}</span>
                  </div>
                </div>
              );
            })()}

            {/* Deuteranopia (Green-Blind) */}
            {(() => {
              const sim = simulateColorBlindness(rgb.r, rgb.g, rgb.b, 'deuteranopia');
              const simHex = rgbToHex(sim.r, sim.g, sim.b);
              return (
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 text-center space-y-3">
                  <div className="h-20 rounded-xl shadow-xs border border-black/10" style={{ backgroundColor: simHex }} />
                  <div>
                    <h4 className="text-xs font-bold text-[rgb(var(--lt-text))]">Deuteranopia</h4>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))] block">Green-blind (~5% males)</span>
                    <span className="text-[11px] font-mono text-[rgb(var(--lt-text-muted))]">{simHex}</span>
                  </div>
                </div>
              );
            })()}

            {/* Tritanopia (Blue-Blind) */}
            {(() => {
              const sim = simulateColorBlindness(rgb.r, rgb.g, rgb.b, 'tritanopia');
              const simHex = rgbToHex(sim.r, sim.g, sim.b);
              return (
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 text-center space-y-3">
                  <div className="h-20 rounded-xl shadow-xs border border-black/10" style={{ backgroundColor: simHex }} />
                  <div>
                    <h4 className="text-xs font-bold text-[rgb(var(--lt-text))]">Tritanopia</h4>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))] block">Blue-blind (Rare)</span>
                    <span className="text-[11px] font-mono text-[rgb(var(--lt-text-muted))]">{simHex}</span>
                  </div>
                </div>
              );
            })()}

            {/* Achromatopsia (Monochromacy / Grayscale) */}
            {(() => {
              const sim = simulateColorBlindness(rgb.r, rgb.g, rgb.b, 'achromatopsia');
              const simHex = rgbToHex(sim.r, sim.g, sim.b);
              return (
                <div className="rounded-2xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 text-center space-y-3">
                  <div className="h-20 rounded-xl shadow-xs border border-black/10" style={{ backgroundColor: simHex }} />
                  <div>
                    <h4 className="text-xs font-bold text-[rgb(var(--lt-text))]">Achromatopsia</h4>
                    <span className="text-[10px] text-[rgb(var(--lt-text-muted))] block">Total Colorblind (0.003%)</span>
                    <span className="text-[11px] font-mono text-[rgb(var(--lt-text-muted))]">{simHex}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </ToolPageShell>
  );
}
