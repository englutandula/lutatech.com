import React from 'react';
import type { Metadata } from 'next';
import PdfSplitterTool from '@/components/PdfSplitterTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Splitter Online - Separate PDF Pages & Ranges',
  description:
    'Split PDF documents into individual single-page files or custom page ranges. Fast, 100% private, and processed directly in your browser with zero uploads.',
  keywords: [
    'pdf splitter',
    'split pdf online free',
    'separate pdf pages',
    'extract pdf page ranges',
    'cut pdf file',
    'private pdf splitter',
  ],
  alternates: {
    canonical: '/tools/pdf-splitter/',
  },
  openGraph: {
    title: 'Free PDF Splitter Online - Separate PDF Pages & Ranges | Luta Tech',
    description:
      'Split any PDF file into separate pages or ranges in seconds. 100% private in-browser tool.',
    url: `${SITE_URL}/tools/pdf-splitter/`,
    type: 'website',
  },
};

export default function PdfSplitterPage() {
  const tool = getTool('pdf-splitter')!;

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Splitter"
        description="Free in-browser PDF splitting tool to extract individual pages or custom ranges."
        url="/tools/pdf-splitter/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Splitter', url: '/tools/pdf-splitter/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfSplitterTool />
      </ToolPageShell>
    </>
  );
}
