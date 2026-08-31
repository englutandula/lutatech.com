import React from 'react';
import type { Metadata } from 'next';
import PdfToImageTool from '@/components/PdfToImageTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF to WebP Converter Online - Smallest File Size with High Quality',
  description:
    'Convert PDF pages to lightweight, high-performance WebP images. Optimized for web publishing and fast loading. 100% private in-browser tool.',
  keywords: [
    'pdf to webp',
    'convert pdf to webp online',
    'pdf to webp converter free',
    'modern web image from pdf',
  ],
  alternates: {
    canonical: '/tools/pdf-to-webp/',
  },
  openGraph: {
    title: 'Free PDF to WebP Converter Online | Luta Tech',
    description:
      'Transform PDF pages into next-generation WebP images for optimal web performance.',
    url: `${SITE_URL}/tools/pdf-to-webp/`,
    type: 'website',
  },
};

export default function PdfToWebpPage() {
  const tool = getTool('pdf-to-webp')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF to WebP Converter"
        description="Transform PDF pages into next-generation WebP images for optimal web performance."
        url="/tools/pdf-to-webp/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF to WebP', url: '/tools/pdf-to-webp/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfToImageTool format="webp" />
      </ToolPageShell>
    </>
  );
}
