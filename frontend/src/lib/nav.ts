// Navigation mega-menu data — drives both the desktop dropdown and the mobile accordion.

export type NavItemStatus = 'live' | 'soon';

export interface NavToolItem {
  label: string;
  href: string;
  status: NavItemStatus;
}

export interface NavPdfGroup {
  id: string;
  label: string;
  /** Full Tailwind classes for the small group icon background */
  iconBg: string;
  /** Full Tailwind classes for the small group icon text/color */
  iconText: string;
  items: NavToolItem[];
}

export interface NavFeaturedTool {
  id: string;
  label: string;
  description: string;
  href: string;
  /** Full Tailwind classes for the card gradient background */
  gradient: string;
  iconBg: string;
  iconText: string;
}

// ---------------------------------------------------------------------------
// Tool categories shown in the mega menu
// ---------------------------------------------------------------------------
export const navPdfGroups: NavPdfGroup[] = [
  {
    id: 'ai',
    label: 'Image & AI Tools',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
    iconText: 'text-purple-600 dark:text-purple-400',
    items: [
      { label: 'Passport Photo', href: '/tools/passport', status: 'live' },
      { label: 'Background Remover', href: '/tools/remove-bg', status: 'live' },
      { label: 'Image Resizer', href: '/tools/image-resizer', status: 'live' },
      { label: 'Image Compressor', href: '/tools/image-compressor', status: 'live' },
    ],
  },
  {
    id: 'organize',
    label: 'Organize PDF',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    items: [
      { label: 'Compress PDF', href: '/tools/pdf-compressor', status: 'live' },
      { label: 'Merge PDF', href: '/tools/pdf-merger', status: 'live' },
      { label: 'Split PDF', href: '/tools/pdf-splitter', status: 'live' },
      { label: 'Extract Pages', href: '/tools/pdf-extract-pages', status: 'live' },
      { label: 'Delete Pages', href: '/tools/pdf-delete-pages', status: 'live' },
      { label: 'Reorder Pages', href: '/tools/pdf-reorder-pages', status: 'live' },
      { label: 'Page Organizer', href: '/tools/pdf-organizer', status: 'live' },
    ],
  },
  {
    id: 'convert',
    label: 'Convert PDF',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
    iconText: 'text-orange-600 dark:text-orange-400',
    items: [
      { label: 'JPG to PDF', href: '/tools/jpg-to-pdf', status: 'live' },
      { label: 'PNG to PDF', href: '/tools/png-to-pdf', status: 'live' },
      { label: 'Images to PDF', href: '/tools/images-to-pdf', status: 'live' },
      { label: 'PDF to JPG', href: '/tools/pdf-to-jpg', status: 'live' },
      { label: 'PDF to PNG', href: '/tools/pdf-to-png', status: 'live' },
      { label: 'PDF to WebP', href: '/tools/pdf-to-webp', status: 'live' },
      { label: 'PDF to Text', href: '#', status: 'soon' },
    ],
  },
  {
    id: 'edit',
    label: 'Edit PDF',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    items: [
      { label: 'Add Text', href: '#', status: 'soon' },
      { label: 'Add Image', href: '#', status: 'soon' },
      { label: 'Draw on PDF', href: '#', status: 'soon' },
      { label: 'Sign PDF', href: '#', status: 'soon' },
      { label: 'Watermark', href: '#', status: 'soon' },
      { label: 'Stamp', href: '#', status: 'soon' },
      { label: 'Page Numbers', href: '#', status: 'soon' },
    ],
  },
  {
    id: 'forms',
    label: 'PDF Forms',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
    iconText: 'text-sky-600 dark:text-sky-400',
    items: [
      { label: 'Fill Forms', href: '#', status: 'soon' },
      { label: 'Create Forms', href: '#', status: 'soon' },
      { label: 'Flatten Forms', href: '#', status: 'soon' },
    ],
  },
  {
    id: 'security',
    label: 'PDF Security',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconText: 'text-red-600 dark:text-red-400',
    items: [
      { label: 'Protect PDF', href: '#', status: 'soon' },
      { label: 'Encrypt PDF', href: '#', status: 'soon' },
      { label: 'Unlock PDF', href: '#', status: 'soon' },
      { label: 'Digital Signatures', href: '#', status: 'soon' },
    ],
  },
  {
    id: 'utilities',
    label: 'PDF Utilities',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    items: [
      { label: 'Compress PDF', href: '/tools/pdf-compressor', status: 'live' },
      { label: 'Metadata Editor', href: '#', status: 'soon' },
      { label: 'Page Size', href: '#', status: 'soon' },
      { label: 'Crop PDF', href: '#', status: 'soon' },
      { label: 'Resize PDF', href: '#', status: 'soon' },
      { label: 'Booklet Creator', href: '#', status: 'soon' },
      { label: 'Print Layout', href: '#', status: 'soon' },
    ],
  },
];
