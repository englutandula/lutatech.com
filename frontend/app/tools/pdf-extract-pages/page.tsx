import React from 'react';
import PdfExtractPagesTool from '@/components/PdfExtractPagesTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'Extract PDF Pages | Luta Tech',
  description: 'Select and extract specific pages from your PDF into a new document. 100% private, free, and in-browser.',
};

export default function PdfExtractPagesPage() {
  const tool = getTool('pdf-extract-pages')!;

  return (
    <ToolPageShell tool={tool}>
      <PdfExtractPagesTool />
    </ToolPageShell>
  );
}
