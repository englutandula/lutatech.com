import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfToImageTool = dynamic(() => import('@/components/PdfToImageTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF to PNG Converter Online - Lossless Transparent PNG Export',
  description:
    'Convert PDF pages to lossless high-resolution PNG images. Perfect for text documents, charts, and presentations. 100% private in-browser tool.',
  keywords: [
    'pdf to png',
    'convert pdf to png online',
    'lossless pdf to image',
    'extract png from pdf',
    'free pdf to png converter',
  ],
  alternates: {
    canonical: '/tools/pdf-to-png/',
  },
  openGraph: {
    title: 'Free PDF to PNG Converter Online | Luta Tech',
    description:
      'Export PDF pages as full-resolution lossless PNG files with zero quality degradation.',
    url: `${SITE_URL}/tools/pdf-to-png/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfToPngPage() {
  const tool = getTool('pdf-to-png')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF to PNG Converter"
        description="Convert PDF pages to lossless full-resolution PNG images."
        url="/tools/pdf-to-png/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF to PNG', url: '/tools/pdf-to-png/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfToImageTool format="png" />
        <ToolContentSection
          toolName="PDF to PNG Converter"
          category="Converter"
          tagline="Export every page of your PDF into lossless, full-resolution PNG images with pixel-perfect clarity."
          steps={[
            {
              title: 'Upload Your PDF File',
              description:
                'Drag and drop or select any PDF document from your computer, smartphone, or tablet.',
            },
            {
              title: 'Preview Extracted Pages',
              description:
                'Inspect lossless PNG page previews generated immediately in your browser canvas.',
            },
            {
              title: 'Download Single Images or ZIP',
              description:
                'Download individual page PNGs or grab the entire set bundled into a single ZIP archive.',
            },
          ]}
          features={[
            {
              title: '100% Lossless Image Quality',
              description:
                'PNG uses lossless compression algorithms, eliminating JPEG compression artifacts around fine text and diagrams.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Rendering happens client-side in memory. No documents or page images are ever uploaded to cloud servers.',
            },
            {
              title: 'Ideal for Charts & Presentations',
              description:
                'Produce crystal-clear visuals for slide decks, documentation, and web design with razor-sharp contrast.',
            },
            {
              title: 'Instant Bulk ZIP Packaging',
              description:
                'Bundle all converted pages into a clean, downloadable ZIP folder with a single click.',
            },
          ]}
          specs={[
            { label: 'Output Format', value: 'Lossless PNG (.png)' },
            { label: 'Rendering Engine', value: 'PDF.js High-DPI' },
            { label: 'Compression', value: 'Lossless Deflate' },
            { label: 'Data Security', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'Why choose PNG over JPG for PDF conversion?',
              answer:
                'PNG is a lossless format, which means sharp edges around letters, numbers, line drawings, and tables remain perfectly crisp without the blurry halo artifacts typical of JPEG compression.',
            },
            {
              question: 'Can I download all pages simultaneously in a ZIP file?',
              answer:
                'Yes. Click the Download All (ZIP) button to export all converted page images bundled into an organized ZIP archive.',
            },
            {
              question: 'Are my confidential documents uploaded to an external server?',
              answer:
                'No. Conversion runs 100% client-side in your web browser. Your private documents never leave your computer.',
            },
            {
              question: 'What is the maximum number of pages I can convert?',
              answer:
                'There is no artificial page limit. You can process multi-page documents as long as your device memory can accommodate them.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
