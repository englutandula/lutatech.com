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
      </ToolPageShell>
    </>
  );
}
