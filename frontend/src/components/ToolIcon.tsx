import React from 'react';
import { type LucideIcon } from 'lucide-react';
import {
  // ── Photo & Creative ───────────────────────────────────────────────
  ScanFace,           // Passport Photo Maker — biometric face scan
  Eraser,             // AI Background Remover — erases background

  // ── Image Processing ───────────────────────────────────────────────
  Expand,             // Image Resizer — expanding dimensions
  Gauge,              // Image Compressor — quality gauge

  // ── PDF – Organize ─────────────────────────────────────────────────
  LayoutGrid,         // PDF Page Organizer — grid of pages
  Combine,            // PDF Merger — combining files
  ScissorsLineDashed, // PDF Splitter — cutting along dashed line
  FileX,              // Delete Pages — file with X
  BookMarked,         // Extract Pages — bookmarked page
  ListOrdered,        // Reorder Pages — numbered sequence

  // ── PDF – Compress ─────────────────────────────────────────────────
  PackageMinus,       // PDF Compressor — shrinking a package

  // ── PDF – Convert (PDF → Image) ────────────────────────────────────
  ImageDown,          // PDF→JPG / PDF→PNG — image downloading from PDF
  Zap,                // PDF→WebP — fast/modern next-gen format

  // ── PDF – Convert (Image → PDF) ────────────────────────────────────
  ImagePlus,          // JPG→PDF / PNG→PDF — image being added to PDF
  GalleryHorizontalEnd, // Images→PDF — gallery into document

  // ── Developer & Utilities ──────────────────────────────────────────
  QrCode,             // QR Code Generator
  Braces,             // JSON Formatter — curly braces = JSON
  Binary,             // Base64 Converter — binary encoding
  Pipette,            // Color Picker — eyedropper tool
  AlignLeft,          // Word Counter — lines of text

  // ── Suite icons ────────────────────────────────────────────────────
  FileText,           // PDF suite
  Sparkles,           // Creative suite / AI
  Code2,              // Developer suite

  // ── Fallbacks / legacy ─────────────────────────────────────────────
  Camera,
  Scissors,
  Volume2,
  Wrench,
  Repeat,
  FileType,
  Image,
  FileImage,
  FilePlus2,
  FileMinus,
  FileSymlink,
  FileOutput,
  Layers,
  Files,
  Scaling,
  Sliders,
  Palette,
  Type,
  Minimize2,
  ArrowDownUp,
  Download,
} from 'lucide-react';

/**
 * Unified icon registry — single source of truth for tool icons
 * across the Home page (ToolCard) and the Products page cards.
 *
 * ─── Icon decisions ───────────────────────────────────────────────────
 *  ScanFace           → Passport Photo Maker (biometric face recognition)
 *  Eraser             → AI Background Remover (AI erases background pixels)
 *  Expand             → Image Resizer (scale up/down dimensions)
 *  Gauge              → Image Compressor (quality control dial)
 *  LayoutGrid         → PDF Organizer (grid of page thumbnails)
 *  Combine            → PDF Merger (combining multiple files)
 *  ScissorsLineDashed → PDF Splitter (cutting along dashed lines)
 *  FileX              → Delete Pages (file with deletion mark)
 *  BookMarked         → Extract Pages (bookmarked specific pages)
 *  ListOrdered        → Reorder Pages (numbered ordered list)
 *  PackageMinus       → PDF Compressor (shrinking package)
 *  ImageDown          → PDF→Image (image downloading from PDF)
 *  Zap                → PDF→WebP (next-gen fast format)
 *  ImagePlus          → Image→PDF (adding image to create PDF)
 *  GalleryHorizontalEnd → Images→PDF (gallery of images)
 *  QrCode             → QR Code Generator (perfect match)
 *  Braces             → JSON Formatter (curly braces = JSON)
 *  Binary             → Base64 Converter (binary encoding)
 *  Pipette            → Color Picker (eyedropper tool)
 *  AlignLeft          → Word Counter (aligned text lines)
 * ──────────────────────────────────────────────────────────────────────
 */
const iconMap: Record<string, LucideIcon> = {
  // ── Photo & Creative ───────────────────────────────────────────────
  ScanFace,
  Eraser,

  // ── Image Processing ───────────────────────────────────────────────
  Expand,
  Gauge,

  // ── PDF – Organize ─────────────────────────────────────────────────
  LayoutGrid,
  Combine,
  ScissorsLineDashed,
  FileX,
  BookMarked,
  ListOrdered,

  // ── PDF – Compress ─────────────────────────────────────────────────
  PackageMinus,

  // ── PDF – Convert ──────────────────────────────────────────────────
  ImageDown,
  Zap,
  ImagePlus,
  GalleryHorizontalEnd,

  // ── Developer & Utilities ──────────────────────────────────────────
  QrCode,
  Braces,
  Binary,
  Pipette,
  AlignLeft,

  // ── Suite icons ────────────────────────────────────────────────────
  FileText,
  Sparkles,
  Code2,
  Download,

  // ── Fallbacks / legacy ─────────────────────────────────────────────
  Camera,
  Scissors,
  Volume2,
  Wrench,
  Repeat,
  FileType,
  Image,
  FileImage,
  FilePlus2,
  FileMinus,
  FileSymlink,
  FileOutput,
  Layers,
  Files,
  Scaling,
  Sliders,
  Palette,
  Type,
  Minimize2,
  ArrowDownUp,
};

export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Sparkles;
  return <Icon className={className} />;
}

export default ToolIcon;
