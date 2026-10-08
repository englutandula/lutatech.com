import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfToImageTool = dynamic(() => import('@/components/PdfToImageTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF to JPG Converter Online - Extract Pages to High-Res JPG',
  description:
    'Convert PDF pages into high-resolution JPG images. Download individual photos or a combined ZIP archive. 100% private in-browser tool with zero file uploads.',
  keywords: [
    'pdf to jpg',
    'convert pdf to jpg online',
    'pdf to image converter',
    'extract jpg from pdf',
    'high quality pdf to jpg',
  ],
  alternates: {
    canonical: '/tools/pdf-to-jpg/',
  },
  openGraph: {
    title: 'Free PDF to JPG Converter Online | Luta Tech',
    description:
      'Convert every page of your PDF into crisp JPG images. Instant batch ZIP download.',
    url: `${SITE_URL}/tools/pdf-to-jpg/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfToJpgPage() {
  const tool = getTool('pdf-to-jpg')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF to JPG Converter"
        description="Convert PDF pages into high-definition JPG images with instant ZIP download."
        url="/tools/pdf-to-jpg/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF to JPG', url: '/tools/pdf-to-jpg/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfToImageTool format="jpeg" />
        <ToolContentSection
          toolName="PDF to JPG Converter"
          category="Converter"
          tagline="Convert every page of your PDF document into crisp, high-resolution JPG images with instant bulk ZIP export."
          steps={[
            {
              title: 'Upload Your PDF File',
              description:
                'Select or drag and drop any multi-page PDF document into the browser dropzone.',
            },
            {
              title: 'Preview Rendered Pages',
              description:
                'Inspect live high-resolution page previews generated in real-time by PDF.js in your browser.',
            },
            {
              title: 'Download Single Images or ZIP',
              description:
                'Download individual page JPGs with one click or export all pages simultaneously in a convenient ZIP archive.',
            },
          ]}
          features={[
            {
              title: 'Crisp High-DPI Rendering',
              description:
                'Renders text, tables, graphs, and illustrations at double density for razor-sharp clarity on Retina screens.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'All page rendering and JPEG encoding take place on your computer. Zero documents or pages are uploaded to external servers.',
            },
            {
              title: 'Batch ZIP Packaging',
              description:
                'Download dozens or hundreds of extracted page images organized neatly into a single ZIP file with zero delay.',
            },
            {
              title: 'Zero Software Installation',
              description:
                'Works instantly across Windows, macOS, Linux, iOS, and Android without requiring Acrobat or desktop plugins.',
            },
          ]}
          specs={[
            { label: 'Output Format', value: 'High-Res JPEG (.jpg)' },
            { label: 'Rendering Engine', value: 'PDF.js WebAssembly' },
            { label: 'Batch Export', value: 'Instant ZIP Archive' },
            { label: 'Data Security', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'Will text and illustrations look sharp in the converted JPGs?',
              answer:
                'Yes. Our PDF engine renders vector graphics and typography at high pixel density (2x scale) to ensure charts, text, and photos remain clear and legible.',
            },
            {
              question: 'Can I download all pages at once?',
              answer:
                'Yes! Click the Download All (ZIP) button to bundle every page image into an organized archive for instant download.',
            },
            {
              question: 'Are my confidential documents uploaded to a cloud server?',
              answer:
                'No. The PDF parsing and canvas rendering execute entirely within your web browser. Your private documents are never uploaded to any remote server.',
            },
            {
              question: 'Can I convert password-protected PDFs?',
              answer:
                'Encrypted documents must have their password removed prior to conversion because our client-side sandbox cannot bypass encryption keys without credentials.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
