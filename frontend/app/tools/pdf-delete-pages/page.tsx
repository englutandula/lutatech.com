import React from 'react';
import PdfDeletePagesTool from '@/components/PdfDeletePagesTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'Delete PDF Pages | Luta Tech',
  description: 'Remove unwanted pages from your PDF file instantly and privately. 100% free and in-browser.',
};

export default function PdfDeletePagesPage() {
  const tool = getTool('pdf-delete-pages')!;

  return (
    <ToolPageShell tool={tool}>
      <PdfDeletePagesTool />
    </ToolPageShell>
  );
}
