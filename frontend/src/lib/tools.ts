export type ToolCategory =
  | 'Image'
  | 'PDF'
  | 'Document'
  | 'Converter'
  | 'Productivity'
  | 'Utility'
  | 'Developer'
  | 'AI';

export interface Tool {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  longDescription: string;
  category: ToolCategory;
  icon: string;
  accent: string;
  status: 'live' | 'soon';
  popular?: boolean;
  href?: string;
}

export const categories: { name: ToolCategory; description: string; icon: string }[] = [
  { name: 'Image', description: 'Edit, enhance, and transform images with AI-powered tools.', icon: 'Image' },
  { name: 'PDF', description: 'Merge, split, compress, and convert PDF documents.', icon: 'FileText' },
  { name: 'Document', description: 'Create, edit, and manage text documents.', icon: 'FileType' },
  { name: 'Converter', description: 'Convert files between formats instantly.', icon: 'Repeat' },
  { name: 'Productivity', description: 'Tools to speed up your daily workflow.', icon: 'Zap' },
  { name: 'Utility', description: 'Handy utilities for everyday tasks.', icon: 'Wrench' },
  { name: 'Developer', description: 'Code, format, and debug with developer tools.', icon: 'Code2' },
  { name: 'AI', description: 'AI-powered tools for smarter output.', icon: 'Sparkles' },
];

export const tools: Tool[] = [
  {
    slug: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    shortName: 'Passport Photo',
    description: 'Create compliant passport photos in seconds. Crop, align, and adjust for any country standard.',
    longDescription:
      'Upload any photo and our Passport Photo Maker guides you through creating a perfectly compliant passport photo. Adjust crop position, background color, and export at the exact dimensions required by official standards.',
    category: 'Image',
    icon: 'Camera',
    accent: 'rose',
    status: 'live',
    popular: true,
    href: '/tools/passport',
  },
  {
    slug: 'background-remover',
    name: 'Background Remover',
    shortName: 'BG Remover',
    description: 'Remove image backgrounds instantly with AI. Get a clean transparent cutout in one click.',
    longDescription:
      'Powered by AI, the Background Remover detects the subject in your photo and erases the background automatically. No upload to a server — everything runs in your browser for speed and privacy.',
    category: 'Image',
    icon: 'Scissors',
    accent: 'sky',
    status: 'live',
    popular: true,
    href: '/tools/remove-bg',
  },
  {
    slug: 'pdf-merger',
    name: 'PDF Merger',
    shortName: 'PDF Merge',
    description: 'Combine multiple PDF files into one document in seconds.',
    longDescription: 'Merge multiple PDF files into a single document with drag-and-drop ease.',
    category: 'PDF',
    icon: 'Files',
    accent: 'rose',
    status: 'live',
    popular: true,
    href: '/tools/pdf-merger',
  },
  {
    slug: 'pdf-splitter',
    name: 'PDF Splitter',
    shortName: 'PDF Split',
    description: 'Split a PDF into individual pages or custom page ranges. 100% private, runs in-browser.',
    longDescription: 'Upload any PDF and split it by individual pages or define custom page ranges. Each split is downloaded as a separate PDF file — no upload to any server, completely private and free.',
    category: 'PDF',
    icon: 'Scissors',
    accent: 'violet',
    status: 'live',
    popular: true,
    href: '/tools/pdf-splitter',
  },
  {
    slug: 'pdf-extract-pages',
    name: 'Extract PDF Pages',
    shortName: 'Extract Pages',
    description: 'Select and extract specific pages from your PDF into a new document.',
    longDescription: 'Extract one or more pages from your PDF file. Select the exact pages you want to keep and instantly generate a new PDF document with only those pages.',
    category: 'PDF',
    icon: 'FileSymlink',
    accent: 'emerald',
    status: 'live',
    href: '/tools/pdf-extract-pages',
  },
  {
    slug: 'pdf-delete-pages',
    name: 'Delete PDF Pages',
    shortName: 'Delete Pages',
    description: 'Remove unwanted pages from your PDF file instantly and privately.',
    longDescription: 'Delete specific pages from a PDF document. Select the pages you want to remove and download a new PDF without those pages. Completely private and runs in your browser.',
    category: 'PDF',
    icon: 'FileMinus',
    accent: 'red',
    status: 'live',
    href: '/tools/pdf-delete-pages',
  },
  {
    slug: 'pdf-reorder-pages',
    name: 'Reorder PDF Pages',
    shortName: 'Reorder Pages',
    description: 'Change the order of pages in your PDF using drag-and-drop.',
    longDescription: 'Rearrange PDF pages effortlessly. Simply drag and drop page thumbnails into your desired order and download the reorganized PDF document.',
    category: 'PDF',
    icon: 'ArrowDownUp',
    accent: 'blue',
    status: 'live',
    href: '/tools/pdf-reorder-pages',
  },
  {
    slug: 'pdf-organizer',
    name: 'PDF Page Organizer',
    shortName: 'Organizer',
    description: 'The ultimate PDF tool: reorder, delete, rotate, and duplicate pages visually.',
    longDescription: 'A comprehensive visual PDF organizer. View all pages as thumbnails, drag to reorder, click to rotate, duplicate pages, or delete unwanted ones—all in one powerful interface.',
    category: 'PDF',
    icon: 'LayoutGrid',
    accent: 'indigo',
    status: 'live',
    popular: true,
    href: '/tools/pdf-organizer',
  },
  {
    slug: 'pdf-to-jpg',
    name: 'PDF to JPG',
    shortName: 'PDF→JPG',
    description: 'Convert every PDF page into a high-quality JPG image. Download all as a ZIP.',
    longDescription: 'Upload any PDF and instantly convert each page to a sharp JPG image at 2× resolution. Images are bundled into a single ZIP download — no server upload, 100% private.',
    category: 'Converter',
    icon: 'FileImage',
    accent: 'orange',
    status: 'live',
    popular: true,
    href: '/tools/pdf-to-jpg',
  },
  {
    slug: 'pdf-to-png',
    name: 'PDF to PNG',
    shortName: 'PDF→PNG',
    description: 'Convert PDF pages to lossless PNG images. Perfect for text-heavy documents.',
    longDescription: 'Export every page of your PDF as a full-resolution lossless PNG. Great for presentations, screenshots, and documents with fine text. All processing stays in your browser.',
    category: 'Converter',
    icon: 'FileImage',
    accent: 'sky',
    status: 'live',
    href: '/tools/pdf-to-png',
  },
  {
    slug: 'pdf-to-webp',
    name: 'PDF to WebP',
    shortName: 'PDF→WebP',
    description: 'Convert PDF pages to modern WebP format — smaller files, great quality.',
    longDescription: 'Transform PDF pages into next-generation WebP images for the smallest file sizes without sacrificing visual quality. Runs entirely in your browser.',
    category: 'Converter',
    icon: 'FileImage',
    accent: 'violet',
    status: 'live',
    href: '/tools/pdf-to-webp',
  },
  {
    slug: 'jpg-to-pdf',
    name: 'JPG to PDF',
    shortName: 'JPG→PDF',
    description: 'Combine one or more JPG images into a single PDF document instantly.',
    longDescription: 'Select multiple JPG files and merge them into a single PDF — each image becomes a page. Reorder images before converting. 100% in-browser, no upload required.',
    category: 'Converter',
    icon: 'FilePlus2',
    accent: 'rose',
    status: 'live',
    href: '/tools/jpg-to-pdf',
  },
  {
    slug: 'png-to-pdf',
    name: 'PNG to PDF',
    shortName: 'PNG→PDF',
    description: 'Turn PNG images into a multi-page PDF document in seconds.',
    longDescription: 'Convert one or more PNG images into a clean PDF document. Each PNG becomes a page sized to match the image dimensions. Privacy-first — no files leave your device.',
    category: 'Converter',
    icon: 'FilePlus2',
    accent: 'teal',
    status: 'live',
    href: '/tools/png-to-pdf',
  },
  {
    slug: 'images-to-pdf',
    name: 'Images to PDF',
    shortName: 'Images→PDF',
    description: 'Convert JPG, PNG, and WebP images into a single PDF. Mix formats freely.',
    longDescription: 'The ultimate image-to-PDF tool. Combine JPG, PNG, and WebP images in any order into one PDF document. Reorder pages, customize the filename, and download — all in-browser.',
    category: 'Converter',
    icon: 'Images',
    accent: 'emerald',
    status: 'live',
    popular: true,
    href: '/tools/images-to-pdf',
  },
  {
    slug: 'image-compressor',
    name: 'Image Compressor',
    shortName: 'Img Compress',
    description: 'Reduce image file size without losing visible quality.',
    longDescription: 'Compress JPG and PNG images to reduce file size while preserving quality.',
    category: 'Image',
    icon: 'Minimize2',
    accent: 'amber',
    status: 'soon',
  },
  {
    slug: 'pdf-to-word',
    name: 'PDF to Word',
    shortName: 'PDF→Word',
    description: 'Convert PDF documents into editable Word files.',
    longDescription: 'Extract text from PDF and convert it into an editable Word document.',
    category: 'Converter',
    icon: 'FileOutput',
    accent: 'indigo',
    status: 'soon',
  },
  {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortName: 'QR Code',
    description: 'Create custom QR codes for links, text, or contact info.',
    longDescription: 'Generate QR codes with custom colors and logos for any URL or text.',
    category: 'Utility',
    icon: 'QrCode',
    accent: 'violet',
    status: 'soon',
  },
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortName: 'Word Count',
    description: 'Count words, characters, sentences, and reading time instantly.',
    longDescription: 'A live word, character, and sentence counter with reading-time estimation.',
    category: 'Productivity',
    icon: 'Type',
    accent: 'teal',
    status: 'soon',
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortName: 'JSON',
    description: 'Format, validate, and minify JSON data with syntax highlighting.',
    longDescription: 'Beautify, validate, and minify JSON with error highlighting.',
    category: 'Developer',
    icon: 'Braces',
    accent: 'orange',
    status: 'soon',
  },
  {
    slug: 'color-picker',
    name: 'Color Picker',
    shortName: 'Colors',
    description: 'Pick colors and get HEX, RGB, and HSL values instantly.',
    longDescription: 'A visual color picker with HEX, RGB, and HSL output.',
    category: 'Utility',
    icon: 'Palette',
    accent: 'pink',
    status: 'soon',
  },
  {
    slug: 'image-resizer',
    name: 'Image Resizer',
    shortName: 'Img Resize',
    description: 'Resize images to exact dimensions while keeping quality.',
    longDescription: 'Resize images to any dimension with quality preservation.',
    category: 'Image',
    icon: 'Scaling',
    accent: 'cyan',
    status: 'soon',
  },
  {
    slug: 'text-to-speech',
    name: 'Text to Speech',
    shortName: 'TTS',
    description: 'Convert written text into natural-sounding speech.',
    longDescription: 'AI-powered text-to-speech with multiple voice options.',
    category: 'AI',
    icon: 'Volume2',
    accent: 'fuchsia',
    status: 'soon',
  },
  {
    slug: 'base64-converter',
    name: 'Base64 Converter',
    shortName: 'Base64',
    description: 'Encode and decode Base64 strings instantly.',
    longDescription: 'Encode text to Base64 or decode Base64 back to text.',
    category: 'Developer',
    icon: 'Binary',
    accent: 'lime',
    status: 'soon',
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug || t.href === `/tools/${slug}`);
}

export function getLiveTools(): Tool[] {
  return tools.filter((t) => t.status === 'live');
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((t) => t.category === category);
}
