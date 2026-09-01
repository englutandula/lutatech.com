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
      </ToolPageShell>
    </>
  );
}
