import React from 'react';
import type { Metadata } from 'next';
import ImagesToPdfTool from '@/components/ImagesToPdfTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

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
      </ToolPageShell>
    </>
  );
}
