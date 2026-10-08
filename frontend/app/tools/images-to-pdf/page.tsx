import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const ImagesToPdfTool = dynamic(() => import('@/components/ImagesToPdfTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Images to PDF Converter - Mix JPG, PNG, WEBP into One PDF',
  description:
    'Combine and convert JPG, PNG, and WebP photos into a single PDF document in seconds. Drag to reorder, customize paper size, and download instantly.',
  keywords: [
    'images to pdf',
    'photos to pdf converter',
    'merge images into pdf',
    'jpg png to pdf online',
    'free image to pdf maker',
  ],
  alternates: {
    canonical: '/tools/images-to-pdf/',
  },
  openGraph: {
    title: 'Free Images to PDF Converter | Luta Tech',
    description:
      'Combine multiple image formats (JPG, PNG, WebP) into a clean, ready-to-share PDF document.',
    url: `${SITE_URL}/tools/images-to-pdf/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function ImagesToPdfPage() {
  const tool = getTool('images-to-pdf')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech Images to PDF Converter"
        description="Combine multiple image formats into a clean, ready-to-share PDF document."
        url="/tools/images-to-pdf/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Images to PDF', url: '/tools/images-to-pdf/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <ImagesToPdfTool
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          formatLabel="JPG, PNG & WebP"
        />
        <ToolContentSection
          toolName="Images to PDF Converter"
          category="Converter"
          tagline="Combine mixed JPG, PNG, and WebP pictures, screenshots, and scans into a single, unified PDF file."
          steps={[
            {
              title: 'Upload Any Image Formats',
              description:
                'Select or drop mixed images including JPG, PNG, and WebP photos and documents.',
            },
            {
              title: 'Organize Pages & Format',
              description:
                'Rearrange page order, set uniform page sizing (A4, US Letter, Auto-Fit), and adjust page margin spacing.',
            },
            {
              title: 'Generate & Save PDF',
              description:
                'Click Convert to compile all pictures into a cohesive PDF document rendered client-side in seconds.',
            },
          ]}
          features={[
            {
              title: 'Mixed Format Support',
              description:
                'Seamlessly combines different image extensions (JPG, PNG, WebP) into a single unified multi-page PDF.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Image data and PDF assembly occur strictly in your device memory without uploading files to remote servers.',
            },
            {
              title: 'Customizable Paper Standard',
              description:
                'Select standard A4 or US Letter sheets with optional white margins suitable for official printing and office distribution.',
            },
            {
              title: 'High Resolution Retention',
              description:
                'Preserves high photographic detail and document clarity without downsampling or pixel compression degradation.',
            },
          ]}
          specs={[
            { label: 'Supported Inputs', value: 'JPG, PNG, WebP' },
            { label: 'Paper Options', value: 'A4, US Letter, Auto-Fit' },
            { label: 'Processing Speed', value: 'Instant Client-Side' },
            { label: 'Data Security', value: '100% In-Browser' },
          ]}
          faqs={[
            {
              question: 'Can I combine different image types like PNG and JPG together?',
              answer:
                'Yes! Our engine normalizes different image encodings and combines JPG photos, PNG graphics, and WebP screenshots into a single clean PDF document.',
            },
            {
              question: 'How do I change the page orientation or margin size?',
              answer:
                'Use the layout options toolbar above the preview to select Portrait or Landscape orientation, choose A4 or Letter sizes, and set custom margin padding.',
            },
            {
              question: 'Are my uploaded files ever stored on a remote server?',
              answer:
                'No. The conversion is executed 100% in your local web browser. None of your photos, scans, or receipts are uploaded or stored anywhere.',
            },
            {
              question: 'Is there a limit on how many images I can include?',
              answer:
                'No arbitrary limits are imposed. You can assemble as many pictures as your computer or smartphone memory comfortably supports.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
