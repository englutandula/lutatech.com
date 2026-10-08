import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import ToolContentSection from '@/components/seo/ToolContentSection';

const PdfMergerTool = dynamic(() => import('@/components/PdfMergerTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Merger Online - Combine Multiple PDFs into One',
  description:
    'Combine and merge multiple PDF files into one clean document in seconds. Drag-and-drop page ordering, 100% private, free, and processed directly in your browser.',
  keywords: [
    'pdf merger',
    'merge pdf online free',
    'combine pdf files',
    'join multiple pdfs',
    'private pdf joiner',
    'merge pdf in browser',
  ],
  alternates: {
    canonical: '/tools/pdf-merger/',
  },
  openGraph: {
    title: 'Free PDF Merger Online - Combine Multiple PDFs into One | Luta Tech',
    description:
      'Combine multiple PDF documents into a single file with drag-and-drop ease. Completely private and in-browser.',
    url: `${SITE_URL}/tools/pdf-merger/`,
    type: 'website',
  },
};

export default function PdfMergerPage() {
  const tool = getTool('pdf-merger')!;

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Merger"
        description="Fast and secure PDF merging tool to combine multiple PDF documents into a single file."
        url="/tools/pdf-merger/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Merger', url: '/tools/pdf-merger/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfMergerTool />
        <ToolContentSection
          toolName="PDF Merger"
          category="PDF"
          tagline="Combine and join multiple PDF files into one clean, organized document with intuitive drag-and-drop ordering."
          steps={[
            {
              title: 'Upload Your PDF Documents',
              description:
                'Select or drag and drop two or more PDF files from your computer, tablet, or smartphone.',
            },
            {
              title: 'Arrange Document Order',
              description:
                'Drag and arrange files into your preferred page sequence before triggering the merge.',
            },
            {
              title: 'Merge & Download Instantly',
              description:
                'Click Merge PDFs to combine all documents into a single unified file in your browser and download immediately.',
            },
          ]}
          features={[
            {
              title: '100% In-Browser Privacy',
              description:
                'PDF documents are processed entirely client-side. Zero sensitive contracts, bank statements, or files ever leave your device.',
            },
            {
              title: 'Lossless Document Quality',
              description:
                'Maintains original vector fonts, high-resolution graphics, hyperlinks, and document formatting without compression degradation.',
            },
            {
              title: 'Unlimited File Merging',
              description:
                'Merge 2, 10, or 50+ files smoothly without arbitrary upload queues, subscription paywalls, or daily caps.',
            },
            {
              title: 'Zero Latency & No Server Queues',
              description:
                'Avoid waiting for slow server uploads and downloads. The tool leverages modern browser memory for instant execution.',
            },
          ]}
          specs={[
            { label: 'Max Files', value: 'Unlimited (In-Browser)' },
            { label: 'Execution', value: 'Client-Side WebAssembly' },
            { label: 'Data Privacy', value: 'Zero Server Storage' },
            { label: 'Output Quality', value: '100% Lossless Vector' },
          ]}
          faqs={[
            {
              question: 'Is there a limit on how many PDF files I can merge at once?',
              answer:
                'No. You can merge as many documents as your computer or mobile device can handle. Since processing takes place locally in your browser, you never encounter artificial file count restrictions.',
            },
            {
              question: 'Are my confidential documents stored on your servers?',
              answer:
                'No. LutaTech operates on a zero-knowledge architecture. Your PDFs are read, combined, and saved strictly inside your browser session. None of your data is ever uploaded or stored on an external server.',
            },
            {
              question: 'Will merging PDFs degrade the quality of images or text?',
              answer:
                'No. The merge operation is lossless. All text elements, embedded graphics, tables, and formatting are preserved exactly as in the original files.',
            },
            {
              question: 'Can I reorder the files before merging them?',
              answer:
                'Yes. You can easily drag and drop the uploaded document cards into your desired sequence before clicking the merge button.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
