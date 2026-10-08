import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfReorderPagesTool = dynamic(() => import('@/components/PdfReorderPagesTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Page Reorderer Online - Rearrange PDF Pages by Drag & Drop',
  description:
    'Change the page order in your PDF documents using intuitive drag-and-drop. Fast, simple, and 100% private in-browser.',
  keywords: [
    'reorder pdf pages',
    'rearrange pdf online',
    'change pdf page order',
    'free pdf page sorter',
  ],
  alternates: {
    canonical: '/tools/pdf-reorder-pages/',
  },
  openGraph: {
    title: 'Free PDF Page Reorderer Online | Luta Tech',
    description:
      'Change the order of pages in your PDF using easy drag-and-drop.',
    url: `${SITE_URL}/tools/pdf-reorder-pages/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfReorderPagesPage() {
  const tool = getTool('pdf-reorder-pages')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Page Reorderer"
        description="Change the order of pages in your PDF using intuitive drag-and-drop."
        url="/tools/pdf-reorder-pages/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Reorder PDF Pages', url: '/tools/pdf-reorder-pages/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfReorderPagesTool />
        <ToolContentSection
          toolName="PDF Page Reorderer"
          category="PDF"
          tagline="Rearrange, re-sequence, and sort pages in your PDF documents with smooth drag-and-drop ease."
          steps={[
            {
              title: 'Upload Your PDF File',
              description:
                'Select or drop your PDF document to load draggable page cards with clear thumbnail previews.',
            },
            {
              title: 'Drag to Rearrange Order',
              description:
                'Drag any page card to its new position to construct the perfect reading sequence.',
            },
            {
              title: 'Save Reordered PDF',
              description:
                'Download your updated, reorganized PDF file instantly processed directly in your web browser.',
            },
          ]}
          features={[
            {
              title: 'Intuitive Drag-and-Drop Sorting',
              description:
                'Easily move pages forward or backward with responsive visual feedback across desktop and touchscreens.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Page reordering is executed client-side in memory. Zero documents are uploaded to cloud servers.',
            },
            {
              title: 'Lossless Vector Preservation',
              description:
                'Retains original PDF structure, form fields, vector fonts, and high-DPI imagery without compression degradation.',
            },
            {
              title: 'Instant Execution',
              description:
                'Process documents in milliseconds without queuing or waiting for server round-trips.',
            },
          ]}
          specs={[
            { label: 'Page Limit', value: 'Unlimited (In-Browser)' },
            { label: 'Sorting Mode', value: 'Drag-and-Drop Visual' },
            { label: 'Quality', value: '100% Lossless Vector' },
            { label: 'Data Security', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'Will changing the page order reduce image or text clarity?',
              answer:
                'No. Reordering pages only modifies the internal page pointer index in the document catalog. The actual page content streams are preserved losslessly.',
            },
            {
              question: 'Can I reorder pages on a mobile or tablet device?',
              answer:
                'Yes! Our interface supports both mouse dragging on desktop and touch-based reordering on tablets and smartphones.',
            },
            {
              question: 'Are my confidential files stored on a server?',
              answer:
                'No. The reordering runs entirely inside your browser session using WebAssembly. Your documents are never uploaded to any remote server.',
            },
            {
              question: 'Can I reorder password-protected PDF files?',
              answer:
                'Please unlock your PDF before uploading, as encrypted documents require authorization to modify page structures.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
