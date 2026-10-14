/**
 * LutaTech Products & App Suites Registry
 *
 * 100% COMPLETE & LIVE:
 * - Every single item listed is fully implemented, working, and ready.
 * - Zero "coming soon" or unfinished placeholders to give the user a complete, authoritative experience.
 *
 * EXTENSIBLE ARCHITECTURE:
 * - Whenever you build a new tool/app, simply add one line here.
 * - It will automatically appear across the Navbar, Mega-Menu, 9-Dot App Launcher,
 *   Search, and Products Directory without touching layout code.
 */

export interface ProductItem {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  href: string;
  badge?: 'Popular' | 'New' | 'Pro' | 'AI';
  icon: string;
}

export interface ProductCategoryGroup {
  id: string;
  title: string;
  items: ProductItem[];
}

export interface ProductSuite {
  id: 'pdf' | 'creative' | 'utilities';
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  accentBg: string;
  flagshipApp: ProductItem;
  groups: ProductCategoryGroup[];
}

export const PRODUCT_SUITES: ProductSuite[] = [
  // 1. PDF & DOCUMENT CLOUD
  {
    id: 'pdf',
    name: 'PDF & Documents',
    shortName: 'PDF & Docs',
    tagline: 'Merge, split, organize, compress, and convert PDF documents in your browser.',
    description: 'Complete browser-based PDF suite. 100% client-side privacy, zero file uploads.',
    icon: 'FileText',
    color: '#EB1000',
    accentBg: 'bg-red-500/10 text-red-600 dark:text-red-400',
    flagshipApp: {
      id: 'pdf-organizer',
      name: 'PDF Page Organizer',
      shortName: 'PDF Organizer',
      description: 'Visually rearrange, delete, rotate, and sort PDF pages with live previews.',
      href: '/tools/pdf-organizer/',
      badge: 'Pro',
      icon: 'LayoutGrid',
    },
    groups: [
      {
        id: 'organize-pdf',
        title: 'Organize PDF',
        items: [
          { id: 'lutapdf-desktop', name: 'LutaPDF Desktop', description: 'Native Windows, macOS & Linux desktop application.', href: '/download/', badge: 'New', icon: 'Download' },
          { id: 'pdf-merger', name: 'Merge PDF', description: 'Combine multiple PDF files into one.', href: '/tools/pdf-merger/', badge: 'Popular', icon: 'Combine' },
          { id: 'pdf-splitter', name: 'Split PDF', description: 'Separate PDF pages into individual files.', href: '/tools/pdf-splitter/', icon: 'ScissorsLineDashed' },
          { id: 'pdf-organizer', name: 'Page Organizer', description: 'Visually rearrange and sort pages.', href: '/tools/pdf-organizer/', badge: 'Pro', icon: 'LayoutGrid' },
          { id: 'pdf-delete-pages', name: 'Delete Pages', description: 'Remove unwanted pages from PDF.', href: '/tools/pdf-delete-pages/', icon: 'FileX' },
          { id: 'pdf-extract-pages', name: 'Extract Pages', description: 'Extract specific pages into a new document.', href: '/tools/pdf-extract-pages/', icon: 'BookMarked' },
          { id: 'pdf-reorder-pages', name: 'Reorder Pages', description: 'Drag-and-drop page sequence adjustment.', href: '/tools/pdf-reorder-pages/', icon: 'ListOrdered' },
        ],
      },
      {
        id: 'convert-pdf',
        title: 'Convert PDF',
        items: [
          { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert JPEG photos into PDF.', href: '/tools/jpg-to-pdf/', icon: 'ImagePlus' },
          { id: 'png-to-pdf', name: 'PNG to PDF', description: 'Convert PNG graphics to PDF.', href: '/tools/png-to-pdf/', icon: 'ImagePlus' },
          { id: 'images-to-pdf', name: 'Images to PDF', description: 'Batch combine mixed images into PDF.', href: '/tools/images-to-pdf/', badge: 'Popular', icon: 'GalleryHorizontalEnd' },
          { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Export PDF pages as crisp JPGs.', href: '/tools/pdf-to-jpg/', icon: 'ImageDown' },
          { id: 'pdf-to-png', name: 'PDF to PNG', description: 'Extract transparent lossless PNGs.', href: '/tools/pdf-to-png/', icon: 'ImageDown' },
          { id: 'pdf-to-webp', name: 'PDF to WebP', description: 'Modern high-compression web images.', href: '/tools/pdf-to-webp/', icon: 'Zap' },
        ],
      },
      {
        id: 'optimize-pdf',
        title: 'Optimize PDF',
        items: [
          { id: 'pdf-compressor', name: 'PDF Compressor', description: 'Reduce PDF file sizes with smart presets.', href: '/tools/pdf-compressor/', badge: 'Popular', icon: 'PackageMinus' },
        ],
      },
    ],
  },

  // 2. CREATIVE & PHOTO SUITE
  {
    id: 'creative',
    name: 'Photo & Creative Studio',
    shortName: 'Photo & Design',
    tagline: 'AI-powered biometric photo creation, background cutout, and image optimization.',
    description: 'Instant creative intelligence running right in your web browser with client-side AI.',
    icon: 'Sparkles',
    color: '#8B5CF6',
    accentBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    flagshipApp: {
      id: 'passport',
      name: 'Passport Photo Studio',
      shortName: 'Passport Maker',
      description: 'Official biometric passport and visa photo maker for 50+ country standards with smart alignment.',
      href: '/tools/passport/',
      badge: 'Popular',
      icon: 'Camera',
    },
    groups: [
      {
        id: 'ai-creative',
        title: 'AI Photo Tools',
        items: [
          { id: 'passport-tool', name: 'Passport Photo Maker', description: 'Create official compliant passport & visa photos online.', href: '/tools/passport/', badge: 'Popular', icon: 'ScanFace' },
          { id: 'remove-bg', name: 'AI Background Remover', description: 'Erase photo backgrounds automatically with AI.', href: '/tools/remove-bg/', badge: 'AI', icon: 'Eraser' },
        ],
      },
      {
        id: 'image-utilities',
        title: 'Image Processing',
        items: [
          { id: 'image-resizer', name: 'Image Resizer', description: 'Scale images by pixels or percentage.', href: '/tools/image-resizer/', icon: 'Expand' },
          { id: 'image-compressor', name: 'Image Compressor', description: 'Lossless & lossy image optimizer for web.', href: '/tools/image-compressor/', badge: 'Popular', icon: 'Gauge' },
        ],
      },
    ],
  },

  // 3. DEVELOPER & WEB UTILITIES
  {
    id: 'utilities',
    name: 'Developer & Web Utilities',
    shortName: 'Utilities',
    tagline: 'Instant developer workflows, formatting, and precision web utilities.',
    description: 'Lightweight, offline-capable productivity utilities crafted for developers and creators.',
    icon: 'Code2',
    color: '#10B981',
    accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    flagshipApp: {
      id: 'qr-generator',
      name: 'QR Code Studio',
      shortName: 'QR Studio',
      description: 'Custom branded QR code generator with logo embed, color styling, and high-DPI SVG export.',
      href: '/tools/qr-code-generator/',
      badge: 'Popular',
      icon: 'QrCode',
    },
    groups: [
      {
        id: 'dev-tools',
        title: 'Developer Tools',
        items: [
          { id: 'qr-code-generator', name: 'QR Code Generator', description: 'Create customizable QR codes for links, text, and WiFi.', href: '/tools/qr-code-generator/', badge: 'Popular', icon: 'QrCode' },
          { id: 'json-formatter', name: 'JSON Formatter', description: 'Prettify, inspect, validate, and minify JSON data.', href: '/tools/json-formatter/', icon: 'Braces' },
          { id: 'base64-converter', name: 'Base64 Converter', description: 'Convert text, images, and files to Base64 format.', href: '/tools/base64-converter/', icon: 'Binary' },
          { id: 'color-picker', name: 'Color Palette & Eyedropper', description: 'HEX, RGB, HSL converter with harmonious palettes.', href: '/tools/color-picker/', icon: 'Pipette' },
          { id: 'word-counter', name: 'Word & Text Analyzer', description: 'Count words, characters, sentences, and reading time.', href: '/tools/word-counter/', icon: 'AlignLeft' },
        ],
      },
    ],
  },
];

// Helper: All live products in flat list
export const ALL_PRODUCTS: ProductItem[] = PRODUCT_SUITES.flatMap((suite) => [
  suite.flagshipApp,
  ...suite.groups.flatMap((g) => g.items),
]).filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));

// Helper: Quick App Switcher list (9-dot waffle menu items - all 100% live)
export const LAUNCHER_APPS: ProductItem[] = [
  { id: 'passport', name: 'Passport Studio', description: 'Official Photo Maker', href: '/tools/passport/', badge: 'Popular', icon: 'ScanFace' },
  { id: 'remove-bg', name: 'AI Background', description: 'Instant Cutout', href: '/tools/remove-bg/', badge: 'AI', icon: 'Eraser' },
  { id: 'pdf-organizer', name: 'PDF Studio', description: 'Page Organizer', href: '/tools/pdf-organizer/', badge: 'Pro', icon: 'LayoutGrid' },
  { id: 'pdf-compressor', name: 'PDF Compressor', description: 'Smart Optimizer', href: '/tools/pdf-compressor/', icon: 'PackageMinus' },
  { id: 'pdf-merger', name: 'PDF Merger', description: 'Combine Multiple Files', href: '/tools/pdf-merger/', icon: 'Combine' },
  { id: 'image-resizer', name: 'Image Resizer', description: 'Batch Scaler', href: '/tools/image-resizer/', icon: 'Expand' },
  { id: 'image-compressor', name: 'Image Compressor', description: 'Lossless Shrink', href: '/tools/image-compressor/', icon: 'Gauge' },
  { id: 'qr-code-generator', name: 'QR Studio', description: 'Vector Branded Codes', href: '/tools/qr-code-generator/', icon: 'QrCode' },
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Validator & Tree', href: '/tools/json-formatter/', icon: 'Braces' },
];
