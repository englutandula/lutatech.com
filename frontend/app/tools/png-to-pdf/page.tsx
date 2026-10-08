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

import ToolContentSection from '@/components/seo/ToolContentSection';

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
        <ToolContentSection
          toolName="PNG to PDF Converter"
          category="Converter"
          tagline="Convert transparent PNG graphics, screenshots, and artwork into crisp, high-fidelity PDF documents."
          steps={[
            {
              title: 'Upload PNG Images',
              description:
                'Select or drag and drop one or more PNG files (including transparent graphics) into the upload area.',
            },
            {
              title: 'Customize Page Layout',
              description:
                'Reorder images, select page dimensions (A4, Letter, Auto-Fit), and define custom page margins.',
            },
            {
              title: 'Convert & Download PDF',
              description:
                'Generate your PDF document instantly in your browser without waiting in upload queues.',
            },
          ]}
          features={[
            {
              title: 'Preserves Alpha Transparency',
              description:
                'Handles transparent logos, diagrams, and icon cutouts cleanly against crisp white document backdrops.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'PNG graphics and document assembly execute on your device. Zero images are transmitted across the web.',
            },
            {
              title: 'High-Resolution Vector Crispness',
              description:
                'Preserves sharp text, UI screenshots, and diagrams without blurry artifacts or pixel compression loss.',
            },
            {
              title: 'Unlimited Batch Processing',
              description:
                'Compile as many PNG images into a unified document as your device memory allows with zero fees.',
            },
          ]}
          specs={[
            { label: 'Input Formats', value: 'PNG (.png, transparent)' },
            { label: 'Page Sizes', value: 'A4, US Letter, Auto-Fit' },
            { label: 'Processing Speed', value: 'Instant Client-Side' },
            { label: 'Data Security', value: '100% In-Browser' },
          ]}
          faqs={[
            {
              question: 'How are transparent PNG images handled in PDF?',
              answer:
                'Transparent areas in your PNG images are blended against a clean white page backdrop, ensuring diagrams and logos appear crisp without black background glitches.',
            },
            {
              question: 'Can I combine multiple PNG files into one PDF?',
              answer:
                'Yes. You can upload multiple PNG screenshots or diagrams and combine them into a single multi-page PDF document in your exact preferred sequence.',
            },
            {
              question: 'Will text in my screenshots remain sharp?',
              answer:
                'Yes. We maintain original pixel density without compression downsampling, keeping code snippets and screenshot text completely readable.',
            },
            {
              question: 'Are my PNG files stored on a server?',
              answer:
                'No. Conversion takes place directly within your web browser. No files are uploaded to our servers or saved permanently.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
