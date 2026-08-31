import React from 'react';
import type { Metadata } from 'next';
import PdfOrganizerTool from '@/components/PdfOrganizerTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Visual PDF Page Organizer - Reorder, Rotate, Delete & Duplicate Pages',
  description:
    'Visual PDF page organizer: drag to reorder, click to rotate, duplicate, or delete pages with live thumbnail previews. 100% private in-browser tool.',
  keywords: [
    'pdf organizer',
    'organize pdf pages online',
    'reorder pdf pages',
    'rotate pdf pages free',
    'delete pdf pages',
    'duplicate pdf pages',
  ],
  alternates: {
    canonical: '/tools/pdf-organizer/',
  },
  openGraph: {
    title: 'Visual PDF Page Organizer | Luta Tech',
    description:
      'Reorder, rotate, delete, and duplicate PDF pages visually with instant drag-and-drop.',
    url: `${SITE_URL}/tools/pdf-organizer/`,
    type: 'website',
  },
};

export default function PdfOrganizerPage() {
  const tool = getTool('pdf-organizer')!;

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech Visual PDF Page Organizer"
        description="Comprehensive visual PDF editor to rearrange, rotate, duplicate, and delete pages."
        url="/tools/pdf-organizer/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Organizer', url: '/tools/pdf-organizer/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfOrganizerTool />
      </ToolPageShell>
    </>
  );
}
