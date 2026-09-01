import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const ImagesToPdfTool = dynamic(() => import('@/components/ImagesToPdfTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free JPG to PDF Converter Online - Merge JPG Images into PDF',
  description:
    'Convert JPG/JPEG pictures into a single multi-page PDF document online. Reorder images, customize page size, and download instantly. 100% private in-browser.',
  keywords: [
    'jpg to pdf',
    'convert jpg to pdf online',
    'jpeg to pdf converter',
    'merge photos into pdf',
    'free jpg to pdf tool',
  ],
  alternates: {
    canonical: '/tools/jpg-to-pdf/',
  },
  openGraph: {
    title: 'Free JPG to PDF Converter Online | Luta Tech',
    description:
      'Combine multiple JPG pictures into a clean PDF document in seconds.',
    url: `${SITE_URL}/tools/jpg-to-pdf/`,
    type: 'website',
  },
};

export default function JpgToPdfPage() {
  const tool = getTool('jpg-to-pdf')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech JPG to PDF Converter"
        description="Convert multiple JPG images into a single PDF document."
        url="/tools/jpg-to-pdf/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'JPG to PDF', url: '/tools/jpg-to-pdf/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <ImagesToPdfTool accept="image/jpeg,.jpg,.jpeg" formatLabel="JPG" />
      </ToolPageShell>
    </>
  );
}
