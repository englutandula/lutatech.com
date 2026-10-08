import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfOrganizerTool = dynamic(() => import('@/components/PdfOrganizerTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Visual PDF Page Organizer - Reorder, Rotate, Delete & Duplicate Pages',
  description:
    'Visual PDF page organizer: drag to reorder, click to rotate, duplicate, or delete pages with live thumbnail previews. 100% private in-browser tool.',
  keywords: [
    'pdf organizer',
    'organize pdf pages online',
    'reorder pdf pages',
    'rotate pdf pages free',
    'delete pdf pages',
    'duplicate pdf pages',
  ],
  alternates: {
    canonical: '/tools/pdf-organizer/',
  },
  openGraph: {
    title: 'Visual PDF Page Organizer | Luta Tech',
    description:
      'Reorder, rotate, delete, and duplicate PDF pages visually with instant drag-and-drop.',
    url: `${SITE_URL}/tools/pdf-organizer/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfOrganizerPage() {
  const tool = getTool('pdf-organizer')!;

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech Visual PDF Page Organizer"
        description="Comprehensive visual PDF editor to rearrange, rotate, duplicate, and delete pages."
        url="/tools/pdf-organizer/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Organizer', url: '/tools/pdf-organizer/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfOrganizerTool />
        <ToolContentSection
          toolName="Visual PDF Page Organizer"
          category="PDF"
          tagline="Drag to reorder, rotate inverted sheets, remove unwanted pages, and duplicate layouts with interactive thumbnail previews."
          steps={[
            {
              title: 'Upload Your Document',
              description:
                'Select or drop any multi-page PDF document to load thumbnail previews for every page.',
            },
            {
              title: 'Reorder, Rotate & Edit',
              description:
                'Drag thumbnails to adjust sequence, click 90° rotate to fix upside-down scans, or click trash to remove unwanted sheets.',
            },
            {
              title: 'Download Organized PDF',
              description:
                'Save and export your clean, re-structured PDF file instantly processed directly inside your browser.',
            },
          ]}
          features={[
            {
              title: 'Interactive Visual Grid',
              description:
                'See exact thumbnail previews for every single page before making structural modifications.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'All page manipulation occurs client-side using WebAssembly. Confidential legal contracts never touch a third-party server.',
            },
            {
              title: '90° Rotation & Page Deletion',
              description:
                'Fix orientation issues on scanned receipts or remove irrelevant cover pages in seconds.',
            },
            {
              title: 'Lossless Vector Preservation',
              description:
                'Preserves embedded typography, hyperlinks, digital signatures, and high-definition imagery intact.',
            },
          ]}
          specs={[
            { label: 'Page Limit', value: 'Unlimited (In-Browser)' },
            { label: 'Editing Actions', value: 'Reorder, Rotate, Delete' },
            { label: 'Execution', value: 'Client-Side WebAssembly' },
            { label: 'Data Security', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'Can I rotate individual upside-down pages without affecting the rest of the PDF?',
              answer:
                'Yes! Each page thumbnail has individual 90° clockwise and counter-clockwise rotation controls so you can fix only the inverted scans.',
            },
            {
              question: 'Will rearranging or deleting pages reduce text quality?',
              answer:
                'No. The operation alters page dictionary trees losslessly without re-encoding text or downsampling embedded graphics.',
            },
            {
              question: 'Are my confidential documents uploaded to a remote cloud server?',
              answer:
                'Never. LutaTech operates on a zero-knowledge architecture. Your documents are modified purely in your local browser memory.',
            },
            {
              question: 'Can I duplicate specific pages within the same document?',
              answer:
                'Yes. You can duplicate any page in the organizer to repeat specific forms or cover sheets across your document.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
