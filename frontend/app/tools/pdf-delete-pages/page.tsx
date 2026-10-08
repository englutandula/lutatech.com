import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfDeletePagesTool = dynamic(() => import('@/components/PdfDeletePagesTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Page Deleter Online - Remove Pages from PDF',
  description:
    'Delete unwanted pages from your PDF documents instantly and download the clean PDF. 100% private in-browser tool.',
  keywords: [
    'delete pdf pages',
    'remove pages from pdf online',
    'delete pages from pdf free',
    'cut pages from pdf',
  ],
  alternates: {
    canonical: '/tools/pdf-delete-pages/',
  },
  openGraph: {
    title: 'Free PDF Page Deleter Online | Luta Tech',
    description:
      'Remove unwanted pages from your PDF file instantly and privately.',
    url: `${SITE_URL}/tools/pdf-delete-pages/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfDeletePagesPage() {
  const tool = getTool('pdf-delete-pages')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Page Deleter"
        description="Delete unwanted pages from your PDF documents instantly."
        url="/tools/pdf-delete-pages/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Delete PDF Pages', url: '/tools/pdf-delete-pages/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfDeletePagesTool />
        <ToolContentSection
          toolName="PDF Page Deleter"
          category="PDF"
          tagline="Select and permanently remove blank or unwanted pages from your PDF document with 100% in-browser privacy."
          steps={[
            {
              title: 'Upload Your PDF File',
              description:
                'Select or drop your PDF document to generate interactive page thumbnails.',
            },
            {
              title: 'Select Pages to Remove',
              description:
                'Click on any pages you wish to eliminate (blank pages, obsolete appendices, or private sheets).',
            },
            {
              title: 'Download Clean PDF',
              description:
                'Process the deletion instantly in your browser and download the sanitized PDF document immediately.',
            },
          ]}
          features={[
            {
              title: 'Visual Multi-Page Selection',
              description:
                'Easily select single or multiple pages visually across your entire document before deleting.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Page stripping runs locally in client-side memory. Zero confidential documents are uploaded to cloud servers.',
            },
            {
              title: 'Lossless Quality',
              description:
                'Retains all original document streams, hyperlinks, bookmarks, and font vector clarity without compression losses.',
            },
            {
              title: 'Instant Execution',
              description:
                'No waiting for server uploads or queues. Large documents are modified in milliseconds.',
            },
          ]}
          specs={[
            { label: 'Page Limit', value: 'Unlimited (In-Browser)' },
            { label: 'File Type', value: 'Standard PDF (.pdf)' },
            { label: 'Engine', value: 'Client-Side WebAssembly' },
            { label: 'Data Security', value: 'Zero Cloud Storage' },
          ]}
          faqs={[
            {
              question: 'Are deleted pages permanently removed?',
              answer:
                'Yes. The resulting downloaded PDF file is completely rebuilt without the selected pages, ensuring that sensitive data is permanently stripped.',
            },
            {
              question: 'Will deleting pages affect the numbering of remaining pages?',
              answer:
                'The physical document page tree is updated immediately so remaining pages flow continuously.',
            },
            {
              question: 'Are my confidential documents uploaded to an external server?',
              answer:
                'Never. LutaTech operates on a strict zero-knowledge, client-side architecture. Processing happens purely inside your web browser session.',
            },
            {
              question: 'Can I delete pages from scanned documents?',
              answer:
                'Yes! Both native digital PDFs and scanned image-based PDF documents are fully supported.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
