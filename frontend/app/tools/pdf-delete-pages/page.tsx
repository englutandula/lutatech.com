import React from 'react';
import type { Metadata } from 'next';
import PdfDeletePagesTool from '@/components/PdfDeletePagesTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Page Deleter Online - Remove Pages from PDF',
  description:
    'Delete unwanted pages from your PDF documents instantly and download the clean PDF. 100% private in-browser tool.',
  keywords: [
    'delete pdf pages',
    'remove pages from pdf online',
    'delete pages from pdf free',
    'cut pages from pdf',
  ],
  alternates: {
    canonical: '/tools/pdf-delete-pages/',
  },
  openGraph: {
    title: 'Free PDF Page Deleter Online | Luta Tech',
    description:
      'Remove unwanted pages from your PDF file instantly and privately.',
    url: `${SITE_URL}/tools/pdf-delete-pages/`,
    type: 'website',
  },
};

export default function PdfDeletePagesPage() {
  const tool = getTool('pdf-delete-pages')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Page Deleter"
        description="Delete unwanted pages from your PDF documents instantly."
        url="/tools/pdf-delete-pages/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Delete PDF Pages', url: '/tools/pdf-delete-pages/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfDeletePagesTool />
      </ToolPageShell>
    </>
  );
}
