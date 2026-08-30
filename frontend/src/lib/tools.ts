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
