import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfSplitterTool = dynamic(() => import('@/components/PdfSplitterTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Splitter Online - Separate PDF Pages & Ranges',
  description:
    'Split PDF documents into individual single-page files or custom page ranges. Fast, 100% private, and processed directly in your browser with zero uploads.',
  keywords: [
    'pdf splitter',
    'split pdf online free',
    'separate pdf pages',
    'extract pdf page ranges',
    'cut pdf file',
    'private pdf splitter',
  ],
  alternates: {
    canonical: '/tools/pdf-splitter/',
  },
  openGraph: {
    title: 'Free PDF Splitter Online - Separate PDF Pages & Ranges | Luta Tech',
    description:
      'Split any PDF file into separate pages or ranges in seconds. 100% private in-browser tool.',
    url: `${SITE_URL}/tools/pdf-splitter/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfSplitterPage() {
  const tool = getTool('pdf-splitter')!;

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Splitter"
        description="Free in-browser PDF splitting tool to extract individual pages or custom ranges."
        url="/tools/pdf-splitter/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Splitter', url: '/tools/pdf-splitter/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfSplitterTool />
        <ToolContentSection
          toolName="PDF Splitter"
          category="PDF"
          tagline="Extract single pages, remove unwanted sheets, or split PDF documents into custom page ranges in seconds."
          steps={[
            {
              title: 'Upload Your PDF Document',
              description:
                'Drag and drop or select any multi-page PDF document to open its page grid preview.',
            },
            {
              title: 'Choose Split Mode & Page Ranges',
              description:
                'Choose whether to extract every page as an individual file or define custom page ranges (e.g., 1-5, 8, 11-14).',
            },
            {
              title: 'Download Split Files Instantly',
              description:
                'Process the split instantly in your browser and download the resulting PDF files or a packaged ZIP archive.',
            },
          ]}
          features={[
            {
              title: 'Custom Range Extraction',
              description:
                'Specify exact ranges or individual page numbers to cleanly separate chapters, invoices, or specific receipts.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Extraction happens client-side in memory. No documents are ever uploaded to an external server.',
            },
            {
              title: 'Lossless Page Quality',
              description:
                'Maintains sharp vector text, embedded high-resolution graphics, annotations, and form data perfectly intact.',
            },
            {
              title: 'Bulk ZIP Download',
              description:
                'Conveniently download multiple separated pages bundled in an organized, instant ZIP download.',
            },
          ]}
          specs={[
            { label: 'Max Pages', value: 'Unlimited (In-Browser)' },
            { label: 'Execution', value: 'Client-Side WebAssembly' },
            { label: 'Formats', value: 'Individual PDFs or ZIP' },
            { label: 'Data Privacy', value: 'Zero Server Storage' },
          ]}
          faqs={[
            {
              question: 'Can I extract specific non-consecutive pages from a PDF?',
              answer:
                'Yes! You can specify custom ranges such as "1-3, 5, 8-10" to extract only the necessary pages into new documents.',
            },
            {
              question: 'Are my split pages saved on your servers?',
              answer:
                'No. All page extraction and splitting operations execute in your browser using client-side JavaScript. Your documents never touch our servers.',
            },
            {
              question: 'Will splitting my PDF reduce its visual quality?',
              answer:
                'No. Pages are extracted losslessly, preserving the original font data, hyperlinks, and image resolutions without alteration.',
            },
            {
              question: 'Can I split password-protected PDFs?',
              answer:
                'Please unlock the PDF file before uploading. Encrypted PDFs cannot be modified without the correct decryption credentials.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
