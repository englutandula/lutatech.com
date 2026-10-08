import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfExtractPagesTool = dynamic(() => import('@/components/PdfExtractPagesTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Page Extractor Online - Extract Selected Pages from PDF',
  description:
    'Select and extract specific pages from any PDF document into a new lightweight PDF file. 100% private in-browser tool.',
  keywords: [
    'pdf extract pages',
    'extract pages from pdf online',
    'save specific pages from pdf',
    'free pdf extractor',
  ],
  alternates: {
    canonical: '/tools/pdf-extract-pages/',
  },
  openGraph: {
    title: 'Free PDF Page Extractor Online | Luta Tech',
    description:
      'Select and extract specific pages from your PDF file into a new document.',
    url: `${SITE_URL}/tools/pdf-extract-pages/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfExtractPagesPage() {
  const tool = getTool('pdf-extract-pages')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Page Extractor"
        description="Select and extract specific pages from any PDF document into a new PDF."
        url="/tools/pdf-extract-pages/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Extract PDF Pages', url: '/tools/pdf-extract-pages/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfExtractPagesTool />
        <ToolContentSection
          toolName="PDF Page Extractor"
          category="PDF"
          tagline="Choose specific pages from any document and extract them into a brand new, lightweight PDF file."
          steps={[
            {
              title: 'Upload Your PDF Document',
              description:
                'Select or drop your PDF document to view visual thumbnails for every page.',
            },
            {
              title: 'Select Specific Pages',
              description:
                'Click the pages you need to extract (invoices, signatures, agreements, or diagrams).',
            },
            {
              title: 'Export Extracted Document',
              description:
                'Create and download your newly compiled PDF containing only the selected pages in seconds.',
            },
          ]}
          features={[
            {
              title: 'Targeted Page Extraction',
              description:
                'Pull out precisely the sheets you need without carrying unnecessary bloated chapters.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Document manipulation occurs locally in memory. Zero sensitive agreements or pages touch a remote server.',
            },
            {
              title: 'Retains Document Clarity',
              description:
                'Preserves all vector fonts, digital forms, and high-definition illustrations losslessly.',
            },
            {
              title: 'Zero Software Required',
              description:
                'Works smoothly on all desktop and mobile browsers without requiring paid Adobe software.',
            },
          ]}
          specs={[
            { label: 'Page Limit', value: 'Unlimited (In-Browser)' },
            { label: 'File Type', value: 'Standard PDF (.pdf)' },
            { label: 'Extraction', value: 'Lossless Vector Preservation' },
            { label: 'Data Security', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'How is page extraction different from splitting a PDF?',
              answer:
                'Splitting typically divides an entire document into chunks or single sheets, whereas Extraction allows you to hand-pick specific pages to assemble into a fresh standalone PDF.',
            },
            {
              question: 'Will text or links inside extracted pages stop working?',
              answer:
                'No. The internal PDF stream dictionaries for the chosen pages are preserved, meaning fonts, hyperlinks, and vector artwork remain fully functional.',
            },
            {
              question: 'Are my extracted documents uploaded to your servers?',
              answer:
                'No. All extraction operations occur entirely inside your browser session. No data is stored, logged, or uploaded.',
            },
            {
              question: 'Can I extract pages from password-protected files?',
              answer:
                'Please unlock your PDF before extraction, as our browser tool respects security encryption.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
