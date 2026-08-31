import React from 'react';
import type { Metadata } from 'next';
import PdfReorderPagesTool from '@/components/PdfReorderPagesTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Page Reorderer Online - Rearrange PDF Pages by Drag & Drop',
  description:
    'Change the page order in your PDF documents using intuitive drag-and-drop. Fast, simple, and 100% private in-browser.',
  keywords: [
    'reorder pdf pages',
    'rearrange pdf online',
    'change pdf page order',
    'free pdf page sorter',
  ],
  alternates: {
    canonical: '/tools/pdf-reorder-pages/',
  },
  openGraph: {
    title: 'Free PDF Page Reorderer Online | Luta Tech',
    description:
      'Change the order of pages in your PDF using easy drag-and-drop.',
    url: `${SITE_URL}/tools/pdf-reorder-pages/`,
    type: 'website',
  },
};

export default function PdfReorderPagesPage() {
  const tool = getTool('pdf-reorder-pages')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Page Reorderer"
        description="Change the order of pages in your PDF using intuitive drag-and-drop."
        url="/tools/pdf-reorder-pages/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Reorder PDF Pages', url: '/tools/pdf-reorder-pages/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfReorderPagesTool />
      </ToolPageShell>
    </>
  );
}
