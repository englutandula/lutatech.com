import React from 'react';
import type { Metadata } from 'next';
import PdfExtractPagesTool from '@/components/PdfExtractPagesTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Page Extractor Online - Extract Selected Pages from PDF',
  description:
    'Select and extract specific pages from any PDF document into a new lightweight PDF file. 100% private in-browser tool.',
  keywords: [
    'pdf extract pages',
    'extract pages from pdf online',
    'save specific pages from pdf',
    'free pdf extractor',
  ],
  alternates: {
    canonical: '/tools/pdf-extract-pages/',
  },
  openGraph: {
    title: 'Free PDF Page Extractor Online | Luta Tech',
    description:
      'Select and extract specific pages from your PDF file into a new document.',
    url: `${SITE_URL}/tools/pdf-extract-pages/`,
    type: 'website',
  },
};

export default function PdfExtractPagesPage() {
  const tool = getTool('pdf-extract-pages')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Page Extractor"
        description="Select and extract specific pages from any PDF document into a new PDF."
        url="/tools/pdf-extract-pages/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Extract PDF Pages', url: '/tools/pdf-extract-pages/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfExtractPagesTool />
      </ToolPageShell>
    </>
  );
}
