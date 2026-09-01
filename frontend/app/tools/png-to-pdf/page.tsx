import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const ImagesToPdfTool = dynamic(() => import('@/components/ImagesToPdfTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PNG to PDF Converter Online - Transform PNG Graphics into PDF',
  description:
    'Convert PNG images into clean PDF documents in seconds. Keep transparency and exact dimensions. 100% private in-browser tool with zero uploads.',
  keywords: [
    'png to pdf',
    'convert png to pdf online',
    'png to pdf converter free',
    'create pdf from png images',
  ],
  alternates: {
    canonical: '/tools/png-to-pdf/',
  },
  openGraph: {
    title: 'Free PNG to PDF Converter Online | Luta Tech',
    description:
      'Transform PNG images into multi-page PDF documents effortlessly.',
    url: `${SITE_URL}/tools/png-to-pdf/`,
    type: 'website',
  },
};

export default function PngToPdfPage() {
  const tool = getTool('png-to-pdf')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PNG to PDF Converter"
        description="Transform PNG images into multi-page PDF documents effortlessly."
        url="/tools/png-to-pdf/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PNG to PDF', url: '/tools/png-to-pdf/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <ImagesToPdfTool accept="image/png,.png" formatLabel="PNG" />
      </ToolPageShell>
    </>
  );
}
