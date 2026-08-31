import React from 'react';
import type { Metadata } from 'next';
import PdfMergerTool from '@/components/PdfMergerTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Merger Online - Combine Multiple PDFs into One',
  description:
    'Combine and merge multiple PDF files into one clean document in seconds. Drag-and-drop page ordering, 100% private, free, and processed directly in your browser.',
  keywords: [
    'pdf merger',
    'merge pdf online free',
    'combine pdf files',
    'join multiple pdfs',
    'private pdf joiner',
    'merge pdf in browser',
  ],
  alternates: {
    canonical: '/tools/pdf-merger/',
  },
  openGraph: {
    title: 'Free PDF Merger Online - Combine Multiple PDFs into One | Luta Tech',
    description:
      'Combine multiple PDF documents into a single file with drag-and-drop ease. Completely private and in-browser.',
    url: `${SITE_URL}/tools/pdf-merger/`,
    type: 'website',
  },
};

export default function PdfMergerPage() {
  const tool = getTool('pdf-merger')!;

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Merger"
        description="Fast and secure PDF merging tool to combine multiple PDF documents into a single file."
        url="/tools/pdf-merger/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Merger', url: '/tools/pdf-merger/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfMergerTool />
      </ToolPageShell>
    </>
  );
}
