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

import ToolContentSection from '@/components/seo/ToolContentSection';

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
        <ToolContentSection
          toolName="JPG to PDF Converter"
          category="Converter"
          tagline="Convert multiple JPG and JPEG pictures into a clean, unified multi-page PDF document in seconds."
          steps={[
            {
              title: 'Upload JPG Images',
              description:
                'Drag and drop or select one or more JPG/JPEG photographs from your computer, tablet, or phone.',
            },
            {
              title: 'Reorder & Configure Layout',
              description:
                'Drag images into your preferred sequence, select page size (A4, Letter, Auto), and adjust margins.',
            },
            {
              title: 'Generate & Download PDF',
              description:
                'Compile images into a single, high-definition PDF file processed directly in your browser without waiting for server uploads.',
            },
          ]}
          features={[
            {
              title: '100% In-Browser Privacy',
              description:
                'Image decoding and PDF assembly happen client-side in memory. Zero photos are ever uploaded to cloud servers.',
            },
            {
              title: 'Lossless Picture Quality',
              description:
                'Embeds original image pixel streams without destructive recompression, keeping your receipts, drawings, and photos crisp.',
            },
            {
              title: 'Batch Image Conversion',
              description:
                'Combine dozens of photos into an organized multi-page document in seconds without file count limits.',
            },
            {
              title: 'Customizable Page Margins',
              description:
                'Choose borderless full-bleed output or add neat white margins suitable for official document submissions.',
            },
          ]}
          specs={[
            { label: 'Input Formats', value: 'JPG, JPEG (.jpg, .jpeg)' },
            { label: 'Page Sizes', value: 'A4, US Letter, Auto-Fit' },
            { label: 'Orientation', value: 'Portrait, Landscape' },
            { label: 'Data Privacy', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'Can I convert multiple JPG photos into a single PDF document?',
              answer:
                'Yes! You can upload multiple JPG images at once, rearrange them into your desired order, and combine them into one continuous multi-page PDF.',
            },
            {
              question: 'Will converting JPG to PDF reduce photo quality?',
              answer:
                'No. Our client-side PDF compiler embeds your original images without applying lossy compression, preserving full resolution and color fidelity.',
            },
            {
              question: 'Are my private pictures stored on a server?',
              answer:
                'No. All processing occurs locally within your web browser. Your files never leave your device and are never stored or logged.',
            },
            {
              question: 'Can I reorder images before generating the PDF?',
              answer:
                'Yes, simply drag and drop the image thumbnails to adjust the page sequence before clicking convert.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
